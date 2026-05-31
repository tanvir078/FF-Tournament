import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { Match } from '../matches/entities/match.entity';
import { Team } from '../teams/entities/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tournament, Match, Team])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
