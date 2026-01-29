import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BadgeDocument = Badge & Document;

@Schema()
export class Badge {
    @Prop({ required: true, unique: true })
    id: string; // e.g., 'first_solve', 'streak_7', 'contest_winner'

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    icon: string; // Emoji or icon name

    @Prop({ required: true, enum: ['bronze', 'silver', 'gold', 'platinum'] })
    tier: string;

    @Prop({ required: true })
    criteria: string; // Description of how to earn

    @Prop({ default: 0 })
    points: number; // Points awarded when earned
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);

// Predefined badges
export const BADGES = [
    { id: 'first_solve', name: 'First Blood', description: 'Solved your first problem', icon: '🎯', tier: 'bronze', criteria: 'Solve 1 problem', points: 5 },
    { id: 'solver_10', name: 'Problem Solver', description: 'Solved 10 problems', icon: '🧩', tier: 'bronze', criteria: 'Solve 10 problems', points: 20 },
    { id: 'solver_50', name: 'Code Master', description: 'Solved 50 problems', icon: '🏆', tier: 'silver', criteria: 'Solve 50 problems', points: 100 },
    { id: 'solver_100', name: 'Algorithm Guru', description: 'Solved 100 problems', icon: '👑', tier: 'gold', criteria: 'Solve 100 problems', points: 250 },
    { id: 'streak_3', name: 'Getting Started', description: '3 day solving streak', icon: '🔥', tier: 'bronze', criteria: '3 day streak', points: 10 },
    { id: 'streak_7', name: 'Week Warrior', description: '7 day solving streak', icon: '⚡', tier: 'silver', criteria: '7 day streak', points: 30 },
    { id: 'streak_30', name: 'Monthly Champion', description: '30 day solving streak', icon: '💎', tier: 'gold', criteria: '30 day streak', points: 150 },
    { id: 'potd_solver', name: 'Daily Devotee', description: 'Solved POTD', icon: '☀️', tier: 'bronze', criteria: 'Solve a POTD', points: 5 },
    { id: 'potd_7', name: 'POTD Streak', description: 'Solved 7 POTDs in a row', icon: '🌟', tier: 'silver', criteria: '7 POTD streak', points: 50 },
    { id: 'contest_join', name: 'Competitor', description: 'Joined your first contest', icon: '🏁', tier: 'bronze', criteria: 'Join a contest', points: 10 },
    { id: 'contest_top3', name: 'Podium Finish', description: 'Top 3 in a contest', icon: '🥇', tier: 'gold', criteria: 'Finish top 3', points: 100 },
    { id: 'contest_winner', name: 'Contest Champion', description: 'Won a contest', icon: '🏅', tier: 'platinum', criteria: 'Win a contest', points: 200 },
    { id: 'easy_master', name: 'Easy Street', description: 'Solved 20 easy problems', icon: '🌱', tier: 'bronze', criteria: 'Solve 20 easy', points: 15 },
    { id: 'medium_master', name: 'Medium Rare', description: 'Solved 20 medium problems', icon: '🌿', tier: 'silver', criteria: 'Solve 20 medium', points: 40 },
    { id: 'hard_master', name: 'Hardened', description: 'Solved 10 hard problems', icon: '🌳', tier: 'gold', criteria: 'Solve 10 hard', points: 75 },
    { id: 'contest_creator', name: 'Contest Creator', description: 'Created a contest', icon: '🎨', tier: 'silver', criteria: 'Create a contest', points: 25 },
];
