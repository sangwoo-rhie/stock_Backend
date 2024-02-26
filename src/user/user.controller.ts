import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  DeleteUserReqDto,
  FindUserReqDto,
  SigninReqDto,
  SignupReqDto,
  UpdateUserReqDto,
} from './dto/req.dto';
// import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { DeleteUserResDto } from './dto/res.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 1. 회원가입 (o)
  // POST http://localhost:3000/user/signup
  @ApiOperation({ summary: '회원가입' })
  @Post('/signup')
  async SignUp(@Body(new ValidationPipe()) signupDto: SignupReqDto) {
    return await this.userService.SignUp(signupDto);
  }

  // 2. 로그인 (o)
  // POST http://localhost:3000/user/signin
  @ApiOperation({ summary: '로그인' })
  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async SignIn(
    @Req() req: any,
  ): Promise<{ token: string; refreshToken: string }> {
    console.log('req.user: ', req.user);
    return await this.userService.SignIn(req.user);
  }

  // 3. 로그아웃 (X)
  // POST http://localhost:3000/user/signout
  @ApiOperation({ summary: '로그아웃' })
  @UseGuards(JwtAuthGuard)
  @Post('/signout')
  async SignOut(@Req() req: any): Promise<void> {
    return await this.userService.SignOut(req.user);
  }

  // 4. 본인정보조회 (o)
  // GET http://localhost:3000/user/myinfo
  @ApiOperation({ summary: '본인정보 조회' })
  @Get('/myinfo')
  async myInfo(@Req() req) {
    return await this.userService.myInfo(req.user);
  }

  // 5. 유저목록조회 (ADMIN만 가능) (o)
  // GET http://localhost:3000/user/users
  @ApiOperation({ summary: '유저목록조회' })
  @Get('/users')
  async findUsers(
    @Req() req,
    @Query('page') page: number,
    @Query('limit') limit: number = 20,
  ) {
    return await this.userService.findUsers(req.user, page, limit);
  }

  // 6. 이메일로 유저조회 (o)
  // GET http://localhost:3000/user/searchEmail?email=betterAndBetter0@naver.com
  @ApiOperation({ summary: '이메일로 유저조회' })
  @Get('/searchEmail')
  async findUser(@Query('email') email: string) {
    return await this.userService.findUser(email);
  }

  // 7. 회원정보 수정 (o)
  // PATCH http://localhost:3000/user/myinfo
  @ApiOperation({ summary: '회원정보 수정' })
  @Patch('/myinfo')
  async updateUser(@Req() req, @Body() updateDto: UpdateUserReqDto) {
    return await this.userService.updateUser(req.user, updateDto);
  }

  // 8. 회원 탈퇴 (o)
  // DELETE http://localhost:3000/user/myinfo
  @ApiOperation({ summary: '회원탈퇴' })
  @Delete('/myinfo')
  async deleteUser(@Req() req, @Body() deleteDto: DeleteUserReqDto) {
    await this.userService.deleteUser(req.user, deleteDto);
    return new DeleteUserResDto(req.user.email);
  }
}
