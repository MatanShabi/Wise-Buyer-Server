import { Request, Response } from "express";
import CommentModel, { IComment } from "../models/comment";
import PostModel from "../models/post";

export const getCommentsSpecificPost = async (req: Request, res: Response) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comments = await CommentModel.find({ post: post._id }).populate({
      path: "user",
      select: "_id firstName lastName pictureUrl",
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addCommentToPost = async (req: Request, res: Response) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
            return res.status(404).json({ message: "Post not found" });
    }

    const comment: IComment = req.body;

    const createdComment = await CommentModel.create(comment);
    res.json(createdComment);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
