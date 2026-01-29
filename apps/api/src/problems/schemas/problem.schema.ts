import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProblemDocument = Problem & Document;

@Schema()
export class Problem {
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
    boilerplates: Record<string, string>; // e.g., { "cpp": "#include <iostream>...", "python": "..." }
}

export const ProblemSchema = SchemaFactory.createForClass(Problem);
