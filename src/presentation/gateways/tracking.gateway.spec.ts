import { Test, TestingModule } from '@nestjs/testing';
import { TrackingGateway } from './tracking.gateway';
import { Socket } from 'socket.io';

describe('TrackingGateway', () => {
  let gateway: TrackingGateway;
  let clientMock: jest.Mocked<Socket>;

  beforeEach(async () => {
    clientMock = {
      id: 'socket-id-123',
      rooms: new Set(['socket-id-123', 'old-room']),
      leave: jest.fn().mockResolvedValue(undefined),
      join: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Socket>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingGateway],
    }).compile();

    gateway = module.get<TrackingGateway>(TrackingGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('handleConnection debe imprimir log', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    gateway.handleConnection(clientMock);
    expect(consoleSpy).toHaveBeenCalledWith('Client connected: socket-id-123');
    consoleSpy.mockRestore();
  });

  it('handleDisconnect debe imprimir log', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    gateway.handleDisconnect(clientMock);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Client disconnected: socket-id-123',
    );
    consoleSpy.mockRestore();
  });

  it('handleSubscribeToRoutes debe abandonar salas antiguas y unirse a las nuevas', () => {
    const result = gateway.handleSubscribeToRoutes(
      ['route-1', 'route-2'],
      clientMock,
    );

    // Debe dejar las salas que no sean su propio ID
    expect(clientMock.leave).toHaveBeenCalledWith('old-room');
    expect(clientMock.leave).not.toHaveBeenCalledWith('socket-id-123');

    // Debe unirse a las nuevas salas
    expect(clientMock.join).toHaveBeenCalledWith('route-1');
    expect(clientMock.join).toHaveBeenCalledWith('route-2');

    // Debe devolver el ack correspondiente
    expect(result).toEqual({
      event: 'subscribed',
      data: ['route-1', 'route-2'],
    });
  });
});
