// import { Query } from '@nestjs/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Stock, StockDocument } from './entities/stock.entity';
import { Model } from 'mongoose';
import { StockDateDto, StockReqDto } from './dto/req.dto';
import { parse } from 'json2csv';
// import { ImageService } from 'src/image/image.service';

// import { ParsedUrlQuery } from 'node:querystring';
// import * as mongoose from 'mongoose';
// import axios from 'axios';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    // private readonly imageService: ImageService,
  ) {}

  // 1. 주식목록 전체 조회
  async getStockData(page: number, limit: number = 50) {
    page = Number(page) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const stocks = await this.stockModel
      .find(
        {},
        {
          timestamp: 1,
          data: 1,
          createdAt: 1,
        },
      )
      .sort({ Date: -1 })
      .skip(startIndex)
      .limit(limit)
      .exec();
    if (!stocks || stocks.length <= 0) {
      throw new NotFoundException('데이터가 존재하지 않습니다.');
    }
    const totalPages = Math.ceil(stocks.length / limit);
    const paginationTotalStocks = stocks.slice(startIndex, endIndex);

    return { totalPages, paginationTotalStocks };
  }

  // 2. 주식목록 단일조회 및 이미지조회
  async getStockImage(timestamp: string, page: number, limit: number = 20) {
    page = Number(page) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const date = timestamp; // 사용자가 입력한 날짜
    const stocks = await this.stockModel.find().exec();

    const targetStocks = stocks.filter((stock) => {
      const stockDate = stock.timestamp.toISOString().split('T')[0];
      return stockDate === date;
    });

    if (!targetStocks) {
      throw new NotFoundException(
        '해당 날짜의 주식 데이터를 찾을 수 없습니다.',
      );
    } else {
      // console.log('targetStocks', targetStocks);
      const totalPages = Math.ceil(targetStocks.length / limit);
      const paginationTotalStocks = targetStocks.slice(startIndex, endIndex);

      return { totalPages, paginationTotalStocks };
    }

    // const image = await this.imageService.findImageByTimestamp(timestamp);
    // return { targetStock, image };
  }

  // 3. 날짜지정 파일 다운로드
  async downloadFile(startdate: string, enddate: string): Promise<string> {
    const start = new Date(startdate);
    const end = new Date(enddate);
    const stocks = await this.stockModel.find().exec();

    const file = stocks[0].data
      .split('\n') // 각 행을 분할
      .slice(1) // 헤더를 제외
      .filter((row) => {
        const rowData = row.split(','); // 각 열을 분할
        const date = new Date(rowData[0]); // "Date" 열의 값
        return date >= start && date <= end; // 시작일과 종료일 사이에 있는 데이터 필터링
      })
      .join('\n'); // 필터링된 데이터를 다시 합치기

    return file;
  }

  // 성공
  // async getStocksAsCsv(): Promise<string> {
  //   const stocks = await this.stockModel.find().exec();
  //   const csv = parse(stocks);
  //   return csv;
  // }

  // // 2. 날짜지정 주식 조회
  // async getStockByDate(
  //   page: number,
  //   limit: number = 50,
  //   stockDto: StockReqDto,
  // ): Promise<Stock[]> {
  //   const { startDate, endDate } = stockDto;
  //   page = Number(page) || 1;
  //   const skip = (page - 1) * limit;

  //   const query = {
  //     Date: {
  //       $gte: startDate,
  //       $lte: endDate,
  //     },
  //   };

  //   const stocks = await this.stockModel
  //     .find(query, {
  //       Date: 1,
  //       Open: 1,
  //       High: 1,
  //       Low: 1,
  //       Close: 1,
  //       Volume: 1,
  //       createdAt: 0,
  //     })
  //     .sort({ Date: -1 })
  //     .skip(skip)
  //     .limit(limit)
  //     .exec();

  //   if (!stocks || stocks.length <= 0) {
  //     throw new NotFoundException('해당 날짜의 데이터가 존재하지 않습니다.');
  //   }

  //   return stocks;
  // }

  // // 3. 특정날짜 주식 조회
  // async getStockByOneDate(stockDto: StockDateDto) {
  //   const { specificDate } = stockDto;

  //   // 데이터를 가져옴
  //   const stocks = await this.stockModel.find({}, { data: 1 });

  //   // 특정 날짜에 해당하는 주식 데이터를 찾음
  //   let targetStockData: string | undefined;
  //   for (const stock of stocks) {
  //     if (stock.data.includes(specificDate.toISOString())) {
  //       targetStockData = stock.data;
  //       break;
  //     }
  //   }
  //   if (!targetStockData) {
  //     throw new NotFoundException(
  //       '해당 날짜의 주식 데이터를 찾을 수 없습니다.',
  //     );
  //   }

  //   // 데이터를 파싱하여 주식 객체로 변환
  //   const stockLines = targetStockData.split('\n');
  //   const targetStockLine = stockLines.find((line) =>
  //     line.includes(specificDate.toISOString()),
  //   );
  //   if (!targetStockLine) {
  //     throw new NotFoundException(
  //       '해당 날짜의 주식 데이터를 찾을 수 없습니다.',
  //     );
  //   }
  //   const stockFields = targetStockLine.split(',');
  //   const stock: Stock = {
  //     Date: new Date(stockFields[0]),
  //     Open: parseFloat(stockFields[1]),
  //     High: parseFloat(stockFields[2]),
  //     Low: parseFloat(stockFields[3]),
  //     Close: parseFloat(stockFields[4]),
  //     AdjClose: parseFloat(stockFields[5]),
  //     Volume: parseInt(stockFields[6]),
  //     createdAt: new Date(),
  //   };

  //   return stock;
  // }
}
