import { Controller, Get, Param } from '@nestjs/common';
import { StreamService } from './stream.service';

@Controller('stream')
export class StreamController {
  constructor(private streamService: StreamService) {}

  @Get('overlay/:matchId')
  async getOverlayData(@Param('matchId') matchId: string) {
    return this.streamService.generateOverlayData(matchId);
  }
}
