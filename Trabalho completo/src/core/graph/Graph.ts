import { PriorityQueue } from './PriorityQueue';

export interface GraphNode {
  id: string;
  name: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export interface ShortestPathResult {
  distance: number;
  path: string[];
}

/**
 * Implementação de um Grafo para representar o mapa de entregas
 * Utiliza o algoritmo de Dijkstra para encontrar a rota mais eficiente
 */
export class Graph {
  private nodes: Map<string, GraphNode> = new Map();
  private adjacencyList: Map<string, GraphEdge[]> = new Map();

  constructor() {}

  /**
   * Adiciona um nó (localização) ao grafo
   */
  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  /**
   * Adiciona uma aresta (estrada) ao grafo
   */
  addEdge(edge: GraphEdge): void {
    // Adiciona a aresta na direção from -> to
    if (!this.adjacencyList.has(edge.from)) {
      this.adjacencyList.set(edge.from, []);
    }
    this.adjacencyList.get(edge.from)!.push(edge);

    // Adiciona a aresta na direção to -> from (grafo não direcionado)
    if (!this.adjacencyList.has(edge.to)) {
      this.adjacencyList.set(edge.to, []);
    }
    this.adjacencyList.get(edge.to)!.push({
      from: edge.to,
      to: edge.from,
      weight: edge.weight
    });
  }

  /**
   * Implementa o algoritmo de Dijkstra para encontrar o menor caminho
   * @param startId ID do nó de origem
   * @param endId ID do nó de destino
   * @returns Resultado com distância e caminho
   */
  dijkstra(startId: string, endId: string): ShortestPathResult | null {
    if (!this.nodes.has(startId) || !this.nodes.has(endId)) {
      return null;
    }

    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const visited = new Set<string>();
    const pq = new PriorityQueue<string>();

    // Inicializa distâncias
    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, nodeId === startId ? 0 : Infinity);
      previous.set(nodeId, null);
    }

    pq.enqueue(startId, 0);

    while (!pq.isEmpty()) {
      const currentId = pq.dequeue()!;
      
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      if (currentId === endId) break;

      const neighbors = this.adjacencyList.get(currentId) || [];
      
      for (const edge of neighbors) {
        const neighborId = edge.to;
        if (visited.has(neighborId)) continue;

        const newDistance = distances.get(currentId)! + edge.weight;
        
        if (newDistance < distances.get(neighborId)!) {
          distances.set(neighborId, newDistance);
          previous.set(neighborId, currentId);
          pq.enqueue(neighborId, newDistance);
        }
      }
    }

    // Reconstrói o caminho
    const path: string[] = [];
    let current: string | null = endId;
    
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current)!;
    }

    if (path[0] !== startId) {
      return null; // Não existe caminho
    }

    return {
      distance: distances.get(endId)!,
      path
    };
  }

  /**
   * Calcula a rota ótima para múltiplos destinos (Problema do Caixeiro Viajante simplificado)
   * @param startId ID do ponto de partida
   * @param destinationIds Lista de IDs dos destinos
   * @returns Rota otimizada com distância total
   */
  calculateOptimalRoute(startId: string, destinationIds: string[]): ShortestPathResult | null {
    if (destinationIds.length === 0) {
      return { distance: 0, path: [startId] };
    }

    if (destinationIds.length === 1) {
      return this.dijkstra(startId, destinationIds[0]);
    }

    // Para múltiplos destinos, usa uma heurística de vizinho mais próximo
    let currentLocation = startId;
    let totalDistance = 0;
    const fullPath: string[] = [startId];
    const remainingDestinations = [...destinationIds];

    while (remainingDestinations.length > 0) {
      let closestDestination = remainingDestinations[0];
      let shortestDistance = Infinity;
      let shortestPathToClosest: string[] = [];

      // Encontra o destino mais próximo
      for (const destination of remainingDestinations) {
        const result = this.dijkstra(currentLocation, destination);
        if (result && result.distance < shortestDistance) {
          shortestDistance = result.distance;
          closestDestination = destination;
          shortestPathToClosest = result.path;
        }
      }

      // Adiciona o caminho ao destino mais próximo (excluindo o ponto de partida)
      if (shortestPathToClosest.length > 1) {
        fullPath.push(...shortestPathToClosest.slice(1));
        totalDistance += shortestDistance;
        currentLocation = closestDestination;
        remainingDestinations.splice(remainingDestinations.indexOf(closestDestination), 1);
      } else {
        // Não foi possível encontrar caminho para algum destino
        return null;
      }
    }

    return {
      distance: totalDistance,
      path: fullPath
    };
  }

  /**
   * Retorna todos os nós do grafo
   */
  getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Retorna todas as arestas do grafo
   */
  getEdges(): GraphEdge[] {
    const edges: GraphEdge[] = [];
    for (const edgeList of this.adjacencyList.values()) {
      edges.push(...edgeList);
    }
    // Remove duplicatas (já que o grafo é não direcionado)
    return edges.filter((edge, index, self) => 
      index === self.findIndex(e => 
        (e.from === edge.from && e.to === edge.to) || 
        (e.from === edge.to && e.to === edge.from)
      )
    );
  }
} 