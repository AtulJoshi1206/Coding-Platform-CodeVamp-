import { Controller, Get, Param } from '@nestjs/common';
import { ProblemsService } from './problems.service';

@Controller('problems')
export class ProblemsController {
    constructor(private readonly problemsService: ProblemsService) { }

    @Get()
    async getAll() {
        return this.problemsService.findAll();
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.problemsService.findOne(id);
    }
}
