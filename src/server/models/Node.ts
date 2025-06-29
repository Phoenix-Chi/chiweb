import mongoose, { Schema, Document } from 'mongoose';

export interface INode extends Document {
  title: string;
  content: string;
  date: Date;
  tag: string;
  mediaUrl?: string;
  extra?: Record<string, unknown>;
}

const NodeSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  tag: { type: String },
  mediaUrl: { type: String },
  extra: { type: Schema.Types.Mixed },
});

export default mongoose.model<INode>('Node', NodeSchema);
