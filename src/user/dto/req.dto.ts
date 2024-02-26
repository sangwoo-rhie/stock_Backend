import { ApiProperty } from '@nestjs/swagger';
// import { Transform } from 'class-transformer';
import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
  // IsNumber,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../userinfo';
// import * as bcrypt from 'bcrypt';

// 1. 회원가입 요청 DTO
export class SignupReqDto {
  @ApiProperty({
    required: true,
    description: '이메일',
    example: 'nestjs@naver.com',
  })
  @IsEmail()
  @MaxLength(30)
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @Matches(
    /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
    {
      message: '이메일 형식이 올바르지 않습니다.',
    },
  )
  readonly email: string; // 이메일

  @ApiProperty({
    required: true,
    description: '비밀번호',
    example: 'Password123@',
  })
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해 주세요.' })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,20}$/, {
    message:
      '비밀번호는 최소 6자 이상의 영문 대소문자 및 숫자와 특수문자를 포함해야 합니다.',
  })
  readonly password: string; // 비밀번호

  @ApiProperty({
    required: true,
    description: '확인 비밀번호',
    example: 'Password123@',
  })
  @IsNotEmpty({ message: '비밀번호를 한번 더 입력해 주세요.' })
  @IsString()
  readonly confirmPassword: string; // 확인 비밀번호

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @IsNotEmpty({ message: '닉네임을 입력해 주세요.' })
  readonly nickname: string; // 닉네임

  @ApiProperty({ required: true, default: UserRole.GUEST })
  @IsEnum(UserRole)
  @IsNotEmpty({
    message:
      '관리자일 경우 `ADMIN`을, 관리자가 아닐 경우 `GUEST`를 입력해주세요.',
  })
  readonly role: UserRole; // 관리자 여부

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: '소속을 입력해 주세요.' })
  readonly organization: string; // 소속
}

// 2. 회원정보 수정 요청 DTO
export class UpdateUserReqDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: '기존 비밀번호를 입력해 주세요.' })
  readonly password: string; // 기존 비밀번호

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: '새로운 비밀번호를 입력해 주세요.' })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,20}$/, {
    message:
      '비밀번호는 최소 6자 이상의 영문 대소문자 및 숫자와 특수문자를 포함해야 합니다.',
  })
  readonly newPassword: string; // 새 비밀번호

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @IsNotEmpty({ message: '닉네임을 입력해 주세요.' })
  readonly nickname: string; // 닉네임

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: '소속을 입력해 주세요.' })
  readonly organization: string; // 소속
}

// 3. 다른 사용자 회원정보 조회 요청 DTO
export class FindUserReqDto {
  @ApiProperty({ required: true })
  email: string; // 이메일
}

// 4. 회원탈퇴 요청 DTO
export class DeleteUserReqDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: '비밀번호를 입력해 주세요.' })
  readonly password: string; // 비밀번호
}

// 5. 로그인 요청 DTO
export class SigninReqDto {
  @ApiProperty({
    required: true,
    description: '이메일',
    example: 'nestjs@naver.com',
  })
  @IsEmail()
  @MaxLength(30)
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  readonly email: string; // 이메일

  @ApiProperty({
    required: true,
    description: '비밀번호',
    example: 'Password123@',
  })
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해 주세요.' })
  readonly password: string; // 비밀번호
}
