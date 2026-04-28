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
import { CreateVehicleUseCase } from '../application/use-cases/create-vehicle.use-case';
import { DeleteVehicleUseCase } from '../application/use-cases/delete-vehicle.use-case';
import { FindAllVehiclesUseCase } from '../application/use-cases/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from '../application/use-cases/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from '../application/use-cases/update-vehicle.use-case';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { VehicleStatuses } from '../domain/vehicle-status';

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
  async findAll(): Promise<VehicleResponseDto[]> {
    const list = await this.findAllVehiclesUseCase.execute();
    return list.map((v) => VehicleResponseDto.fromDomain(v));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<VehicleResponseDto> {
    const vehicle = await this.findVehicleByIdUseCase.execute(id);
    return VehicleResponseDto.fromDomain(vehicle);
  }

  @Patch(':id')
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
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteVehicleUseCase.execute(id);
  }
}
