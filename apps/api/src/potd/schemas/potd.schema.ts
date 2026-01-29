import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type POTDDocument = POTD & Document;

@Schema({ timestamps: true })
export class POTD {
    @Prop({ required: true })
    date: string; // Format: YYYY-MM-DD

    @Prop({ type: Types.ObjectId, ref: 'Problem', required: true })
    problemId: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    solvedBy: Types.ObjectId[];
}

export const POTDSchema = SchemaFactory.createForClass(POTD);
