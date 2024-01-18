import PostModel, { IPost } from "../models/post";
import { BaseController } from "./base";
import { Response } from "express";
import { AuthResquest } from "../common/auth_middleware";

class PostController extends BaseController<IPost>{
    constructor() {
        super(PostModel)
    }

    async post(req: AuthResquest, res: Response) {
        console.log("post:" + req.body);
        const _id = req.user._id;
        req.body.owner = _id;
        super.post(req, res);
    }
}

export default new PostController();
