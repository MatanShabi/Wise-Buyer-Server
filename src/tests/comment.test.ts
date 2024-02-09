import { Express } from "express";
import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import Post, { IPost } from "../models/post";
import User, { IUser } from "../models/user";
import Comment, { IComment } from "../models/comment";

let app: Express;

const user: IUser = {
    email: "test@comment.test",
    password: "1234567890",
    firstName: "Geri",
    lastName: "Guerrero"
}
let post1: IPost = {
    title: "comments title",
    catalog: "garden",
    description: "very good garden tool",
    price: 100,
    commentsAmount: 0,
};

let accessToken = "";
let user_id;
let post_id;

beforeAll(async () => {
    app = await initApp();
    console.log("beforeAll");
    await Post.deleteMany({ 'title': 'comments title' });
    await User.deleteMany({ 'email': user.email });
    await Comment.deleteMany({ 'description': 'This is a comment' });

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

    const postResponse = await request(app)
        .post("/post")
        .set("Authorization", "JWT " + accessToken)
        .send(post1);
    console.log("NEW POST: ", postResponse.body._id);
    expect(postResponse.statusCode).toBe(201);
    expect(postResponse.body.title).toBe(post.title);
    expect(postResponse.body.description).toBe(post.description);
    post_id = postResponse.body._id;
};

const addComment = async () => {
    const response = await request(app)
        .post("/auth/login")
        .send(user);
    accessToken = response.body.accessToken;
    
    

    let comment: IComment = {
        description: "This is a comment",
        user: user_id,
        post: post_id
    }
    const response2 = await request(app)
        .post(`/comment/${post_id}`)
        .set("Authorization", "JWT " + accessToken)
        .send(comment);

    console.log("NEW COMMENT: ", response2.body._id);
    expect(response2.statusCode).toBe(200);
    expect(response2.body.description).toBe(comment.description);
    expect(response2.body.user).toBe(comment.user);
    expect(response2.body.post).toBe(comment.post); 
};

describe("Post and Comment API tests", () => {
    test("Should add a post and a comment to the post", async () => {
        await addPost(post1);
        await addComment();
    });

    test("Should get comments of a created post", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send(user);
        accessToken = response.body.accessToken;

        const response2 = await request(app)
            .get(`/comment/${post_id}`)
            .set("Authorization", "JWT " + accessToken);
        expect(response2.statusCode).toBe(200);

        expect(response2.body[0].user).toBe(user_id.toString());
    });

    // Additional test cases can be added here
});

