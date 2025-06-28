import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import nodeRouter from './routes/node';

// 环境变量配置
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 节点相关 API 路由
app.use('/api/nodes', nodeRouter);

// 连接 MongoDB
mongoose.connect(process.env.MONGODB_URI || '', {
  dbName: 'chiweb',
})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
