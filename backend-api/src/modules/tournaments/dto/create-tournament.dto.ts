import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';
import { TournamentFormat } from '../entities/tournament.entity';

export class CreateTournamentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  organizerId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsEnum(TournamentFormat)
  format: TournamentFormat;

  @IsNumber()
  @IsOptional()
  entryFee?: number;

  @IsNumber()
  @IsOptional()
  prizePool?: number;

  @IsNumber()
  maxTeams: number;

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

  @IsDateString()
  @IsOptional()
  registrationStart?: string;

  @IsDateString()
  @IsOptional()
  registrationEnd?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
