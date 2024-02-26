import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { ApiOperation } from '@nestjs/swagger';
import { ObjectId, Types } from 'mongoose';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  // 1. 이미지목록 전체조회 (o)
  // GET http://localhost:3000/image?page=1&limit=20
  @ApiOperation({ summary: '이미지목록 전체조회' })
  @Get()
  async getImages(
    @Query('page') page: number,
    @Query('limit') limit: number = 20,
  ) {
    return await this.imageService.getImages(page, limit);
  }

  // 2. 이미지 단일조회 + 해당 이미지에 해당하는 주식정보 조회
  // GET http://localhost:3000/image/file_id 65d3054ef84bd4045826a09f
  // file_id는 예를들어 65d3054ef84bd4045826a09f
  // GET http://localhost:3000/image/65d3054ef84bd4045826a09f?page=1&limit=20
  @ApiOperation({ summary: '이미지 단일조회' })
  @Get('/:file_id')
  async getImage(
    @Param('file_id') file_id: ObjectId,
    @Query('page') page: number,
    @Query('limit') limit: number = 20,
  ) {
    const fileId = file_id.toString();
    console.log('fileId', fileId);
    return await this.imageService.getImage(fileId, page, limit);
  }
}
