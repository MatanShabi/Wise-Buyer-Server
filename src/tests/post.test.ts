import { Express } from "express";
import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import Post, { IPost } from "../models/post";
import User, { IUser } from "../models/user";

let app: Express;
let accessToken = "";
let user_id = "";

const user: IUser = {
  email: "test@post.test",
  password: "1234567890",
  firstName: "Geri",
  lastName: "Guerrero"
}
const post1: IPost = {
  title: "post1 title",
  catalog: "garden",
  description: "very good garden tool",
  price: 100,
  commentsAmount: 0,
};

beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await Post.deleteMany({'title': 'post1 title'});

  await User.deleteMany({ 'email': user.email });
  const response = await request(app)
    .post("/auth/register")
    .send(user);
  
  user_id = response.body._id;
  const response2 = await request(app)
    .post("/auth/login")
    .send(user);
  accessToken = response2.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("post tests", () => {
  const addPost = async (post: IPost) => {
    const response = await request(app)
      .post("/post")
      .set("Authorization", "JWT " + accessToken)
      .send(post1);
    expect(response.statusCode).toBe(201);
    expect(response.body.owner).toBe(user_id);
    expect(response.body.title).toBe(post.title);
    expect(response.body.description).toBe(post.description);
  };
  
  test("Test Get All posts - empty response", async () => {
    const response = await request(app).get("/post");
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual([]);
  });

  test("Test Post post", async () => {
    await addPost(post1);
  });

  test("Test Get All posts with one post in DB", async () => {
    const response = await request(app).get("/post");
    expect(response.statusCode).toBe(200);
    const rc = response.body[0];
    console.log(rc);
    expect(rc.title).toBe(post1.title);
    expect(rc.description).toBe(post1.description);
    expect(rc.owner).toBe(user_id);
  });

});
