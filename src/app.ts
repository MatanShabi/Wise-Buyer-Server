import env from "dotenv";
env.config();
import express, { Express } from "express";
import cors from 'cors'
import logger from 'pino-http'
import mongoose from "mongoose";
import bodyParser from "body-parser";
import userRoute from "./routes/user";
import postRoute from "./routes/post";
import authRoute from "./routes/auth";
import fileUpload from "./routes/file-upload";
import commentsRoute from "./routes/comments";

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
      app.use(logger())
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use("/user", userRoute);
      app.use("/post", postRoute);
      app.use("/auth", authRoute);
      app.use("/upload", fileUpload)
      app.use("/comments", commentsRoute);
      app.use('/public', express.static('public'));

      resolve(app);
    });
  });
  return promise;
};

export default initApp;
