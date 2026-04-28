import type { Route } from '../../domain/route.entity';

export class RouteResponseDto {
  id!: string;
  code!: string;
  name!: string;
  description!: string | null;
  isActive!: boolean;
  createdAt!: string;
  updatedAt!: string;

  static fromDomain(route: Route): RouteResponseDto {
    const dto = new RouteResponseDto();
    dto.id = route.id;
    dto.code = route.code;
    dto.name = route.name;
    dto.description = route.description;
    dto.isActive = route.isActive;
    dto.createdAt = route.createdAt.toISOString();
    dto.updatedAt = route.updatedAt.toISOString();
    return dto;
  }
}
