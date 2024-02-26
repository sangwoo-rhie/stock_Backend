import { JwtStrategy } from './strategies/jwt.strategy';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import mongoose, { Model, ObjectId } from 'mongoose';
import {
  DeleteUserReqDto,
  FindUserReqDto,
  SigninReqDto,
  SignupReqDto,
  UpdateUserReqDto,
} from './dto/req.dto';
import * as bcrypt from 'bcrypt';
// import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { DeleteUserResDto } from './dto/res.dto';
import { JwtConfigService } from 'src/common/config/jwt.config.service';
import { UserRole } from './userinfo';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly jwtConfigService: JwtConfigService,
    private readonly JwtStrategy: JwtStrategy,
  ) {}

  // 1. 회원가입
  async SignUp(signupDto: SignupReqDto): Promise<User> {
    const { email, password, confirmPassword, nickname, role, organization } =
      signupDto;

    if (
      !email ||
      !password ||
      !confirmPassword ||
      !nickname ||
      !role ||
      !organization
    ) {
      throw new BadRequestException(
        '미기입된 사항이 있습니다. 모두 입력해주세요.',
      );
    }
    const existEmail = await this.getUserByEmail(email);
    if (existEmail) {
      throw new ConflictException('동일한 E-mail 계정이 이미 존재합니다.');
    }

    const existNickname = await this.getUserByNickname(nickname);
    if (existNickname) {
      throw new ConflictException(
        '동일한 nickname을 가진 계정이 이미 존재합니다.',
      );
    }

    if (password !== confirmPassword)
      throw new BadRequestException(
        '비밀번호와 확인 비밀번호가 일치하지 않습니다.',
      );

    if (role !== UserRole.ADMIN && role !== UserRole.GUEST) {
      throw new BadRequestException(
        '관리자일 경우 `ADMIN`을, 관리자가 아닐 경우 `GUEST`를 입력해주세요.',
      );
    }

    const hashedPassword = await this.hashPassword(password);

    const createUser = await this.userModel.create({
      email,
      password: hashedPassword,
      nickname,
      role,
      organization,
    });

    return createUser;
  }

  // 2. 로그인
  async SignIn(user: User): Promise<{ token: string; refreshToken: string }> {
    const LoginUser = await this.userModel.findOne({ email: user.email });
    const token = this.getAccessToken(LoginUser._id, user.email);
    const refreshToken = this.getRefreshToken(LoginUser._id, user.email);
    await this.userModel.updateOne(
      { email: user.email },
      {
        $set: {
          refreshToken: refreshToken,
        },
      },
    );
    return { token, refreshToken };
  }

  // 토큰발급 (액세스 토큰발급)
  getAccessToken(_id: ObjectId, email: string) {
    const payload = { _id, email };
    const secret = this.jwtConfigService.createJwtOptions();
    return this.jwtService.sign(payload, secret);
  }

  // 리프레시 토큰발급
  getRefreshToken(_id: ObjectId, email: string) {
    const payload = { _id, email };
    const refresh = this.jwtConfigService.createRefreshTokenOptions();
    return this.jwtService.sign(payload, refresh);
  }

  // 리프래시 토큰 유효성검사
  async validateRefreshToken(
    user: User,
    bearerToken: string,
  ): Promise<{ token: string }> {
    const refreshToken = bearerToken.replace('Bearer', '').trim();

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }
    const LoginUser = await this.userModel.findOne({ email: user.email });
    const token = this.getAccessToken(LoginUser._id, user.email);
    return { token };
  }

  // 3. 로그아웃
  async SignOut(user: User): Promise<void> {
    const LoginUser = await this.userModel.findOne({ email: user.email });
    await this.JwtStrategy.removeRefreshToken(LoginUser._id);
  }

  // 4. 본인정보 조회
  async myInfo(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { refreshToken, password, updatedAt, deletedAt, ...rest } = user;
    return { rest };
  }

  // 5. 유저목록조회
  async findUsers(
    user: User,
    page: number,
    limit: number = 20,
  ): Promise<User[]> {
    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException(
        '관리자만 유저 목록을 조회할 수 있습니다.',
      );
    }
    page = Number(page) || 1;
    const skip = (page - 1) * limit;
    return await this.userModel
      .find(
        {},
        {
          email: 1,
          nickname: 1,
          organization: 1,
          role: 1,
          createdAt: 1,
          refreshToken: 1,
          _id: 0,
        },
      )
      .skip(skip)
      .limit(limit)
      .exec();
  }

  // 6. 이메일로 유저조회
  async findUser(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('존재하는 유저가 아닙니다.');
    }
    const userEmail = user.email;
    const nickname = user.nickname;
    const organization = user.organization;
    const role = user.organization;
    const createdAt = user.createdAt;
    return { userEmail, nickname, organization, role, createdAt };
  }

  // 7. 회원정보 수정
  async updateUser(user: User, updateDto: UpdateUserReqDto) {
    const { password, newPassword, nickname, organization } = updateDto;

    const comparedPassword = await bcrypt.compare(password, user.password);
    if (!comparedPassword) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
    const newpw = await this.hashPassword(newPassword);

    await this.userModel.updateOne(
      { email: user.email },
      {
        $set: {
          password: newpw,
          nickname: nickname,
          organization: organization,
          updatedAt: new Date(),
        },
      },
    );
    return this.userModel.findOne({ email: user.email });
  }

  // 8. 회원 탈퇴
  async deleteUser(user: User, deleteDto: DeleteUserReqDto) {
    const { password } = deleteDto;
    if (!password) {
      throw new BadRequestException(
        '회원 탈퇴를 위한 기존 회원 비밀번호를 입력해주세요.',
      );
    }
    const comparedPassword = await bcrypt.compare(password, user.password);
    if (!comparedPassword) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
    if (comparedPassword) {
      await this.userModel.updateOne(
        { email: user.email },
        {
          $set: {
            deletedAt: new Date(),
          },
        },
      );
      await this.userModel.deleteOne({ email: user.email });
    }
    return new DeleteUserResDto(user.email);
  }

  // 유저 유효성 검사
  async validateUser(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('해당 회원이 존재하지 않습니다.');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('잘못된 비밀번호입니다.');
    }
    return user;
  }

  // Email 검사
  async getUserByEmail(email: string) {
    return await this.userModel.findOne({ email: email });
  }

  // Nickname 검사
  async getUserByNickname(nickname: string) {
    return await this.userModel.findOne({ nickname: nickname });
  }

  // 사용자인증 미들웨어 토큰 조회
  // async getUserById(id: string): Promise<User | null> {
  //   try {
  //     const userId = new mongoose.Types.ObjectId(id);
  //     const user = await this.userModel.findById(userId);
  //     return user;
  //   } catch (error) {
  //     console.log(error);
  //     return null;
  //   }
  // }

  // 비밀번호 해싱
  async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_SALT) || 10;
    return await bcrypt.hash(password, saltRounds);
  }
}
