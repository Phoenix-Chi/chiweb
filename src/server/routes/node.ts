import express from 'express';
import Node from '../models/Node';
import { deleteMediaFiles } from '../utils/deleteMediaFiles';

const router = express.Router();

// 获取所有节点
router.get('/', async (req, res) => {
  const { q } = req.query;
  let filter = {};
  if (q) {
    filter = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ],
    };
  }
  const nodes = await Node.find(filter).sort({ date: 1 });
  res.json(nodes);
});

// 新增节点
router.post('/', async (req, res) => {
  const node = new Node(req.body);
  await node.save();
  res.status(201).json(node);
});

// 更新节点
router.put('/:id', async (req, res) => {
  const node = await Node.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(node);
});

// 删除节点
router.delete('/:id', async (req, res) => {
  const node = await Node.findById(req.params.id);
  if (node && node.media) {
    await deleteMediaFiles(node.media);
  }
  await Node.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
