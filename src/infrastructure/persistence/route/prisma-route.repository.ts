import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import type {
  CreateRouteData,
  IRouteRepository,
  UpdateRouteData,
} from '@repositories/route/route.repository';
import { Route } from '@entities/route/route.entity';
import { PrismaRouteMapper } from '@persistence/route/prisma-route.mapper';

const uniqueViolation = 'P2002';
const recordNotFound = 'P2025';

@Injectable()
export class PrismaRouteRepository implements IRouteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRouteData): Promise<Route> {
    try {
      const row = await this.prisma.route.create({
        data: {
          code: data.code,
          name: data.name,
          description: data.description ?? null,
          isActive: data.isActive ?? true,
        },
      });
      return PrismaRouteMapper.toDomain(row);
    } catch (error: unknown) {
      if (this.isPrismaError(error) && error.code === uniqueViolation) {
        throw new ConflictException(
          'El código de ruta ya está registrado en otra ruta',
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<Route[]> {
    const rows = await this.prisma.route.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => PrismaRouteMapper.toDomain(row));
  }

  async findById(id: string): Promise<Route | null> {
    const row = await this.prisma.route.findUnique({ where: { id } });
    return row ? PrismaRouteMapper.toDomain(row) : null;
  }

  async update(id: string, data: UpdateRouteData): Promise<Route> {
    try {
      const row = await this.prisma.route.update({
        where: { id },
        data: {
          ...(data.code !== undefined && { code: data.code }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
      return PrismaRouteMapper.toDomain(row);
    } catch (error: unknown) {
      if (this.isPrismaError(error) && error.code === uniqueViolation) {
        throw new ConflictException(
          'El código de ruta ya está registrado en otra ruta',
        );
      }
      if (this.isPrismaError(error) && error.code === recordNotFound) {
        throw new NotFoundException(`Ruta con id ${id} no encontrada`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.route.delete({ where: { id } });
    } catch (error: unknown) {
      if (this.isPrismaError(error) && error.code === recordNotFound) {
        throw new NotFoundException(`Ruta con id ${id} no encontrada`);
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
