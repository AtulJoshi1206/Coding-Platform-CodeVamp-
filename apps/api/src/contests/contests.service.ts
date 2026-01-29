import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contest, ContestDocument } from './schemas/contest.schema';

@Injectable()
export class ContestsService {
    constructor(
        @InjectModel(Contest.name) private contestModel: Model<ContestDocument>,
    ) { }

    async create(contestData: Partial<Contest>, creatorId: string): Promise<ContestDocument> {
        const contest = new this.contestModel({
            ...contestData,
            creator: new Types.ObjectId(creatorId),
        });
        return contest.save();
    }

    async findAll(): Promise<ContestDocument[]> {
        return this.contestModel
            .find({ isPublic: true })
            .populate('creator', 'username')
            .sort({ startTime: -1 })
            .exec();
    }

    async findOne(id: string): Promise<ContestDocument> {
        const contest = await this.contestModel
            .findById(id)
            .populate('creator', 'username')
            .exec();
        if (!contest) throw new NotFoundException('Contest not found');
        return contest;
    }

    async findUpcoming(): Promise<ContestDocument[]> {
        return this.contestModel
            .find({ isPublic: true, startTime: { $gt: new Date() } })
            .populate('creator', 'username')
            .sort({ startTime: 1 })
            .limit(5)
            .exec();
    }

    async findActive(): Promise<ContestDocument[]> {
        const now = new Date();
        return this.contestModel
            .find({
                isPublic: true,
                startTime: { $lte: now },
                endTime: { $gte: now }
            })
            .populate('creator', 'username')
            .exec();
    }

    async joinContest(contestId: string, odId: string): Promise<ContestDocument> {
        const contest = await this.contestModel.findById(contestId);
        if (!contest) throw new NotFoundException('Contest not found');

        const now = new Date();
        if (now > contest.endTime) {
            throw new BadRequestException('Contest has ended');
        }

        const odIdObj = new Types.ObjectId(odId);
        if (!contest.participants.some(p => p.equals(odIdObj))) {
            contest.participants.push(odIdObj);
            await contest.save();
        }

        return contest;
    }

    async getContestProblem(contestId: string, problemIndex: number) {
        const contest = await this.contestModel.findById(contestId);
        if (!contest) throw new NotFoundException('Contest not found');
        if (problemIndex < 0 || problemIndex >= contest.problems.length) {
            throw new NotFoundException('Problem not found');
        }

        const now = new Date();
        if (now < contest.startTime) {
            throw new BadRequestException('Contest has not started yet');
        }

        return contest.problems[problemIndex];
    }

    async recordSolve(contestId: string, odId: string, problemIndex: number, time: number) {
        const contest = await this.contestModel.findById(contestId);
        if (!contest) throw new NotFoundException('Contest not found');

        const existing = contest.submissions.find(
            s => s.odId.equals(new Types.ObjectId(odId)) && s.odblordex === problemIndex
        );

        if (!existing) {
            contest.submissions.push({
                odId: new Types.ObjectId(odId),
                odblordex: problemIndex,
                solvedAt: new Date(),
                time
            });
            await contest.save();
        }

        return contest;
    }

    async getLeaderboard(contestId: string) {
        const contest = await this.contestModel
            .findById(contestId)
            .populate('participants', 'username')
            .exec();
        if (!contest) throw new NotFoundException('Contest not found');

        // Calculate scores for each participant
        const scores = new Map<string, { username: string; solved: number; totalTime: number }>();

        for (const participant of contest.participants) {
            const odId = (participant as any)._id.toString();
            const username = (participant as any).username;
            const odSubmissions = contest.submissions.filter(s => s.odId.toString() === odId);

            scores.set(odId, {
                username,
                solved: odSubmissions.length,
                totalTime: odSubmissions.reduce((acc, s) => acc + s.time, 0)
            });
        }

        // Sort by solved (desc), then by totalTime (asc)
        return Array.from(scores.values())
            .sort((a, b) => {
                if (b.solved !== a.solved) return b.solved - a.solved;
                return a.totalTime - b.totalTime;
            });
    }

    async updateStatuses() {
        const now = new Date();
        await this.contestModel.updateMany(
            { startTime: { $lte: now }, endTime: { $gte: now }, status: 'upcoming' },
            { status: 'active' }
        );
        await this.contestModel.updateMany(
            { endTime: { $lt: now }, status: { $ne: 'ended' } },
            { status: 'ended' }
        );
    }
}
