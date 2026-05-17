import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LocalDatabaseModule } from './local-database.module';
import { ProblemsModule } from './problems/problems.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { ContestsModule } from './contests/contests.module';
import { POTDModule } from './potd/potd.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Smart DB module: embedded MongoDB in dev, Atlas in prod
    LocalDatabaseModule,
    ProblemsModule,
    SubmissionsModule,
    AuthModule,
    UsersModule,
    LeaderboardModule,
    ContestsModule,
    POTDModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
