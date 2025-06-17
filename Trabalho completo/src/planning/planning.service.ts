import { PrismaClient, Shipment, Vehicle, Location, Road } from '@prisma/client';
import { ShipmentPlanner } from '../core/shipment_grouping/ShipmentPlanner';
import { GroupingTree, GroupingNode } from '../core/shipment_grouping/GroupingTree';
import { Graph, GraphNode, GraphEdge } from '../core/graph/Graph';

export interface PlanningResult {
  success: boolean;
  message: string;
  plannedShipments: Shipment[];
  assignedVehicle?: Vehicle;
  plannedRoute?: string[];
  totalDistance?: number;
  estimatedDuration?: number;
  efficiency: number;
}

export interface PlanningAnalysis {
  totalPendingShipments: number;
  availableVehicles: number;
  groupingTreeStats: {
    totalShipments: number;
    totalWeight: number;
    averagePriority: number;
    treeHeight: number;
  };
  recommendedBatches: {
    vehicleId: string;
    shipmentCount: number;
    totalWeight: number;
    efficiency: number;
    description: string;
  }[];
}

/**
 * Serviço principal de planejamento que coordena o uso das estruturas de dados:
 * - Fila de Prioridade (para agrupamento)
 * - Árvore Binária (para representação hierárquica)
 * - Grafo (para cálculo de rotas)
 */
