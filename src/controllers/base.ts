import { Request, Response } from "express";
import { Model } from "mongoose";
import { AuthResquest } from "../common/auth_middleware";

export class BaseController<ModelType>{

    model: Model<ModelType>
    constructor(model: Model<ModelType>) {
        this.model = model;
    }

    async get(req: Request, res: Response) {

        try {
            if (req.query._id) {
                const users = await this.model.find({ _id: req.query._id });
                res.send(users);
            } else {
                const users = await this.model.find();
                res.send(users);
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getById(req: Request, res: Response) {
        console.log("getUserById:" + req.params.id);
        try {
            const user = await this.model.findById(req.params.id);
            res.send(user);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async post(req: Request, res: Response) {
        console.log("post:" + req.body);
        try {
            const obj = await this.model.create(req.body);
            res.status(201).send(obj);
        } catch (err) {
            console.log(err);
            res.status(406).send("fail: " + err.message);
        }
    }

    async putById(req: AuthResquest, res: Response) {
        const userId = req.user._id;
        try {
            const updatedUser = await this.model.findByIdAndUpdate(
                userId,
                req.body,
                { new: true } // This option returns the updated document
            );
            if (!updatedUser) {
                res.status(404).json({ message: 'No item found with this ID' });
            } else {
                res.status(200).json(updatedUser);
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async deleteById(req: AuthResquest, res: Response) {
        const userId = req.user._id
        let result = null;
        try {
            if (req.params.idToDelete){
               result = await this.model.deleteOne({ _id: req.params.idToDelete });     
            }
            else{
               result = await this.model.deleteOne({ _id: userId });
            }
            if (!result || result.deletedCount === 0) {
                res.status(404).json({ message: 'No item found with this ID' });
            } else {
                res.status(200).json({ message: 'Item deleted successfully' });
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}

const createController = <ModelType>(model: Model<ModelType>) => {
    return new BaseController<ModelType>(model);
}

export default createController;