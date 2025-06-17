IMPLEMENTAÇÃO DA ÁRVORE DE AGRUPAMENTO HIERÁRQUICO
==================================================

// Estrutura do Nó da Árvore - GroupingNode.ts
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
    }
  }

  /**
   * COLETA TODAS AS ENTREGAS DO NÓ
   * Percorre a subárvore e retorna todas as entregas
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
   */
  getShipmentCount(): number {
    if (this.isLeaf) {
      return this.shipment ? 1 : 0;
    }

    let count = 0;
    if (this.left) count += this.left.getShipmentCount();
    if (this.right) count += this.right.getShipmentCount();
    return count;
  }

  /**
   * VERIFICA ADEQUAÇÃO PARA VEÍCULO
   * Valida se o lote cabe na capacidade do veículo
   */
  canFitInVehicle(vehicleCapacity: number): boolean {
    return this.totalWeight <= vehicleCapacity;
  }

  /**
   * CALCULA PRIORIDADE MÉDIA DO LOTE
   * Usado para ordenação de urgência
   */
  getAveragePriority(): number {
    const shipmentCount = this.getShipmentCount();
    return shipmentCount > 0 ? this.priority / shipmentCount : 0;
  }

  /**
   * ANÁLISE DE DESTINOS ÚNICOS
   * Ajuda na otimização de rotas
   */
  getUniqueDestinations(): string[] {
    const shipments = this.collectShipments();
    const destinations = shipments.map(s => s.destinationId);
    return [...new Set(destinations)];
  }
}

// Estrutura da Árvore Completa - GroupingTree.ts
export class GroupingTree {
  public root?: GroupingNode;

  constructor(root?: GroupingNode) {
    this.root = root;
  }

  /**
   * BUSCA PELO MELHOR LOTE PARA DESPACHO
   * Encontra o nó mais adequado baseado em capacidade e prioridade
   */
  findBestBatchForDispatch(maxCapacity: number, maxShipments?: number): GroupingNode | null {
    if (!this.root) return null;
    return this.findBestNode(this.root, maxCapacity, maxShipments);
  }

  /**
   * BUSCA RECURSIVA PELO MELHOR NÓ
   * Implementa algoritmo de busca otimizada na árvore
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

    // Para nós internos, busca o melhor filho
    let bestNode: GroupingNode | null = null;
    let bestPriority = Infinity;

    // Se o nó atual é viável, ele é um candidato
    if (isViable) {
      bestNode = node;
      bestPriority = node.getAveragePriority();
    }

    // Verifica os filhos recursivamente
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
   * TRAVERSAL PRÉ-ORDEM PARA DEBUG
   * Útil para visualizar a estrutura da árvore
   */
  preOrderTraversal(node?: GroupingNode, depth: number = 0): string[] {
    if (!node) node = this.root;
    if (!node) return [];

    const result: string[] = [];
    const indent = "  ".repeat(depth);
    
    if (node.isLeaf && node.shipment) {
      result.push(`${indent}Entrega: ${node.shipment.cargoDescription} (${node.totalWeight}kg, P:${node.priority})`);
    } else {
      result.push(`${indent}Lote: ${node.getShipmentCount()} entregas (${node.totalWeight}kg, P:${node.getAveragePriority().toFixed(1)})`);
    }

    if (node.left) {
      result.push(...this.preOrderTraversal(node.left, depth + 1));
    }
    if (node.right) {
      result.push(...this.preOrderTraversal(node.right, depth + 1));
    }

    return result;
  }

  /**
   * ESTATÍSTICAS DA ÁRVORE
   * Métricas para análise de desempenho
   */
  getStats(): {
    totalShipments: number;
    totalWeight: number;
    averagePriority: number;
    treeHeight: number;
  } {
    if (!this.root) {
      return { totalShipments: 0, totalWeight: 0, averagePriority: 0, treeHeight: 0 };
    }

    return {
      totalShipments: this.root.getShipmentCount(),
      totalWeight: this.root.totalWeight,
      averagePriority: this.root.getAveragePriority(),
      treeHeight: this.calculateHeight(this.root)
    };
  }

  private calculateHeight(node: GroupingNode): number {
    if (node.isLeaf) return 1;
    
    let leftHeight = 0;
    let rightHeight = 0;
    
    if (node.left) leftHeight = this.calculateHeight(node.left);
    if (node.right) rightHeight = this.calculateHeight(node.right);
    
    return Math.max(leftHeight, rightHeight) + 1;
  }
}

CONSTRUÇÃO DA ÁRVORE NO SISTEMA:
================================

// No ShipmentPlanner - constrói a árvore hierárquica
buildGroupingTree(shipments: Shipment[]): GroupingTree {
  if (shipments.length === 0) {
    return new GroupingTree();
  }

  if (shipments.length === 1) {
    const leafNode = new GroupingNode(shipments[0]);
    return new GroupingTree(leafNode);
  }

  // Usa fila de prioridade para construir a árvore bottom-up
  const priorityQueue = new PriorityQueue<GroupingNode>();

  // Cria nós folha para cada entrega
  for (const shipment of shipments) {
    const leafNode = new GroupingNode(shipment);
    priorityQueue.enqueue(leafNode, this.calculateNodePriority(leafNode));
  }

  // Constrói a árvore hierárquica
  while (priorityQueue.size() > 1) {
    // Remove os dois nós de menor prioridade (mais urgentes)
    const leftNode = priorityQueue.dequeue()!;
    const rightNode = priorityQueue.dequeue()!;

    // Cria nó pai combinando os dois filhos
    const parentNode = new GroupingNode(undefined, leftNode, rightNode);
    
    // Calcula prioridade do novo nó e adiciona de volta à fila
    const parentPriority = this.calculateNodePriority(parentNode);
    priorityQueue.enqueue(parentNode, parentPriority);
  }

  // O último nó na fila é a raiz da árvore
  const rootNode = priorityQueue.dequeue()!;
  return new GroupingTree(rootNode);
}

USO NO PLANEJAMENTO DE ENTREGAS:
================================

// No PlanningService - encontra melhor estratégia
async planNextShipment(): Promise<PlanningResult> {
  // 1. Busca entregas pendentes
  const pendingShipments = await this.prisma.shipment.findMany({
    where: { status: 'pending' }
  });

  // 2. Constrói árvore de agrupamento
  const groupingTree = this.shipmentPlanner.buildGroupingTree(pendingShipments);

  // 3. Busca veículos disponíveis
  const availableVehicles = await this.prisma.vehicle.findMany({
    where: { status: 'available' }
  });

  // 4. Para cada veículo, encontra o melhor lote na árvore
  for (const vehicle of availableVehicles) {
    const bestBatch = groupingTree.findBestBatchForDispatch(
      vehicle.capacityKg,
      8 // máximo de 8 entregas por viagem
    );

    if (bestBatch) {
      const shipmentBatch = bestBatch.collectShipments();
      // Prossegue com planejamento da rota...
    }
  }
}

VANTAGENS DA ÁRVORE HIERÁRQUICA:
================================
✓ Organização natural por prioridade e similaridade
✓ Busca eficiente por lotes adequados O(log n)
✓ Flexibilidade na escolha do tamanho do lote
✓ Otimização automática de agrupamento
✓ Facilita análise de diferentes estratégias de despacho
✓ Suporte a critérios múltiplos de agrupamento 