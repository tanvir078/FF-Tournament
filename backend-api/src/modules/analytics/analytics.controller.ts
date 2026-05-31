import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('player/:userId')
  async getPlayerStats(@Param('userId') userId: string) {
    return this.analyticsService.getPlayerStats(userId);
  }

  @Get('team/:teamId')
  async getTeamStats(@Param('teamId') teamId: string) {
    return this.analyticsService.getTeamStats(teamId);
  }

  @Get('tournament/:tournamentId')
  async getTournamentAnalytics(@Param('tournamentId') tournamentId: string) {
    return this.analyticsService.getTournamentAnalytics(tournamentId);
  }
}
