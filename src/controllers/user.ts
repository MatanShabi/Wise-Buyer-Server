import UserModel, { IUser } from "../models/user";
import createController from "./base";

const studentController = createController<IUser>(UserModel);

export default studentController
