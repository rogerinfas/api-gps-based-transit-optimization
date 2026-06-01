import { DomainException } from '../domain-exception';

export class StopNotFoundException extends DomainException {
  constructor() {
    super('No active stop found.');
  }
}

export class RouteOrStopNotFoundException extends DomainException {
  constructor() {
    super('Route or Stop not found or invalid UUID.');
  }
}
