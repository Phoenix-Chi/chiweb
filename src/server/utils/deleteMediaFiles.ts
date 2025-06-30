import fs from 'fs/promises';
import path from 'path';
import { IMedia } from '../models/Node';

/**
 * 删除节点关联的所有多媒体文件（图片、音频、视频等）
 * @param mediaList 节点的 media 字段
 */
export async function deleteMediaFiles(mediaList: IMedia[] = []) {
  for (const media of mediaList) {
    try {
      // 只处理 /uploads/ 路径下的文件
      if (!media.url || !media.url.startsWith('/uploads/')) continue;
      const filePath = path.join(process.cwd(), 'public', media.url);
      // 删除主文件
      await fs.unlink(filePath).catch(() => {});
      // 如果是图片且有缩略图，删除缩略图
      if (media.type === 'image' && media.thumbnail) {
        const thumbPath = path.join(process.cwd(), 'public', media.thumbnail);
        await fs.unlink(thumbPath).catch(() => {});
      }
    } catch (err) {
      console.error('删除多媒体文件失败:', media.url, err);
    }
  }
}
