import { Request, Response } from 'express';
import PostModel, { IPost } from '../models/post';

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await PostModel.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const newPost: IPost = req.body;
    const createdPost = await PostModel.create(newPost);
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const updatedPost: IPost = req.body;
    const post = await PostModel.findByIdAndUpdate(req.params.id, updatedPost, { new: true });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const deletedPost = await PostModel.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(deletedPost);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
