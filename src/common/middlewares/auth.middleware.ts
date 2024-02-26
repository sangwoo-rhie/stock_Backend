import { UserService } from 'src/user/user.service';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User, UserDocument } from 'src/user/entities/user.entity';

// 사용자인증 미들웨어
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    // @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // eslint-disable-next-line @typescript-eslint/ban-types
  async use(req: any, res: any, next: Function) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('로그인이 필요한 기능입니다.');
    }
    let token: string;
    try {
      token = authHeader.split(' ')[1];
      const decodedToken = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      if (!decodedToken) {
        throw new UnauthorizedException('로그인이 필요한 기능입니다.');
      }
      const userEmail = decodedToken.email;
      const user = await this.userService.getUserByEmail(userEmail);
      req.user = user;
      next();
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('로그인이 필요한 기능입니다.');
    }
  }
}
