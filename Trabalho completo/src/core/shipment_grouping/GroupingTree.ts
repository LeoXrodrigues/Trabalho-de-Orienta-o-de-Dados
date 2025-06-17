import { Shipment } from '@prisma/client';

/**
 * Representa um nó na árvore de agrupamento de entregas
 * Pode ser uma folha (entrega individual) ou um nó interno (lote de entregas)
 */
export class GroupingNode {
  // Entrega individual (apenas para nós folha)
  public shipment?: Shipment;
  
  // Prioridade do nó (soma das prioridades dos filhos para nós internos)
  public priority: number;
  
  // Peso total do nó (soma dos pesos dos filhos)
  public totalWeight: number;
  
  // Filhos do nó (null para nós folha)
  public left?: GroupingNode;
  public right?: GroupingNode;
  
  // Indica se é um nó folha
  public isLeaf: boolean;

  constructor(shipment?: Shipment, left?: GroupingNode, right?: GroupingNode) {
    this.shipment = shipment;
    this.left = left;
    this.right = right;
    this.isLeaf = !left && !right;

    if (this.isLeaf && shipment) {
      // Nó folha: prioridade e peso da entrega individual
      this.priority = shipment.priority;
      this.totalWeight = shipment.weightKg;
    } else if (left && right) {
      // Nó interno: soma das prioridades e pesos dos filhos
      this.priority = left.priority + right.priority;
      this.totalWeight = left.totalWeight + right.totalWeight;
    } else {
      this.priority = 0;
      this.totalWeight = 0;
    }
  }

  /**
   * Coleta todas as entregas que fazem parte deste nó (e seus filhos)
   * @returns Array de entregas
   */
  collectShipments(): Shipment[] {
    if (this.isLeaf && this.shipment) {
      return [this.shipment];
    }

    const shipments: Shipment[] = [];
    if (this.left) {
      shipments.push(...this.left.collectShipments());
    }
    if (this.right) {
      shipments.push(...this.right.collectShipments());
    }

    return shipments;
  }

  /**
   * Conta o número de entregas neste nó
   * @returns Número de entregas
   */
  getShipmentCount(): number {
    if (this.isLeaf) {
      return this.shipment ? 1 : 0;
    }

    let count = 0;
    if (this.left) {
      count += this.left.getShipmentCount();
    }
    if (this.right) {
      count += this.right.getShipmentCount();
    }

    return count;
  }

  /**
   * Verifica se este lote pode ser atendido por um veículo específico
   * @param vehicleCapacity Capacidade do veículo em kg
   * @returns true se o veículo pode carregar todo o lote
   */
  canFitInVehicle(vehicleCapacity: number): boolean {
    return this.totalWeight <= vehicleCapacity;
  }

  /**
   * Calcula a prioridade média do lote
   * @returns Prioridade média (menor valor = maior prioridade)
   */
  getAveragePriority(): number {
    const shipmentCount = this.getShipmentCount();
    return shipmentCount > 0 ? this.priority / shipmentCount : 0;
  }

  /**
   * Obtém todos os destinos únicos das entregas neste nó
   * @returns Array de IDs de destino únicos
   */
  getUniqueDestinations(): string[] {
    const shipments = this.collectShipments();
    const destinations = shipments.map(s => s.destinationId);
    return [...new Set(destinations)];
  }

  /**
   * Obtém todas as origens únicas das entregas neste nó
   * @returns Array de IDs de origem únicos
   */
  getUniqueOrigins(): string[] {
    const shipments = this.collectShipments();
    const origins = shipments.map(s => s.originId);
    return [...new Set(origins)];
  }

  /**
   * Representação em string do nó para debug
   */
  toString(): string {
    if (this.isLeaf && this.shipment) {
      return `Folha[${this.shipment.id}] P:${this.priority} W:${this.totalWeight}kg`;
    } else {
      return `Nó[${this.getShipmentCount()} entregas] P:${this.priority} W:${this.totalWeight}kg`;
    }
  }
}

/**
 * Representa a árvore completa de agrupamento de entregas
 */
export class GroupingTree {
  public root?: GroupingNode;

  constructor(root?: GroupingNode) {
    this.root = root;
  }

  /**
   * Encontra o melhor lote para despacho baseado em prioridade e viabilidade
   * @param maxCapacity Capacidade máxima do veículo disponível
   * @param maxShipments Número máximo de entregas por lote
   * @returns Melhor nó para despacho ou null se nenhum for viável
   */
  findBestBatchForDispatch(maxCapacity: number, maxShipments?: number): GroupingNode | null {
    if (!this.root) return null;

    return this.findBestNode(this.root, maxCapacity, maxShipments);
  }

  /**
   * Busca recursiva pelo melhor nó para despacho
   */
  private findBestNode(
    node: GroupingNode, 
    maxCapacity: number, 
    maxShipments?: number
  ): GroupingNode | null {
    // Verifica se o nó atual é viável
    const isViable = node.canFitInVehicle(maxCapacity) && 
                     (!maxShipments || node.getShipmentCount() <= maxShipments);

    if (node.isLeaf) {
      return isViable ? node : null;
    }

    // Para nós internos, tenta encontrar o melhor filho
    let bestNode: GroupingNode | null = null;
    let bestPriority = Infinity;

    // Se o nó atual é viável, ele é um candidato
    if (isViable) {
      bestNode = node;
      bestPriority = node.getAveragePriority();
    }

    // Verifica os filhos
    if (node.left) {
      const leftBest = this.findBestNode(node.left, maxCapacity, maxShipments);
      if (leftBest && leftBest.getAveragePriority() < bestPriority) {
        bestNode = leftBest;
        bestPriority = leftBest.getAveragePriority();
      }
    }

    if (node.right) {
      const rightBest = this.findBestNode(node.right, maxCapacity, maxShipments);
      if (rightBest && rightBest.getAveragePriority() < bestPriority) {
        bestNode = rightBest;
        bestPriority = rightBest.getAveragePriority();
      }
    }

    return bestNode;
  }

  /**
   * Percorre a árvore em pré-ordem para debug
   */
  preOrderTraversal(node?: GroupingNode, depth: number = 0): string[] {
    const result: string[] = [];
    const currentNode = node || this.root;
    
    if (!currentNode) return result;

    const indent = '  '.repeat(depth);
    result.push(`${indent}${currentNode.toString()}`);

    if (currentNode.left) {
      result.push(...this.preOrderTraversal(currentNode.left, depth + 1));
    }
    if (currentNode.right) {
      result.push(...this.preOrderTraversal(currentNode.right, depth + 1));
    }

    return result;
  }

  /**
   * Retorna informações estatísticas da árvore
   */
  getStats(): {
    totalShipments: number;
    totalWeight: number;
    averagePriority: number;
    treeHeight: number;
  } {
    if (!this.root) {
      return {
        totalShipments: 0,
        totalWeight: 0,
        averagePriority: 0,
        treeHeight: 0
      };
    }

    return {
      totalShipments: this.root.getShipmentCount(),
      totalWeight: this.root.totalWeight,
      averagePriority: this.root.getAveragePriority(),
      treeHeight: this.calculateHeight(this.root)
    };
  }

  /**
   * Calcula a altura da árvore
   */
  private calculateHeight(node: GroupingNode): number {
    if (node.isLeaf) return 1;

    let leftHeight = 0;
    let rightHeight = 0;

    if (node.left) leftHeight = this.calculateHeight(node.left);
    if (node.right) rightHeight = this.calculateHeight(node.right);

    return 1 + Math.max(leftHeight, rightHeight);
  }
} 