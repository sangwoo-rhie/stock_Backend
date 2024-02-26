import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserDocument } from '../entities/user.entity';
import mongoose, { Model } from 'mongoose';
import { JwtConfigService } from 'src/common/config/jwt.config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtConfigService: JwtConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfigService.createJwtOptions().secret, //process.env.JWT_SECRET,
    });
  }
  async validate(payload) {
    const { id } = payload;
    const userId = mongoose.Types.ObjectId.createFromHexString(id); // id를 ObjectId로 변환
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('로그인 후 이용 가능합니다.');
    }
    return user;
  }

  async removeRefreshToken(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    } else {
      throw new NotFoundException(
        '이미 로그아웃 되었거나, 사용자를 찾을 수 없습니다.',
      );
    }
  }
}
