import {
  Controller,
  Get,
  Query,
  ParseFloatPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EtaService } from '../../../application/use-cases/eta/eta.service';

@ApiTags('ETA')
@Controller('eta')
export class EtaController {
  constructor(private readonly etaService: EtaService) {}

  @Get('nearest-stop')
  @ApiOperation({
    summary: 'Obtener el paradero más cercano y tiempo de caminata estimado',
  })
  @ApiQuery({ name: 'lat', type: Number, required: true })
  @ApiQuery({ name: 'lng', type: Number, required: true })
  @ApiQuery({ name: 'routeId', type: String, required: false })
  async getNearestStop(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('routeId') routeId?: string,
  ) {
    return this.etaService.getNearestStop(lat, lng, routeId);
  }

  @Get('bus-arrival')
  @ApiOperation({
    summary: 'Obtener tiempo estimado de arribo (ETA) del bus al paradero',
  })
  @ApiQuery({ name: 'routeId', type: String, required: true })
  @ApiQuery({ name: 'stopId', type: String, required: true })
  async getBusArrivalEta(
    @Query('routeId', ParseUUIDPipe) routeId: string,
    @Query('stopId', ParseUUIDPipe) stopId: string,
  ) {
    return this.etaService.getBusArrivalEta(routeId, stopId);
  }
}
