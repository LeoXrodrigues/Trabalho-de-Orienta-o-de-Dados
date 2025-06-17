IMPLEMENTAÇÃO DE TABELA HASH (MAP) NO SISTEMA
===========================================

O sistema utiliza as Tabelas Hash nativas do TypeScript (Map) para acesso rápido
a dados de caminhões, motoristas, localizações e informações de cargas.

PRINCIPAIS USOS DA TABELA HASH:
===============================

1. ARMAZENAMENTO DE NÓS E ARESTAS NO GRAFO:
==========================================
// Na classe Graph - adjacencyList e nodes
export class Graph {
  private nodes: Map<string, GraphNode> = new Map();           // Tabela Hash: ID -> Nó
  private adjacencyList: Map<string, GraphEdge[]> = new Map(); // Tabela Hash: ID -> Lista de Arestas

  /**
   * ACESSO O(1) aos nós do grafo
   */
  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);  // Inserção O(1)
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  /**
   * BUSCA O(1) de vizinhos
   */
  getNeighbors(nodeId: string): GraphEdge[] {
    return this.adjacencyList.get(nodeId) || [];  // Busca O(1)
  }
}

2. CACHE DE DISTÂNCIAS NO ALGORITMO DE DIJKSTRA:
===============================================
dijkstra(startId: string, endId: string): ShortestPathResult | null {
  // Tabelas Hash para armazenar distâncias e caminhos anteriores
  const distances = new Map<string, number>();     // O(1) para acessar distância
  const previous = new Map<string, string | null>(); // O(1) para reconstruir caminho

  // Inicialização rápida usando Map
  for (const nodeId of this.nodes.keys()) {
    distances.set(nodeId, nodeId === startId ? 0 : Infinity);
    previous.set(nodeId, null);
  }

  // Durante o algoritmo - acesso constante
  while (!pq.isEmpty()) {
    const currentId = pq.dequeue()!;
    const currentDistance = distances.get(currentId)!; // O(1)
    
    for (const edge of neighbors) {
      const newDistance = currentDistance + edge.weight;
      if (newDistance < distances.get(neighborId)!) {    // O(1)
        distances.set(neighborId, newDistance);          // O(1)
        previous.set(neighborId, currentId);             // O(1)
      }
    }
  }
}

3. MATRIZ DE DISTÂNCIAS PARA MÚLTIPLOS DESTINOS:
===============================================
// Tabela Hash aninhada para cache de rotas calculadas
private buildDistanceMatrix(points: string[]): Map<string, Map<string, {distance: number, path: string[]}>> | null {
  const matrix = new Map<string, Map<string, {distance: number, path: string[]}>>();

  for (const from of points) {
    matrix.set(from, new Map()); // Cria subtabela para cada origem

    for (const to of points) {
      if (from === to) {
        matrix.get(from)!.set(to, { distance: 0, path: [from] });
      } else {
        const result = this.dijkstra(from, to);
        if (result) {
          matrix.get(from)!.set(to, result); // Armazena resultado O(1)
        }
      }
    }
  }

  return matrix;
}

// USO da matriz - acesso duplo O(1)
const getDistance = (from: string, to: string) => {
  return matrix.get(from)?.get(to)?.distance || Infinity;
};

4. REPOSITÓRIOS COM CACHE USANDO MAP:
====================================
// Exemplo conceitual de como os repositórios poderiam usar cache
export class VehicleRepository {
  private vehicleCache = new Map<string, Vehicle>();  // Cache de veículos
  private locationCache = new Map<string, Location>(); // Cache de localizações

  /**
   * BUSCA COM CACHE - primeiro tenta o cache O(1)
   */
  async findById(id: string): Promise<Vehicle | null> {
    // Verifica cache primeiro
    if (this.vehicleCache.has(id)) {
      return this.vehicleCache.get(id)!; // Retorno O(1)
    }

    // Se não estiver em cache, busca no banco
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { location: true }
    });

    // Armazena no cache para próximas consultas
    if (vehicle) {
      this.vehicleCache.set(id, vehicle);    // O(1)
      if (vehicle.location) {
        this.locationCache.set(vehicle.locationId, vehicle.location); // O(1)
      }
    }

    return vehicle;
  }

  /**
   * INVALIDAÇÃO SELETIVA DO CACHE
   */
  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const updated = await this.prisma.vehicle.update({
      where: { id },
      data,
      include: { location: true }
    });

    // Atualiza cache
    this.vehicleCache.set(id, updated);  // O(1)
    
    return updated;
  }
}

