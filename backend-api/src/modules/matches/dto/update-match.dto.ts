import { IsString, IsNumber, IsEnum, IsOptional, IsArray } from 'class-validator';
import { MatchStatus } from '../entities/match.entity';

export class UpdateMatchDto {
  @IsString()
  @IsOptional()
  roomId?: string;

  @IsString()
  @IsOptional()
  roomPassword?: string;

  @IsString()
  @IsOptional()
  map?: string;

  @IsEnum(MatchStatus)
  @IsOptional()
  status?: MatchStatus;

  @IsArray()
  @IsOptional()
  slots?: any[];

  @IsArray()
  @IsOptional()
  results?: any[];

  @IsString()
  @IsOptional()
  mvpTeamId?: string;

  @IsArray()
  @IsOptional()
  screenshots?: string[];

  @IsString()
  @IsOptional()
  streamUrl?: string;
}
