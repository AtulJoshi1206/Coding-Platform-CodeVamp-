import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('execute')
    async executeCode(
        @Body('code') code: string,
        @Body('language') language: string,
        @Body('problemId') problemId: string,
        @Body('isSubmit') isSubmit: boolean,
        @Req() req: any,
    ) {
        return this.submissionsService.submitCode(code, language, problemId, req.user.userId, isSubmit);
    }

    @Get('status/:jobId')
    async getStatus(@Param('jobId') jobId: string) {
        return this.submissionsService.getJobStatus(jobId);
    }
}
