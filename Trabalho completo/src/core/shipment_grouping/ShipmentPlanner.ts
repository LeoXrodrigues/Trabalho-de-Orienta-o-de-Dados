import { Shipment } from '@prisma/client';
import { PriorityQueue } from '../graph/PriorityQueue';
import { GroupingNode, GroupingTree } from './GroupingTree';

/**
 * Classe principal responsável pelo planejamento inteligente de entregas
 * Utiliza uma árvore de agrupamento construída com fila de prioridade
 */
export class ShipmentPlanner {
  constructor() {}

  /**
   * Constrói uma árvore de agrupamento hierárquico das entregas
   * Utiliza uma fila de prioridade (min-heap) para agrupar entregas de forma ótima
   * 
   * @param shipments Lista de entregas pendentes
   * @returns Árvore de agrupamento construída
   */
  buildGroupingTree(shipments: Shipment[]): GroupingTree {
    if (shipments.length === 0) {
      return new GroupingTree();
    }

    if (shipments.length === 1) {
      const leafNode = new GroupingNode(shipments[0]);
      return new GroupingTree(leafNode);
    }

    // Cria a fila de prioridade para agrupar os nós
    const priorityQueue = new PriorityQueue<GroupingNode>();

    // Cria um nó folha para cada entrega e adiciona à fila
    // A prioridade é baseada na urgência da entrega (menor valor = maior prioridade)
    for (const shipment of shipments) {
      const leafNode = new GroupingNode(shipment);
      priorityQueue.enqueue(leafNode, this.calculateNodePriority(leafNode));
    }

    // Constrói a árvore hierárquica agrupando nós de menor prioridade
    while (priorityQueue.size() > 1) {
      // Remove os dois nós de menor prioridade
      const leftNode = priorityQueue.dequeue()!;
      const rightNode = priorityQueue.dequeue()!;

      // Cria um novo nó interno com os dois nós como filhos
      const parentNode = new GroupingNode(undefined, leftNode, rightNode);
      
      // Calcula a prioridade do novo nó e o adiciona de volta à fila
      const parentPriority = this.calculateNodePriority(parentNode);
      priorityQueue.enqueue(parentNode, parentPriority);
    }

    // O último nó na fila é a raiz da árvore
    const rootNode = priorityQueue.dequeue()!;
    return new GroupingTree(rootNode);
  }

  /**
   * Calcula a prioridade de um nó para ordenação na fila
   * Considera múltiplos fatores: urgência, peso, e eficiência de agrupamento
   * 
   * @param node Nó para calcular a prioridade
   * @returns Valor de prioridade (menor = mais prioritário)
   */
  private calculateNodePriority(node: GroupingNode): number {
    const shipments = node.collectShipments();
    
    // Fator 1: Prioridade média das entregas (1 = mais urgente, 5 = menos urgente)
    const avgUrgency = node.getAveragePriority();
    
    // Fator 2: Eficiência de agrupamento (prioriza lotes com destinos próximos)
    const groupingEfficiency = this.calculateGroupingEfficiency(shipments);
    
    // Fator 3: Fator de peso (lotes muito pesados ou muito leves são menos prioritários)
    const weightFactor = this.calculateWeightFactor(node.totalWeight);
    
    // Fator 4: Fator de tamanho do lote (lotes de tamanho médio são preferidos)
    const sizeFactor = this.calculateSizeFactor(shipments.length);

    // Combina todos os fatores em uma única pontuação
    // Pesos ajustáveis para diferentes estratégias de priorização
    const priorityScore = 
      (avgUrgency * 0.4) +           // 40% baseado na urgência
      (groupingEfficiency * 0.3) +   // 30% baseado na eficiência de agrupamento
      (weightFactor * 0.2) +         // 20% baseado no peso
      (sizeFactor * 0.1);            // 10% baseado no tamanho do lote

    return priorityScore;
  }

  /**
   * Calcula a eficiência de agrupamento baseada na similaridade dos destinos
   * Lotes com destinos próximos ou iguais têm melhor eficiência
   */
  private calculateGroupingEfficiency(shipments: Shipment[]): number {
    if (shipments.length <= 1) return 1.0;

    const destinations = shipments.map(s => s.destinationId);
    const uniqueDestinations = new Set(destinations);
    
    // Quanto menos destinos únicos, melhor a eficiência
    const efficiency = uniqueDestinations.size / shipments.length;
    
    // Inverte o valor para que menor = melhor prioridade
    return efficiency;
  }

