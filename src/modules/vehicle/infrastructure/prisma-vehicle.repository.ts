import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import type {
  CreateVehicleData,
  IVehicleRepository,
  UpdateVehicleData,
} from '../domain/vehicle.repository';
import { Vehicle } from '../domain/vehicle.entity';
import { PrismaVehicleMapper } from './prisma-vehicle.mapper';

const uniqueViolation = 'P2002';
const recordNotFound = 'P2025';

@Injectable()
export class PrismaVehicleRepository implements IVehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateVehicleData): Promise<Vehicle> {
    try {
      const row = await this.prisma.vehicle.create({
        data: {
          code: data.code,
          plateNumber: data.plateNumber ?? null,
          status: data.status,
          capacity: data.capacity ?? null,
          routeId: data.routeId ?? null,
        },
      });
      return PrismaVehicleMapper.toDomain(row);
    } catch (error: unknown) {
      if (this.isPrismaError(error) && error.code === uniqueViolation) {
        throw new ConflictException(
          'El código o la placa ya está registrado en otro vehículo',
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<Vehicle[]> {
    const rows = await this.prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => PrismaVehicleMapper.toDomain(row));
  }

  async findById(id: string): Promise<Vehicle | null> {
    const row = await this.prisma.vehicle.findUnique({ where: { id } });
    return row ? PrismaVehicleMapper.toDomain(row) : null;
  }

  async update(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    try {
      const row = await this.prisma.vehicle.update({
        where: { id },
        data: {
          ...(data.code !== undefined && { code: data.code }),
          ...(data.plateNumber !== undefined && {
            plateNumber: data.plateNumber,
          }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.capacity !== undefined && { capacity: data.capacity }),
          ...(data.routeId !== undefined && { routeId: data.routeId }),
        },
      });
      return PrismaVehicleMapper.toDomain(row);
    } catch (error: unknown) {
      if (this.isPrismaError(error) && error.code === uniqueViolation) {
        throw new ConflictException(
          'El código o la placa ya está registrado en otro vehículo',
        );
      }
      if (this.isPrismaError(error) && error.code === recordNotFound) {
        throw new NotFoundException(`Vehículo con id ${id} no encontrado`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.vehicle.delete({ where: { id } });
    } catch (error: unknown) {
      if (this.isPrismaError(error) && error.code === recordNotFound) {
        throw new NotFoundException(`Vehículo con id ${id} no encontrado`);
      }
      throw error;
    }
  }

  private isPrismaError(
    error: unknown,
  ): error is { code: string; message?: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code: unknown }).code === 'string'
    );
  }
}
