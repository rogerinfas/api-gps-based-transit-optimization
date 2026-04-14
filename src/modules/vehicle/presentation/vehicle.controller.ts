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
import { VehicleService } from '../application/vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { VehicleStatuses } from '../domain/vehicle-status';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  async create(
    @Body() createVehicleDto: CreateVehicleDto,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleService.create({
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
    const list = await this.vehicleService.findAll();
    return list.map((v) => VehicleResponseDto.fromDomain(v));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleService.findOne(id);
    return VehicleResponseDto.fromDomain(vehicle);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleService.update(id, {
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
    await this.vehicleService.remove(id);
  }
}
