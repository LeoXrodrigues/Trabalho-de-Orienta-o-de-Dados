# Sistema Nacional de Planejamento e Prioridade de Entregas

Uma API de logística avançada que utiliza **algoritmos de agrupamento hierárquico** para otimizar a priorização de entregas, implementando três estruturas de dados fundamentais:

- 🏗️ **Fila de Prioridade (Min-Heap)** - Para identificação e ordenação de entregas urgentes
- 🌳 **Árvore Binária de Agrupamento** - Para consolidação dinâmica de entregas em lotes ótimos  
- 🗺️ **Grafo com Dijkstra** - Para cálculo de rotas mais eficientes no mapa

## 🎯 Objetivo

Demonstrar a implementação prática de estruturas de dados complexas em um sistema real de logística, onde cada estrutura desempenha um papel específico no processo de otimização:

1. **Fila de Prioridade** → Ordena entregas por urgência e viabilidade
2. **Árvore Binária** → Agrupa entregas em lotes hierárquicos otimizados
3. **Grafo + Dijkstra** → Calcula a rota mais eficiente para cada lote

## 📋 Funcionalidades Principais

### 🚀 Planejamento Inteligente
- **Algoritmo de Agrupamento Hierárquico**: Usa fila de prioridade para construir árvore binária de lotes
- **Otimização Multi-Critério**: Considera urgência, peso, destinos e capacidade de veículos
- **Cálculo de Rotas Ótimas**: Implementa Dijkstra para menor distância entre múltiplos destinos

### 📊 Análise e Monitoramento
- **Dashboard de Estado**: Visualização completa do sistema de planejamento
- **Métricas de Eficiência**: Análise de utilização de veículos e otimização de rotas
- **Demonstração das Estruturas**: Endpoint especial para visualizar algoritmos em ação

## 🏗️ Arquitetura

### Stack Tecnológica
- **Backend**: Node.js + TypeScript + Express.js
- **Banco de Dados**: SQLite com Prisma ORM
- **Padrão Arquitetural**: Repository Pattern (Controller → Service → Repository)

### Estrutura de Pastas
```
src/
├── core/                      # Estruturas de dados fundamentais
│   ├── graph/                 # Grafo e algoritmo de Dijkstra
│   │   ├── Graph.ts          # Implementação do grafo
│   │   └── PriorityQueue.ts  # Fila de prioridade genérica
│   └── shipment_grouping/     # Sistema de agrupamento
│       ├── GroupingTree.ts   # Árvore binária de agrupamento
│       └── ShipmentPlanner.ts # Lógica principal de planejamento
├── modules/                   # Módulos CRUD
│   ├── location/             # Gerenciamento de localidades
│   └── vehicle/              # Gerenciamento de veículos
├── planning/                  # Coordenação do planejamento
│   ├── planning.service.ts   # Serviço principal
│   └── planning.controller.ts # Endpoints da API
└── config/                   # Configurações
```

## 🔧 Como o Sistema Funciona

### Fluxo do Algoritmo Principal

1. **Coleta de Dados** 📦
   ```typescript
   // Busca entregas pendentes e veículos disponíveis
   const pendingShipments = await prisma.shipment.findMany({
     where: { status: 'pending' }
   });
   ```

2. **Construção da Árvore de Agrupamento** 🌳
   ```typescript
   // Usa fila de prioridade para construir árvore hierárquica
   const groupingTree = shipmentPlanner.buildGroupingTree(pendingShipments);
   ```

3. **Seleção do Lote Ótimo** 🎯
   ```typescript
   // Encontra o melhor lote baseado na capacidade do veículo
   const bestBatch = tree.findBestBatchForDispatch(vehicleCapacity);
   ```

4. **Cálculo da Rota** 🗺️
   ```typescript
   // Usa Dijkstra para encontrar menor caminho
   const optimalRoute = graph.calculateOptimalRoute(startId, destinations);
   ```

5. **Execução do Plano** ✅
   ```typescript
   // Atualiza status das entregas e associa veículo/rota
   await executeShipmentPlan(shipments, vehicle, route);
   ```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Configuração

1. **Clone e instale dependências**
   ```bash
   git clone <repositorio>
   cd sistema-planejamento-entregas
   npm install
   ```

2. **Configure banco de dados**
   ```bash
   # Gera cliente Prisma
   npm run db:generate
   
   # Aplica schema ao banco
   npm run db:push
   
   # Popula com dados de exemplo
   npm run db:seed
   ```

3. **Execute o sistema**
   ```bash
   # Desenvolvimento
   npm run dev
   
   # Produção
   npm run build
   npm start
   ```

## 📡 Endpoints da API

### 🏠 Documentação
```http
GET / 
# Documentação completa da API
```

### 🎯 Planejamento (Core)
```http
POST /api/planning/plan-next
# Executa o planejamento inteligente do próximo despacho
# Demonstra todas as 3 estruturas de dados em ação

GET /api/planning/analysis  
# Análise detalhada do estado atual do sistema

GET /api/planning/demonstrate-structures
# Endpoint especial para visualizar estruturas de dados
```

