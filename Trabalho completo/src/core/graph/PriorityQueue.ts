/**
 * Implementação de uma Fila de Prioridade (Min-Heap) genérica
 * Usada tanto para o algoritmo de Dijkstra quanto para o agrupamento de entregas
 */
export class PriorityQueue<T> {
  private heap: Array<{ item: T; priority: number }> = [];

  constructor() {}

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
   * Remove e retorna o item com menor prioridade
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
   * Reorganiza o heap para cima (usado após inserção)
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
   * Reorganiza o heap para baixo (usado após remoção)
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