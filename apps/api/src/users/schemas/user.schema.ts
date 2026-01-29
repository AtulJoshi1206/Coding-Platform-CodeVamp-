import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: 0 })
    score: number;

    @Prop({ default: 0 })
    solvedCount: number;

    @Prop({ default: 0 })
    solvedEasy: number;

    @Prop({ default: 0 })
    solvedMedium: number;

    @Prop({ default: 0 })
    solvedHard: number;

    @Prop({ default: 0 })
    coins: number;

    @Prop({ default: 0 })
    streak: number;

    @Prop({ default: '' })
    bio: string;

    @Prop({ default: '' })
    location: string;

    @Prop({ default: '' })
    githubUrl: string;

    @Prop({ default: '' })
    linkedInUrl: string;

    @Prop({ type: [String], default: [] })
    solvedProblems: string[]; // Array of problem IDs

    @Prop({ type: [String], default: [] })
    badges: string[]; // Array of badge IDs

    @Prop({ type: Date, default: null })
    lastSolvedDate: Date | null;

    @Prop({ default: 0 })
    potdStreak: number;

    @Prop({ type: [String], default: [] })
    contestsJoined: string[]; // Array of contest IDs

    @Prop({ default: 0 })
    contestsWon: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
