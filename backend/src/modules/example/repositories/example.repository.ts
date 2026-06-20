import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ExampleEntity } from '../entities/example.entity';
import { CreateExampleDto } from '../dto/create-example.dto';

export type FindAllOptions = {
  cursor?: string;
  limit: number;
};

export type FindAllResult = {
  items: ExampleEntity[];
  nextCursor: string | null;
  total: number;
};

@Injectable()
export class ExampleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: FindAllOptions): Promise<FindAllResult> {
    const [rows, total] = await Promise.all([
      this.prisma.example.findMany({
        take: options.limit + 1,
        ...(options.cursor ? { skip: 1, cursor: { id: options.cursor } } : {}),
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.example.count(),
    ]);

    const hasNext = rows.length > options.limit;
    const items = hasNext ? rows.slice(0, -1) : rows;
    const nextCursor = hasNext ? (items[items.length - 1]?.id ?? null) : null;

    return {
      items: items.map((row) => new ExampleEntity(row)),
      nextCursor,
      total,
    };
  }

  async findById(id: string): Promise<ExampleEntity | null> {
    const row = await this.prisma.example.findUnique({ where: { id } });
    return row ? new ExampleEntity(row) : null;
  }

  async create(dto: CreateExampleDto): Promise<ExampleEntity> {
    const row = await this.prisma.example.create({ data: { name: dto.name } });
    return new ExampleEntity(row);
  }
}
