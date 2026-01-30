import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProblemsService } from '../problems/problems.service';
import { UsersService } from '../users/users.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { POTDService } from '../potd/potd.service';
import { ContestsService } from '../contests/contests.service';
import { ExecutionService } from './execution.service';
import { Submission } from './schemas/submission.schema';

@Injectable()
export class SubmissionsService {
    constructor(
        @InjectModel(Submission.name) private submissionModel: Model<Submission>,
        private executionService: ExecutionService,
        private problemsService: ProblemsService,
        private usersService: UsersService,
        private leaderboardService: LeaderboardService,
        private potdService: POTDService,
        private contestsService: ContestsService,
    ) { }

    async submitCode(code: string, language: string, problemId: string, userId?: string, isSubmit: boolean = false) {
        let testCases: any[] = [];
        let difficulty = 'Medium';

        if (problemId.startsWith('contest_')) {
            const parts = problemId.split('_');
            const contestId = parts[1];
            const problemIndex = parseInt(parts[2]);

            const contest = await this.contestsService.findOne(contestId);
            if (!contest || !contest.problems[problemIndex]) {
                throw new NotFoundException('Contest problem not found');
            }

            const problem = contest.problems[problemIndex];
            difficulty = problem.difficulty;
            testCases = isSubmit
                ? problem.testCases
                : problem.testCases.filter(tc => !tc.isHidden);
        } else {
            const problem = await this.problemsService.findOne(problemId);
            if (!problem) {
                throw new NotFoundException('Problem not found');
            }
            difficulty = problem.difficulty;
            testCases = isSubmit
                ? problem.testCases
                : problem.testCases.filter(tc => !tc.isHidden);
        }

        // Create submission record
        const submission = new this.submissionModel({
            code,
            language,
            problemId,
            userId,
            isSubmit,
            status: 'processing',
        });
        await submission.save();

        // Start execution asynchronously
        this.runExecution(submission.id as string, code, language, testCases, userId, problemId, isSubmit);


        return { jobId: submission.id };
    }

    private async runExecution(submissionId: string, code: string, language: string, testCases: any[], userId: string | undefined, problemId: string, isSubmit: boolean) {

        try {
            const result = await this.executionService.execute(code, language, testCases);

            await this.submissionModel.findByIdAndUpdate(submissionId, {
                status: 'completed',
                result: result,
            });

            if (isSubmit && result && result.results) {
                const allPassed = result.results.every((r: any) => r.passed);
                if (allPassed && userId) {
                    await this.handleRewards(userId, problemId);
                }
            }
        } catch (error) {
            await this.submissionModel.findByIdAndUpdate(submissionId, {
                status: 'failed',
                result: { error: error.message },
            });
        }
    }

    private async handleRewards(userId: string, problemId: string) {
        let difficulty = '';
        let points = 0;

        if (problemId.startsWith('contest_')) {
            const parts = problemId.split('_');
            const contest = await this.contestsService.findOne(parts[1]);
            const problem = contest?.problems[parseInt(parts[2])];
            if (problem) {
                difficulty = problem.difficulty;
                points = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 30 : 50;
            }
        } else {
            const problem = await this.problemsService.findOne(problemId);
            if (problem) {
                difficulty = problem.difficulty;
                points = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 30 : 50;
            }
        }

        if (difficulty) {
            await this.usersService.addSolvedProblem(userId, problemId, points, difficulty);

            if (!problemId.startsWith('contest_')) {
                const potd = await this.potdService.getTodaysPOTD();
                if (potd.problem._id.toString() === problemId) {
                    await this.potdService.markSolved(userId);
                }
            }

            const user = await this.usersService.findById(userId);
            if (user) {
                if (user.solvedCount === 1) await this.usersService.awardBadge(user._id.toString(), 'first_solve');
                if (user.solvedCount === 10) await this.usersService.awardBadge(user._id.toString(), 'solver_10');
                if (user.solvedCount === 50) await this.usersService.awardBadge(user._id.toString(), 'solver_50');
                if (user.solvedEasy === 20) await this.usersService.awardBadge(user._id.toString(), 'easy_master');
                if (user.solvedMedium === 20) await this.usersService.awardBadge(user._id.toString(), 'medium_master');
                if (user.solvedHard === 10) await this.usersService.awardBadge(user._id.toString(), 'hard_master');
                if (user.potdStreak === 3) await this.usersService.awardBadge(user._id.toString(), 'streak_3');
                if (user.potdStreak === 7) await this.usersService.awardBadge(user._id.toString(), 'streak_7');
            }

            await this.leaderboardService.pushUpdate();
        }
    }

    async getJobStatus(jobId: string) {
        const submission = await this.submissionModel.findById(jobId);
        if (!submission) return { status: 'not_found' };

        return {
            id: submission.id,
            status: submission.status,
            result: submission.result,
        };
    }
}

