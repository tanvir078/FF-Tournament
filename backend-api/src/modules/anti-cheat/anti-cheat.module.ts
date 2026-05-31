import { Module } from '@nestjs/common';
import { AntiCheatService } from './anti-cheat.service';
import { AntiCheatController } from './anti-cheat.controller';

@Module({
  controllers: [AntiCheatController],
  providers: [AntiCheatService],
  exports: [AntiCheatService],
})
export class AntiCheatModule {}
