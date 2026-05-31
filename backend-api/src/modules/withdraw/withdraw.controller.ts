import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { CreateWithdrawRequestDto } from './dto/create-withdraw-request.dto';
import { UpdateWithdrawRequestDto } from './dto/update-withdraw-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';

@Controller('withdraw')
export class WithdrawController {
  constructor(private withdrawService: WithdrawService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createWithdrawRequestDto: CreateWithdrawRequestDto) {
    return this.withdrawService.create(req.user.id, createWithdrawRequestDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.withdrawService.findAll();
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  async getMyRequests(@Request() req) {
    return this.withdrawService.findByUser(req.user.id);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPending() {
    return this.withdrawService.getPendingRequests();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats() {
    return this.withdrawService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    return this.withdrawService.findOneForUser(id, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateWithdrawRequestDto: UpdateWithdrawRequestDto) {
    return this.withdrawService.update(id, updateWithdrawRequestDto);
  }
}
