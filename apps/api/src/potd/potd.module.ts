import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { POTDController } from './potd.controller';
import { POTDService } from './potd.service';
import { POTD, POTDSchema } from './schemas/potd.schema';
import { Problem, ProblemSchema } from '../problems/schemas/problem.schema';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: POTD.name, schema: POTDSchema },
            { name: Problem.name, schema: ProblemSchema },
        ]),
        forwardRef(() => UsersModule),
    ],
    controllers: [POTDController],
    providers: [POTDService],
    exports: [POTDService],
})
export class POTDModule { }
