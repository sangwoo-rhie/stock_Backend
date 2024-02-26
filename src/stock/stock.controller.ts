import {
  Get,
  Controller,
  Query,
  ValidationPipe,
  Body,
  Res,
  StreamableFile,
  Header,
  HttpCode,
  HttpStatus,
  UploadedFiles,
  UseInterceptors,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { ApiTags } from '@nestjs/swagger';
import { StockDateDto, StockReqDto } from './dto/req.dto';
import { createReadStream } from 'fs';
import { extname, join } from 'path';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { uploadFiles } from 'src/common/decorators';
// import { Stock, StockDocument } from './entities/stock.entity';
// import { PageReqDto } from 'src/common/dto/req.dto';
// import { User, UserAfterAuth } from 'src/common/decorator/user.decorator';
// import { StockResDto } from './dto/res.dto';
// import { StockReqDto } from './dto/req.dto';
// import { ParsedUrlQuery } from 'node:querystring';

@ApiTags('Stock')
@Controller('yahoo-finance')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  // 1. 주식목록 전체 조회 (O)
  // GET http://localhost:3000/yahoo-finance?page=1&limit=10
  @ApiOperation({ summary: '주식목록 전체조회' })
  @Get()
  async getStockData(
    @Query('page') page: number,
    @Query('limit') limit: number = 50,
  ) {
    return await this.stockService.getStockData(page, limit);
  }

  // 2. 주식목록 단일조회 및 이미지 조회 (O)
  // GET http://localhost:3000/yahoo-finance/image?timestamp=2024-02-14
  // @ApiOperation({ summary: '주식목록 단일조회 및 이미지조회' })
  // @Get('/image')
  // async getStockImage(@Query('timestamp') timestamp: string) {
  //   return await this.stockService.getStockImage(timestamp);
  // }

  // 3. 날짜지정 파일 다운로드 (파일 1개) (O)
  // GET http://localhost:3000/yahoo-finance/download?startdate=2024-01-23&enddate=2024-01-26
  @ApiOperation({ summary: '파일 다운로드' })
  @Get('/download')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="stocks.csv"')
  async downloadFile(
    @Query('startdate') startdate: string,
    @Query('enddate') enddate: string,
    @Res() res: any,
  ) {
    const file = await this.stockService.downloadFile(startdate, enddate);
    res.send(file);
  }

  // 성공
  // @Get('/download-csv')
  // @Header('Content-Type', 'text/csv')
  // @Header('Content-Disposition', 'attachment; filename="stocks.csv"')
  // async downloadCsv(@Res() res: any) {
  //   const csv = await this.stockService.getStocksAsCsv();
  //   res.send(csv);
  // }

  // 3. 업로드 (파일 1개) (O)
  // GET http://localhost:3000/yahoo-finance/upload
  // @ApiOperation({ summary: '파일 업로드' })
  // @HttpCode(HttpStatus.CREATED)
  // @ApiConsumes('multipart/form-data')
  // @uploadFiles('filename')
  // @UseInterceptors(FileInterceptor('filename'))
  // @Post('/upload')
  // uploadFiles(@UploadedFile() files) {
  //   console.log(files);
  // }

  // 2. 날짜지정 주식 조회
  // GET http://localhost:3000/yahoo-finance/date
  // @ApiOperation({ summary: '날짜지정 주식 조회' })
  // @Get('/date')
  // async getStockByDate(
  //   @Query('page') page: number,
  //   @Query('limit') limit: number = 50,
  //   @Body(new ValidationPipe()) stockDto: StockReqDto,
  // ) {
  //   return await this.stockService.getStockByDate(page, limit, stockDto);
  // }

  // 3. 특정날짜 주식 조회
  // GET http://localhost:3000/yahoo-finance/onedate
  // @ApiOperation({ summary: '특정날짜 주식 조회' })
  // @Get('/onedate')
  // async getStockByOneDate(@Body(new ValidationPipe()) stockDto: StockDateDto) {
  //   return await this.stockService.getStockByOneDate(stockDto);
  // }
}
