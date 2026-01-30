import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { ExecutionService } from './execution.service';
import { Submission, SubmissionSchema } from './schemas/submission.schema';
import { ProblemsModule } from '../problems/problems.module';
import { UsersModule } from '../users/users.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { POTDModule } from '../potd/potd.module';
import { ContestsModule } from '../contests/contests.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Submission.name, schema: SubmissionSchema }]),
    ProblemsModule,
    UsersModule,
    LeaderboardModule,
    POTDModule,
    ContestsModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, ExecutionService],
})
export class SubmissionsModule { }

