import mongoose, { Schema, Document } from 'mongoose';

interface IMedia {
  url: string;
  type: 'image' | 'video' | 'audio';
  thumbnail?: string;
  duration?: number;
  size: number;
  width?: number;
  height?: number;
}

export interface INode extends Document {
  title: string;
  content: string;
  date: Date;
  tag: string;
  media?: IMedia[];
  extra?: Record<string, unknown>;
}

const NodeSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  tag: { type: String },
  media: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'audio'], required: true },
    thumbnail: { type: String },
    duration: { type: Number },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number }
  }],
  extra: { type: Schema.Types.Mixed },
});

export default mongoose.model<INode>('Node', NodeSchema);
