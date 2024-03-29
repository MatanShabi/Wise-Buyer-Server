import { Request, Response } from 'express';
import User, { IUser } from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { createDirectory, handleUserProfileImg} from '../common/rest_api_handler';


const client = new OAuth2Client();
const googleSignin = async (req: Request, res: Response) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: req.body.credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload?.email;
        const now = new Date();
        if (email != null) {
            let user = await User.findOne({ 'email': email });

            const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
            const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET, {expiresIn: process.env.JWT_REFRESH_EXPIRATION});

            if (user.refreshTokens == null) {
                user.refreshTokens = [refreshToken];
            } else {
                user.refreshTokens.push(refreshToken);
            }

            if (user == null) {
                user = await User.create(
                    {
                        'email': email,
                        'password': '0',
                        'firstName': payload.given_name,
                        'lastName': payload.family_name,
                        'pictureUrl': payload?.picture,
                    });
            }

            res.status(200).send({
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                pictureUrl: user.pictureUrl,
                refreshTokenInterval: 3000,
                loginTime: now.getTime(),
                accessToken,
                refreshToken
            }
            )
        }
    } catch (err) {
        return res.status(400).send(err.message);
    }

}

const register = async (req: Request, res: Response) => {
    try {
        const {firstName, lastName, email, password} = req.body;
        
        if (!email || !password || !firstName || !lastName) {
            throw Error("missing parameters in body request");
        }

        const rs = await User.findOne({ 'email': email });
        if (rs != null) {
            return res.status(406).send('email already exists');
        }
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        const rs2 = await User.create({ 'email': email, 'password': encryptedPassword,
                                        'firstName': firstName, 'lastName': lastName});

        const profileImgPath = `./public/profileImages/${rs2._id}`
        createDirectory(profileImgPath);
        await handleUserProfileImg(rs2._id, rs2.firstName, rs2.lastName, profileImgPath);

        const fullProfileImgPath = `${req.protocol}://${req.get('host')}/public/profileImages/${rs2._id}/profile.png`;
        await User.findByIdAndUpdate(rs2._id, { $set: { 'pictureUrl': fullProfileImgPath } }, { new: true });

        return res.status(201).send(rs2);
    } catch (err) {
        return res.status(400).send("error missing email or password");
    }
}

const login = async (req: Request, res: Response) => {
    try {
    const {email, password} = req.body;
    
    if (!email || !password) {
        throw Error("missing email or password");
    }
    
        const user = await User.findOne({ 'email': email });
        if (user == null) {
            return res.status(401).send("email or password incorrect");
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send("email or password incorrect");
        }
        const now = new Date();
        const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
        const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET, {expiresIn: process.env.JWT_REFRESH_EXPIRATION});
        if (user.refreshTokens == null) {
            user.refreshTokens = [refreshToken];
        } else {
            user.refreshTokens.push(refreshToken);
        }
        await user.save();
        return res.status(200).send({
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            refreshTokenInterval: +process.env.JWT_REFRESH_INTERVAL,
            loginTime: now.getTime(),
            accessToken,
            refreshToken,
            pictureUrl: user.pictureUrl
        });
    } catch (err) {
        return res.status(400).send("error missing email or password");
    }
}

const logout = async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1];
    if (refreshToken == null) return res.sendStatus(401);

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, user: { '_id': string }) => {
        try {
            
            if (err) {
                throw Error('Failed to logging out')
            }

            const userDb = await User.findOne({ '_id': user._id });
            if (!userDb.refreshTokens) {
                userDb.refreshTokens = [];
                await userDb.save();
                return res.sendStatus(401);
            } else {
                userDb.refreshTokens = userDb.refreshTokens.filter(t => t !== refreshToken);
                await userDb.save();
                return res.sendStatus(200);
            }
        } catch (err) {
            return res.status(401).send(err.message);
        }
    });
}

const refresh = async (req: Request, res: Response) => {
    const authHeader =req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1];
    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, user: { '_id': string }) => {
        try {

            if (err) {
                throw Error("Failed to refresh token")
            }

            const userDb = await User.findOne({ '_id': user._id });
            if (!userDb.refreshTokens || !userDb.refreshTokens.includes(refreshToken)) {
                userDb.refreshTokens = [];
                await userDb.save();
                return res.sendStatus(401);
            }
            const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
            const newRefreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET,  { expiresIn: process.env.JWT_REFRESH_EXPIRATION });
            userDb.refreshTokens = userDb.refreshTokens.filter(t => t !== refreshToken);
            userDb.refreshTokens.push(refreshToken);
            await userDb.save();

            const now = new Date();
            return res.status(200).send({
                _id: user._id,
                email: userDb.email,
                firstName: userDb.firstName,
                lastName: userDb.lastName,
                refreshTokenInterval: +process.env.JWT_REFRESH_INTERVAL,
                loginTime: now.getTime(),
                accessToken,
                refreshToken: newRefreshToken,
                pictureUrl: userDb.pictureUrl
            });
        } catch (err) {
            return res.status(401).send(err.message);
        }
    });
}

export default {
    register,
    login,
    logout,
    refresh,
    googleSignin
}