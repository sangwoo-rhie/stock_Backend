import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image, ImageDocument } from './entities/image.entity';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { StockService } from 'src/stock/stock.service';

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Image.name) private readonly imageModel: Model<ImageDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly stockService: StockService,
  ) {}

  // 1. 이미지목록 전체조회
  async getImages(page: number, limit: number = 20) {
    page = Number(page) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const images = await this.imageModel
      .find(
        {},
        {
          file_id: 1,
          filename: 1,
          timestamp: 1,
          data: 1,
        },
      )
      .sort({ Date: -1 })
      .skip(startIndex)
      .limit(limit)
      .exec();
    if (!images || images.length <= 0) {
      throw new NotFoundException('데이터가 존재하지 않습니다.');
    }
    const totalPages = Math.ceil(images.length / limit);
    const paginationTotalImages = images.slice(startIndex, endIndex);
    return { totalPages, paginationTotalImages };
  }

  // 2. 이미지 단일조회 + 해당 이미지에 해당하는 주식정보 조회
  async getImage(
    fileId: string,
    page: number,
    limit: number = 20,
  ): Promise<{ imagefile: string; stockfile: any }> {
    if (!fileId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new NotFoundException(`유효하지 않은 파일 ID 형식입니다.`);
    }
    const bucket = new GridFSBucket(this.connection.db, {
      bucketName: 'fs',
    });

    const file_id = new ObjectId(fileId);
    const image = await this.imageModel.findOne({
      file_id: file_id,
    });
    if (!image) {
      throw new NotFoundException(`해당 이미지가 존재하지 않습니다.`);
    }
    const file = await this.connection.db.collection('fs.files').findOne({
      _id: file_id,
    });
    if (!file) {
      throw new NotFoundException(`해당 이미지 파일을 찾을 수 없습니다.`);
    }

    const chunks: Buffer[] = [];
    const stream = bucket.openDownloadStream(file._id);
    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    const imagefilePromise = new Promise<string>((resolve, reject) => {
      stream.on('error', () => {
        reject(
          new NotFoundException(
            '이미지 데이터를 불러오는 중 오류가 발생했습니다.',
          ),
        );
      });

      stream.on('end', () => {
        const imageBuffer = Buffer.concat(chunks);
        const base64String = imageBuffer.toString('base64');
        resolve(base64String);
      });
    });

    const Date = image.timestamp;
    const timeStamp = Date.toISOString().split('T')[0];

    const stockfile = await this.stockService.getStockImage(
      timeStamp,
      page,
      limit,
    );
    // console.log('stockfile', stockfile);

    const imagefile = await imagefilePromise;
    return { stockfile, imagefile };
  }

  // 3. 해당 주식과 동일한 timeStamp를 갖고있는 이미지 조회 (stockService와 연결)
  async findImageByTimestamp(timestamp: string): Promise<string> {
    // : Promise<Buffer>
    const bucket = new GridFSBucket(this.connection.db, {
      bucketName: 'fs',
    });

    const regex = new RegExp(`^${timestamp}`);
    const image = await this.imageModel.findOne({
      filename: { $regex: regex },
    });
    if (!image) {
      throw new NotFoundException(
        `해당 날짜(${timestamp})에 대한 이미지를 찾을 수 없습니다.`,
      );
    }
    const file = await this.connection.db.collection('fs.files').findOne({
      filename: { $regex: regex },
    });
    if (!file) {
      throw new NotFoundException(
        `해당 날짜(${timestamp})에 대한 이미지 파일을 찾을 수 없습니다.`,
      );
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = bucket.openDownloadStream(file._id);
      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      stream.on('error', () => {
        reject(
          new NotFoundException(
            '이미지 데이터를 불러오는 중 오류가 발생했습니다.',
          ),
        );
      });

      stream.on('end', () => {
        const imageBuffer = Buffer.concat(chunks);
        const base64String = imageBuffer.toString('base64');
        resolve(base64String);
      });
    });
  }
}
