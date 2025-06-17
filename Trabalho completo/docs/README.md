# 📖 Documentação da API

Esta pasta contém toda a documentação completa do **Sistema Nacional de Planejamento e Prioridade de Entregas**.

## 📋 Arquivos de Documentação

### 🔥 **Principais (Comece aqui)**

1. **[`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)** - 📚 **Documentação Completa**
   - Todos os endpoints detalhados
   - Exemplos de requisições e respostas
   - Explicação das estruturas de dados
   - Guias de teste e cenários de uso

2. **[`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md)** - 🚀 **Referência Rápida**
   - Comandos essenciais
   - Teste rápido do sistema
   - Scripts úteis
   - Endpoints prioritários

### 🛠️ **Ferramentas de Teste**

3. **[`POSTMAN_COLLECTION.json`](./POSTMAN_COLLECTION.json)** - 📮 **Coleção do Postman**
   - Todas as requisições prontas para uso
   - Variáveis configuradas
   - Testes sequenciais organizados
   - Importar no Postman e testar imediatamente

---

## 🎯 **Como Usar Esta Documentação**

### Para **Desenvolvedores**:
1. Leia a **Documentação Completa** para entender todos os endpoints
2. Use a **Referência Rápida** para comandos do dia-a-dia
3. Importe a **Coleção do Postman** para testes práticos

### Para **Estudantes** (Estruturas de Dados):
1. Foque na **Documentação Completa** - seção "Estruturas de Dados Demonstradas"
2. Execute os endpoints de **Demonstração Educacional**
3. Use os **Cenários de Teste** para ver os algoritmos em ação

### Para **Testadores**:
1. Comece com a **Referência Rápida** - seção "Comandos de Teste"
2. Use a **Coleção do Postman** para testes manuais
3. Execute os **Testes Sequenciais** para validação completa

---

## 🎓 **Estruturas de Dados Demonstradas**

Esta API é um **caso de estudo prático** que demonstra:

### 1. **Fila de Prioridade (Min-Heap)**
- **Arquivo**: `src/core/graph/PriorityQueue.ts`
- **Uso**: Ordenação de entregas por urgência
- **Demonstração**: Endpoint `GET /api/planning/demonstrate-structures`

### 2. **Árvore Binária de Agrupamento**
- **Arquivo**: `src/core/shipment_grouping/GroupingTree.ts`
- **Uso**: Agrupamento hierárquico de lotes de entregas
- **Demonstração**: Endpoint `POST /api/planning/plan-next`

### 3. **Grafo com Dijkstra**
- **Arquivo**: `src/core/graph/Graph.ts`
- **Uso**: Cálculo de rotas ótimas entre localidades
- **Demonstração**: Resultado do planejamento com rotas calculadas

---

## ⚡ **Teste Rápido - 30 Segundos**

Execute estes comandos para ver o sistema funcionando:

```bash
# 1. Verificar se está funcionando
curl http://localhost:3000/health

# 2. Ver estruturas de dados em ação
curl http://localhost:3000/api/planning/demonstrate-structures

# 3. Executar algoritmo principal
curl -X POST http://localhost:3000/api/planning/plan-next
```

---

## 🔗 **Links Importantes**

| Documento | Propósito | Quando Usar |
|-----------|-----------|-------------|
| [Documentação Completa](./API_DOCUMENTATION.md) | Referência completa de todos os endpoints | Desenvolvimento, estudos detalhados |
| [Referência Rápida](./QUICK_REFERENCE.md) | Comandos essenciais e scripts | Uso diário, testes rápidos |
| [Coleção Postman](./POSTMAN_COLLECTION.json) | Requisições prontas para teste | Testes manuais, validação |

---

## 💡 **Dicas de Uso**

- **Para estudar algoritmos**: Comece pelo endpoint `/api/planning/demonstrate-structures`
- **Para testar rapidamente**: Use os comandos da Referência Rápida
- **Para desenvolvimento**: Consulte a Documentação Completa
- **Para automação**: Use a Coleção do Postman

---

**Esta documentação cobre um sistema completo que demonstra estruturas de dados avançadas aplicadas a um problema real de logística.** 🎯

---

## 🤝 **Contribuição**

Se encontrar problemas na documentação ou sugestões de melhoria:
1. Verifique se o sistema está rodando corretamente
2. Teste os endpoints básicos primeiro
3. Consulte os logs para debugging
4. Use os health checks para verificar o status 