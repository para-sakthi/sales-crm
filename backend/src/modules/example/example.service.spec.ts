import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExampleService } from './example.service';
import { ExampleRepository } from './repositories/example.repository';
import { ExampleEntity } from './entities/example.entity';

const mockRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

describe('ExampleService', () => {
  let service: ExampleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        { provide: ExampleRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated results', async () => {
      const items = [
        new ExampleEntity({ id: '1', name: 'Test', createdAt: new Date() }),
      ];
      mockRepository.findAll.mockResolvedValue({
        items,
        nextCursor: null,
        total: 1,
      });

      const result = await service.findAll({ limit: 20 });

      expect(result.data).toEqual(items);
      expect(result.meta.total).toBe(1);
      expect(result.meta.nextCursor).toBeNull();
    });
  });

  describe('findOne', () => {
    it('returns an entity when found', async () => {
      const entity = new ExampleEntity({
        id: '1',
        name: 'Test',
        createdAt: new Date(),
      });
      mockRepository.findById.mockResolvedValue(entity);

      const result = await service.findOne('1');

      expect(result).toEqual(entity);
    });

    it('throws NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and returns an entity', async () => {
      const entity = new ExampleEntity({
        id: '3',
        name: 'New',
        createdAt: new Date(),
      });
      mockRepository.create.mockResolvedValue(entity);

      const result = await service.create({ name: 'New' });

      expect(result).toEqual(entity);
      expect(mockRepository.create).toHaveBeenCalledWith({ name: 'New' });
    });
  });
});
