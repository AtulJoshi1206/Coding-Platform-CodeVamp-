import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { POTDService } from './potd.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('potd')
export class POTDController {
    constructor(private readonly potdService: POTDService) { }

    @Get()
    async getTodaysPOTD() {
        return this.potdService.getTodaysPOTD();
    }

    @Get('status')
    @UseGuards(JwtAuthGuard)
    async getStatus(@Request() req: any) {
        const solved = await this.potdService.hasUserSolvedToday(req.user.userId);
        return { solved };
    }

    @Post('solve')
    @UseGuards(JwtAuthGuard)
    async markSolved(@Request() req: any) {
        return this.potdService.markSolved(req.user.userId);
    }
}
