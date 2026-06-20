import { Injectable, NotFoundException } from '@nestjs/common';
import { ExampleRepository } from './repositories/example.repository';
import { CreateExampleDto } from './dto/create-example.dto';
import { ListExampleDto } from './dto/list-example.dto';
import {
  PaginatedResponseDto,
  PaginatedMetaDto,
} from '@/common/dto/paginated-response.dto';
import { ExampleEntity } from './entities/example.entity';

@Injectable()
export class ExampleService {
  constructor(private readonly exampleRepository: ExampleRepository) {}

  async findAll(
    dto: ListExampleDto,
  ): Promise<PaginatedResponseDto<ExampleEntity>> {
    const { items, nextCursor, total } = await this.exampleRepository.findAll({
      cursor: dto.cursor,
      limit: dto.limit ?? 20,
    });

    return new PaginatedResponseDto(
      items,
      new PaginatedMetaDto(nextCursor, total),
    );
  }

  async findOne(id: string): Promise<ExampleEntity> {
    const entity = await this.exampleRepository.findById(id);
    if (!entity) throw new NotFoundException(`Example ${id} not found`);
    return entity;
  }

  async create(dto: CreateExampleDto): Promise<ExampleEntity> {
    return this.exampleRepository.create(dto);
  }
}
