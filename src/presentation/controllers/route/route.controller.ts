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
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CreateRouteUseCase } from '@use-cases/route/create-route.use-case';
import { DeleteRouteUseCase } from '@use-cases/route/delete-route.use-case';
import { FindAllRoutesUseCase } from '@use-cases/route/find-all-routes.use-case';
import { FindRouteByIdUseCase } from '@use-cases/route/find-route-by-id.use-case';
import { UpdateRouteUseCase } from '@use-cases/route/update-route.use-case';
import { GetRouteSimulationUseCase } from '@use-cases/route/get-route-simulation.use-case';
import { CreateRouteDto } from '@dtos/route/create-route.dto';
import { UpdateRouteDto } from '@dtos/route/update-route.dto';
import { RouteResponseDto } from '@dtos/route/route-response.dto';
import { UploadFileUseCase, GetPublicUrlUseCase } from '@storage/index';

@ApiTags('Routes')
@Controller('routes')
export class RouteController {
  constructor(
    private readonly createRouteUseCase: CreateRouteUseCase,
    private readonly findAllRoutesUseCase: FindAllRoutesUseCase,
    private readonly findRouteByIdUseCase: FindRouteByIdUseCase,
    private readonly updateRouteUseCase: UpdateRouteUseCase,
    private readonly deleteRouteUseCase: DeleteRouteUseCase,
    private readonly getRouteSimulationUseCase: GetRouteSimulationUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly getPublicUrlUseCase: GetPublicUrlUseCase,
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
      imageUrl: createRouteDto.imageUrl ?? null,
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
      ...(updateRouteDto.imageUrl !== undefined && {
        imageUrl: updateRouteDto.imageUrl,
      }),
      ...(updateRouteDto.isActive !== undefined && {
        isActive: updateRouteDto.isActive,
      }),
      ...(updateRouteDto.outboundPathGeoJson !== undefined && {
        outboundPathGeoJson: updateRouteDto.outboundPathGeoJson,
      }),
      ...(updateRouteDto.returnPathGeoJson !== undefined && {
        returnPathGeoJson: updateRouteDto.returnPathGeoJson,
      }),
    });
    return RouteResponseDto.fromDomain(route);
  }

  @Post(':id/image')
  @ApiOperation({ summary: 'Subir o reemplazar la imagen de una ruta' })
  @ApiParam({ name: 'id', description: 'Identificador de la ruta' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ type: RouteResponseDto })
  @ApiNotFoundResponse({ description: 'Ruta no encontrada' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<RouteResponseDto> {
    const route = await this.findRouteByIdUseCase.execute(id);

    // Subir el archivo usando la lib de storage
    const metadata = await this.uploadFileUseCase.execute(
      {
        buffer: file.buffer,
        filename: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
      { path: `rutas/${route.code}` },
    );

    // Obtener la URL pública mediante el caso de uso de la lib
    const imageUrl = this.getPublicUrlUseCase.execute(metadata.key);

    const updatedRoute = await this.updateRouteUseCase.execute(id, {
      imageUrl,
    });

    return RouteResponseDto.fromDomain(updatedRoute);
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

  @Get(':id/simulate')
  @ApiOperation({ summary: 'Obtener un punto interpolado para simulación' })
  @ApiParam({ name: 'id', description: 'Identificador de la ruta' })
  @ApiQuery({
    name: 'progress',
    description: 'Progreso de la ruta (0.0 a 1.0)',
    example: 0.5,
  })
  @ApiOkResponse({
    description: 'Punto interpolado [lon, lat]',
    type: [Number],
  })
  async simulate(
    @Param('id') id: string,
    @Query('progress') progress: string,
  ): Promise<[number, number]> {
    return this.getRouteSimulationUseCase.execute(id, parseFloat(progress));
  }
}
