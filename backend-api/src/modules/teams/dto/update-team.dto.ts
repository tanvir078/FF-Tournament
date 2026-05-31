import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsArray()
  @IsOptional()
  players?: any[];
}
