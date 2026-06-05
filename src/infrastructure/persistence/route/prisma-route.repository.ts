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
import {
  PrismaRouteMapper,
  RouteRow,
} from '@persistence/route/prisma-route.mapper';

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
          imageUrl: data.imageUrl ?? null,
          color: data.color,
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
    const rows: RouteRow[] = await this.prisma.$queryRaw`
      SELECT id, code, name, description, color, "imageUrl", "isActive", "createdAt", "updatedAt",
             ST_AsGeoJSON("outboundPath") as "outboundPath",
             ST_AsGeoJSON("returnPath") as "returnPath"
      FROM "Route"
      ORDER BY "createdAt" DESC
    `;
    return rows.map((row) => PrismaRouteMapper.toDomain(row));
  }

  async findById(id: string): Promise<Route | null> {
    const rows: RouteRow[] = await this.prisma.$queryRaw`
      SELECT id, code, name, description, color, "imageUrl", "isActive", "createdAt", "updatedAt",
             ST_AsGeoJSON("outboundPath") as "outboundPath",
             ST_AsGeoJSON("returnPath") as "returnPath"
      FROM "Route"
      WHERE id = ${id}
    `;
    const row = rows[0];
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
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
          ...(data.color !== undefined && { color: data.color }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      if (data.outboundPathGeoJson) {
        await this.prisma.$executeRaw`
          UPDATE "Route"
          SET "outboundPath" = ST_GeomFromGeoJSON(${JSON.stringify(data.outboundPathGeoJson)})
          WHERE id = ${id}
        `;
      }

      if (data.returnPathGeoJson) {
        await this.prisma.$executeRaw`
          UPDATE "Route"
          SET "returnPath" = ST_GeomFromGeoJSON(${JSON.stringify(data.returnPathGeoJson)})
          WHERE id = ${id}
        `;
      }

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

  async getInterpolatedPoint(
    id: string,
    progress: number,
  ): Promise<[number, number] | null> {
    const rows: Array<{ point: string }> = await this.prisma.$queryRaw`
      SELECT ST_AsGeoJSON(ST_LineInterpolatePoint("outboundPath", ${progress})) as point
      FROM "Route"
      WHERE id = ${id} AND "outboundPath" IS NOT NULL
    `;

    const row = rows[0];
    if (!row?.point) return null;

    try {
      const geojson = JSON.parse(row.point) as {
        type: string;
        coordinates: [number, number];
      };
      return geojson.coordinates; // [lon, lat]
    } catch {
      return null;
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
