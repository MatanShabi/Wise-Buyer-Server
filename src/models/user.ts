import mongoose, {ObjectId} from "mongoose";

export interface IUser {
  email: string;
  _id?: string;
  password: string;
  firstName: string;
  lastName: string;
  refreshTokens?: string[];
  favorites?: ObjectId[];
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName:{
    type: String,
    required: true,
  },
  lastName:{
    type: String,
    required: true,
  },
  refreshTokens: {
    type: [String],
    required: false,
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
});

export default mongoose.model<IUser>("User", userSchema);