  /**
   * Calcula o fator de peso para otimizar a utilização de veículos
   * Prefere lotes que aproveitam bem a capacidade dos veículos
   */
  private calculateWeightFactor(totalWeight: number): number {
    // Assume capacidades típicas de veículos: 1000kg, 2000kg, 5000kg
    const typicalCapacities = [1000, 2000, 5000];
    
    // Encontra a melhor utilização de capacidade
    let bestUtilization = 0;
    for (const capacity of typicalCapacities) {
      if (totalWeight <= capacity) {
        const utilization = totalWeight / capacity;
        bestUtilization = Math.max(bestUtilization, utilization);
      }
    }

    // Prefere utilizações entre 70% e 95%
    if (bestUtilization >= 0.7 && bestUtilization <= 0.95) {
      return 1.0; // Ótimo
    } else if (bestUtilization >= 0.5) {
      return 1.5; // Bom
    } else {
      return 2.0; // Pode melhorar
    }
  }

  /**
   * Calcula o fator de tamanho do lote
   * Prefere lotes de tamanho médio (não muito pequenos nem muito grandes)
   */
  private calculateSizeFactor(shipmentCount: number): number {
    if (shipmentCount >= 3 && shipmentCount <= 8) {
      return 1.0; // Tamanho ideal
    } else if (shipmentCount >= 2 && shipmentCount <= 10) {
      return 1.2; // Tamanho aceitável
    } else {
      return 1.5; // Muito pequeno ou muito grande
    }
  }

  /**
   * Analisa a árvore de agrupamento e sugere estratégias de despacho
   * 
   * @param tree Árvore de agrupamento construída
   * @param availableVehicles Lista de veículos disponíveis com suas capacidades
   * @returns Sugestões de despacho ordenadas por prioridade
   */
  analyzeDispatchStrategies(tree: GroupingTree, availableVehicles: { id: string, capacityKg: number }[]): {
    vehicleId: string;
    batch: GroupingNode;
    efficiency: number;
    description: string;
  }[] {
    const suggestions: {
      vehicleId: string;
      batch: GroupingNode;
      efficiency: number;
      description: string;
    }[] = [];

    if (!tree.root) return suggestions;

    // Para cada veículo, encontra o melhor lote
    for (const vehicle of availableVehicles) {
      const bestBatch = tree.findBestBatchForDispatch(vehicle.capacityKg);
      
      if (bestBatch) {
        const shipments = bestBatch.collectShipments();
        const utilization = bestBatch.totalWeight / vehicle.capacityKg;
        const avgPriority = bestBatch.getAveragePriority();
        const uniqueDestinations = bestBatch.getUniqueDestinations().length;
        
        // Calcula a eficiência geral da sugestão
        const efficiency = this.calculateDispatchEfficiency(
          utilization, 
          avgPriority, 
          uniqueDestinations, 
          shipments.length
        );

        suggestions.push({
          vehicleId: vehicle.id,
          batch: bestBatch,
          efficiency,
          description: this.generateDispatchDescription(bestBatch, vehicle.capacityKg)
        });
      }
    }

    // Ordena por eficiência (maior = melhor)
    return suggestions.sort((a, b) => b.efficiency - a.efficiency);
  }

  /**
   * Calcula a eficiência geral de uma estratégia de despacho
   */
  private calculateDispatchEfficiency(
    utilization: number,
    avgPriority: number,
    uniqueDestinations: number,
    shipmentCount: number
  ): number {
    // Normaliza a prioridade (1-5 para 0.8-0.2)
    const priorityScore = (6 - avgPriority) / 5;
    
    // Pontuação de utilização (ótimo entre 0.7-0.95)
    const utilizationScore = utilization >= 0.7 && utilization <= 0.95 ? 1.0 : 
                            utilization >= 0.5 ? 0.8 : 0.6;
    
    // Pontuação de concentração de destinos (menos destinos = melhor)
    const destinationScore = Math.max(0.2, 1 - (uniqueDestinations / shipmentCount));
    
    // Pontuação de tamanho do lote
    const sizeScore = shipmentCount >= 3 && shipmentCount <= 8 ? 1.0 : 0.8;

    return (priorityScore * 0.4) + (utilizationScore * 0.3) + 
           (destinationScore * 0.2) + (sizeScore * 0.1);
  }

  /**
   * Gera uma descrição textual da estratégia de despacho
   */
  private generateDispatchDescription(batch: GroupingNode, vehicleCapacity: number): string {
    const shipments = batch.collectShipments();
    const utilization = (batch.totalWeight / vehicleCapacity * 100).toFixed(1);
    const avgPriority = batch.getAveragePriority().toFixed(1);
    const destinations = batch.getUniqueDestinations().length;

    return `Lote de ${shipments.length} entregas (${batch.totalWeight}kg) ` +
           `com ${destinations} destino(s). Utilização: ${utilization}%. ` +
           `Prioridade média: ${avgPriority}`;
  }
} 