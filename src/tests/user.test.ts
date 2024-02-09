import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import User, {IUser} from "../models/user";

let app: Express;
let accessToken: string;

let user: IUser = {
  email: "testUser@test.com",
  password: "1234567890",
  firstName: "Geri",
  lastName: "Guerrero"
};

let user2: IUser = {
  email: "testUser2@test.com",
  password: "1234567890",
  firstName: "Geri",
  lastName: "Guerrero"
};


beforeAll(async () => {
  app = await initApp();
  await User.deleteOne({email: user.email });
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
    user = response.body
    accessToken = response.body.accessToken;
    expect(response.statusCode).toBe(200);
  });

  test("Test create user",async () => {
    const response = await request(app)
      .post(`/user`)
      .send(user2)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(201);
    
  })

  test("Test get user user", async () => {
    const response = await request(app)
      .get(`/user/${user._id}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toBe(200);
  });

  test("Test get non exist user", async () => {
    const response = await request(app)
      .get(`/user/nonexistentuserid`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toBe(500);
  });

  test("Test PUT /user/:id", async () => {
    const updatedUser = { ...user, firstName: "Popi" };
    console.log("updatedUser: " + updatedUser);
    const response = await request(app)
      .put(`/user/${user._id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(updatedUser);
    console.log(response.body)
    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe(updatedUser.firstName);
  });

  test("Test PUT non exist user", async () => {
    const response = await request(app)
      .put(`/user/nonexistentuserid`)
      .set("Authorization", `Bearer ${accessToken}`);
      
    expect(response.statusCode).toBe(500);
  });

  test("Test DELETE /user/:id", async () => {
    const response = await request(app)
      .delete(`/user/${user._id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      
    expect(response.statusCode).toBe(200);
  });

  test("Test DELETE non exist user", async () => {
    const response = await request(app)
      .delete(`/user/nonexistentuserid`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(500);
  });

});
