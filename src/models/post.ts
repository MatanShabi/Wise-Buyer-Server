import mongoose, {ObjectId} from "mongoose";

export interface IPost {
  title: string;
  catalog: string;
  description: string;
  link?: string;
  price: number;
  owner?: ObjectId;
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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: false,
  }
});

export default mongoose.model<IPost>("Post", postSchema);
