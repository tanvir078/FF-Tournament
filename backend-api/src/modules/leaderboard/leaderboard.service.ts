import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { Match } from '../matches/entities/match.entity';
import { Team } from '../teams/entities/team.entity';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Tournament)
    private tournamentRepository: Repository<Tournament>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async getTournamentLeaderboard(tournamentId: string) {
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
    });

    if (!tournament) {
      return null;
    }

    const matches = await this.matchRepository.find({
      where: { tournamentId },
    });

    // Calculate leaderboard based on match results
    const teamStats = new Map<string, any>();

    matches.forEach((match) => {
      if (match.results) {
        match.results.forEach((result) => {
          if (!teamStats.has(result.teamId)) {
            teamStats.set(result.teamId, {
              teamId: result.teamId,
              totalPoints: 0,
              totalKills: 0,
              matchesPlayed: 0,
            });
          }

          const stats = teamStats.get(result.teamId);
          stats.totalPoints += result.points;
          stats.totalKills += result.kills;
          stats.matchesPlayed += 1;
        });
      }
    });

    // Convert to array and sort by points, then kills
    const leaderboard = Array.from(teamStats.values()).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.totalKills - a.totalKills;
    });

    // Add rank
    leaderboard.forEach((team, index) => {
      team.rank = index + 1;
    });

    return leaderboard;
  }

  async calculatePoints(kills: number, placement: number) {
    // Standard Free Fire scoring formula
    const pointsPerKill = 1;
    const placementPoints = {
      1: 12, // Booyah
      2: 9,
      3: 8,
      4: 7,
      5: 6,
      6: 5,
      7: 4,
      8: 3,
      9: 2,
      10: 1,
    };

    const killPoints = kills * pointsPerKill;
    const placementPoint = placementPoints[placement] || 0;

    return {
      total: killPoints + placementPoint,
      killPoints,
      placementPoint,
    };
  }
}
