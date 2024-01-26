import mongoose, { ObjectId } from "mongoose";

export interface IPost {
  title: string;
  catalog: string;
  description: string;
  link?: string;
  productUrl?: string;
  price: number;
  userId?: ObjectId;
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
  productUrl: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

export default mongoose.model<IPost>("Post", postSchema);
