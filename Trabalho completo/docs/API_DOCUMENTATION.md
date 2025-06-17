# 📚 Documentação Completa da API

## Sistema Nacional de Planejamento e Prioridade de Entregas

Esta API demonstra a implementação prática de **3 estruturas de dados fundamentais** em um sistema real de logística:

- 🏗️ **Fila de Prioridade (Min-Heap)** - Ordenação de entregas por urgência
- 🌳 **Árvore Binária de Agrupamento** - Consolidação hierárquica de lotes  
- 🗺️ **Grafo com Dijkstra** - Cálculo de rotas ótimas

---

## 🌐 URL Base

```
http://localhost:3000
```

---

## 📋 Índice de Endpoints

### 🏠 Informações Gerais
- [`GET /`](#get-) - Documentação da API
- [`GET /health`](#get-health) - Status do sistema

### 🎯 Planejamento (Core do Sistema)
- [`POST /api/planning/plan-next`](#post-apiplanningplan-next) - **Algoritmo Principal**
- [`GET /api/planning/analysis`](#get-apiplanninganalysis) - Análise do sistema
- [`GET /api/planning/demonstrate-structures`](#get-apiplanningdemonstrate-structures) - **Demonstração das Estruturas**
- [`GET /api/planning/health`](#get-apiplanninghealth) - Saúde do planejamento
- [`POST /api/planning/cancel`](#post-apiplanningcancel) - Cancelar planejamento
- [`POST /api/planning/complete/:shipmentId`](#post-apiplanningcompleteshipmentid) - Finalizar entrega

### 📍 Localidades
- [`GET /api/locations`](#get-apilocations) - Listar localidades
- [`POST /api/locations`](#post-apilocations) - Criar localidade
- [`GET /api/locations/:id`](#get-apilocationsid) - Buscar por ID
- [`PUT /api/locations/:id`](#put-apilocationsid) - Atualizar localidade
- [`DELETE /api/locations/:id`](#delete-apilocationsid) - Remover localidade
- [`GET /api/locations/search?q=query`](#get-apilocationsearch) - Buscar localidades
- [`GET /api/locations/stats`](#get-apilocationsstats) - Estatísticas
- [`GET /api/locations/state/:state`](#get-apilocationsstate) - Por estado
- [`GET /api/locations/:id/connections`](#get-apilocationsidconnections) - Conexões

---

## 🏠 Informações Gerais

### `GET /`

Retorna informações gerais sobre a API e todos os endpoints disponíveis.

**Resposta:**
```json
{
  "message": "Sistema Nacional de Planejamento e Prioridade de Entregas",
  "description": "API de logística que utiliza algoritmos de agrupamento hierárquico para otimizar entregas",
  "version": "1.0.0",
  "features": [
    "Fila de Prioridade para identificação de entregas urgentes",
    "Árvore Binária para consolidação dinâmica de lotes",
    "Grafo com Dijkstra para cálculo de rotas ótimas"
  ],
  "endpoints": {
    "locations": { ... },
    "planning": { ... }
  }
}
```

### `GET /health`

Verifica se o sistema está funcionando.

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Sistema Nacional de Planejamento e Prioridade de Entregas",
  "version": "1.0.0"
}
```

---

## 🎯 Planejamento - Core do Sistema

### `POST /api/planning/plan-next`

**🚀 ENDPOINT PRINCIPAL - Executa o algoritmo completo de planejamento inteligente**

Este endpoint demonstra todas as 3 estruturas de dados trabalhando juntas:

1. **Fila de Prioridade** ordena entregas por urgência
2. **Árvore Binária** agrupa entregas em lotes hierárquicos
3. **Grafo + Dijkstra** calcula a rota ótima

**Método:** `POST`  
**URL:** `/api/planning/plan-next`  
**Body:** Não necessário (usa dados pendentes do banco)

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3000/api/planning/plan-next \
  -H "Content-Type: application/json"
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Lote de 3 entregas planejado com sucesso",
  "data": {
    "plannedShipments": [
      {
        "id": "shipment-1",
        "cargoDescription": "Eletrônicos - Notebook Dell",
        "weightKg": 25.5,
        "priority": 1,
        "status": "planned",
        "originId": "loc-sp",
        "destinationId": "client-sp",
        "assignedVehicleId": "vehicle-1",
        "plannedRoute": "[\"loc-sp\",\"client-sp\"]"
      }
    ],
    "assignedVehicle": {
      "id": "vehicle-1",
      "licensePlate": "ABC-1234",
      "capacityKg": 1500,
      "type": "Van",
      "status": "assigned",
      "locationId": "loc-sp"
    },
    "route": {
      "path": ["loc-sp", "client-sp", "client-rj"],
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

**Resposta de Erro (400):**
```json
{
  "message": "Não há entregas pendentes para planejar",
  "success": false
}
```

### `GET /api/planning/analysis`

Fornece análise detalhada do estado atual do sistema de planejamento.

**Exemplo de Requisição:**
```bash
curl http://localhost:3000/api/planning/analysis
```

**Resposta:**
```json
{
  "message": "Análise do estado do planejamento",
  "data": {
    "totalPendingShipments": 5,
    "availableVehicles": 3,
    "groupingTreeStats": {
      "totalShipments": 5,
      "totalWeight": 280.7,
      "averagePriority": 2.2,
      "treeHeight": 3
    },
    "recommendedBatches": [
      {
        "vehicleId": "vehicle-1",
        "shipmentCount": 2,
        "totalWeight": 70.5,
        "efficiency": 0.89,
        "description": "Lote de 2 entregas (70.5kg) com 1 destino(s). Utilização: 85.3%. Prioridade média: 1.5"
      }
    ]
  },
  "insights": [
    "🚚 Melhor estratégia: Lote de 2 entregas (70.5kg) com 1 destino(s). Utilização: 85.3%. Prioridade média: 1.5 (Eficiência: 89.0%)",
    "🔥 Alta concentração de entregas urgentes (prioridade < 2.0)"
  ]
}
```

### `GET /api/planning/demonstrate-structures`

**🎓 ENDPOINT EDUCACIONAL - Demonstra como cada estrutura de dados funciona**

Este endpoint é especial para visualizar as estruturas de dados em ação.

**Exemplo de Requisição:**
```bash
curl http://localhost:3000/api/planning/demonstrate-structures
```

**Resposta:**
```json
{
  "message": "Demonstração das Estruturas de Dados do Sistema",
  "structures": {
    "priorityQueue": {
      "description": "Fila de Prioridade (Min-Heap)",
      "usage": "Usada no ShipmentPlanner para agrupar entregas hierarquicamente",
      "demonstration": "Entregas são inseridas na fila com base na prioridade (1=alta, 5=baixa), peso e eficiência de agrupamento",
      "currentState": "5 entregas pendentes aguardando processamento na fila"
    },
    "binaryTree": {
      "description": "Árvore Binária de Agrupamento",
      "usage": "Representa hierarquicamente os lotes ótimos de entregas",
      "demonstration": "Cada nó folha = 1 entrega, nós internos = lotes agrupados",
      "currentState": {
        "totalShipments": 5,
        "totalWeight": 280.7,
        "averagePriority": 2.2,
        "treeHeight": 3
      }
    },
    "graph": {
      "description": "Grafo com Algoritmo de Dijkstra",
      "usage": "Calcula rotas ótimas entre localidades usando menor distância",
      "demonstration": "Cada localidade = nó, cada estrada = aresta com peso (distância)",
      "currentState": "Grafo construído dinamicamente a partir das localidades e estradas cadastradas"
    }
  },
  "algorithmicFlow": {
    "step1": "Entregas pendentes → Fila de Prioridade (ordenação por urgência)",
    "step2": "Fila de Prioridade → Árvore Binária (agrupamento hierárquico)",
    "step3": "Árvore Binária → Seleção do lote ótimo (baseado em capacidade do veículo)",
    "step4": "Lote selecionado → Grafo (cálculo da rota ótima)",
    "step5": "Rota calculada → Execução do plano (atualização do banco de dados)"
  },
  "recommendedBatches": [...]
}
```

### `GET /api/planning/health`

Verifica a saúde específica do sistema de planejamento.

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "metrics": {
    "pendingShipments": 5,
    "availableVehicles": 3,
    "canPlan": true,
    "averageEfficiency": "0.847"
  },
  "warnings": []
}
```

### `POST /api/planning/cancel`

Cancela um planejamento em andamento, voltando as entregas para status pendente.

**Body:**
```json
{
  "shipmentIds": ["shipment-1", "shipment-2"]
}
```

**Resposta:**
```json
{
  "message": "Planejamento cancelado para 2 entregas",
  "cancelledShipments": ["shipment-1", "shipment-2"]
}
```

### `POST /api/planning/complete/:shipmentId`

Marca uma entrega como finalizada.

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/planning/complete/shipment-1
```

**Resposta:**
```json
{
  "message": "Entrega marcada como finalizada",
  "shipmentId": "shipment-1"
}
```

---

## 📍 Localidades

### `GET /api/locations`

Lista todas as localidades cadastradas.

**Resposta:**
```json
{
  "message": "Localizações encontradas",
  "data": [
    {
      "id": "loc-1",
      "name": "Centro de Distribuição São Paulo",
      "city": "São Paulo",
      "state": "SP",
      "vehicles": [...],
      "shipments": [...],
      "originRoads": [...],
      "destRoads": [...]
    }
  ],
  "count": 5
}
```

### `POST /api/locations`

Cria uma nova localidade.

**Body:**
```json
{
  "name": "Centro de Distribuição Curitiba",
  "city": "Curitiba",
  "state": "PR"
}
```

**Resposta (201):**
```json
{
  "message": "Localização criada com sucesso",
  "data": {
    "id": "loc-new",
    "name": "Centro de Distribuição Curitiba",
    "city": "Curitiba",
    "state": "PR"
  }
}
```

### `GET /api/locations/:id`

Busca uma localidade específica por ID.

**Exemplo:**
```bash
curl http://localhost:3000/api/locations/loc-1
```

### `PUT /api/locations/:id`

Atualiza uma localidade existente.

**Body:**
```json
{
  "name": "Centro de Distribuição SP - Atualizado",
  "city": "São Paulo",
  "state": "SP"
}
```

### `DELETE /api/locations/:id`

Remove uma localidade (só se não houver veículos ou entregas associadas).

### `GET /api/locations/search?q=query`

Busca localidades por nome, cidade ou estado.

**Exemplo:**
```bash
curl "http://localhost:3000/api/locations/search?q=São Paulo"
```

### `GET /api/locations/stats`

Retorna estatísticas das localidades.

**Resposta:**
```json
{
  "message": "Estatísticas das localizações",
  "data": {
    "totalLocations": 5,
    "locationsByState": {
      "SP": 2,
      "RJ": 2,
      "MG": 1
    },
    "locationsWithVehicles": 3,
    "locationsWithShipments": 4
  }
}
```

### `GET /api/locations/state/:state`

Lista localidades de um estado específico.

**Exemplo:**
```bash
curl http://localhost:3000/api/locations/state/SP
```

### `GET /api/locations/:id/connections`

Mostra as conexões (estradas) de uma localidade.

**Resposta:**
```json
{
  "message": "Conexões da localização encontradas",
  "data": {
    "outgoing": [
      {
        "destination": { "id": "loc-2", "name": "Rio de Janeiro" },
        "distance": 430
      }
    ],
    "incoming": [
      {
        "source": { "id": "loc-3", "name": "Belo Horizonte" },
        "distance": 580
      }
    ]
  }
}
```

---

## 🔧 Como Testar o Sistema Completo

### 1. **Verificar Estado Inicial**
```bash
curl http://localhost:3000/api/planning/analysis
```

### 2. **Executar Planejamento Principal**
```bash
curl -X POST http://localhost:3000/api/planning/plan-next
```

### 3. **Ver Estruturas de Dados em Ação**
```bash
curl http://localhost:3000/api/planning/demonstrate-structures
```

### 4. **Verificar Localidades**
```bash
curl http://localhost:3000/api/locations
```

### 5. **Buscar por Localidade**
```bash
curl "http://localhost:3000/api/locations/search?q=São Paulo"
```

---

## ⚡ Exemplos de Fluxo Completo

### Cenário 1: Planejamento de Entregas Urgentes

1. **Verificar entregas pendentes:**
   ```bash
   curl http://localhost:3000/api/planning/analysis
   ```

2. **Executar planejamento:**
   ```bash
   curl -X POST http://localhost:3000/api/planning/plan-next
   ```

3. **Verificar resultado:**
   - Entregas agrupadas por urgência (Fila de Prioridade)
   - Lote otimizado formado (Árvore Binária)
   - Rota calculada (Grafo + Dijkstra)

### Cenário 2: Demonstração Educacional

1. **Ver estruturas em ação:**
   ```bash
   curl http://localhost:3000/api/planning/demonstrate-structures
   ```

2. **Analisar cada estrutura:**
   - **Fila de Prioridade**: Como entregas são ordenadas
   - **Árvore Binária**: Como lotes são formados
   - **Grafo**: Como rotas são calculadas

### Cenário 3: Gerenciamento de Localidades

1. **Criar nova localidade:**
   ```bash
   curl -X POST http://localhost:3000/api/locations \
     -H "Content-Type: application/json" \
     -d '{"name":"Novo Centro","city":"Brasília","state":"DF"}'
   ```

2. **Buscar estatísticas:**
   ```bash
   curl http://localhost:3000/api/locations/stats
   ```

---

## 🎯 Códigos de Status HTTP

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| `200` | Sucesso | Operação realizada com sucesso |
| `201` | Criado | Recurso criado com sucesso |
| `400` | Erro de Requisição | Dados inválidos ou faltando |
| `404` | Não Encontrado | Recurso não existe |
| `500` | Erro Interno | Erro no servidor |

---

## 🎓 Estruturas de Dados Demonstradas

### 1. **Fila de Prioridade (Min-Heap)**
- **Arquivo**: `src/core/graph/PriorityQueue.ts`
- **Uso**: Ordenação de entregas por urgência no agrupamento
- **Complexidade**: O(log n) para inserção/remoção

### 2. **Árvore Binária de Agrupamento**
- **Arquivo**: `src/core/shipment_grouping/GroupingTree.ts`
- **Uso**: Representação hierárquica de lotes de entregas
- **Algoritmo**: Construção bottom-up com fila de prioridade

### 3. **Grafo com Dijkstra**
- **Arquivo**: `src/core/graph/Graph.ts`
- **Uso**: Cálculo de rotas ótimas entre localidades
- **Complexidade**: O((V + E) log V) com fila de prioridade

---

## 🔍 Monitoramento e Debug

### Logs do Sistema
O sistema registra automaticamente:
- Todas as requisições HTTP
- Operações de planejamento
- Erros e exceções

### Health Checks
- `GET /health` - Status geral
- `GET /api/planning/health` - Status do planejamento

### Métricas Disponíveis
- Número de entregas pendentes
- Veículos disponíveis
- Eficiência média dos planejamentos
- Utilização de veículos

---

**Esta API demonstra a aplicação prática de estruturas de dados complexas em um sistema real de logística, onde cada algoritmo desempenha um papel específico na otimização de entregas.** 🎯 