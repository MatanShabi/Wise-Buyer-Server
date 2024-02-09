import mongoose, { ObjectId } from "mongoose";

export interface IPost {
  title: string;
  catalog: string;
  description: string;
  link?: string;
  pictureUrl?: string;
  price: number;
  user?: ObjectId;
  commentsAmount: number;
}

const postSchema = new mongoose.Schema<IPost>({
  title: {
    type: String,
    required: true,
  },
  catalog: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  pictureUrl: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  commentsAmount:{
    type: Number,
    default: 0,
  }

}, { timestamps: true });

export default mongoose.model<IPost>("Post", postSchema);
