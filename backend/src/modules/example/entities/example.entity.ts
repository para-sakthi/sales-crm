import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ExampleEntity {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<ExampleEntity>) {
    Object.assign(this, partial);
  }
}
