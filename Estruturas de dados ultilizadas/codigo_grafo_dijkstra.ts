IMPLEMENTAÇÃO DO GRAFO COM ALGORITMO DE DIJKSTRA
==================================================

// Estrutura do Grafo - Graph.ts
export class Graph {
  private nodes: Map<string, GraphNode> = new Map();
  private adjacencyList: Map<string, GraphEdge[]> = new Map();

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
    // Grafo não direcionado - adiciona em ambas as direções
    if (!this.adjacencyList.has(edge.from)) {
      this.adjacencyList.set(edge.from, []);
    }
    this.adjacencyList.get(edge.from)!.push(edge);
    
    // Aresta reversa
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
   * ALGORITMO DE DIJKSTRA - Encontra o menor caminho
   */
  dijkstra(startId: string, endId: string): ShortestPathResult | null {
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

    return {
      distance: distances.get(endId)!,
      path
    };
  }

  /**
   * ROTA OTIMIZADA PARA MÚLTIPLOS DESTINOS
   * Resolve problema similar ao do Caixeiro Viajante
   */
  calculateOptimalRoute(startId: string, destinationIds: string[]): ShortestPathResult | null {
    if (destinationIds.length === 0) {
      return { distance: 0, path: [startId] };
    }

    if (destinationIds.length === 1) {
      return this.dijkstra(startId, destinationIds[0]);
    }

    // Constrói matriz de distâncias entre todos os pontos
    const allPoints = [startId, ...destinationIds];
    const distanceMatrix = this.buildDistanceMatrix(allPoints);
    
    if (!distanceMatrix) return null;
    
    // Encontra sequência ótima usando algoritmo melhorado
    let bestRoute = this.findOptimalSequence(startId, destinationIds, distanceMatrix);
    
    if (!bestRoute) return null;
    
    // Aplica otimização 2-opt para rotas maiores
    if (destinationIds.length > 3) {
      const improvedRoute = this.optimize2Opt(bestRoute, distanceMatrix);
      if (improvedRoute && improvedRoute.totalDistance < bestRoute.totalDistance) {
        bestRoute = improvedRoute;
      }
    }
    
    const fullPath = this.buildFullPath(bestRoute.sequence, distanceMatrix);
    
    return {
      distance: bestRoute.totalDistance,
      path: fullPath
    };
  }
}

EXEMPLO DE USO NO SISTEMA:
==========================

// No PlanningService - construção do grafo do mapa
private async buildMapGraph(): Promise<Graph> {
  const graph = new Graph();
  
  // Adiciona localizações como nós
  const locations = await this.prisma.location.findMany();
  for (const location of locations) {
    graph.addNode({
      id: location.id,
      name: location.name
    });
  }
  
  // Adiciona estradas como arestas
  const roads = await this.prisma.road.findMany();
  for (const road of roads) {
    graph.addEdge({
      from: road.fromLocationId,
      to: road.toLocationId,
      weight: road.distanceKm
    });
  }
  
  return graph;
}

// Cálculo de rota ótima para entregas
private async calculateOptimalRoute(
  graph: Graph,
  startLocationId: string,
  shipments: Shipment[]
): Promise<{ distance: number; path: string[] } | null> {
  
  const destinations = [...new Set(shipments.map(s => s.destinationId))];
  return graph.calculateOptimalRoute(startLocationId, destinations);
} 