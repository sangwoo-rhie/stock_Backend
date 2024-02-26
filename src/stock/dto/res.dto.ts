import { ApiProperty } from '@nestjs/swagger';
import { StockDocument } from '../entities/stock.entity';

export class StockResDto {
  @ApiProperty({ description: '날짜' })
  readonly date: Date;

  @ApiProperty({ description: '시작가' })
  readonly open: number;

  @ApiProperty({ description: '최고가' })
  readonly high: number;

  @ApiProperty({ description: '최저가' })
  readonly low: number;

  @ApiProperty({ description: '마감가' })
  readonly close: number;

  @ApiProperty({ description: '거래량' })
  readonly volume: number;

  constructor(data: {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }) {
    this.date = data.date;
    this.open = data.open;
    this.high = data.high;
    this.low = data.low;
    this.close = data.close;
    this.volume = data.volume;
  }

  static toDto(stock: StockDocument) {
    const { date, open, high, low, close, volume } = stock.toObject({
      getters: true,
    });
    return new StockResDto({ date, open, high, low, close, volume });
  }
}
