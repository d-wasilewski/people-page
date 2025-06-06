import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    cors({
      origin: 'http://localhost:5173',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    })
  );

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
}
bootstrap();
