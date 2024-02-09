import { Express } from "express";
import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import Post, { IPost } from "../models/post";
import User, { IUser } from "../models/user";
import post from "../models/post";

let app: Express;

const user: IUser = {
  email: "test@post.test",
  password: "1234567890",
  firstName: "Geri",
  lastName: "Guerrero"
}
let post1: IPost = {
  title: "post1 title",
  catalog: "garden",
  description: "very good garden tool",
  price: 100,
  commentsAmount: 0,
};

let accessToken = "";
let user_id = "";
let post_id = "";

beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await Post.deleteMany({ 'title': 'post1 title' });

  await User.deleteMany({ 'email': user.email });
  const response = await request(app)
    .post("/auth/register")
    .send(user);
  user_id = response.body._id;
  post1.user = response.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});
const addPost = async (post: IPost) => {
  const response = await request(app)
    .post("/auth/login")
    .send(user);
  accessToken = response.body.accessToken;

  const response2 = await request(app)
    .post("/post")
    .set("Authorization", "JWT " + accessToken)
    .send(post1);
  console.log("NEW POST: ", response2.body._id);
  expect(response2.statusCode).toBe(201);
  expect(response2.body.title).toBe(post.title);
  expect(response2.body.description).toBe(post.description);
  post_id = response2.body._id;
};

describe("post tests", () => {
  test("Test Post post", async () => {
    await addPost(post1);
  });

  test("Test Get All posts with one post in DB", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send(user);
    accessToken = response.body.accessToken;

    const response2 = await request(app)
      .get("/post")
      .set("Authorization", "JWT " + accessToken);
    expect(response2.statusCode).toBe(200);
    const rc = response2.body[0];
    console.log(rc);
    expect(rc.title).toBe(post1.title);
    expect(rc.description).toBe(post1.description);
  });
});

describe("getPostById tests", () => {
  test("Test Get post by existing ID", async () => {
    await addPost(post1);

    const response = await request(app)
      .post("/auth/login")
      .send(user);
    accessToken = response.body.accessToken;

    const response2 = await request(app)
      .get(`/post/${post_id}`)
      .set("Authorization", "JWT " + accessToken);

    expect(response2.statusCode).toBe(200);
    expect(response2.body.title).toBe(post1.title);
    expect(response2.body.description).toBe(post1.description);
  });

  test("Test Get post by invalid object id", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send(user);
    accessToken = response.body.accessToken;

    const nonExistingId = "nonexistingid";
    const response2 = await request(app)
      .get(`/post/${nonExistingId}`)
      .set("Authorization", "JWT " + accessToken);
    expect(response2.statusCode).toBe(500);
  });

  test("Test Get post by non-existing ID", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send(user);
    accessToken = response.body.accessToken;

    const nonExistingId = "65257f3409269afcaee74044";
    const response2 = await request(app)
      .get(`/post/${nonExistingId}`)
      .set("Authorization", "JWT " + accessToken);

    expect(response2.statusCode).toBe(404);
    expect(response2.body.message).toBe("Post not found");
  });
});


describe("getPostsByUserId tests", () => {
  test("Test Get posts by existing user ID", async () => {
    await addPost(post1);
    const response = await request(app)
      .post("/auth/login")
      .send(user);
    accessToken = response.body.accessToken;

    const response2 = await request(app)
      .get(`/post/user/${user_id}`)
      .set("Authorization", "JWT " + accessToken);

    expect(response2.statusCode).toBe(200);
    expect(Array.isArray(response2.body)).toBe(true);
    expect(response2.body.length).toBeGreaterThan(0);
    expect(response2.body[0].user._id).toBe(user_id);
  });

  test("Test Get posts by non-existing user ID", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send(user);
    accessToken = response.body.accessToken;

    const nonExistingUserId = "15157f3409269afcaee74044";
    const response2 = await request(app)
      .get(`/post/user/${nonExistingUserId}`)
      .set("Authorization", "JWT " + accessToken);
    expect(response2.statusCode).toBe(404);
    expect(response2.body.message).toBe("Posts not found");
  });

  test("Test Get posts with invalid user ID format", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send(user);
    accessToken = response.body.accessToken;

    const invalidUserId = "invaliduseridformat";
    const response2 = await request(app)
      .get(`/post/user/${invalidUserId}`)
      .set("Authorization", "JWT " + accessToken);

    expect(response2.statusCode).toBe(500);
  });

  describe("updatePost tests", () => {
    test("Test update an existing post", async () => {
      await addPost(post1);

      const response = await request(app)
        .post("/auth/login")
        .send(user);
      accessToken = response.body.accessToken;

      const updatedPost = {
        title: "Updated title",
        catalog: "Updated catalog",
        description: "Updated description",
        price: 200,
        commentsAmount: 5,
        user: response.body._id
      };

      const response2 = await request(app)
        .put(`/post/${post_id}`)
        .set("Authorization", "JWT " + accessToken)
        .send(updatedPost);

      expect(response2.statusCode).toBe(200);
      expect(response2.body.title).toBe(updatedPost.title);
      expect(response2.body.catalog).toBe(updatedPost.catalog);
      expect(response2.body.description).toBe(updatedPost.description);
      expect(response2.body.price).toBe(updatedPost.price);
      expect(response2.body.commentsAmount).toBe(updatedPost.commentsAmount);
    });

    test("Test update a non-existing post", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send(user);
      accessToken = response.body.accessToken;

      const updatedPost = {
        title: "Updated title",
        catalog: "Updated catalog",
        description: "Updated description",
        price: 200,
        commentsAmount: 5,
        user: response.body._id
      };

      const nonExistingPostId = "nonexistingpostid123";
      const response2 = await request(app)
        .put(`/post/${nonExistingPostId}`)
        .set("Authorization", "JWT " + accessToken)
        .send(updatedPost);

      expect(response2.statusCode).toBe(404);
      expect(response2.body.message).toBe("Post not found");
    });
  });
});


