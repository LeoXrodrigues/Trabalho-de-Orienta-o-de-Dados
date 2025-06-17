import { PrismaClient, Location } from '@prisma/client';

export class LocationRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: {
    name: string;
    city: string;
    state: string;
  }): Promise<Location> {
    return await this.prisma.location.create({
      data
    });
  }

  async findAll(): Promise<Location[]> {
    return await this.prisma.location.findMany({
      include: {
        vehicles: true,
        shipments: true,
        originRoads: {
          include: {
            destination: true
          }
        },
        destRoads: {
          include: {
            source: true
          }
        }
      }
    });
  }

  async findById(id: string): Promise<Location | null> {
    return await this.prisma.location.findUnique({
      where: { id },
      include: {
        vehicles: true,
        shipments: true,
        originRoads: {
          include: {
            destination: true
          }
        },
        destRoads: {
          include: {
            source: true
          }
        }
      }
    });
  }

  async findByName(name: string): Promise<Location | null> {
    return await this.prisma.location.findUnique({
      where: { name }
    });
  }

  async update(id: string, data: {
    name?: string;
    city?: string;
    state?: string;
  }): Promise<Location> {
    return await this.prisma.location.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Location> {
    return await this.prisma.location.delete({
      where: { id }
    });
  }

  async findByState(state: string): Promise<Location[]> {
    return await this.prisma.location.findMany({
      where: { state }
    });
  }

  async findByCity(city: string): Promise<Location[]> {
    return await this.prisma.location.findMany({
      where: { city }
    });
  }

  async getLocationConnections(id: string): Promise<{
    outgoing: { destination: Location; distance: number }[];
    incoming: { source: Location; distance: number }[];
  }> {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        originRoads: {
          include: {
            destination: true
          }
        },
        destRoads: {
          include: {
            source: true
          }
        }
      }
    });

    if (!location) {
      return { outgoing: [], incoming: [] };
    }

    return {
      outgoing: location.originRoads.map(road => ({
        destination: road.destination,
        distance: road.distance
      })),
      incoming: location.destRoads.map(road => ({
        source: road.source,
        distance: road.distance
      }))
    };
  }
} 