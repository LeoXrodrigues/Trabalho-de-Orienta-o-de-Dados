import { PrismaClient, Vehicle } from '@prisma/client';

export class VehicleRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: {
    licensePlate: string;
    capacityKg: number;
    type: string;
    locationId: string;
    status?: string;
  }): Promise<Vehicle> {
    return await this.prisma.vehicle.create({
      data: {
        ...data,
        status: data.status || 'available'
      },
      include: {
        location: true,
        shipments: true
      }
    });
  }

  async findAll(): Promise<Vehicle[]> {
    return await this.prisma.vehicle.findMany({
      include: {
        location: true,
        shipments: true
      }
    });
  }

  async findById(id: string): Promise<Vehicle | null> {
    return await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        location: true,
        shipments: true
      }
    });
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    return await this.prisma.vehicle.findUnique({
      where: { licensePlate },
      include: {
        location: true,
        shipments: true
      }
    });
  }

  async findByStatus(status: string): Promise<Vehicle[]> {
    return await this.prisma.vehicle.findMany({
      where: { status },
      include: {
        location: true,
        shipments: true
      }
    });
  }

  async findByLocation(locationId: string): Promise<Vehicle[]> {
    return await this.prisma.vehicle.findMany({
      where: { locationId },
      include: {
        location: true,
        shipments: true
      }
    });
  }

  async findAvailableVehicles(): Promise<Vehicle[]> {
    return await this.prisma.vehicle.findMany({
      where: { status: 'available' },
      include: {
        location: true,
        shipments: true
      }
    });
  }

  async findByCapacityRange(minCapacity: number, maxCapacity: number): Promise<Vehicle[]> {
    return await this.prisma.vehicle.findMany({
      where: {
        capacityKg: {
          gte: minCapacity,
          lte: maxCapacity
        }
      },
      include: {
        location: true,
        shipments: true
      }
    });
  }

  async update(id: string, data: {
    licensePlate?: string;
    capacityKg?: number;
    type?: string;
    status?: string;
    locationId?: string;
  }): Promise<Vehicle> {
    return await this.prisma.vehicle.update({
      where: { id },
      data,
      include: {
        location: true,
        shipments: true
      }
    });
  }

  async updateStatus(id: string, status: string): Promise<Vehicle> {
    return await this.prisma.vehicle.update({
      where: { id },
      data: { status },
      include: {
        location: true,
        shipments: true
      }
    });
  }

  async delete(id: string): Promise<Vehicle> {
    return await this.prisma.vehicle.delete({
      where: { id }
    });
  }

  async getVehicleUtilization(id: string): Promise<{
    vehicle: Vehicle;
    currentLoad: number;
    utilizationPercentage: number;
    availableCapacity: number;
  } | null> {
    const vehicle = await this.findById(id);
    if (!vehicle) return null;

    const activeShipments = vehicle.shipments?.filter(s => 
      s.status === 'planned' || s.status === 'in_transit'
    ) || [];

    const currentLoad = activeShipments.reduce((sum, shipment) => sum + shipment.weightKg, 0);
    const utilizationPercentage = (currentLoad / vehicle.capacityKg) * 100;
    const availableCapacity = vehicle.capacityKg - currentLoad;

    return {
      vehicle,
      currentLoad,
      utilizationPercentage,
      availableCapacity
    };
  }
} 