import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar localizações
  console.log('📍 Criando localizações...');
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { name: 'Centro de Distribuição São Paulo' },
      update: {},
      create: {
        name: 'Centro de Distribuição São Paulo',
        city: 'São Paulo',
        state: 'SP'
      }
    }),
    prisma.location.upsert({
      where: { name: 'Centro de Distribuição Rio de Janeiro' },
      update: {},
      create: {
        name: 'Centro de Distribuição Rio de Janeiro',
        city: 'Rio de Janeiro',
        state: 'RJ'
      }
    }),
    prisma.location.upsert({
      where: { name: 'Centro de Distribuição Belo Horizonte' },
      update: {},
      create: {
        name: 'Centro de Distribuição Belo Horizonte',
        city: 'Belo Horizonte',
        state: 'MG'
      }
    }),
    prisma.location.upsert({
      where: { name: 'Cliente Zona Sul SP' },
      update: {},
      create: {
        name: 'Cliente Zona Sul SP',
        city: 'São Paulo',
        state: 'SP'
      }
    }),
    prisma.location.upsert({
      where: { name: 'Cliente Centro RJ' },
      update: {},
      create: {
        name: 'Cliente Centro RJ',
        city: 'Rio de Janeiro',
        state: 'RJ'
      }
    })
  ]);

  console.log(`✅ ${locations.length} localizações criadas`);

  // Criar estradas
  console.log('🛣️ Criando estradas...');
  const roads = await Promise.all([
    prisma.road.upsert({
      where: { 
        sourceId_destinationId: {
          sourceId: locations[0].id, // SP
          destinationId: locations[1].id // RJ
        }
      },
      update: {},
      create: {
        sourceId: locations[0].id,
        destinationId: locations[1].id,
        distance: 430 // km
      }
    }),
    prisma.road.upsert({
      where: { 
        sourceId_destinationId: {
          sourceId: locations[0].id, // SP
          destinationId: locations[2].id // BH
        }
      },
      update: {},
      create: {
        sourceId: locations[0].id,
        destinationId: locations[2].id,
        distance: 580 // km
      }
    }),
    prisma.road.upsert({
      where: { 
        sourceId_destinationId: {
          sourceId: locations[1].id, // RJ
          destinationId: locations[2].id // BH
        }
      },
      update: {},
      create: {
        sourceId: locations[1].id,
        destinationId: locations[2].id,
        distance: 440 // km
      }
    }),
    prisma.road.upsert({
      where: { 
        sourceId_destinationId: {
          sourceId: locations[0].id, // SP
          destinationId: locations[3].id // Cliente SP
        }
      },
      update: {},
      create: {
        sourceId: locations[0].id,
        destinationId: locations[3].id,
        distance: 25 // km
      }
    }),
    prisma.road.upsert({
      where: { 
        sourceId_destinationId: {
          sourceId: locations[1].id, // RJ
          destinationId: locations[4].id // Cliente RJ
        }
      },
      update: {},
      create: {
        sourceId: locations[1].id,
        destinationId: locations[4].id,
        distance: 15 // km
      }
    })
  ]);

  console.log(`✅ ${roads.length} estradas criadas`);

  // Criar veículos
  console.log('🚚 Criando veículos...');
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { licensePlate: 'ABC-1234' },
      update: {},
      create: {
        licensePlate: 'ABC-1234',
        capacityKg: 1500,
        type: 'Van',
        locationId: locations[0].id, // SP
        status: 'available'
      }
    }),
    prisma.vehicle.upsert({
      where: { licensePlate: 'DEF-5678' },
      update: {},
      create: {
        licensePlate: 'DEF-5678',
        capacityKg: 3000,
        type: 'Caminhão',
        locationId: locations[1].id, // RJ
        status: 'available'
      }
    }),
    prisma.vehicle.upsert({
      where: { licensePlate: 'GHI-9012' },
      update: {},
      create: {
        licensePlate: 'GHI-9012',
        capacityKg: 2000,
        type: 'Caminhonete',
        locationId: locations[2].id, // BH
        status: 'available'
      }
    })
  ]);

  console.log(`✅ ${vehicles.length} veículos criados`);

  // Criar entregas
  console.log('📦 Criando entregas...');
  const shipments = await Promise.all([
    prisma.shipment.create({
      data: {
        cargoDescription: 'Eletrônicos - Notebook Dell',
        weightKg: 25.5,
        priority: 1, // Alta prioridade
        status: 'pending',
        originId: locations[0].id, // SP
        destinationId: locations[3].id // Cliente SP
      }
    }),
    prisma.shipment.create({
      data: {
        cargoDescription: 'Roupas - Coleção Verão',
        weightKg: 45.0,
        priority: 3, // Prioridade média
        status: 'pending',
        originId: locations[0].id, // SP
        destinationId: locations[3].id // Cliente SP
      }
    }),
    prisma.shipment.create({
      data: {
        cargoDescription: 'Medicamentos - Insulina',
        weightKg: 5.2,
        priority: 1, // Alta prioridade
        status: 'pending',
        originId: locations[1].id, // RJ
        destinationId: locations[4].id // Cliente RJ
      }
    }),
    prisma.shipment.create({
      data: {
        cargoDescription: 'Livros Didáticos',
        weightKg: 120.0,
        priority: 2, // Prioridade alta
        status: 'pending',
        originId: locations[1].id, // RJ
        destinationId: locations[4].id // Cliente RJ
      }
    }),
    prisma.shipment.create({
      data: {
        cargoDescription: 'Móveis - Mesa de Escritório',
        weightKg: 85.0,
        priority: 4, // Prioridade baixa
        status: 'pending',
        originId: locations[2].id, // BH
        destinationId: locations[3].id // Cliente SP
      }
    })
  ]);

  console.log(`✅ ${shipments.length} entregas criadas`);

  // Estatísticas finais
  const stats = {
    locations: await prisma.location.count(),
    vehicles: await prisma.vehicle.count(),
    roads: await prisma.road.count(),
    shipments: await prisma.shipment.count(),
    pendingShipments: await prisma.shipment.count({ where: { status: 'pending' } })
  };

  console.log('\n📊 Estatísticas do banco de dados:');
  console.log(`📍 Localizações: ${stats.locations}`);
  console.log(`🚚 Veículos: ${stats.vehicles}`);
  console.log(`🛣️ Estradas: ${stats.roads}`);
  console.log(`📦 Entregas: ${stats.shipments}`);
  console.log(`⏳ Entregas pendentes: ${stats.pendingShipments}`);

  console.log('\n🎯 Sistema pronto para demonstrar as estruturas de dados:');
  console.log('• Fila de Prioridade: Entregas ordenadas por urgência');
  console.log('• Árvore Binária: Agrupamento hierárquico de lotes');
  console.log('• Grafo: Cálculo de rotas ótimas entre localidades');

  console.log('\n🚀 Para testar o sistema:');
  console.log('1. npm run dev');
  console.log('2. POST http://localhost:3000/api/planning/plan-next');
  console.log('3. GET http://localhost:3000/api/planning/demonstrate-structures');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Seed concluído com sucesso!');
  }); 