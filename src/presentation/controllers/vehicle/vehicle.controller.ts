import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateVehicleUseCase } from '@use-cases/vehicle/create-vehicle.use-case';
import { DeleteVehicleUseCase } from '@use-cases/vehicle/delete-vehicle.use-case';
import { FindAllVehiclesUseCase } from '@use-cases/vehicle/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from '@use-cases/vehicle/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from '@use-cases/vehicle/update-vehicle.use-case';
import { CreateVehicleDto } from '@dtos/vehicle/create-vehicle.dto';
import { UpdateVehicleDto } from '@dtos/vehicle/update-vehicle.dto';
import { VehicleResponseDto } from '@dtos/vehicle/vehicle-response.dto';
import { VehicleStatuses } from '@entities/vehicle/vehicle-status';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly findAllVehiclesUseCase: FindAllVehiclesUseCase,
    private readonly findVehicleByIdUseCase: FindVehicleByIdUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un vehículo (bus)' })
  @ApiCreatedResponse({ type: VehicleResponseDto })
  @ApiConflictResponse({ description: 'El código o la placa ya existen' })
  async create(
    @Body() createVehicleDto: CreateVehicleDto,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.createVehicleUseCase.execute({
      code: createVehicleDto.code,
      plateNumber: createVehicleDto.plateNumber ?? null,
      status: createVehicleDto.status ?? VehicleStatuses[0],
      capacity: createVehicleDto.capacity ?? null,
      routeId: createVehicleDto.routeId ?? null,
    });
    return VehicleResponseDto.fromDomain(vehicle);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los vehículos' })
  @ApiOkResponse({ type: VehicleResponseDto, isArray: true })
  async findAll(): Promise<VehicleResponseDto[]> {
    const list = await this.findAllVehiclesUseCase.execute();
    return list.map((v) => VehicleResponseDto.fromDomain(v));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un vehículo por id' })
  @ApiParam({ name: 'id', description: 'Identificador del vehículo' })
  @ApiOkResponse({ type: VehicleResponseDto })
  @ApiNotFoundResponse({ description: 'Vehículo no encontrado' })
  async findOne(@Param('id') id: string): Promise<VehicleResponseDto> {
    const vehicle = await this.findVehicleByIdUseCase.execute(id);
    return VehicleResponseDto.fromDomain(vehicle);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente un vehículo' })
  @ApiParam({ name: 'id', description: 'Identificador del vehículo' })
  @ApiOkResponse({ type: VehicleResponseDto })
  @ApiNotFoundResponse({ description: 'Vehículo no encontrado' })
  @ApiConflictResponse({ description: 'El código o la placa ya existen' })
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.updateVehicleUseCase.execute(id, {
      ...(updateVehicleDto.code !== undefined && {
        code: updateVehicleDto.code,
      }),
      ...(updateVehicleDto.plateNumber !== undefined && {
        plateNumber: updateVehicleDto.plateNumber,
      }),
      ...(updateVehicleDto.status !== undefined && {
        status: updateVehicleDto.status,
      }),
      ...(updateVehicleDto.capacity !== undefined && {
        capacity: updateVehicleDto.capacity,
      }),
      ...(updateVehicleDto.routeId !== undefined && {
        routeId: updateVehicleDto.routeId,
      }),
    });
    return VehicleResponseDto.fromDomain(vehicle);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un vehículo' })
  @ApiParam({ name: 'id', description: 'Identificador del vehículo' })
  @ApiNoContentResponse({ description: 'Vehículo eliminado' })
  @ApiNotFoundResponse({ description: 'Vehículo no encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteVehicleUseCase.execute(id);
  }
}
