import { Controller, Get, Param } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  @Get('tournament/:tournamentId')
  async getTournamentLeaderboard(@Param('tournamentId') tournamentId: string) {
    return this.leaderboardService.getTournamentLeaderboard(tournamentId);
  }
}
