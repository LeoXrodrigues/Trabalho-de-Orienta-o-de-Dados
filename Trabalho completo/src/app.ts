import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { json, urlencoded } from 'body-parser';

// Database
import prisma from './config/database';

// Repositories
import { LocationRepository } from './modules/location/location.repository';
import { VehicleRepository } from './modules/vehicle/vehicle.repository';

// Services
import { LocationService } from './modules/location/location.service';
import { PlanningService } from './planning/planning.service';

// Controllers
import { LocationController } from './modules/location/location.controller';
import { PlanningController } from './planning/planning.controller';

class App {
  public app: express.Application;
  
  // Repositories
  private locationRepository: LocationRepository;
  private vehicleRepository: VehicleRepository;
  
  // Services
  private locationService: LocationService;
  private planningService: PlanningService;
  
  // Controllers
  private locationController: LocationController;
  private planningController: PlanningController;

  constructor() {
    this.app = express();
    
    // Initialize repositories
    this.locationRepository = new LocationRepository(prisma);
    this.vehicleRepository = new VehicleRepository(prisma);
    
    // Initialize services
    this.locationService = new LocationService(this.locationRepository);
    this.planningService = new PlanningService(prisma);
    
    // Initialize controllers
    this.locationController = new LocationController(this.locationService);
    this.planningController = new PlanningController(this.planningService);
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }));
    
    // Body parsing middleware
    this.app.use(json({ limit: '10mb' }));
    this.app.use(urlencoded({ extended: true, limit: '10mb' }));
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Sistema Nacional de Planejamento e Prioridade de Entregas',
        version: '1.0.0'
      });
    });

    // API documentation endpoint
    this.app.get('/', (req, res) => {
      res.status(200).json({
        message: 'Sistema Nacional de Planejamento e Prioridade de Entregas',
        description: 'API de logística que utiliza algoritmos de agrupamento hierárquico para otimizar entregas',
        version: '1.0.0',
        features: [
          'Fila de Prioridade para identificação de entregas urgentes',
          'Árvore Binária para consolidação dinâmica de lotes',
          'Grafo com Dijkstra para cálculo de rotas ótimas'
        ],
        endpoints: {
          locations: {
            'GET /api/locations': 'Lista todas as localizações',
            'POST /api/locations': 'Cria nova localização',
            'GET /api/locations/:id': 'Busca localização por ID',
            'PUT /api/locations/:id': 'Atualiza localização',
            'DELETE /api/locations/:id': 'Remove localização',
            'GET /api/locations/search?q=query': 'Busca localizações',
            'GET /api/locations/stats': 'Estatísticas das localizações'
          },
          planning: {
            'POST /api/planning/plan-next': 'Executa planejamento inteligente do próximo despacho',
            'GET /api/planning/analysis': 'Análise detalhada do estado do planejamento',
            'POST /api/planning/cancel': 'Cancela planejamento em andamento',
            'POST /api/planning/complete/:id': 'Marca entrega como finalizada',
            'GET /api/planning/demonstrate-structures': 'Demonstra estruturas de dados em ação',
            'GET /api/planning/health': 'Verifica saúde do sistema de planejamento'
          }
        }
      });
    });

    // Location routes
    const locationRouter = express.Router();
    locationRouter.get('/', this.locationController.getAllLocations.bind(this.locationController));
    locationRouter.post('/', this.locationController.createLocation.bind(this.locationController));
    locationRouter.get('/search', this.locationController.searchLocations.bind(this.locationController));
    locationRouter.get('/stats', this.locationController.getLocationStats.bind(this.locationController));
    locationRouter.get('/state/:state', this.locationController.getLocationsByState.bind(this.locationController));
    locationRouter.get('/city/:city', this.locationController.getLocationsByCity.bind(this.locationController));
    locationRouter.get('/:id', this.locationController.getLocationById.bind(this.locationController));
    locationRouter.put('/:id', this.locationController.updateLocation.bind(this.locationController));
    locationRouter.delete('/:id', this.locationController.deleteLocation.bind(this.locationController));
    locationRouter.get('/:id/connections', this.locationController.getLocationConnections.bind(this.locationController));
    
    this.app.use('/api/locations', locationRouter);

    // Planning routes (core functionality)
    const planningRouter = express.Router();
    planningRouter.post('/plan-next', this.planningController.planNextShipment.bind(this.planningController));
    planningRouter.get('/analysis', this.planningController.analyzePlanningState.bind(this.planningController));
    planningRouter.post('/cancel', this.planningController.cancelPlanning.bind(this.planningController));
    planningRouter.post('/complete/:shipmentId', this.planningController.completeShipment.bind(this.planningController));
    planningRouter.get('/demonstrate-structures', this.planningController.demonstrateDataStructures.bind(this.planningController));
    planningRouter.get('/health', this.planningController.checkPlanningHealth.bind(this.planningController));
    
    this.app.use('/api/planning', planningRouter);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint não encontrado',
        message: `Rota ${req.method} ${req.originalUrl} não existe`,
        availableEndpoints: [
          'GET /',
          'GET /health',
          'GET /api/locations',
          'POST /api/planning/plan-next'
        ]
      });
    });

    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Erro interno:', error);
      
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Ocorreu um erro inesperado',
        timestamp: new Date().toISOString()
      });
    });
  }

  public listen(): void {
    const port = process.env.PORT || 3000;
    
    this.app.listen(port, () => {
      console.log(`🚀 Sistema Nacional de Planejamento e Prioridade de Entregas iniciado!`);
      console.log(`📍 Servidor rodando na porta ${port}`);
      console.log(`🌐 Acesse: http://localhost:${port}`);
      console.log(`📊 Documentação da API: http://localhost:${port}/`);
      console.log(`🔍 Endpoint principal: POST http://localhost:${port}/api/planning/plan-next`);
      console.log(`\n📋 Estruturas de dados implementadas:`);
      console.log(`   • Fila de Prioridade (Min-Heap) - Agrupamento de entregas`);
      console.log(`   • Árvore Binária - Representação hierárquica de lotes`);
      console.log(`   • Grafo com Dijkstra - Cálculo de rotas ótimas`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

export default App; 