5. AGRUPAMENTO DE ENTREGAS POR DESTINO:
======================================
// No ShipmentPlanner
private groupShipmentsByDestination(shipments: Shipment[]): Map<string, Shipment[]> {
  const grouped = new Map<string, Shipment[]>();

  for (const shipment of shipments) {
    const destination = shipment.destinationId;
    
    if (!grouped.has(destination)) {
      grouped.set(destination, []);     // O(1)
    }
    
    grouped.get(destination)!.push(shipment); // O(1)
  }

  return grouped;
}

// USO do agrupamento
const analyzeDestinations = (shipments: Shipment[]) => {
  const grouped = this.groupShipmentsByDestination(shipments);
  
  // Análise rápida por destino
  for (const [destination, batch] of grouped.entries()) {
    const totalWeight = batch.reduce((sum, s) => sum + s.weightKg, 0);
    const avgPriority = batch.reduce((sum, s) => sum + s.priority, 0) / batch.length;
    
    console.log(`Destino ${destination}: ${batch.length} entregas, ${totalWeight}kg, prioridade média ${avgPriority}`);
  }
};

6. CONTROLE DE CAPACIDADE DE VEÍCULOS:
=====================================
// Tabela Hash para mapear tipos de veículo e suas capacidades
const VEHICLE_CAPACITIES = new Map<string, number>([
  ['motorcycle', 50],      // Motocicleta: 50kg
  ['car', 500],           // Carro: 500kg  
  ['van', 1000],          // Van: 1000kg
  ['small_truck', 2000],  // Caminhão pequeno: 2000kg
  ['medium_truck', 5000], // Caminhão médio: 5000kg
  ['large_truck', 10000]  // Caminhão grande: 10000kg
]);

// VALIDAÇÃO RÁPIDA DE CAPACIDADE
const canVehicleCarry = (vehicleType: string, totalWeight: number): boolean => {
  const capacity = VEHICLE_CAPACITIES.get(vehicleType) || 0; // O(1)
  return totalWeight <= capacity;
};

// BUSCA DE VEÍCULOS ADEQUADOS
const findSuitableVehicles = (requiredCapacity: number): string[] => {
  const suitable: string[] = [];
  
  for (const [type, capacity] of VEHICLE_CAPACITIES.entries()) {
    if (capacity >= requiredCapacity) {
      suitable.push(type);
    }
  }
  
  return suitable.sort((a, b) => VEHICLE_CAPACITIES.get(a)! - VEHICLE_CAPACITIES.get(b)!);
};

7. ESTATÍSTICAS E MÉTRICAS EM TEMPO REAL:
========================================
// Cache de estatísticas para dashboard
export class PlanningService {
  private statsCache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();

  private getCachedStats(key: string, ttlMinutes: number = 5): any | null {
    const now = Date.now();
    const expiry = this.cacheExpiry.get(key) || 0;
    
    if (now < expiry && this.statsCache.has(key)) {
      return this.statsCache.get(key);  // O(1)
    }
    
    return null;
  }

  private setCachedStats(key: string, data: any, ttlMinutes: number = 5): void {
    const expiry = Date.now() + (ttlMinutes * 60 * 1000);
    this.statsCache.set(key, data);      // O(1)
    this.cacheExpiry.set(key, expiry);   // O(1)
  }

  async getQuickStats(): Promise<any> {
    const cached = this.getCachedStats('quickStats');
    if (cached) return cached;

    // Calcula estatísticas...
    const stats = {
      pendingShipments: await this.prisma.shipment.count({ where: { status: 'pending' } }),
      availableVehicles: await this.prisma.vehicle.count({ where: { status: 'available' } }),
      // ... outras métricas
    };

    this.setCachedStats('quickStats', stats);
    return stats;
  }
}

VANTAGENS DAS TABELAS HASH NO SISTEMA:
======================================
✓ Acesso O(1) - busca instantânea por ID
✓ Inserção O(1) - adição rápida de novos dados  
✓ Cache eficiente - evita consultas desnecessárias ao banco
✓ Agrupamento dinâmico - organização flexível de dados
✓ Mapeamento de configurações - capacidades, tipos, etc.
✓ Controle de estado - rastreamento de veículos e entregas
✓ Otimização de algoritmos - Dijkstra, agrupamento, etc. 