### 📍 Localidades
```http
GET /api/locations          # Lista todas
POST /api/locations         # Cria nova
GET /api/locations/:id      # Busca por ID
PUT /api/locations/:id      # Atualiza
DELETE /api/locations/:id   # Remove
```

## 🎮 Testando o Sistema

### 1. Verificar Estado Inicial
```bash
curl http://localhost:3000/api/planning/analysis
```

### 2. Executar Planejamento
```bash
curl -X POST http://localhost:3000/api/planning/plan-next
```

### 3. Ver Estruturas em Ação
```bash
curl http://localhost:3000/api/planning/demonstrate-structures
```

## 🏗️ Detalhes das Estruturas de Dados

### 1. Fila de Prioridade (Min-Heap)
**Localização**: `src/core/graph/PriorityQueue.ts`

```typescript
// Usada para ordenar nós por prioridade no agrupamento
priorityQueue.enqueue(leafNode, calculateNodePriority(leafNode));
const lowestPriorityNode = priorityQueue.dequeue();
```

**Aplicação**:
- Construção da árvore de agrupamento
- Algoritmo de Dijkstra para rotas
- Ordenação por urgência, peso e eficiência

### 2. Árvore Binária de Agrupamento  
**Localização**: `src/core/shipment_grouping/GroupingTree.ts`

```typescript
// Cada nó pode ser folha (1 entrega) ou interno (lote)
class GroupingNode {
  shipment?: Shipment;        // Folha: entrega individual
  left?: GroupingNode;        // Filho esquerdo
  right?: GroupingNode;       // Filho direito  
  priority: number;           // Soma das prioridades
  totalWeight: number;        // Peso total do lote
}
```

**Aplicação**:
- Representação hierárquica de lotes
- Busca do lote ótimo por capacidade
- Análise de viabilidade de despacho

### 3. Grafo com Dijkstra
**Localização**: `src/core/graph/Graph.ts`

```typescript
// Cada localidade é um nó, cada estrada é uma aresta
graph.addNode({ id: location.id, name: location.name });
graph.addEdge({ from: sourceId, to: destId, weight: distance });

// Dijkstra para menor caminho
const route = graph.dijkstra(startId, endId);
```

**Aplicação**:
- Mapeamento de localidades e estradas
- Cálculo de rotas de menor distância  
- Otimização para múltiplos destinos

## 🎯 Exemplo de Resposta do Planejamento

```json
{
  "message": "Lote de 3 entregas planejado com sucesso",
  "data": {
    "plannedShipments": [...],
    "assignedVehicle": {...},
    "route": {
      "path": ["cd-sp", "cliente-sp", "cliente-rj"],
      "totalDistance": 455,
      "estimatedDuration": 455
    },
    "efficiency": 0.87
  },
  "analytics": {
    "shipmentsCount": 3,
    "totalWeight": 170.5,
    "averagePriority": 2.0,
    "vehicleUtilization": "85.3%"
  }
}
```

## 🎓 Conceitos Demonstrados

### Estruturas de Dados
- **Min-Heap**: Implementação manual com operações de heapify
- **Árvore Binária**: Construção bottom-up e busca por critérios
- **Grafo**: Representação com lista de adjacência e Dijkstra

### Algoritmos
- **Agrupamento Hierárquico**: Construção de árvore com fila de prioridade
- **Dijkstra**: Caminho mais curto com múltiplos destinos  
- **Otimização Multi-Critério**: Balanceamento de urgência, peso e eficiência

### Padrões de Projeto
- **Repository Pattern**: Separação de responsabilidades
- **Strategy Pattern**: Diferentes critérios de priorização
- **Factory Pattern**: Criação de estruturas de dados

## 🔧 Configuração Avançada

### Variáveis de Ambiente
```env
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

### Scripts Disponíveis
```json
{
  "dev": "ts-node-dev src/server.ts",
  "build": "tsc", 
  "start": "node dist/server.js",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:seed": "ts-node scripts/seed.ts"
}
```

## 🎯 Casos de Uso Demonstrados

1. **Priorização Inteligente**: Medicamentos urgentes são priorizados sobre móveis
2. **Otimização de Capacidade**: Lotes respeitam limite de peso dos veículos  
3. **Eficiência de Rota**: Entregas com destinos próximos são agrupadas
4. **Balanceamento**: Sistema considera urgência + peso + distância simultaneamente

## 🚀 Próximos Passos

- [ ] Interface web para visualização das estruturas
- [ ] Algoritmos de machine learning para predição
- [ ] Otimização com programação dinâmica
- [ ] Implementação de outras estruturas (AVL, Hash Tables)

---

**Desenvolvido para demonstrar a aplicação prática de Estruturas de Dados e Algoritmos em sistemas reais de logística** 🎯 