import env from "dotenv";
env.config();
import express, { Express } from "express";
import cors from 'cors'
import mongoose from "mongoose";
import bodyParser from "body-parser";
import userRoute from "./routes/user";
import postRoute from "./routes/post";
import authRoute from "./routes/auth";

const initApp = (): Promise<Express> => {
  const promise = new Promise<Express>((resolve) => {
    const db = mongoose.connection;
    db.once("open", () => console.log("Connected to Database"));
    db.on("error", (error) => console.error(error));
    const url = process.env.DB_URL;
    mongoose.connect(url!).then(() => {
      const app = express();
      //TODO: when app is ready to production allow just the relevant domains.
      app.use(cors());
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use("/user", userRoute);
      app.use("/post", postRoute);
      app.use("/auth", authRoute);
      resolve(app);
    });
  });
  return promise;
};

export default initApp;
