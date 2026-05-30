export const ETA_REPOSITORY = Symbol('ETA_REPOSITORY');

export interface NearestStopData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
}

export interface RouteStopPathData {
  totalLengthMeters: number;
  stopDistanceMeters: number;
}

export interface IEtaRepository {
  getNearestStopData(
    lat: number,
    lng: number,
    routeId?: string,
  ): Promise<NearestStopData | null>;
  getRouteStopPathData(
    routeId: string,
    stopId: string,
  ): Promise<RouteStopPathData | null>;
}
