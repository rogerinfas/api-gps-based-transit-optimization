export interface RouteProps {
  id: string;
  code: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  outboundPath?: [number, number][]; // [lon, lat][]
  returnPath?: [number, number][]; // [lon, lat][]
}

export class Route {
  private constructor(private readonly props: RouteProps) {}

  static rehydrate(props: RouteProps): Route {
    return new Route({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get imageUrl(): string | null {
    return this.props.imageUrl;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get outboundPath(): [number, number][] | undefined {
    return this.props.outboundPath;
  }

  get returnPath(): [number, number][] | undefined {
    return this.props.returnPath;
  }

  toProps(): RouteProps {
    return { ...this.props };
  }
}
