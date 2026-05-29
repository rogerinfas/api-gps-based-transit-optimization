import { Test, TestingModule } from '@nestjs/testing';
import { SimulationService } from './simulation.service';
import { TrackingGateway } from '../../../presentation/gateways/tracking.gateway';
import { PrismaService } from '@shared/prisma/prisma.service';

describe('SimulationService', () => {
  let service: SimulationService;
  let gateway: jest.Mocked<TrackingGateway>;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    gateway = {
      server: {
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      },
    } as unknown as jest.Mocked<TrackingGateway>;

    prisma = {
      $queryRaw: jest.fn(),
    } as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationService,
        { provide: TrackingGateway, useValue: gateway },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SimulationService>(SimulationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe iniciar el intervalo en onModuleInit', () => {
    jest.useFakeTimers();
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    service.onModuleInit();

    expect(setIntervalSpy).toHaveBeenCalled();

    // Cleanup
    service.onModuleDestroy();
    jest.useRealTimers();
  });

  it('debe limpiar el intervalo en onModuleDestroy', () => {
    jest.useFakeTimers();
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    service.onModuleInit();
    service.onModuleDestroy();

    expect(clearIntervalSpy).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
