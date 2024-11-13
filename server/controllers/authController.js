import bcrypt from 'bcryptjs'

import User from "../models/userModel.js";
import {logMessage} from "../utils/logMessage.js";
import generateAndSetToken from '../utils/generateAndSetToken.js';

const userSignUp = async (req, res) => {
    try {
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
        const usernameRegex = /^[a-zA-Z0-9_-]+$/
        const { fullname, username, email, password, confirmPassword } = req.body

        if(!fullname || !username || !email || !password || !confirmPassword) {
            return res.status(400).json({ message : "All fields are required" });
        }

        if(!usernameRegex.test(username)) {
            return res.status(400).json({ message : "Username cannot conntain the following characters: @?!/|\\[]{}*+=,.~%$'" });
        }

        if(password.length < 6) {
            return res.status(400).json({ message : "Password must be at least 6 characters" });
        }

        if(password !== confirmPassword) {
            return res.status(400).json({ message : "Passwords do not match" });
        }

        const existingUser = await User.findOne({ username })
        if(existingUser) {
            return res.status(400).json({ message : "User already exists" });
        }

        const existingEmail = await User.findOne({ email })
        if(existingEmail) {
            return res.status(400).json({ message : "Email already exists" });
        }

        if(!emailRegex.test(email)) {
            return res.status(400).json({ message : "Invalid email" });
        }

        const salt = await bcrypt.genSalt(15);

        const hashedPassword = await bcrypt.hash(password, salt);



        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPassword
        })
        if(newUser){
            generateAndSetToken(newUser._id, res)
            await newUser.save()
        }
        res.status(200).json({
            _id: newUser._id,
            fullname: newUser.fullname,
            username: newUser.username,
            email: newUser.email,
            followers: newUser.followers,
            following: newUser.following,
            bio: newUser.bio,
            profilePic: newUser.profilePic,
            coverPic: newUser.coverPic
        });
    } catch (error) {
        logMessage('error', error)
        return res.status(500).json({error : "Internal Server Error"})
    }
}

const userLogin = async (req, res) => {
    try{
        const { credentials, password } = req.body;

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials);

        const user = await User.findOne({
            [isEmail ? 'email' : 'username']: credentials,
        });

        if (!user) {
            return res.status(400).json({ message : "User does not exist" });
        }

        const hashedPassword = bcrypt.compare(password, user?.password || '');

        if (!hashedPassword){
            return res.status(400).json({ message : "Incorrect password" });
        }

        generateAndSetToken(user._id, res)
        return res.status(200).json({message: "Log In Successfull", user:{
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            bio: user.bio,
            profilePic: user.profilePic,
            coverPic: user.coverPic
        } })
    } catch (error) {
        logMessage('error', error)
        return res.status(500).json({error : "Internal Server Error"})
    }
}

const userLogOut = (req, res) => {
    try {
        res.cookie('jwt', '', {maxAge: 0})
        return res.status(200).json({ success: true })

    } catch (error) {
        console.error("Error while loging Out user", error.message);
        return res.status(500).json({ error:"Internal Server Error" })
    }
}

export { userSignUp, userLogin, userLogOut }