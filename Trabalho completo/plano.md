Master Prompt: Geração do Backend com Agrupamento Hierárquico
Para: Ferramenta de Geração de Código (ex: Cursor) ou Equipe de Desenvolvimento Backend

De: Arquiteto de Software do Projeto

Assunto: Geração da Estrutura Completa do Backend para o "Sistema Nacional de Planejamento e Prioridade de Entregas"

1. Objetivo do Projeto
Gerar o código-fonte completo para uma API de logística que utiliza um algoritmo de agrupamento hierárquico para otimizar a priorização de entregas. O sistema utiliza uma Fila de Prioridade para identificar e uma Árvore Binária para consolidar dinamicamente as entregas em lotes ótimos. Uma vez que o lote prioritário é definido, um Grafo é usado para calcular a rota mais eficiente no mapa.

2. Persona de Geração (Para IA)
Atue como um time de desenvolvimento backend sênior, especialista em TypeScript, Node.js, Prisma, e na implementação de arquiteturas de software limpas e escaláveis. O código deve ser robusto, bem documentado e seguir as melhores práticas do mercado, com foco em demonstrar claramente o uso de cada estrutura de dados.

3. Arquitetura e Stack Tecnológica
Linguagem: TypeScript

Ambiente de Execução: Node.js com Express.js

Banco de Dados: SQLite

ORM: Prisma

Padrão Arquitetural Principal: Repository Pattern (Controller ➔ Service ➔ Repository)

4. Estrutura de Pastas do Projeto
A estrutura agora reflete a lógica central de agrupamento.

/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── core/
│   |   ├── graph/
│   |   |   ├── Graph.ts
│   |   |   └── PriorityQueue.ts      # Fila de Prioridade para o Dijkstra
│   |   └── shipment_grouping/
│   |       ├── GroupingTree.ts     # Define a estrutura do Nó e da Árvore de Agrupamento
│   |       └── ShipmentPlanner.ts    # Lógica para construir a árvore a partir das entregas
│   ├── modules/
│   |   ├── location/         # CRUD de Localidades
│   |   ├── road/             # CRUD de Estradas
│   |   ├── vehicle/          # CRUD de Veículos
│   |   └── shipment/         # CRUD de Entregas
│   ├── planning/             # Módulo de orquestração do planejamento
│   |   ├── planning.controller.ts
│   |   ├── planning.service.ts
│   |   └── planning.routes.ts
│   ├── server.ts
│   └── app.ts
└── .env

5. Modelagem de Dados (prisma/schema.prisma)
O schema permanece o mesmo, pois é robusto e atende às necessidades. A inovação está em como usamos esses dados.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Location {
  id     String @id @default(cuid())
  name   String @unique
  city   String
  state  String

  originRoads Road[]     @relation("OriginRoads")
  destRoads   Road[]     @relation("DestRoads")
  vehicles    Vehicle[]
  shipments   Shipment[]
}

model Road {
  id          String   @id @default(cuid())
  distance    Float
  createdAt   DateTime @default(now())
  sourceId    String
  destinationId String
  source      Location @relation("OriginRoads", fields: [sourceId], references: [id])
  destination Location @relation("DestRoads", fields: [destinationId], references: [id])
}

model Vehicle {
  id           String     @id @default(cuid())
  licensePlate String     @unique
  capacityKg   Int
  type         String
  status       String     @default("available")
  locationId   String
  location     Location   @relation(fields: [locationId], references: [id])
  shipments    Shipment[]
}

model Shipment {
  id               String   @id @default(cuid())
  cargoDescription String
  weightKg         Float
  priority         Int      @default(3) // 1 (alta) a 5 (baixa)
  status           String   @default("pending")
  originId         String
  destinationId    String
  location         Location @relation(fields: [originId, destinationId], references: [id])
  assignedVehicleId String?
  assignedVehicle   Vehicle? @relation(fields: [assignedVehicleId], references: [id])

  // Armazena a rota planejada como uma lista de IDs de Location
  plannedRoute      String?
}

6. Lógica de Negócio Principal
6.1 core/shipment_grouping/GroupingTree.ts
Define a classe GroupingNode.

Um nó pode ser uma folha (representando uma única entrega/Shipment) ou um nó interno (representando um lote de entregas agrupadas).

Propriedades: shipment (opcional), priority (soma das prioridades dos filhos), left, right.

6.2 core/shipment_grouping/ShipmentPlanner.ts
Classe principal da lógica de planejamento.

Método buildGroupingTree(shipments: Shipment[]).

Lógica:

Cria um nó folha (GroupingNode) para cada entrega.

Insere todos os nós folha em uma Fila de Prioridade (Min-Heap, onde a menor priority é a mais urgente).

Em um loop while a fila tiver mais de um elemento:

Remove os dois nós de menor prioridade.

Cria um novo nó interno com os dois nós removidos como filhos e a prioridade sendo a soma das prioridades deles.

Insere o novo nó interno de volta na fila.

Retorna o nó raiz final, que representa a Árvore de Agrupamento de Entregas.

6.3 Módulo de Planejamento (planning/planning.service.ts)
Lógica do planNextShipment():

Busca todas as entregas com status pending.

Instancia o ShipmentPlanner e chama buildGroupingTree() para obter a árvore de planejamento.

Percorre a árvore para encontrar o lote de entregas mais prioritário e viável para despacho.

Encontra um veículo disponível que possa atender àquele lote.

Instancia o Graph com os dados do mapa e usa dijkstra() para achar a rota ótima para o lote.

Atualiza o status de todas as entregas do lote para planned e associa o veículo e a rota.