import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

// 1. 날짜별 조회 요청 DTO
export class StockReqDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({
    message: '조회하고자 하는 주식 기간의 시작날짜를 입력해주세요.',
  })
  startDate: Date; // "2024-01-01"

  @ApiProperty({ required: true })
  @IsNotEmpty({
    message: '조회하고자 하는 주식 기간의 마지막날짜를 입력해주세요.',
  })
  endDate: Date; // "2024-01-23"

  @IsEmpty({ message: 'You cannot pass user id' })
  readonly user: User;
}

// 2. 특정 날짜 주식 조회 DTO
export class StockDateDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({
    message: '조회하고자 하는 주식 기간의 시작날짜를 입력해주세요.',
  })
  searchDate: Date; // "2024-01-23"
}
