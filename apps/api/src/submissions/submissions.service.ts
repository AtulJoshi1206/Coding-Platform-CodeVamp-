import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ProblemsService } from '../problems/problems.service';
import { UsersService } from '../users/users.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { POTDService } from '../potd/potd.service';
import { ContestsService } from '../contests/contests.service';

@Injectable()
export class SubmissionsService {
    constructor(
        @InjectQueue('code-execution') private codeQueue: Queue,
        private problemsService: ProblemsService,
        private usersService: UsersService,
        private leaderboardService: LeaderboardService,
        private potdService: POTDService,
        private contestsService: ContestsService,
    ) { }

    async submitCode(code: string, language: string, problemId: string, userId?: string, isSubmit: boolean = false) {
        let testCases: any[] = [];
        let difficulty = 'Medium'; // Default

        if (problemId.startsWith('contest_')) {
            // Format: contest_{contestId}_{problemIndex}
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

        const job = await this.codeQueue.add('execute', {
            code,
            language,
            testCases,
            problemId,
            userId,
            isSubmit,
        });

        return { jobId: job.id };
    }

    async getJobStatus(jobId: string) {
        const job = await this.codeQueue.getJob(jobId);
        if (!job) return { status: 'not_found' };

        const state = await job.getState();
        const result = job.returnvalue;

        if (state === 'completed' && job.data.isSubmit && result && result.results) {
            const allPassed = result.results.every((r: any) => r.passed);
            if (allPassed && job.data.userId) {
                let difficulty = '';
                let points = 0;

                if (job.data.problemId.startsWith('contest_')) {
                    const parts = job.data.problemId.split('_');
                    try {
                        const contest = await this.contestsService.findOne(parts[1]);
                        const problem = contest?.problems[parseInt(parts[2])];
                        if (problem) {
                            difficulty = problem.difficulty;
                            points = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 30 : 50;
                        }
                    } catch (e) {
                        // Contest might not exist or other error, ignore
                    }
                } else {
                    const problem = await this.problemsService.findOne(job.data.problemId);
                    if (problem) {
                        difficulty = problem.difficulty;
                        points = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 30 : 50;
                    }
                }

                if (difficulty) {
                    await this.usersService.addSolvedProblem(job.data.userId, job.data.problemId, points, difficulty);

                    // Check for POTD (Only for regular problems)
                    if (!job.data.problemId.startsWith('contest_')) {
                        const potd = await this.potdService.getTodaysPOTD();
                        if (potd.problem._id.toString() === job.data.problemId) {
                            const { streakIncreased } = await this.potdService.markSolved(job.data.userId);
                            if (streakIncreased) {
                                // Maybe notify user of streak increase?
                            }
                        }
                    }

                    // Check for Badges (Simplified Logic)
                    const user = await this.usersService.findById(job.data.userId);
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
        }

        return {
            id: job.id,
            status: state === 'completed' ? 'completed' : state === 'failed' ? 'failed' : 'processing',
            result,
        };
    }
}
