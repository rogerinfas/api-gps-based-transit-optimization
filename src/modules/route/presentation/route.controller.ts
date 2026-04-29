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
import { CreateRouteUseCase } from '../application/use-cases/create-route.use-case';
import { DeleteRouteUseCase } from '../application/use-cases/delete-route.use-case';
import { FindAllRoutesUseCase } from '../application/use-cases/find-all-routes.use-case';
import { FindRouteByIdUseCase } from '../application/use-cases/find-route-by-id.use-case';
import { UpdateRouteUseCase } from '../application/use-cases/update-route.use-case';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteResponseDto } from './dto/route-response.dto';

@ApiTags('Routes')
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
  @ApiOperation({ summary: 'Crear una ruta' })
  @ApiCreatedResponse({ type: RouteResponseDto })
  @ApiConflictResponse({ description: 'El código de ruta ya existe' })
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
  @ApiOperation({ summary: 'Listar todas las rutas' })
  @ApiOkResponse({ type: RouteResponseDto, isArray: true })
  async findAll(): Promise<RouteResponseDto[]> {
    const list = await this.findAllRoutesUseCase.execute();
    return list.map((route) => RouteResponseDto.fromDomain(route));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ruta por id' })
  @ApiParam({ name: 'id', description: 'Identificador de la ruta' })
  @ApiOkResponse({ type: RouteResponseDto })
  @ApiNotFoundResponse({ description: 'Ruta no encontrada' })
  async findOne(@Param('id') id: string): Promise<RouteResponseDto> {
    const route = await this.findRouteByIdUseCase.execute(id);
    return RouteResponseDto.fromDomain(route);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente una ruta' })
  @ApiParam({ name: 'id', description: 'Identificador de la ruta' })
  @ApiOkResponse({ type: RouteResponseDto })
  @ApiNotFoundResponse({ description: 'Ruta no encontrada' })
  @ApiConflictResponse({ description: 'El código de ruta ya existe' })
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
  @ApiOperation({ summary: 'Eliminar una ruta' })
  @ApiParam({ name: 'id', description: 'Identificador de la ruta' })
  @ApiNoContentResponse({ description: 'Ruta eliminada' })
  @ApiNotFoundResponse({ description: 'Ruta no encontrada' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteRouteUseCase.execute(id);
  }
}
