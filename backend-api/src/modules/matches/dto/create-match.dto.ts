import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';
import { TournamentStage } from '../../tournaments/entities/tournament.entity';

export class CreateMatchDto {
  @IsString()
  tournamentId: string;

  @IsNumber()
  matchNumber: number;

  @IsEnum(TournamentStage)
  stage: TournamentStage;

  @IsString()
  map: string;

  @IsDateString()
  scheduledTime: string;

  @IsArray()
  @IsOptional()
  slots?: any[];
}
