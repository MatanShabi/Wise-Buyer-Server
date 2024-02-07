import { Request, Response } from 'express';
import PostModel, { IPost } from '../models/post';

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await PostModel.find().populate({
      path: 'user',
      select: '_id firstName lastName pictureUrl'
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getPostsByUserId = async (req: Request, res: Response) => {
  try {
    const url = req.url;
    const startIndex = url.lastIndexOf('/') + 1;
    const userid = url.substring(startIndex);

    const posts = await PostModel.find({ user: userid }).populate({
      path: 'user',
      select: '_id firstName lastName pictureUrl'
    });
    if (!posts) {
      return res.status(404).json({ message: 'Posts not found' });
    }
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
    const populatedPost = await PostModel.findById(createdPost._id).populate({
      path: 'user',
      select: '_id firstName lastName pictureUrl'
    });

    res.status(201).json(populatedPost);
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
