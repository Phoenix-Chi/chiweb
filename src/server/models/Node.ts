import mongoose, { Schema, Document } from 'mongoose';

export interface INode extends Document {
  title: string;
  content: string;
  date: Date;
  type: 'text' | 'number' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
  extra?: Record<string, any>;
}

const NodeSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['text', 'number', 'image', 'audio', 'video'], required: true },
  mediaUrl: { type: String },
  extra: { type: Schema.Types.Mixed },
});

export default mongoose.model<INode>('Node', NodeSchema);
