import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import User, {IUser} from "../models/user";
import Post, {IPost} from "../models/post";
import Like, { ILike, LikeMode } from '../models/like';

let app: Express;
let accessToken: string;
let like: ILike
let unlike: ILike
let user_id = "";
let post_id = "";

const user: IUser = {
  email: "test@like.test",
  password: "1234567890",
  firstName: "Geri",
  lastName: "Guerrero"
};

const post: IPost = {
  title: "post of like test",
  catalog: "like test",
  description: "like test",
  price: 256
};

beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await User.deleteMany({ 'email': user.email });
  await Post.deleteMany({ 'title': post.title });
  await Like.deleteMany({ });
  const response = await request(app)
    .post("/auth/register")
    .send(user);
  
  const response2 = await request(app)
    .post("/auth/login")
    .send(user);
  accessToken = response2.body.accessToken;

  const response3 = await request(app)
      .post("/post")
      .set("Authorization", "JWT " + accessToken)
      .send(post);
  post_id = response3.body._id;
  user_id = response.body._id;

  like = {
    userId: new mongoose.Types.ObjectId(user_id),
    postId: new mongoose.Types.ObjectId(post_id),
    mode: LikeMode.Like
  } 
  
  unlike = {
    userId: new mongoose.Types.ObjectId(user_id),
    postId: new mongoose.Types.ObjectId(post_id),
    mode: LikeMode.UnLike
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User tests", () => {
  console.log("user_id:" + user_id);
  console.log("post_id:" + post_id);

  test("Test like to post", async () => { 
    const response = await request(app)
      .post("/like")
      .set("Authorization", "JWT " + accessToken)
      .send(like);
    expect(response.statusCode).toBe(201);
    expect(response.body.mode).toBe(LikeMode.Like);
  });

  test("Test like again to delete like", async () => { 
    const response = await request(app)
      .post("/like")
      .set("Authorization", "JWT " + accessToken)
      .send(like);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Item deleted successfully');
  });
  
  test("Test to dislike post", async () => {
    const response = await request(app)
      .post("/like")
      .set("Authorization", "JWT " + accessToken)
      .send(unlike);
    expect(response.statusCode).toBe(201);
    expect(response.body.mode).toBe(LikeMode.UnLike);
  });

  test("Test like after dislike to see change", async () => {
    const response = await request(app)
      .post("/like")
      .set("Authorization", "JWT " + accessToken)
      .send(like);
    console.log("response.body:" + JSON.stringify(response.body));
    expect(response.statusCode).toBe(201);
    expect(response.body.mode).toBe(LikeMode.Like);
  });

  test("Test invalid input - missing mode", async () => {
    const invalidLike = {
      userId: new mongoose.Types.ObjectId(user_id),
      postId: new mongoose.Types.ObjectId(post_id)
    };
    const response = await request(app)
      .post("/like")
      .set("Authorization", "JWT " + accessToken)
      .send(invalidLike);
  
    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("incorrect like mode");
  });

  test("Test invalid input - incorrect mode", async () => {
    const invalidLike = {
      userId: new mongoose.Types.ObjectId(user_id),
      postId: new mongoose.Types.ObjectId(post_id),
      mode: 5
    };
    const response = await request(app)
      .post("/like")
      .set("Authorization", "JWT " + accessToken)
      .send(invalidLike);
    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("incorrect like mode");
  });

  test("Test missing postId in request body", async () => {
    const invalidLike = {
      userId: new mongoose.Types.ObjectId(user_id),
      // postId is missing
      mode: LikeMode.Like
    };
    const response = await request(app)
      .post("/like")
      .set("Authorization", "JWT " + accessToken)
      .send(invalidLike);
  
    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("postId is required");
  });

  test("Test post not found", async () => {
    const nonExistentPostId = new mongoose.Types.ObjectId("111111111111111111111111");
    const newlike: ILike = {
      userId: new mongoose.Types.ObjectId(user_id),
      postId: nonExistentPostId,
      mode: LikeMode.Like
    };
    const response = await request(app)
      .post("/like")
      .set("Authorization", "JWT " + accessToken)
      .send(newlike);
    expect(response.statusCode).toBe(404);
    expect(response.text).toContain("post not found");
  });  
});
