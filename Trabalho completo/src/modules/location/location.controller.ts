import { Request, Response } from 'express';
import { LocationService } from './location.service';

export class LocationController {
  private locationService: LocationService;

  constructor(locationService: LocationService) {
    this.locationService = locationService;
  }

  // POST /locations
  async createLocation(req: Request, res: Response): Promise<void> {
    try {
      const { name, city, state } = req.body;

      if (!name || !city || !state) {
        res.status(400).json({
          error: 'Campos obrigatórios: name, city, state'
        });
        return;
      }

      const location = await this.locationService.createLocation({
        name,
        city,
        state
      });

      res.status(201).json({
        message: 'Localização criada com sucesso',
        data: location
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao criar localização'
      });
    }
  }

  // GET /locations
  async getAllLocations(req: Request, res: Response): Promise<void> {
    try {
      const locations = await this.locationService.getAllLocations();

      res.status(200).json({
        message: 'Localizações encontradas',
        data: locations,
        count: locations.length
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar localizações'
      });
    }
  }

  // GET /locations/:id
  async getLocationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const location = await this.locationService.getLocationById(id);

      res.status(200).json({
        message: 'Localização encontrada',
        data: location
      });
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Localização não encontrada'
      });
    }
  }

  // PUT /locations/:id
  async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, city, state } = req.body;

      const location = await this.locationService.updateLocation(id, {
        name,
        city,
        state
      });

      res.status(200).json({
        message: 'Localização atualizada com sucesso',
        data: location
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao atualizar localização'
      });
    }
  }

  // DELETE /locations/:id
  async deleteLocation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.locationService.deleteLocation(id);

      res.status(200).json({
        message: 'Localização excluída com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao excluir localização'
      });
    }
  }

  // GET /locations/state/:state
  async getLocationsByState(req: Request, res: Response): Promise<void> {
    try {
      const { state } = req.params;

      const locations = await this.locationService.getLocationsByState(state);

      res.status(200).json({
        message: `Localizações encontradas no estado ${state}`,
        data: locations,
        count: locations.length
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar localizações por estado'
      });
    }
  }

  // GET /locations/city/:city
  async getLocationsByCity(req: Request, res: Response): Promise<void> {
    try {
      const { city } = req.params;

      const locations = await this.locationService.getLocationsByCity(city);

      res.status(200).json({
        message: `Localizações encontradas na cidade ${city}`,
        data: locations,
        count: locations.length
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar localizações por cidade'
      });
    }
  }

  // GET /locations/:id/connections
  async getLocationConnections(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const connections = await this.locationService.getLocationConnections(id);

      res.status(200).json({
        message: 'Conexões da localização encontradas',
        data: connections
      });
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar conexões da localização'
      });
    }
  }

  // GET /locations/search?q=query
  async searchLocations(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          error: 'Parâmetro de busca "q" é obrigatório'
        });
        return;
      }

      const locations = await this.locationService.searchLocations(q);

      res.status(200).json({
        message: `Localizações encontradas para "${q}"`,
        data: locations,
        count: locations.length
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar localizações'
      });
    }
  }

  // GET /locations/stats
  async getLocationStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.locationService.getLocationStats();

      res.status(200).json({
        message: 'Estatísticas das localizações',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar estatísticas'
      });
    }
  }
} 