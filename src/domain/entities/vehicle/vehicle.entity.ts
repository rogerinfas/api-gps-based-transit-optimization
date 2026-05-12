import type { VehicleStatus } from './vehicle-status';

export interface VehicleProps {
  id: string;
  code: string;
  plateNumber: string | null;
  status: VehicleStatus;
  capacity: number | null;
  routeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Vehicle {
  private constructor(private readonly props: VehicleProps) {}

  static rehydrate(props: VehicleProps): Vehicle {
    return new Vehicle({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get plateNumber(): string | null {
    return this.props.plateNumber;
  }

  get status(): VehicleStatus {
    return this.props.status;
  }

  get capacity(): number | null {
    return this.props.capacity;
  }

  get routeId(): string | null {
    return this.props.routeId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toProps(): VehicleProps {
    return { ...this.props };
  }
}
