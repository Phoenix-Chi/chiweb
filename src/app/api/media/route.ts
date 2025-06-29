import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    const data = await request.formData();
    const file = data.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '没有上传文件' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, filename);
    const publicUrl = `/uploads/${filename}`;

    await fs.promises.writeFile(filePath, buffer);

    let result: any = {
      url: publicUrl,
      type: file.type.split('/')[0],
      size: file.size
    };

    // 处理图片
    if (file.type.startsWith('image/')) {
      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      // 生成缩略图
      const thumbnailName = `thumb_${filename}`;
      const thumbnailPath = path.join(uploadDir, thumbnailName);
      await image.resize(300).toFile(thumbnailPath);
      
      result = {
        ...result,
        width: metadata.width,
        height: metadata.height,
        thumbnail: `/uploads/${thumbnailName}`
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('文件处理失败:', error);
    return NextResponse.json(
      { error: '文件处理失败' },
      { status: 500 }
    );
  }
}
