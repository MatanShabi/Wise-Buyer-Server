import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import User from "../models/user";

let app: Express;
const userRegister = {
  email: "testUserAuth@test.com",
  password: "1234567890",
  firstName: "Geri",
  lastName: "Guerrero"
}

const userLogin = {
  email: "testUserAuth@test.com",
  password: "1234567890",
  firstName: "Geri",
  lastName: "Guerrero"
}

beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await User.deleteMany({ 'email': userRegister.email });
});

afterAll(async () => {
  await mongoose.connection.close();
});

let accessToken: string;
let refreshToken: string;
let newRefreshToken: string

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

  test('Test login with incorrect password', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: userLogin.email, password: 'wrongPassword' });

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe('email or password incorrect');
  });

  test('Test login with non-existing email', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'somePassword' });

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe('email or password incorrect');
  });

  test('Test login with empty parameters in body request', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: '', password: ''});
    expect(response.statusCode).toBe(400);
  });
  
  test('Test login with missing parameter', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: userLogin.email});
    expect(response.statusCode).toBe(400);
  });

  test('Test register with missing parameter', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: userRegister.email, password: userRegister.password,
              firstName: userRegister.firstName});
    expect(response.statusCode).toBe(400);
  });


  test("Test forbidden access without token", async () => {
    const response = await request(app).get("/user");
    expect(response.statusCode).toBe(401);
  });

  test("Test access with valid token", async () => {
    const response = await request(app)
      .get("/user")
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
  });

  test("Test access with invalid token", async () => {
    const response = await request(app)
      .get("/user")
      .set("Authorization", "JWT 1" + accessToken);
    expect(response.statusCode).toBe(401);
  });

  jest.setTimeout(10000);

  test("Test access after timeout of token", async () => {
    await new Promise(resolve => setTimeout(() => resolve("done"), 5000));
    const response = await request(app)
      .get("/user")
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).not.toBe(200);
  });

  test("Test refresh token", async () => {
    const response = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "JWT " + refreshToken)
      .send();
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    const newAccessToken = response.body.accessToken;
    newRefreshToken = response.body.refreshToken;

    const response2 = await request(app)
      .get("/user")
      .set("Authorization", "JWT " + newAccessToken);
    expect(response2.statusCode).toBe(200);
  });

  test("Test double use of refresh token", async () => {
    const response = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "JWT " + refreshToken)
      .send();
    expect(response.statusCode).not.toBe(200);

    //verify that the new token is not valid as well
    const response1 = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "JWT " + newRefreshToken)
      .send();
    expect(response1.statusCode).not.toBe(200);
  });
});
