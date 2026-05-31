import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  captainId?: string;

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
