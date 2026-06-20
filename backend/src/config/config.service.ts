import { Injectable } from '@nestjs/common';
import { validateEnv, Env } from './env.validation';

@Injectable()
export class ConfigService {
  private readonly env: Env;

  constructor() {
    this.env = validateEnv(process.env);
  }

  get jwtSecret(): string {
    return this.env.JWT_SECRET;
  }

  get port(): number {
    return this.env.PORT;
  }

  get databaseUrl(): string {
    return this.env.DATABASE_URL;
  }
}
