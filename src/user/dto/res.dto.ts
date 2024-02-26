import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UserDocument } from '../entities/user.entity';

// 1. 회원가입 응답 DTO
export class SignupResDto {
  @ApiProperty({ required: true })
  @IsString()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  password: string;

  @ApiProperty({ required: true })
  @IsString()
  nickname: string;

  @ApiProperty({ required: true })
  @IsString()
  organization: string;

  @ApiProperty({ required: true })
  @IsString()
  role: string;

  @ApiProperty({ required: true })
  @IsString()
  accessToken: string;

  @ApiProperty({ required: true })
  @IsString()
  refreshToken: string;
}

// 2. 회원정보 수정 응답 DTO
export class UpdateUserResDto {
  @ApiProperty({ required: true })
  @IsString()
  password: string;

  @ApiProperty({ required: true })
  @IsString()
  newPassword: string; // newPassword

  @ApiProperty({ required: true })
  @IsString()
  nickname: string;

  @ApiProperty({ required: true })
  @IsString()
  organization: string;

  @ApiProperty({ required: true })
  @IsString()
  updatedAt: string;

  static toDto({ password, nickname, organization, updatedAt }: UserDocument) {
    return {
      password,
      nickname,
      organization,
      updatedAt: updatedAt.toISOString(),
    };
  }
}

// 3. 다른 사용자 회원정보 조회 응답 DTO
export class FindUserResDto {
  @ApiProperty({ required: true })
  @IsString()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  nickname: string;

  @ApiProperty({ required: true })
  @IsString()
  organization: string;

  @ApiProperty({ required: true })
  @IsString()
  role: string;

  @ApiProperty({ required: true })
  @IsString()
  createdAt: string;

  static toDto({
    email,
    nickname,
    organization,
    role,
    createdAt,
  }: UserDocument) {
    return {
      email,
      nickname,
      organization,
      role,
      createdAt: createdAt.toISOString(),
    };
  }
}

// 4. 회원 탈퇴 응답 DTO
export class DeleteUserResDto {
  constructor(email: string) {
    this.email = email;
  }

  @ApiProperty({ required: true })
  email: string;
}
