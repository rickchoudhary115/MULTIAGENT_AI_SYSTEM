import { getAuth } from "firebase-admin/auth";
import User from "../models/user.model.js";
import { app } from "../config/firebase.js";
import {createConnection} from "mongoose";
import crypto from "crypto";
import redis from "../../../shared/redis/redis.js";


export const login = async (req, res) => {
    try {
        const {token}=req.body;
       const decodedToken = await getAuth(app).verifyIdToken(token);
       let user = await User.findOne({
        firebaseId: decodedToken.uid
       })
       if(!user){
            user = await User.create({
            firebaseId: decodedToken.uid,
            name: decodedToken.name,
            email: decodedToken.email,
            avatar: decodedToken.picture
        })

        
       }
       const sessionId=crypto.randomUUID();
       await redis.set(`session:${sessionId}`, JSON.stringify({
        userId:user._id,
        name:user.name,
        email:user.email,
        avatar:user.avatar

       }), "EX", 7 * 24 * 60 * 60);

       
       res.cookie("session", sessionId, {
        httpOnly:true,
        secure:false,
        sameSite:"strict",
        maxAge:7*24*60*60*1000
       })
       return res.status(200).json({message:"login successful"});

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = async (req, res) => {
    try{
        const sessionId = req.cookies.session;
        if(sessionId){
            await redis.del(`session:${sessionId}`);
            res.clearCookie("session");
            return res.status(200).json({message:"logout successful"});
        }
    }catch(error){
        return res.status(500).json({ message: "Error during logout:", error });
    }
}