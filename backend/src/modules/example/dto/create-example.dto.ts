import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
