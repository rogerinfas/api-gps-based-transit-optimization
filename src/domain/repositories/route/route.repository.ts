import type { Route } from '@entities/route/route.entity';

export const ROUTE_REPOSITORY = Symbol('ROUTE_REPOSITORY');

export interface CreateRouteData {
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateRouteData {
  code?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface IRouteRepository {
  create(data: CreateRouteData): Promise<Route>;
  findAll(): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  update(id: string, data: UpdateRouteData): Promise<Route>;
  delete(id: string): Promise<void>;
  getInterpolatedPoint(
    id: string,
    progress: number,
  ): Promise<[number, number] | null>;
}
