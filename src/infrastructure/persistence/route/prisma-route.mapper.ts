import { Route } from '@entities/route/route.entity';

type RouteRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class PrismaRouteMapper {
  static toDomain(row: RouteRow): Route {
    return Route.rehydrate({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
