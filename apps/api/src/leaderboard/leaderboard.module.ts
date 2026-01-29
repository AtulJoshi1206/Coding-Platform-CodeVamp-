import { Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardGateway } from './leaderboard.gateway';
import { LeaderboardController } from './leaderboard.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [LeaderboardService, LeaderboardGateway],
  controllers: [LeaderboardController],
  exports: [LeaderboardService],
})
export class LeaderboardModule { }
