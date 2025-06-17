# 🚀 Guia de Referência Rápida

## Comandos Essenciais para Testar o Sistema

### 🎯 **PRINCIPAIS ENDPOINTS (Demonstração das Estruturas de Dados)**

#### 1. **Algoritmo Completo** - Demonstra todas as 3 estruturas
```bash
curl -X POST http://localhost:3000/api/planning/plan-next
```

#### 2. **Visualizar Estruturas de Dados** - Endpoint educacional
```bash
curl http://localhost:3000/api/planning/demonstrate-structures
```

#### 3. **Análise do Sistema** - Estado atual
```bash
curl http://localhost:3000/api/planning/analysis
```

---

### 📋 **SETUP INICIAL**

#### Configurar e Inicializar
```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados
npm run db:generate
npm run db:push

# 3. Popular com dados de exemplo
npm run db:seed

# 4. Iniciar servidor
npm run dev
```

#### Verificar se está funcionando
```bash
curl http://localhost:3000/health
```

---

### 🧪 **COMANDOS DE TESTE RÁPIDO**

#### Teste Completo (Sequência)
```bash
# 1. Ver estado inicial
curl http://localhost:3000/api/planning/analysis

# 2. Executar planejamento
curl -X POST http://localhost:3000/api/planning/plan-next

# 3. Ver estruturas em ação
curl http://localhost:3000/api/planning/demonstrate-structures

# 4. Verificar localidades
curl http://localhost:3000/api/locations/stats
```

#### Teste das Estruturas de Dados
```bash
# Demonstração educacional completa
curl http://localhost:3000/api/planning/demonstrate-structures | jq .

# Estado da árvore de agrupamento
curl http://localhost:3000/api/planning/analysis | jq .data.groupingTreeStats

# Saúde do sistema de planejamento
curl http://localhost:3000/api/planning/health | jq .
```

---

### 📍 **GERENCIAMENTO DE LOCALIDADES**

#### Comandos Básicos
```bash
# Listar todas
curl http://localhost:3000/api/locations

# Criar nova
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{"name":"Centro DF","city":"Brasília","state":"DF"}'

# Buscar por nome
curl "http://localhost:3000/api/locations/search?q=São Paulo"

# Estatísticas
curl http://localhost:3000/api/locations/stats

# Por estado
curl http://localhost:3000/api/locations/state/SP
```

---

### 🔧 **COMANDOS DE DEBUG**

#### Verificar Status
```bash
# Status geral
curl http://localhost:3000/health

# Status do planejamento
curl http://localhost:3000/api/planning/health

# Análise completa
curl http://localhost:3000/api/planning/analysis
```

#### Logs e Monitoramento
```bash
# Com formatação JSON
curl http://localhost:3000/api/planning/analysis | jq .

# Apenas insights
curl http://localhost:3000/api/planning/analysis | jq .insights

# Métricas específicas
curl http://localhost:3000/api/planning/health | jq .metrics
```

---

### 📊 **INTERPRETANDO RESULTADOS**

#### Resposta do Planejamento Principal
```json
{
  "data": {
    "plannedShipments": [...],    // ← Entregas agrupadas
    "assignedVehicle": {...},     // ← Veículo otimizado  
    "route": {                    // ← Rota calculada com Dijkstra
      "path": [...],
      "totalDistance": 455,
      "estimatedDuration": 455
    }
  },
  "analytics": {                  // ← Métricas de eficiência
    "vehicleUtilization": "85.3%"
  }
}
```

#### Estruturas de Dados em Ação
```json
{
  "structures": {
    "priorityQueue": {            // ← Min-Heap
      "currentState": "5 entregas pendentes"
    },
    "binaryTree": {               // ← Árvore Binária
      "currentState": {
        "treeHeight": 3,
        "totalShipments": 5
      }
    },
    "graph": {                    // ← Grafo + Dijkstra
      "usage": "Calcula rotas ótimas"
    }
  }
}
```

---

### ⚡ **SCRIPTS ÚTEIS**

#### Teste Automatizado
```bash
#!/bin/bash
echo "🧪 Testando Sistema Completo..."

echo "1. Verificando saúde..."
curl -s http://localhost:3000/health | jq .status

echo "2. Analisando estado..."
curl -s http://localhost:3000/api/planning/analysis | jq .data.totalPendingShipments

echo "3. Executando planejamento..."
curl -s -X POST http://localhost:3000/api/planning/plan-next | jq .message

echo "✅ Teste concluído!"
```

#### Reset do Sistema
```bash
# Para recomeçar com dados limpos
rm dev.db
npm run db:push
npm run db:seed
```

---

### 🎓 **DEMONSTRAÇÃO EDUCACIONAL**

#### Para Apresentações
```bash
# 1. Mostrar documentação
curl http://localhost:3000/ | jq .

# 2. Demonstrar estruturas
curl http://localhost:3000/api/planning/demonstrate-structures | jq .structures

# 3. Executar algoritmo completo
curl -X POST http://localhost:3000/api/planning/plan-next | jq .

# 4. Mostrar fluxo algorítmico
curl http://localhost:3000/api/planning/demonstrate-structures | jq .algorithmicFlow
```

#### Métricas para Análise
```bash
# Eficiência do sistema
curl -s http://localhost:3000/api/planning/health | jq .metrics.averageEfficiency

# Utilização de recursos
curl -s http://localhost:3000/api/planning/analysis | jq .data.availableVehicles

# Complexidade da árvore
curl -s http://localhost:3000/api/planning/analysis | jq .data.groupingTreeStats.treeHeight
```

---

### 🎯 **ENDPOINTS MAIS IMPORTANTES**

| Prioridade | Endpoint | Funcionalidade |
|------------|----------|----------------|
| ⭐⭐⭐ | `POST /api/planning/plan-next` | **Algoritmo principal** |
| ⭐⭐⭐ | `GET /api/planning/demonstrate-structures` | **Demonstração educacional** |
| ⭐⭐ | `GET /api/planning/analysis` | Análise do sistema |
| ⭐⭐ | `GET /health` | Status do sistema |
| ⭐ | `GET /api/locations` | Gerenciamento básico |

---

**💡 Dica**: Use `| jq .` no final dos comandos curl para formatação JSON bonita! 