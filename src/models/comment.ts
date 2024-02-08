import mongoose, { Document, Schema, ObjectId } from "mongoose";

export interface IComment extends Document {
  description: string;
  user: ObjectId;
  post: ObjectId;
}

const commentSchema: Schema = new Schema({
  description: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
});

export default mongoose.model<IComment>("Comment", commentSchema);
