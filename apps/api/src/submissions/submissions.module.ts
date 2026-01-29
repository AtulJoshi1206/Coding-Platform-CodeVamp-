import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { ProblemsModule } from '../problems/problems.module';
import { UsersModule } from '../users/users.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { POTDModule } from '../potd/potd.module';
import { ContestsModule } from '../contests/contests.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'code-execution',
    }),
    ProblemsModule,
    UsersModule,
    LeaderboardModule,
    POTDModule,
    ContestsModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule { }
