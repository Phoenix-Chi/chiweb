import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB限制
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

// 媒体上传端点
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有上传文件' });
  }

  const file = req.file;
  const filePath = path.join(uploadDir, file.filename);
  const publicUrl = `/uploads/${file.filename}`;
  let result: any = {
    url: publicUrl,
    type: file.mimetype.split('/')[0],
    size: file.size
  };

  try {
    // 处理图片
    if (file.mimetype.startsWith('image/')) {
      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      // 生成缩略图
      const thumbnailName = `thumb_${file.filename}`;
      const thumbnailPath = path.join(uploadDir, thumbnailName);
      await image.resize(300).toFile(thumbnailPath);
      
      result = {
        ...result,
        width: metadata.width,
        height: metadata.height,
        thumbnail: `/uploads/${thumbnailName}`
      };
    }

    // 处理视频/音频
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      // TODO: 添加视频/音频处理逻辑 (提取时长、生成缩略图等)
      // 可以使用FFmpeg等工具
    }

    res.json(result);
  } catch (error) {
    console.error('文件处理失败:', error);
    fs.unlinkSync(filePath); // 删除上传的文件
    res.status(500).json({ error: '文件处理失败' });
  }
});

export default router;
