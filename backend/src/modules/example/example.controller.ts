import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';
import { ListExampleDto } from './dto/list-example.dto';

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  async findAll(@Query() query: ListExampleDto) {
    return this.exampleService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.exampleService.findOne(id);
  }

  @Post()
  async create(@Body() body: CreateExampleDto) {
    return this.exampleService.create(body);
  }
}
