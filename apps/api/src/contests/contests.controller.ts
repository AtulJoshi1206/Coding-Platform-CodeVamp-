import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ContestsService } from './contests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('contests')
export class ContestsController {
    constructor(private readonly contestsService: ContestsService) { }

    @Get()
    async findAll() {
        await this.contestsService.updateStatuses();
        return this.contestsService.findAll();
    }

    @Get('upcoming')
    async findUpcoming() {
        await this.contestsService.updateStatuses();
        return this.contestsService.findUpcoming();
    }

    @Get('active')
    async findActive() {
        await this.contestsService.updateStatuses();
        return this.contestsService.findActive();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.contestsService.findOne(id);
    }

    @Get(':id/problem/:index')
    async getProblem(@Param('id') id: string, @Param('index') index: string) {
        return this.contestsService.getContestProblem(id, parseInt(index));
    }

    @Get(':id/leaderboard')
    async getLeaderboard(@Param('id') id: string) {
        return this.contestsService.getLeaderboard(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createContestDto: any, @Request() req: any) {
        return this.contestsService.create(createContestDto, req.user.userId);
    }

    @Post(':id/join')
    @UseGuards(JwtAuthGuard)
    async join(@Param('id') id: string, @Request() req: any) {
        return this.contestsService.joinContest(id, req.user.userId);
    }

    @Post(':id/solve/:index')
    @UseGuards(JwtAuthGuard)
    async recordSolve(
        @Param('id') id: string,
        @Param('index') index: string,
        @Body('time') time: number,
        @Request() req: any
    ) {
        return this.contestsService.recordSolve(id, req.user.userId, parseInt(index), time);
    }
}
