import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/online-coding-platform'),
      }),
      inject: [ConfigService],
    }),
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