export class PlanningService {
  private prisma: PrismaClient;
  private shipmentPlanner: ShipmentPlanner;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.shipmentPlanner = new ShipmentPlanner();
  }

  /**
   * Método principal: planeja o próximo despacho de entregas
   * Implementa a lógica descrita no plano de arquitetura
   */
  async planNextShipment(): Promise<PlanningResult> {
    try {
      // 1. Busca todas as entregas pendentes
      const pendingShipments = await this.prisma.shipment.findMany({
        where: { status: 'pending' },
        include: {
          origin: true,
          assignedVehicle: true
        }
      });

      if (pendingShipments.length === 0) {
        return {
          success: false,
          message: 'Não há entregas pendentes para planejar',
          plannedShipments: [],
          efficiency: 0
        };
      }

      // 2. Instancia o ShipmentPlanner e constrói a árvore de agrupamento
      const groupingTree = this.shipmentPlanner.buildGroupingTree(pendingShipments);

      // 3. Busca veículos disponíveis
      const availableVehicles = await this.prisma.vehicle.findMany({
        where: { status: 'available' },
        include: { location: true }
      });

      if (availableVehicles.length === 0) {
        return {
          success: false,
          message: 'Não há veículos disponíveis',
          plannedShipments: [],
          efficiency: 0
        };
      }

      // 4. Analisa estratégias de despacho
      const strategies = this.shipmentPlanner.analyzeDispatchStrategies(
        groupingTree,
        availableVehicles.map(v => ({ id: v.id, capacityKg: v.capacityKg }))
      );

      if (strategies.length === 0) {
        return {
          success: false,
          message: 'Não foi possível encontrar estratégia viável de despacho',
          plannedShipments: [],
          efficiency: 0
        };
      }

      // 5. Seleciona a melhor estratégia
      const bestStrategy = strategies[0];
      const selectedVehicle = availableVehicles.find(v => v.id === bestStrategy.vehicleId)!;
      const shipmentBatch = bestStrategy.batch.collectShipments();

      // 6. Constrói o grafo do mapa e calcula a rota ótima
      const mapGraph = await this.buildMapGraph();
      const optimalRoute = await this.calculateOptimalRoute(
        mapGraph, 
        selectedVehicle.locationId,
        shipmentBatch
      );

      if (!optimalRoute) {
        return {
          success: false,
          message: 'Não foi possível calcular rota viável',
          plannedShipments: [],
          efficiency: 0
        };
      }

      // 7. Atualiza o status das entregas e associa o veículo e rota
      const updatedShipments = await this.executeShipmentPlan(
        shipmentBatch,
        selectedVehicle,
        optimalRoute.path
      );

      return {
        success: true,
        message: `Lote de ${shipmentBatch.length} entregas planejado com sucesso`,
        plannedShipments: updatedShipments,
        assignedVehicle: selectedVehicle,
        plannedRoute: optimalRoute.path,
        totalDistance: optimalRoute.distance,
        estimatedDuration: this.estimateDuration(optimalRoute.distance),
        efficiency: bestStrategy.efficiency
      };

    } catch (error) {
      return {
        success: false,
        message: `Erro no planejamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        plannedShipments: [],
        efficiency: 0
      };
    }
  }

  /**
   * Fornece análise detalhada do estado atual do planejamento
   */
  async analyzePlanningState(): Promise<PlanningAnalysis> {
    const pendingShipments = await this.prisma.shipment.findMany({
      where: { status: 'pending' },
      include: { origin: true }
    });

    const availableVehicles = await this.prisma.vehicle.findMany({
      where: { status: 'available' }
    });

    let groupingTreeStats = {
      totalShipments: 0,
      totalWeight: 0,
      averagePriority: 0,
      treeHeight: 0
    };

    let recommendedBatches: {
      vehicleId: string;
      shipmentCount: number;
      totalWeight: number;
      efficiency: number;
      description: string;
    }[] = [];

    if (pendingShipments.length > 0) {
      const groupingTree = this.shipmentPlanner.buildGroupingTree(pendingShipments);
      groupingTreeStats = groupingTree.getStats();

      const strategies = this.shipmentPlanner.analyzeDispatchStrategies(
        groupingTree,
        availableVehicles.map(v => ({ id: v.id, capacityKg: v.capacityKg }))
      );

      recommendedBatches = strategies.slice(0, 5).map(strategy => ({
        vehicleId: strategy.vehicleId,
        shipmentCount: strategy.batch.getShipmentCount(),
        totalWeight: strategy.batch.totalWeight,
        efficiency: strategy.efficiency,
        description: strategy.description
      }));
    }

    return {
      totalPendingShipments: pendingShipments.length,
      availableVehicles: availableVehicles.length,
      groupingTreeStats,
      recommendedBatches
    };
  }

  /**
   * Constrói o grafo do mapa a partir dos dados de localidades e estradas
   */
  private async buildMapGraph(): Promise<Graph> {
    const graph = new Graph();

    // Adiciona todas as localidades como nós
    const locations = await this.prisma.location.findMany();
    for (const location of locations) {
      graph.addNode({
        id: location.id,
        name: location.name
      });
    }

    // Adiciona todas as estradas como arestas
    const roads = await this.prisma.road.findMany({
      include: {
        source: true,
        destination: true
      }
    });

    for (const road of roads) {
      graph.addEdge({
        from: road.sourceId,
        to: road.destinationId,
        weight: road.distance
      });
    }

    return graph;
  }

  /**
   * Calcula a rota ótima para um lote de entregas
   */
  private async calculateOptimalRoute(
    graph: Graph,
    startLocationId: string,
    shipments: Shipment[]
  ): Promise<{ distance: number; path: string[] } | null> {
    // Coleta todos os destinos únicos
    const destinationIds = [...new Set(shipments.map(s => s.destinationId))];

    if (destinationIds.length === 0) {
      return { distance: 0, path: [startLocationId] };
    }

    // Usa o algoritmo de rota ótima do grafo
    return graph.calculateOptimalRoute(startLocationId, destinationIds);
  }

  /**
   * Executa o plano de entregas: atualiza status e associa veículo/rota
   */
  private async executeShipmentPlan(
    shipments: Shipment[],
    vehicle: Vehicle,
    route: string[]
  ): Promise<Shipment[]> {
    const routeString = JSON.stringify(route);

    // Atualiza o status do veículo para 'assigned'
    await this.prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { status: 'assigned' }
    });

    // Atualiza todas as entregas do lote
    const updatedShipments: Shipment[] = [];
    for (const shipment of shipments) {
      const updated = await this.prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: 'planned',
          assignedVehicleId: vehicle.id,
          plannedRoute: routeString
        }
      });
      updatedShipments.push(updated);
    }

    return updatedShipments;
  }

  /**
   * Estima a duração da viagem baseada na distância
   */
  private estimateDuration(distance: number): number {
    // Assume velocidade média de 60 km/h
    const averageSpeedKmH = 60;
    return (distance / averageSpeedKmH) * 60; // retorna em minutos
  }

  /**
   * Cancela um planejamento em andamento
   */
  async cancelPlanning(shipmentIds: string[]): Promise<void> {
    // Encontra o veículo associado
    const shipments = await this.prisma.shipment.findMany({
      where: { 
        id: { in: shipmentIds },
        status: 'planned'
      },
      include: { assignedVehicle: true }
    });

    if (shipments.length === 0) return;

    const vehicleId = shipments[0].assignedVehicleId;

    // Volta as entregas para pendente
    await this.prisma.shipment.updateMany({
      where: { id: { in: shipmentIds } },
      data: {
        status: 'pending',
        assignedVehicleId: null,
        plannedRoute: null
      }
    });

    // Libera o veículo
    if (vehicleId) {
      await this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'available' }
      });
    }
  }

  /**
   * Finaliza uma entrega (marca como completed)
   */
  async completeShipment(shipmentId: string): Promise<void> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { assignedVehicle: true }
    });

    if (!shipment) {
      throw new Error('Entrega não encontrada');
    }

    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: 'completed' }
    });

    // Verifica se todas as entregas do veículo foram completadas
    if (shipment.assignedVehicleId) {
      const remainingShipments = await this.prisma.shipment.count({
        where: {
          assignedVehicleId: shipment.assignedVehicleId,
          status: { in: ['planned', 'in_transit'] }
        }
      });

      // Se não há mais entregas, libera o veículo
      if (remainingShipments === 0) {
        await this.prisma.vehicle.update({
          where: { id: shipment.assignedVehicleId },
          data: { status: 'available' }
        });
      }
    }
  }
} 