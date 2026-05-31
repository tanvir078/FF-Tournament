import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AntiCheatService } from './anti-cheat.service';

@Controller('anti-cheat')
export class AntiCheatController {
  constructor(private antiCheatService: AntiCheatService) {}

  @Post('check-uid')
  async checkDuplicateUID(@Body('uid') uid: string) {
    return this.antiCheatService.checkDuplicateUID(uid);
  }

  @Get('multiple-accounts/:userId')
  async detectMultipleAccounts(@Param('userId') userId: string) {
    return this.antiCheatService.detectMultipleAccounts(userId);
  }

  @Post('verify-screenshot')
  async verifyScreenshot(@Body('screenshotUrl') screenshotUrl: string) {
    return this.antiCheatService.verifyScreenshot(screenshotUrl);
  }
}
