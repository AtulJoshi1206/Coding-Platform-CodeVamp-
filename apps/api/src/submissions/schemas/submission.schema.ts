import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Submission extends Document {
    @Prop({ required: true })
    code: string;

    @Prop({ required: true })
    language: string;

    @Prop({ required: true })
    problemId: string;

    @Prop()
    userId: string;

    @Prop({ default: 'processing' })
    status: string;

    @Prop({ type: Object })
    result: any;

    @Prop({ default: false })
    isSubmit: boolean;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
