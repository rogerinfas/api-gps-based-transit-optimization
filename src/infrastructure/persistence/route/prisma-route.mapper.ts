import { Route } from '@entities/route/route.entity';

export type RouteRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  path?: string; // GeoJSON string from PostGIS
};

interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export class PrismaRouteMapper {
  static toDomain(row: RouteRow): Route {
    let coordinates: [number, number][] | undefined;

    if (row.path) {
      try {
        const geojson = JSON.parse(row.path) as GeoJSONLineString;
        if (geojson.type === 'LineString') {
          coordinates = geojson.coordinates;
        }
      } catch (e) {
        console.error('Error parsing route path GeoJSON:', e);
      }
    }

    return Route.rehydrate({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      path: coordinates,
    });
  }
}
