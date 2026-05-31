import { Injectable } from '@nestjs/common';

@Injectable()
export class StreamService {
  generateOverlayData(matchId: string) {
    // Generate OBS overlay data for streaming
    return {
      matchId,
      teams: [],
      currentRankings: [],
      topFragger: null,
      mvp: null,
    };
  }
}
