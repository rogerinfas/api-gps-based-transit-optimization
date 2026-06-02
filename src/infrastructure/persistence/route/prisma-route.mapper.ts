import { Route } from '@entities/route/route.entity';

export type RouteRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  outboundPath?: string; // GeoJSON string from PostGIS
  returnPath?: string;
};

interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export class PrismaRouteMapper {
  static toDomain(row: RouteRow): Route {
    let outboundCoordinates: [number, number][] | undefined;
    let returnCoordinates: [number, number][] | undefined;

    if (row.outboundPath) {
      try {
        const geojson = JSON.parse(row.outboundPath) as GeoJSONLineString;
        if (geojson.type === 'LineString') {
          outboundCoordinates = geojson.coordinates;
        }
      } catch (e) {
        console.error('Error parsing route outboundPath GeoJSON:', e);
      }
    }

    if (row.returnPath) {
      try {
        const geojson = JSON.parse(row.returnPath) as GeoJSONLineString;
        if (geojson.type === 'LineString') {
          returnCoordinates = geojson.coordinates;
        }
      } catch (e) {
        console.error('Error parsing route returnPath GeoJSON:', e);
      }
    }

    return Route.rehydrate({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      imageUrl: row.imageUrl,
      color: row.color,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      outboundPath: outboundCoordinates,
      returnPath: returnCoordinates,
    });
  }
}
