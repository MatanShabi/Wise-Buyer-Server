import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import User, { IUser } from "../models/user";
import  generateTokens from "../controllers/auth";

let app: Express;
const userRegister = {
  email: "testUserAuth@test.com",
  password: "1234567890",
  firstName: "Geri",
  lastName: "Guerrero"
};

const userLogin = {
  email: "testUserAuth@test.com",
  password: "1234567890"
};

beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await User.deleteMany({ email: userRegister.email });
});

afterAll(async () => {
  await mongoose.connection.close();
});

let userId: string;
let user: IUser;
let accessToken: string;
let refreshToken: string;
let newRefreshToken: string;

describe("Auth tests", () => {

  test("Test Register", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(userRegister);
    expect(response.statusCode).toBe(201);
  });

  test("Test Register exist email", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(userRegister);
    expect(response.statusCode).toBe(406);
  });

  test("Test Register missing parameters in body request ", async () => {
    const response = await request(app)
      .post("/auth/register").send({
        email: "test@test.com",
        password: "1234567890",
      });
    expect(response.statusCode).toBe(400);
  });

  test("Test Login", async () => {
    const response = await request(app)
      .post("/auth/login").send(userLogin);
    expect(response.statusCode).toBe(200);
    user = response.body;
    userId = response.body._id;
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
    console.log("accessToken: " + accessToken);
    console.log("refreshToken: " + refreshToken);
    expect(accessToken).toBeDefined();
  });

  test('Test login with correct email and password', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send(userLogin);

    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  // Add more test cases for login scenarios

  test("Test forbidden access without token", async () => {
    const response = await request(app).get(`/user/${userId}`);
    expect(response.statusCode).toBe(401);
  });

  test("Test access with valid token", async () => {
    const response = await request(app)
      .get(`/user/${userId}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(response.statusCode).toBe(200);
  });

  // Add more test cases for access with token scenarios

  // Define the sleep function
  const sleep = async (ms: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  test("Test access after timeout of token", async () => {
    const response = await request(app)
      .post('/auth/login')
      .send(userLogin);
    const accessToken = response.body.accessToken;
    console.log("accessToken: " + accessToken);
    await sleep(4000); 
    const response2 = await request(app)
      .get(`/user/${userId}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(response2.statusCode).not.toBe(200);
  });

  test("Test refresh token", async () => {
    const response = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "Bearer " + refreshToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    const newAccessToken = response.body.accessToken;
    newRefreshToken = response.body.refreshToken;

    const response2 = await request(app)
      .get(`/user/${userId}`)
      .set("Authorization", "Bearer " + newAccessToken);
    expect(response2.statusCode).toBe(200);
  });

  // Add more test cases for refresh token scenarios

  test("Test double use of refresh token", async () => {
    const response = await request(app)
      .get(`/user/${userId}`)
      .set("Authorization", "Bearer " + refreshToken);
    expect(response.statusCode).not.toBe(200);

    const response1 = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "Bearer " + newRefreshToken);
    expect(response1.statusCode).not.toBe(200);
  });

  test("Test logout", async () => {
    const response = await request(app)
      .post("/auth/login").send(userLogin);
    expect(response.statusCode).toBe(200);
    user = response.body;
    userId = response.body._id;
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
    console.log("accessToken: " + accessToken);
    console.log("refreshToken: " + refreshToken);

    const response2 = await request(app)
      .get(`/auth/logout`)
      .set("Authorization", "Bearer " + accessToken);
    expect(response2.statusCode).toBe(200);
  });
});
