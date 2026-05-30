export class NearestStopEntity {
  constructor(
    public readonly stopId: string,
    public readonly name: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly distanceMeters: number,
    public readonly etaSeconds: number,
  ) {}
}
