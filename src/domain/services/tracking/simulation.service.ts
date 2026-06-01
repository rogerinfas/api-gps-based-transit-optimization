export const SIMULATION_SERVICE = Symbol('SIMULATION_SERVICE');

export interface ISimulationService {
  getProgress(routeId: string): number;
}
