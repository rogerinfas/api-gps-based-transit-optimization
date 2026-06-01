export class BusArrivalEtaEntity {
  constructor(
    public readonly routeId: string,
    public readonly stopId: string,
    public readonly progress: number,
    public readonly busDistanceMeters: number,
    public readonly stopDistanceMeters: number,
    public readonly distanceToStopMeters: number,
    public readonly etaSeconds: number,
  ) {}
}
