import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LeaderboardGateway } from './leaderboard.gateway';

@Injectable()
export class LeaderboardService {
    constructor(
        private usersService: UsersService,
        private leaderboardGateway: LeaderboardGateway,
    ) { }

    async getTopUsers(limit: number = 10) {
        return this.usersService.getTopUsers(limit);
    }

    async pushUpdate() {
        const topUsers = await this.getTopUsers();
        this.leaderboardGateway.broadcastUpdate(topUsers);
    }
}
