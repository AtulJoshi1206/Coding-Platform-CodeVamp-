import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findByUsername(username: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ username }).exec();
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    async getTopUsers(limit: number = 10): Promise<UserDocument[]> {
        return this.userModel
            .find({}, { password: 0 })
            .sort({ score: -1 })
            .limit(limit)
            .exec();
    }

    async addSolvedProblem(userId: string, problemId: string, points: number, difficulty: string) {
        const user = await this.userModel.findById(userId);
        if (!user) return null;

        // Check if already solved
        if (user.solvedProblems.includes(problemId)) {
            return user;
        }

        const difficultyInc: Record<string, number> = {};
        if (difficulty === 'Easy') difficultyInc.solvedEasy = 1;
        else if (difficulty === 'Medium') difficultyInc.solvedMedium = 1;
        else if (difficulty === 'Hard') difficultyInc.solvedHard = 1;

        return this.userModel.findByIdAndUpdate(
            userId,
            {
                $addToSet: { solvedProblems: problemId },
                $inc: { score: points, solvedCount: 1, coins: 1, ...difficultyInc },
            },
            { new: true },
        );
    }

    async updateProfile(userId: string, profileData: Partial<User>) {
        return this.userModel.findByIdAndUpdate(userId, { $set: profileData }, { new: true });
    }

    async awardCoins(userId: string, amount: number) {
        return this.userModel.findByIdAndUpdate(userId, { $inc: { coins: amount } }, { new: true });
    }

    async create(userData: Partial<User>): Promise<UserDocument> {
        const newUser = new this.userModel(userData);
        return newUser.save();
    }

    async updateStreak(userId: string, newStreak: number) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $set: { streak: newStreak, lastSolvedDate: new Date() } },
            { new: true }
        );
    }

    async awardBadge(userId: string, badgeId: string) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $addToSet: { badges: badgeId } },
            { new: true }
        );
    }

    async hasBadge(userId: string, badgeId: string): Promise<boolean> {
        const user = await this.findById(userId);
        return user?.badges?.includes(badgeId) || false;
    }

    async getUserBadges(userId: string): Promise<string[]> {
        const user = await this.findById(userId);
        return user?.badges || [];
    }

    async joinContest(userId: string, contestId: string) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $addToSet: { contestsJoined: contestId } },
            { new: true }
        );
    }

    async incrementContestsWon(userId: string) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $inc: { contestsWon: 1 } },
            { new: true }
        );
    }
}
