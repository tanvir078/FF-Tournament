import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';

@Controller('notices')
export class NoticesController {
  constructor(private noticesService: NoticesService) {}

  @Get()
  async findAll() {
    return this.noticesService.findAll();
  }

  @Get('active')
  async findActive() {
    return this.noticesService.findActive();
  }

  @Get('location/:location')
  async findByLocation(@Param('location') location: 'dashboard' | 'tournaments' | 'wallet') {
    return this.noticesService.findByLocation(location);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.noticesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createNoticeDto: CreateNoticeDto) {
    return this.noticesService.create(createNoticeDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateNoticeDto: UpdateNoticeDto) {
    return this.noticesService.update(id, updateNoticeDto);
  }

  @Put(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleActive(@Param('id') id: string) {
    return this.noticesService.toggleActive(id);
  }

  @Put(':id/pin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async togglePin(@Param('id') id: string) {
    return this.noticesService.togglePin(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.noticesService.remove(id);
  }
}
