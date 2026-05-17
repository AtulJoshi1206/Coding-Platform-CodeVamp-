import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { POTD, POTDDocument } from './schemas/potd.schema';
import { Problem, ProblemDocument } from '../problems/schemas/problem.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class POTDService implements OnModuleInit {
    constructor(
        @InjectModel(POTD.name) private potdModel: Model<POTDDocument>,
        @InjectModel(Problem.name) private problemModel: Model<ProblemDocument>,
        private usersService: UsersService,
    ) { }

    async onModuleInit() {
        // Gracefully initialize POTD — don't crash if DB is empty on first boot
        // (Problems are seeded async, so this may run before seed completes)
        try {
            await this.getOrCreateTodaysPOTD();
        } catch (err) {
            console.warn('[POTD] Skipping POTD init on startup — no problems in DB yet. Will retry on first request.');
        }
    }

    private getTodayDate(): string {
        return new Date().toISOString().split('T')[0];
    }

    async getOrCreateTodaysPOTD(): Promise<POTDDocument> {
        const today = this.getTodayDate();

        let potd = await this.potdModel.findOne({ date: today }).populate('problemId');

        // If POTD exists but problem is missing (e.g., deleted due to re-seeding), recreate it
        if (potd && !potd.problemId) {
            await this.potdModel.deleteOne({ _id: potd._id });
            potd = null;
        }

        if (potd) return potd;

        // Select a random problem
        const problems = await this.problemModel.find().exec();
        if (problems.length === 0) {
            throw new Error('No problems available for POTD');
        }

        const randomIndex = Math.floor(Math.random() * problems.length);
        const selectedProblem = problems[randomIndex];

        potd = new this.potdModel({
            date: today,
            problemId: selectedProblem._id,
        });

        await potd.save();
        return potd.populate('problemId');
    }

    async getTodaysPOTD() {
        const potd = await this.getOrCreateTodaysPOTD();
        return {
            date: potd.date,
            problem: potd.problemId,
            solvedCount: potd.solvedBy.length,
        };
    }

    async markSolved(userId: string): Promise<{ streakIncreased: boolean; newStreak: number }> {
        const today = this.getTodayDate();
        const potd = await this.potdModel.findOne({ date: today });

        if (!potd) {
            throw new Error('No POTD for today');
        }

        const userIdObj = new Types.ObjectId(userId);

        // Check if already solved
        if (potd.solvedBy.some(id => id.equals(userIdObj))) {
            const user = await this.usersService.findById(userId);
            return { streakIncreased: false, newStreak: user?.streak || 0 };
        }

        // Mark as solved
        potd.solvedBy.push(userIdObj);
        await potd.save();

        // Increase streak
        const user = await this.usersService.findById(userId);
        if (!user) throw new Error('User not found');

        // Check if user solved yesterday's POTD (for streak continuation)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const yesterdayPOTD = await this.potdModel.findOne({ date: yesterdayStr });
        const solvedYesterday = yesterdayPOTD?.solvedBy.some(id => id.equals(userIdObj)) || false;

        let newStreak: number;
        if (solvedYesterday) {
            newStreak = (user.streak || 0) + 1;
        } else {
            newStreak = 1; // Reset streak
        }

        await this.usersService.updateStreak(userId, newStreak);

        return { streakIncreased: true, newStreak };
    }

    async hasUserSolvedToday(userId: string): Promise<boolean> {
        const today = this.getTodayDate();
        const potd = await this.potdModel.findOne({ date: today });
        if (!potd) return false;

        return potd.solvedBy.some(id => id.equals(new Types.ObjectId(userId)));
    }
}
