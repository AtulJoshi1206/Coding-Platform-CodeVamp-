import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() req: any) {
        return this.usersService.findById(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put('profile')
    async updateProfile(@Req() req: any, @Body() profileData: any) {
        return this.usersService.updateProfile(req.user.userId, profileData);
    }
}
