import { Module } from '@nestjs/common';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { ExampleRepository } from './repositories/example.repository';

@Module({
  controllers: [ExampleController],
  providers: [ExampleService, ExampleRepository],
})
export class ExampleModule {}
