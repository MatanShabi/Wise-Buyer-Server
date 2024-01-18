import mongoose, {ObjectId} from "mongoose";

export enum LikeMode {
  Like = 1,
  UnLike = -1,
}

export interface ILike {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  mode: LikeMode;
}

const likeSchema = new mongoose.Schema<ILike>({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', 
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
  },
  mode: {
    type: Number,
    enum: [LikeMode.Like, LikeMode.UnLike],
    required: true,
  },
  
});

export default mongoose.model<ILike>("Like", likeSchema);
