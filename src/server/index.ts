import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import nodeRouter from './routes/node.ts';

// 环境变量配置
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 节点相关 API 路由
app.use('/api/nodes', nodeRouter);

// 连接 MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
  console.error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://');
  process.exit(1);
}

console.log('Connecting to MongoDB at:', mongoURI);

mongoose.connect(mongoURI, {
  dbName: 'chiweb',
})
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('\nMongoDB connection failed:');
    console.error('- Error:', err.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Ensure MongoDB service is running locally');
    console.error('   - On Windows: run "net start MongoDB" (if installed as service)');
    console.error('   - On macOS/Linux: run "brew services start mongodb-community" or equivalent');
    console.error('2. Or use a remote MongoDB Atlas connection string in .env file');
    console.error('   - Format: MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/chiweb');
    console.error('3. Check if port 27017 is available or change MongoDB port');
    process.exit(1);
  });
