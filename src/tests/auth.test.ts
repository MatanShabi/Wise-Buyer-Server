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

describe("Authorization tests", () => {

  test("Test Register", async () => {
    const registerResponse = await request(app)
      .post("/auth/register")
      .send(userRegister);
    expect(registerResponse.statusCode).toBe(201);
  });

  test("Test Register exist email", async () => {
    const registerResponse = await request(app)
      .post("/auth/register")
      .send(userRegister);
    expect(registerResponse.statusCode).toBe(406);
  });

  test("Test Register missing parameters in body request ", async () => {
    const registerResponse = await request(app)
      .post("/auth/register").send({
        email: "test@test.com",
        password: "1234567890",
      });
    expect(registerResponse.statusCode).toBe(400);
  });

  test("Test Login", async () => {
    const loginResponse = await request(app)
      .post("/auth/login").send(userLogin);
    expect(loginResponse.statusCode).toBe(200);
    user = loginResponse.body;
    userId = loginResponse.body._id;
    accessToken = loginResponse.body.accessToken;
    refreshToken = loginResponse.body.refreshToken;
    
    expect(accessToken).toBeDefined();
  });

  test('Test login with correct email and password', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send(userLogin);

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.accessToken).toBeDefined();
    expect(loginResponse.body.refreshToken).toBeDefined();
  });

  test('Test login without email and password', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send();

    expect(loginResponse.statusCode).toBe(400);
  });

  test('Test login without email that not exists', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({email:"aaaaaaaa", password: "aaaaaa"});

    expect(loginResponse.statusCode).toBe(401);
  });

  test("Test forbidden access without token", async () => {
    const userResponse = await request(app).get(`/user/${userId}`);
    expect(userResponse.statusCode).toBe(401);
  });

  test("Test access with valid token", async () => {
    const response = await request(app)
      .get(`/user/${userId}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(response.statusCode).toBe(200);
  });


  test("Test access after timeout of token", async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send(userLogin);
    const accessToken = loginResponse.body.accessToken;
  
    await sleep(4000); 

    const userResponse = await request(app)
      .get(`/user/${userId}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(userResponse.statusCode).not.toBe(200);
  });

  test("Test refresh token", async () => {
    const refreshTokenResponse = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "Bearer " + refreshToken);

    expect(refreshTokenResponse.statusCode).toBe(200);
    expect(refreshTokenResponse.body.accessToken).toBeDefined();
    expect(refreshTokenResponse.body.refreshToken).toBeDefined();

    const newAccessToken = refreshTokenResponse.body.accessToken;
    newRefreshToken = refreshTokenResponse.body.refreshToken;

    const userResponse = await request(app)
      .get(`/user/${userId}`)
      .set("Authorization", "Bearer " + newAccessToken);
    expect(userResponse.statusCode).toBe(200);
  });


  test("Test refresh token without token", async () => {
    const refreshTokenResponse = await request(app)
      .get("/auth/refresh")

    expect(refreshTokenResponse.statusCode).toBe(401);
  });

  test("Test refresh token invalid token", async () => {
    const refreshTokenResponse = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "Bearer sakldjaklsjdklsajdljsalkd");

    expect(refreshTokenResponse.statusCode).toBe(401);
  });

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
    const userLoginResponse = await request(app)
      .post("/auth/login").send(userLogin);
    expect(userLoginResponse.statusCode).toBe(200);
    user = userLoginResponse.body;
    userId = userLoginResponse.body._id;
    accessToken = userLoginResponse.body.accessToken;
    refreshToken = userLoginResponse.body.refreshToken;

    const userLoggedOutResponse = await request(app)
      .get(`/auth/logout`)
      .set("Authorization", "Bearer " + accessToken);
    expect(userLoggedOutResponse.statusCode).toBe(200);
  });

  test("Test logout without token", async () => {
    const userLoggedOutResponse = await request(app)
      .get(`/auth/logout`)
      
    expect(userLoggedOutResponse.statusCode).toBe(401);
  });

  test("Test logout invalid token", async () => {
    const userLoggedOutResponse = await request(app)
      .get(`/auth/logout`)
      .set("Authorization", "Bearer dkjsahdjksadkshakdhskjahdkjsahdkhsakdhjksa" );
      
    expect(userLoggedOutResponse.statusCode).toBe(401);
  });

});

// Define the sleep function
const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};