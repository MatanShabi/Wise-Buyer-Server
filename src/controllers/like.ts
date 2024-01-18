import LikeModel, { ILike, LikeMode } from "../models/like";
import Post from '../models/post';
import mongoose from "mongoose";
import { Response } from "express";
import { BaseController } from "./base";
import { AuthResquest } from "../common/auth_middleware";

// const likeController = createController<ILike>(LikeModel);

// export default likeController;

class LikeController extends BaseController<ILike>{
    constructor() {
        super(LikeModel)
    }

    async post(req: AuthResquest, res: Response) {
        const user_id = req.user._id;
        if (!req.body.postId){
            res.status(400).send("postId is required");
            return
        }
        const postId =  new mongoose.Types.ObjectId(req.body.postId)
        const postFromDB = await Post.findOne({ _id: postId});

        console.log("postFromDB:" + JSON.stringify(postFromDB));
        if (postFromDB == null){
            res.status(404).send("post not found");
            return
        }
        if (!Object.values(LikeMode).includes(req.body.mode)) {
            res.status(400).send("incorrect like mode");
            return
        }

        //check if like already exists
        const likeFromDB = await LikeModel.findOne({ userId: user_id, postId: postId });
        console.log("likeFromDB:" + JSON.stringify(likeFromDB));
        
        // delete like that already exists
        if (likeFromDB) {
            req.params.idToDelete = likeFromDB._id.toString()
            console.log("DELETE LIKE");
            if (likeFromDB.mode == req.body.mode) {
                await super.deleteById(req,res)
                return
            }
            await this.model.deleteOne({ _id: req.params.idToDelete });     
        }        
        req.body.userId = new mongoose.Types.ObjectId(user_id);
        req.body.postId = postId    
        super.post(req, res);
    }
}

export default new LikeController();
