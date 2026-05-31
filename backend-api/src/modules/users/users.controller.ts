import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Put('change-password')
  async changePassword(
    @Request() req,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.changePassword(req.user.id, currentPassword, newPassword);
  }

  @Put(':id/ban')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async banUser(@Param('id') id: string, @Body('reason') reason: string) {
    return this.usersService.banUser(id, reason);
  }

  @Put(':id/unban')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async unbanUser(@Param('id') id: string) {
    return this.usersService.unbanUser(id);
  }
}
