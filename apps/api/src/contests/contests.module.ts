import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContestsController } from './contests.controller';
import { ContestsService } from './contests.service';
import { Contest, ContestSchema } from './schemas/contest.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Contest.name, schema: ContestSchema }]),
    ],
    controllers: [ContestsController],
    providers: [ContestsService],
    exports: [ContestsService],
})
export class ContestsModule { }
