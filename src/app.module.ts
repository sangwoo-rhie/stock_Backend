import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { StockModule } from './stock/stock.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import mongoose from 'mongoose';
import mongoDB from './common/config/keys';
import * as dotenv from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ImageModule } from './image/image.module';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(mongoDB.mongoURI, {
      autoCreate: true,
    }),
    UserModule,
    StockModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule implements NestModule {
  private readonly isDev: boolean =
    process.env.NODE_ENV === 'dev' ? true : false;
  configure(consumer: MiddlewareConsumer) {
    mongoose.set('debug', this.isDev); // mongoose 쿼리 logger
    consumer
      .apply(AuthMiddleware) // 회원가입, 로그인 제외 모두 사용자인증미들웨어 적용
      .exclude(
        { path: 'user/signin', method: RequestMethod.POST },
        { path: 'user/signup', method: RequestMethod.POST },
        // { path: 'yahoo-finance', method: RequestMethod.GET },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
