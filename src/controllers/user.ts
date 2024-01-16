import UserModel, { IUser } from "../models/user";
import createController from "./base";

const userController = createController<IUser>(UserModel);

export default userController
