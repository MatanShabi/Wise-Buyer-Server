import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import User, {IUser} from "../models/user";

let app: Express;
let accessToken: string;

const user: IUser = {
  email: "testUser@test.com",
  password: "1234567890",
  firstName: "Geri",
  lastName: "Guerrero"
};

beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await User.deleteMany();
  // User.deleteMany({ 'email': user.email });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User tests", () => {
  test("Test add first user", async () => {
    await request(app)
      .post("/auth/register")
      .send(user);
    const response = await request(app)
      .post("/auth/login")
      .send(user);
    accessToken = response.body.accessToken;
    expect(response.statusCode).toBe(200);
  });

  test("Test Get All users with one user in DB", async () => {
    const response = await request(app)
      .get("/user")
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    const us = response.body[0];
    expect(us.firstName).toBe(user.firstName);
    expect(us.lastName).toBe(user.lastName);
  });

  test("Test PUT /user/:id", async () => {
    const updatedUser = { ...user, firstName: "Popi" };
    console.log("updatedUser: " + updatedUser);
    const response = await request(app)
      .put(`/user/${user._id}`)
      .set("Authorization", "JWT " + accessToken)
      .send(updatedUser);
    console.log(response.body)
    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe(updatedUser.firstName);
  });

  test("Test DELETE /user/:id", async () => {
    const response = await request(app)
      .delete(`/user/${user._id}`)
      .set("Authorization", "JWT " + accessToken)
    expect(response.statusCode).toBe(200);
  });
});
