import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
// import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
// import * as express from 'express';
import { TransformInterceptor } from './common/interceptors/responseData';
// import { HttpExceptionFilter } from './common/decorators/http.exceptions';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  // global
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.use(cookieParser());
  // app.useGlobalFilters(new HttpExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('Stock Project')
    .setDescription('Stock API description')
    .setVersion('1.0')
    .addTag('Stock')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = 3000;
  await app.listen(PORT);
}
bootstrap();

// 스웨거 : localhost:3000/api
// npm run generate:resource name
