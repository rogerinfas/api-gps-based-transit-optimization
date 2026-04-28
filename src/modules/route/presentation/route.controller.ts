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
import { CreateRouteUseCase } from '../application/use-cases/create-route.use-case';
import { DeleteRouteUseCase } from '../application/use-cases/delete-route.use-case';
import { FindAllRoutesUseCase } from '../application/use-cases/find-all-routes.use-case';
import { FindRouteByIdUseCase } from '../application/use-cases/find-route-by-id.use-case';
import { UpdateRouteUseCase } from '../application/use-cases/update-route.use-case';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteResponseDto } from './dto/route-response.dto';

@Controller('routes')
export class RouteController {
  constructor(
    private readonly createRouteUseCase: CreateRouteUseCase,
    private readonly findAllRoutesUseCase: FindAllRoutesUseCase,
    private readonly findRouteByIdUseCase: FindRouteByIdUseCase,
    private readonly updateRouteUseCase: UpdateRouteUseCase,
    private readonly deleteRouteUseCase: DeleteRouteUseCase,
  ) {}

  @Post()
  async create(
    @Body() createRouteDto: CreateRouteDto,
  ): Promise<RouteResponseDto> {
    const route = await this.createRouteUseCase.execute({
      code: createRouteDto.code,
      name: createRouteDto.name,
      description: createRouteDto.description ?? null,
      isActive: createRouteDto.isActive ?? true,
    });
    return RouteResponseDto.fromDomain(route);
  }

  @Get()
  async findAll(): Promise<RouteResponseDto[]> {
    const list = await this.findAllRoutesUseCase.execute();
    return list.map((route) => RouteResponseDto.fromDomain(route));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RouteResponseDto> {
    const route = await this.findRouteByIdUseCase.execute(id);
    return RouteResponseDto.fromDomain(route);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRouteDto: UpdateRouteDto,
  ): Promise<RouteResponseDto> {
    const route = await this.updateRouteUseCase.execute(id, {
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
    await this.deleteRouteUseCase.execute(id);
  }
}
