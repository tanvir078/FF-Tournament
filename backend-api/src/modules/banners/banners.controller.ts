import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';

@Controller('banners')
export class BannersController {
  constructor(private bannersService: BannersService) {}

  @Get()
  async findAll() {
    return this.bannersService.findAll();
  }

  @Get('active')
  async findActive() {
    return this.bannersService.findActive();
  }

  @Get('featured')
  async findFeatured() {
    return this.bannersService.findFeatured();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannersService.create(createBannerDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannersService.update(id, updateBannerDto);
  }

  @Put(':id/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateOrder(@Param('id') id: string, @Body('order') order: number) {
    return this.bannersService.updateOrder(id, order);
  }

  @Put(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleActive(@Param('id') id: string) {
    return this.bannersService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
