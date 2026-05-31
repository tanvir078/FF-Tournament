import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';
import { TournamentFormat, TournamentStatus, TournamentStage } from '../entities/tournament.entity';

export class UpdateTournamentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsEnum(TournamentFormat)
  @IsOptional()
  format?: TournamentFormat;

  @IsEnum(TournamentStatus)
  @IsOptional()
  status?: TournamentStatus;

  @IsEnum(TournamentStage)
  @IsOptional()
  currentStage?: TournamentStage;

  @IsNumber()
  @IsOptional()
  entryFee?: number;

  @IsNumber()
  @IsOptional()
  prizePool?: number;

  @IsNumber()
  @IsOptional()
  maxTeams?: number;

  @IsArray()
  @IsOptional()
  prizeDistribution?: any[];

  @IsArray()
  @IsOptional()
  rules?: string[];

  @IsArray()
  @IsOptional()
  maps?: string[];

  @IsNumber()
  @IsOptional()
  matchCount?: number;
}
