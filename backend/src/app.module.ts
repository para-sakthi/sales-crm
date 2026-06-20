import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExampleModule } from './modules/example/example.module';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, ExampleModule],
})
export class AppModule {}
