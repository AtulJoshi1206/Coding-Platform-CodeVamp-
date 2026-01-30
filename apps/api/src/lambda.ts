import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverless from 'serverless-http';
import { Handler, Context, Callback } from 'aws-lambda';

let cachedServer: any;

async function bootstrap() {
    if (!cachedServer) {
        const app = await NestFactory.create(AppModule);
        app.enableCors();
        await app.init();
        const expressApp = app.getHttpAdapter().getInstance();
        cachedServer = serverless(expressApp);
    }
    return cachedServer;
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
    if (event.path) {
        if (event.path.includes('/.netlify/functions/lambda')) {
            event.path = event.path.replace('/.netlify/functions/lambda', '');
        } else if (event.path.startsWith('/api')) {
            event.path = event.path.replace('/api', '');
        }
    }


    const server = await bootstrap();
    return server(event, context, callback);
};
