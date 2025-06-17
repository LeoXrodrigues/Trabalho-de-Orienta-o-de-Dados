import { Location } from '@prisma/client';
import { LocationRepository } from './location.repository';

export class LocationService {
  private locationRepository: LocationRepository;

  constructor(locationRepository: LocationRepository) {
    this.locationRepository = locationRepository;
  }

  async createLocation(data: {
    name: string;
    city: string;
    state: string;
  }): Promise<Location> {
    // Verifica se já existe uma localização com o mesmo nome
    const existingLocation = await this.locationRepository.findByName(data.name);
    if (existingLocation) {
      throw new Error(`Localização com nome '${data.name}' já existe`);
    }

    // Valida os dados
    this.validateLocationData(data);

    return await this.locationRepository.create(data);
  }

  async getAllLocations(): Promise<Location[]> {
    return await this.locationRepository.findAll();
  }

  async getLocationById(id: string): Promise<Location> {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new Error(`Localização com ID '${id}' não encontrada`);
    }
    return location;
  }

  async updateLocation(id: string, data: {
    name?: string;
    city?: string;
    state?: string;
  }): Promise<Location> {
    // Verifica se a localização existe
    await this.getLocationById(id);

    // Se está alterando o nome, verifica se não existe outro com o mesmo nome
    if (data.name) {
      const existingLocation = await this.locationRepository.findByName(data.name);
      if (existingLocation && existingLocation.id !== id) {
        throw new Error(`Localização com nome '${data.name}' já existe`);
      }
    }

    // Valida os dados se fornecidos
    if (data.name || data.city || data.state) {
      this.validateLocationData({
        name: data.name || '',
        city: data.city || '',
        state: data.state || ''
      });
    }

    return await this.locationRepository.update(id, data);
  }

  async deleteLocation(id: string): Promise<void> {
    // Verifica se a localização existe
    const location = await this.getLocationById(id);

    // Verifica se a localização não está sendo usada
    if (location.vehicles && location.vehicles.length > 0) {
      throw new Error(`Não é possível excluir a localização '${location.name}' pois existem veículos associados`);
    }

    if (location.shipments && location.shipments.length > 0) {
      throw new Error(`Não é possível excluir a localização '${location.name}' pois existem entregas associadas`);
    }

    await this.locationRepository.delete(id);
  }

  async getLocationsByState(state: string): Promise<Location[]> {
    if (!state || state.trim().length === 0) {
      throw new Error('Estado é obrigatório');
    }

    return await this.locationRepository.findByState(state);
  }

  async getLocationsByCity(city: string): Promise<Location[]> {
    if (!city || city.trim().length === 0) {
      throw new Error('Cidade é obrigatória');
    }

    return await this.locationRepository.findByCity(city);
  }

  async getLocationConnections(id: string): Promise<{
    outgoing: { destination: Location; distance: number }[];
    incoming: { source: Location; distance: number }[];
  }> {
    // Verifica se a localização existe
    await this.getLocationById(id);

    return await this.locationRepository.getLocationConnections(id);
  }

  async searchLocations(query: string): Promise<Location[]> {
    if (!query || query.trim().length < 2) {
      throw new Error('Query de busca deve ter pelo menos 2 caracteres');
    }

    const allLocations = await this.locationRepository.findAll();
    const searchTerm = query.toLowerCase().trim();

    return allLocations.filter(location => 
      location.name.toLowerCase().includes(searchTerm) ||
      location.city.toLowerCase().includes(searchTerm) ||
      location.state.toLowerCase().includes(searchTerm)
    );
  }

  async getLocationStats(): Promise<{
    totalLocations: number;
    locationsByState: { [state: string]: number };
    locationsWithVehicles: number;
    locationsWithShipments: number;
  }> {
    const locations = await this.locationRepository.findAll();

    const locationsByState: { [state: string]: number } = {};
    let locationsWithVehicles = 0;
    let locationsWithShipments = 0;

    for (const location of locations) {
      // Conta por estado
      locationsByState[location.state] = (locationsByState[location.state] || 0) + 1;

      // Conta localizações com veículos
      if (location.vehicles && location.vehicles.length > 0) {
        locationsWithVehicles++;
      }

      // Conta localizações com entregas
      if (location.shipments && location.shipments.length > 0) {
        locationsWithShipments++;
      }
    }

    return {
      totalLocations: locations.length,
      locationsByState,
      locationsWithVehicles,
      locationsWithShipments
    };
  }

  private validateLocationData(data: { name: string; city: string; state: string }): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome da localização é obrigatório');
    }

    if (!data.city || data.city.trim().length === 0) {
      throw new Error('Cidade é obrigatória');
    }

    if (!data.state || data.state.trim().length === 0) {
      throw new Error('Estado é obrigatório');
    }

    if (data.name.length > 100) {
      throw new Error('Nome da localização não pode ter mais de 100 caracteres');
    }

    if (data.city.length > 100) {
      throw new Error('Nome da cidade não pode ter mais de 100 caracteres');
    }

    if (data.state.length > 50) {
      throw new Error('Nome do estado não pode ter mais de 50 caracteres');
    }
  }
} 