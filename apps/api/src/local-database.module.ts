import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * LocalDatabaseModule
 *
 * In development (NODE_ENV=development or when MONGODB_URI is localhost):
 *   → Starts an embedded MongoDB Memory Server automatically.
 *     Zero installation required — the binary is downloaded once on first run.
 *
 * In production:
 *   → Uses the MONGODB_URI from .env (Atlas or any real MongoDB).
 */
@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => {
                const uri = config.get<string>('MONGODB_URI') || '';
                const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1') || !uri;

                if (isLocal) {
                    // Use embedded MongoDB Memory Server for local dev
                    const { MongoMemoryServer } = await import('mongodb-memory-server');
                    const mongod = await MongoMemoryServer.create({
                        instance: {
                            dbName: 'codevamp',
                            port: 27017, // Try to use the standard port
                        },
                    });
                    const memUri = mongod.getUri();
                    console.log(`\n🗄️  [DB] Embedded MongoDB started at: ${memUri}\n`);

                    // Store reference so it doesn't get GC'd
                    (global as any).__mongod = mongod;

                    return { uri: memUri };
                }

                // Production: use Atlas or real MongoDB
                console.log(`\n🗄️  [DB] Connecting to remote MongoDB...\n`);
                return { uri };
            },
        }),
    ],
    exports: [MongooseModule],
})
export class LocalDatabaseModule { }
