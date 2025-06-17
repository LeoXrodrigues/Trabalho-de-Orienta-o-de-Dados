import { Request, Response } from 'express';
import { PlanningService } from './planning.service';

export class PlanningController {
  private planningService: PlanningService;

  constructor(planningService: PlanningService) {
    this.planningService = planningService;
  }

  /**
   * POST /planning/plan-next
   * Endpoint principal: executa o planejamento inteligente do próximo despacho
   */
  async planNextShipment(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.planningService.planNextShipment();

      if (result.success) {
        res.status(200).json({
          message: result.message,
          data: {
            plannedShipments: result.plannedShipments,
            assignedVehicle: result.assignedVehicle,
            route: {
              path: result.plannedRoute,
              totalDistance: result.totalDistance,
              estimatedDuration: result.estimatedDuration
            },
            efficiency: result.efficiency
          },
          analytics: {
            shipmentsCount: result.plannedShipments.length,
            totalWeight: result.plannedShipments.reduce((sum, s) => sum + s.weightKg, 0),
            averagePriority: result.plannedShipments.reduce((sum, s) => sum + s.priority, 0) / result.plannedShipments.length,
            vehicleUtilization: result.assignedVehicle ? 
              (result.plannedShipments.reduce((sum, s) => sum + s.weightKg, 0) / result.assignedVehicle.capacityKg * 100).toFixed(1) + '%' 
              : '0%'
          }
        });
      } else {
        res.status(400).json({
          message: result.message,
          success: false
        });
      }
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro interno no planejamento',
        success: false
      });
    }
  }

  /**
   * GET /planning/analysis
   * Fornece análise detalhada do estado atual do sistema
   */
  async analyzePlanningState(req: Request, res: Response): Promise<void> {
    try {
      const analysis = await this.planningService.analyzePlanningState();

      res.status(200).json({
        message: 'Análise do estado do planejamento',
        data: analysis,
        insights: this.generateInsights(analysis)
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao analisar estado do planejamento'
      });
    }
  }

  /**
   * POST /planning/cancel
   * Cancela um planejamento em andamento
   */
  async cancelPlanning(req: Request, res: Response): Promise<void> {
    try {
      const { shipmentIds } = req.body;

      if (!shipmentIds || !Array.isArray(shipmentIds) || shipmentIds.length === 0) {
        res.status(400).json({
          error: 'Campo "shipmentIds" é obrigatório e deve ser um array não vazio'
        });
        return;
      }

      await this.planningService.cancelPlanning(shipmentIds);

      res.status(200).json({
        message: `Planejamento cancelado para ${shipmentIds.length} entregas`,
        cancelledShipments: shipmentIds
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao cancelar planejamento'
      });
    }
  }

  /**
   * POST /planning/complete/:shipmentId
   * Marca uma entrega como finalizada
   */
  async completeShipment(req: Request, res: Response): Promise<void> {
    try {
      const { shipmentId } = req.params;

      if (!shipmentId) {
        res.status(400).json({
          error: 'ID da entrega é obrigatório'
        });
        return;
      }

      await this.planningService.completeShipment(shipmentId);

      res.status(200).json({
        message: 'Entrega marcada como finalizada',
        shipmentId
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao finalizar entrega'
      });
    }
  }

  /**
   * GET /planning/demonstrate-structures
   * Endpoint especial para demonstrar o uso das estruturas de dados
   */
  async demonstrateDataStructures(req: Request, res: Response): Promise<void> {
    try {
      const analysis = await this.planningService.analyzePlanningState();

      // Demonstra cada estrutura de dados em ação
      const demonstration = {
        message: 'Demonstração das Estruturas de Dados do Sistema',
        structures: {
          priorityQueue: {
            description: 'Fila de Prioridade (Min-Heap)',
            usage: 'Usada no ShipmentPlanner para agrupar entregas hierarquicamente',
            demonstration: 'Entregas são inseridas na fila com base na prioridade (1=alta, 5=baixa), peso e eficiência de agrupamento',
            currentState: `${analysis.totalPendingShipments} entregas pendentes aguardando processamento na fila`
          },
          binaryTree: {
            description: 'Árvore Binária de Agrupamento',
            usage: 'Representa hierarquicamente os lotes ótimos de entregas',
            demonstration: 'Cada nó folha = 1 entrega, nós internos = lotes agrupados',
            currentState: analysis.groupingTreeStats
          },
          graph: {
            description: 'Grafo com Algoritmo de Dijkstra',
            usage: 'Calcula rotas ótimas entre localidades usando menor distância',
            demonstration: 'Cada localidade = nó, cada estrada = aresta com peso (distância)',
            currentState: 'Grafo construído dinamicamente a partir das localidades e estradas cadastradas'
          }
        },
        algorithmicFlow: {
          step1: 'Entregas pendentes → Fila de Prioridade (ordenação por urgência)',
          step2: 'Fila de Prioridade → Árvore Binária (agrupamento hierárquico)',
          step3: 'Árvore Binária → Seleção do lote ótimo (baseado em capacidade do veículo)',
          step4: 'Lote selecionado → Grafo (cálculo da rota ótima)',
          step5: 'Rota calculada → Execução do plano (atualização do banco de dados)'
        },
        recommendedBatches: analysis.recommendedBatches
      };

      res.status(200).json(demonstration);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro na demonstração das estruturas'
      });
    }
  }

  /**
   * GET /planning/health
   * Verifica a saúde do sistema de planejamento
   */
  async checkPlanningHealth(req: Request, res: Response): Promise<void> {
    try {
      const analysis = await this.planningService.analyzePlanningState();
      
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        metrics: {
          pendingShipments: analysis.totalPendingShipments,
          availableVehicles: analysis.availableVehicles,
          canPlan: analysis.totalPendingShipments > 0 && analysis.availableVehicles > 0,
          averageEfficiency: analysis.recommendedBatches.length > 0 ? 
            (analysis.recommendedBatches.reduce((sum, b) => sum + b.efficiency, 0) / analysis.recommendedBatches.length).toFixed(3) : 0
        },
        warnings: []
      };

      // Adiciona avisos baseados no estado
      if (analysis.totalPendingShipments === 0) {
        health.warnings.push('Não há entregas pendentes');
      }
      
      if (analysis.availableVehicles === 0) {
        health.warnings.push('Não há veículos disponíveis');
        health.status = 'warning';
      }

      if (analysis.recommendedBatches.length === 0 && analysis.totalPendingShipments > 0) {
        health.warnings.push('Não foi possível gerar estratégias de despacho viáveis');
        health.status = 'warning';
      }

      res.status(200).json(health);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Erro ao verificar saúde do sistema',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Gera insights baseados na análise do planejamento
   */
  private generateInsights(analysis: any): string[] {
    const insights: string[] = [];

    if (analysis.totalPendingShipments === 0) {
      insights.push('✅ Todas as entregas foram processadas');
    } else if (analysis.totalPendingShipments > 0 && analysis.availableVehicles === 0) {
      insights.push('⚠️ Há entregas pendentes mas nenhum veículo disponível');
    } else if (analysis.recommendedBatches.length > 0) {
      const bestBatch = analysis.recommendedBatches[0];
      insights.push(`🚚 Melhor estratégia: ${bestBatch.description} (Eficiência: ${(bestBatch.efficiency * 100).toFixed(1)}%)`);
    }

    if (analysis.groupingTreeStats.averagePriority < 2.0) {
      insights.push('🔥 Alta concentração de entregas urgentes (prioridade < 2.0)');
    }

    if (analysis.groupingTreeStats.totalWeight > 10000) {
      insights.push('📦 Grande volume de carga aguardando despacho');
    }

    return insights;
  }
} 