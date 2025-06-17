IMPLEMENTAÇÃO DA FILA DE PRIORIDADE (MIN-HEAP)
==============================================

// Estrutura da Fila de Prioridade - PriorityQueue.ts
export class PriorityQueue<T> {
  private heap: Array<{ item: T; priority: number }> = [];

  /**
   * Adiciona um item à fila com a prioridade especificada
   * @param item Item a ser adicionado
   * @param priority Prioridade (menor valor = maior prioridade)
   */
  enqueue(item: T, priority: number): void {
    const node = { item, priority };
    this.heap.push(node);
    this.heapifyUp(this.heap.length - 1);
  }

  /**
   * Remove e retorna o item com menor prioridade (mais urgente)
   * @returns Item com menor prioridade ou undefined se a fila estiver vazia
   */
  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop()!.item;

    const min = this.heap[0].item;
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return min;
  }

  /**
   * Verifica se a fila está vazia
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Retorna o tamanho da fila
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * OPERAÇÃO HEAPIFY UP - Reorganiza o heap após inserção
   * Garante que o elemento menor suba para a posição correta
   */
  private heapifyUp(index: number): void {
    if (index === 0) return;

    const parentIndex = Math.floor((index - 1) / 2);
    if (this.heap[parentIndex].priority > this.heap[index].priority) {
      this.swap(parentIndex, index);
      this.heapifyUp(parentIndex);
    }
  }

  /**
   * OPERAÇÃO HEAPIFY DOWN - Reorganiza o heap após remoção
   * Garante que o elemento na raiz seja o menor
   */
  private heapifyDown(index: number): void {
    const leftChild = 2 * index + 1;
    const rightChild = 2 * index + 2;
    let smallest = index;

    if (
      leftChild < this.heap.length &&
      this.heap[leftChild].priority < this.heap[smallest].priority
    ) {
      smallest = leftChild;
    }

    if (
      rightChild < this.heap.length &&
      this.heap[rightChild].priority < this.heap[smallest].priority
    ) {
      smallest = rightChild;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this.heapifyDown(smallest);
    }
  }

  /**
   * Troca dois elementos no heap
   */
  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}

USO DA FILA DE PRIORIDADE NO SISTEMA:
=====================================

1. NO ALGORITMO DE DIJKSTRA:
=============================
// Usa a fila para sempre processar o nó com menor distância
dijkstra(startId: string, endId: string): ShortestPathResult | null {
  const distances = new Map<string, number>();
  const pq = new PriorityQueue<string>();

  // Inicializa com o nó de partida
  pq.enqueue(startId, 0);

  while (!pq.isEmpty()) {
    const currentId = pq.dequeue()!; // Sempre pega o nó com menor distância
    
    // Processa vizinhos e adiciona à fila com nova prioridade
    for (const edge of neighbors) {
      const newDistance = distances.get(currentId)! + edge.weight;
      if (newDistance < distances.get(neighborId)!) {
        pq.enqueue(neighborId, newDistance);
      }
    }
  }
}

2. NO AGRUPAMENTO DE ENTREGAS:
==============================
// Usa a fila para construir árvore de agrupamento hierárquico
buildGroupingTree(shipments: Shipment[]): GroupingTree {
  const priorityQueue = new PriorityQueue<GroupingNode>();

  // Adiciona cada entrega como nó folha na fila
  for (const shipment of shipments) {
    const leafNode = new GroupingNode(shipment);
    const priority = this.calculateNodePriority(leafNode);
    priorityQueue.enqueue(leafNode, priority);
  }

  // Constrói árvore hierárquica
  while (priorityQueue.size() > 1) {
    // Remove os dois nós de menor prioridade (mais urgentes)
    const leftNode = priorityQueue.dequeue()!;
    const rightNode = priorityQueue.dequeue()!;

    // Cria nó pai e adiciona de volta à fila
    const parentNode = new GroupingNode(undefined, leftNode, rightNode);
    const parentPriority = this.calculateNodePriority(parentNode);
    priorityQueue.enqueue(parentNode, parentPriority);
  }

  return new GroupingTree(priorityQueue.dequeue()!);
}

3. CÁLCULO DE PRIORIDADE PARA ENTREGAS:
=======================================
// Combina múltiplos fatores para determinar urgência
private calculateNodePriority(node: GroupingNode): number {
  const shipments = node.collectShipments();
  
  // Fator 1: Urgência média das entregas (1=mais urgente, 5=menos urgente)
  const avgUrgency = node.getAveragePriority();
  
  // Fator 2: Eficiência de agrupamento (destinos próximos)
  const groupingEfficiency = this.calculateGroupingEfficiency(shipments);
  
  // Fator 3: Aproveitamento de capacidade do veículo
  const weightFactor = this.calculateWeightFactor(node.totalWeight);
  
  // Fator 4: Tamanho ideal do lote
  const sizeFactor = this.calculateSizeFactor(shipments.length);

  // Combinação ponderada dos fatores
  const priorityScore = 
    (avgUrgency * 0.4) +           // 40% urgência
    (groupingEfficiency * 0.3) +   // 30% agrupamento
    (weightFactor * 0.2) +         // 20% peso
    (sizeFactor * 0.1);            // 10% tamanho

  return priorityScore;
}

VANTAGENS DA FILA DE PRIORIDADE:
================================
✓ Sempre processa primeiro o item mais urgente
✓ Inserção e remoção em O(log n) - muito eficiente
✓ Ideal para algoritmos como Dijkstra que precisam do "menor"
✓ Permite priorização dinâmica baseada em múltiplos critérios
✓ Garante que entregas críticas (vacinas, medicamentos) sejam planejadas primeiro 