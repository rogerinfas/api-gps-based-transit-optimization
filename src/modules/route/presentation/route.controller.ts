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
import { RouteService } from '../application/route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteResponseDto } from './dto/route-response.dto';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  async create(
    @Body() createRouteDto: CreateRouteDto,
  ): Promise<RouteResponseDto> {
    const route = await this.routeService.create({
      code: createRouteDto.code,
      name: createRouteDto.name,
      description: createRouteDto.description ?? null,
      isActive: createRouteDto.isActive ?? true,
    });
    return RouteResponseDto.fromDomain(route);
  }

  @Get()
  async findAll(): Promise<RouteResponseDto[]> {
    const list = await this.routeService.findAll();
    return list.map((route) => RouteResponseDto.fromDomain(route));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RouteResponseDto> {
    const route = await this.routeService.findOne(id);
    return RouteResponseDto.fromDomain(route);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRouteDto: UpdateRouteDto,
  ): Promise<RouteResponseDto> {
    const route = await this.routeService.update(id, {
      ...(updateRouteDto.code !== undefined && { code: updateRouteDto.code }),
      ...(updateRouteDto.name !== undefined && { name: updateRouteDto.name }),
      ...(updateRouteDto.description !== undefined && {
        description: updateRouteDto.description,
      }),
      ...(updateRouteDto.isActive !== undefined && {
        isActive: updateRouteDto.isActive,
      }),
    });
    return RouteResponseDto.fromDomain(route);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.routeService.remove(id);
  }
}
