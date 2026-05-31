import { Controller, Get, Put, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('financial-reports')
  async getFinancialReports() {
    return this.adminService.getFinancialReports();
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id/ban')
  async banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Put('users/:id/unban')
  async unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Get('tournaments')
  async getAllTournaments() {
    return this.adminService.getAllTournaments();
  }

  @Delete('tournaments/:id')
  async deleteTournament(@Param('id') id: string) {
    return this.adminService.deleteTournament(id);
  }

  @Get('withdrawals')
  async getWithdrawals(@Query('status') status?: string) {
    return this.adminService.getWithdrawals(status);
  }

  @Put('withdrawals/:id/approve')
  async approveWithdrawal(@Param('id') id: string) {
    return this.adminService.approveWithdrawal(id);
  }

  @Put('withdrawals/:id/reject')
  async rejectWithdrawal(@Param('id') id: string) {
    return this.adminService.rejectWithdrawal(id);
  }
}
