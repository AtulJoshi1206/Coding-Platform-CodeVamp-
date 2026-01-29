import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContestDocument = Contest & Document;

@Schema()
export class ContestProblem {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, enum: ['Easy', 'Medium', 'Hard'] })
    difficulty: string;

    @Prop({ required: true })
    constraints: string[];

    @Prop({
        type: [{ input: String, expectedOutput: String, isHidden: Boolean }],
        required: true,
    })
    testCases: { input: string; expectedOutput: string; isHidden: boolean }[];

    @Prop({ type: Object })
    boilerplates: Record<string, string>;
}

export const ContestProblemSchema = SchemaFactory.createForClass(ContestProblem);

@Schema({ timestamps: true })
export class Contest {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    creator: Types.ObjectId;

    @Prop({ required: true })
    startTime: Date;

    @Prop({ required: true })
    endTime: Date;

    @Prop({ type: [ContestProblemSchema], default: [] })
    problems: ContestProblem[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    participants: Types.ObjectId[];

    @Prop({
        type: [{
            odId: { type: Types.ObjectId, ref: 'User' },
            odblordex: Number,
            solvedAt: Date,
            time: Number
        }],
        default: []
    })
    submissions: { odId: Types.ObjectId; odblordex: number; solvedAt: Date; time: number }[];

    @Prop({ default: 'upcoming', enum: ['upcoming', 'active', 'ended'] })
    status: string;

    @Prop({ default: true })
    isPublic: boolean;
}

export const ContestSchema = SchemaFactory.createForClass(Contest);
