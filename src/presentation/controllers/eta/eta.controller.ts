import {
  Controller,
  Get,
  Query,
  ParseFloatPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger';
import { GetNearestStopUseCase } from '../../../application/use-cases/eta/get-nearest-stop.use-case';
import { GetBusArrivalUseCase } from '../../../application/use-cases/eta/get-bus-arrival.use-case';
import { NearestStopResponse, BusArrivalEtaResponse } from './dto';

@ApiTags('ETA')
@Controller('eta')
export class EtaController {
  constructor(
    private readonly getNearestStopUseCase: GetNearestStopUseCase,
    private readonly getBusArrivalUseCase: GetBusArrivalUseCase,
  ) {}

  @Get('nearest-stop')
  @ApiOperation({
    summary: 'Obtener el paradero más cercano y tiempo de caminata estimado',
  })
  @ApiQuery({ name: 'lat', type: Number, required: true })
  @ApiQuery({ name: 'lng', type: Number, required: true })
  @ApiQuery({ name: 'routeId', type: String, required: false })
  @ApiResponse({ type: NearestStopResponse })
  async getNearestStop(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('routeId') routeId?: string,
  ): Promise<NearestStopResponse> {
    const result = await this.getNearestStopUseCase.execute(lat, lng, routeId);
    return NearestStopResponse.fromEntity(result);
  }

  @Get('bus-arrival')
  @ApiOperation({
    summary: 'Obtener tiempo estimado de arribo (ETA) del bus al paradero',
  })
  @ApiQuery({ name: 'routeId', type: String, required: true })
  @ApiQuery({ name: 'stopId', type: String, required: true })
  @ApiResponse({ type: BusArrivalEtaResponse })
  async getBusArrivalEta(
    @Query('routeId', ParseUUIDPipe) routeId: string,
    @Query('stopId') stopId: string,
  ): Promise<BusArrivalEtaResponse> {
    const result = await this.getBusArrivalUseCase.execute(routeId, stopId);
    return BusArrivalEtaResponse.fromEntity(result);
  }
}
