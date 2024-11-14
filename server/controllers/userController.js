import bcrypt from 'bcryptjs'

import Notification from "../models/notificationModel.js"
import User from "../models/userModel.js"

import { logMessage } from "../utils/logMessage.js"

const getUserProfile = async (req, res) => {
    const { username } = req.params

    try{
        const user = await User.findOne({ username }).select('-password')

        if(!user) {
            return res.status(404).json({ error : "User not found" })
        }

        return res.status(200).json({ user })
    } catch (error) {
        logMessage('Error in getUserProfile', error)
        return res.status(500).json({ error : "Internal Server Error" })
    }
}

const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id

        const usersFollowed = await User.findById(userId).select('following')

        const users = await User.aggregate([
            { $match : { _id : { $ne : userId } } },
            { $sample : { size : 10 } }
        ])

        const filterededUsers = users.filter(user => !usersFollowed.following.includes(user._id))
        const suggestedUsers = filterededUsers.slice(0, 5)

        suggestedUsers.forEach(user => user.password = null)

        return res.status(200).json({ suggestedUsers })

    } catch (error) {
        logMessage('Error in getSuggestedUsers', error)
        return res.status(500).json({ error : "Internal Server Error" })
    }
}

const toggleFollowUser = async (req, res) => {
    try {
        const { id } = req.params
        const userId  = req.user._id.toString()

        console.log(id, userId);
        

        if( id === userId) {
            return res.status(400).json({ error : "You cannot follow/unfollow yourself" })
        }

        const userToModify = await User.findById(id)
        const currentUser = await User.findById(userId)

        if(!currentUser || !userToModify) {
            return res.status(404).json({ error : "User not found" })
        }

        const isFollowing = currentUser.following.includes(id)

        if(isFollowing) {
            currentUser.following = currentUser.following.filter(follower => follower.toString() !== id)
            userToModify.followers = userToModify.followers.filter(follower => follower.toString() !== userId)
            res.status(200).json({ message : "Unfollowed successfully" })
        } else {
            userToModify.followers.push(userId)
            currentUser.following.push(id)
            res.status(200).json({ message : "Followed successfully"})
        }
        const newNotification = new Notification({
            from : currentUser._id,
            to : userToModify._id,
            type : "follow"
        })
        
        await Promise.all([userToModify.save(), currentUser.save(), newNotification.save()])
    } catch (error) {
        logMessage('Error in toggleFollowUser', error)
        return res.status(500).json({ error : "Internal Server Error" })
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const { username } = req.body

        const user = await User.findOne({ username }).select('-password')

        if(!user) return res.status(404).json({ error : "User not found" })

        const { fullname, bio, profilePic, coverPic, links } = req.body

        user.fullname = fullname || user.fullname
        user.bio = bio || user.bio
        user.profilePic = profilePic || user.profilePic
        user.coverPic = coverPic || user.coverPic
        user.links = links || user.links

        await user.save()

        return res.status(200).json({ user })
    } catch (error) {
        logMessage('Error in updateUserProfile', error)
        return res.status(500).json({ error : "Internal Server Error" })
    }


}

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body
        const userId = req.user._id

        const user = await User.findOne({ _id : userId })

        if(!user) return res.status(400).json({ error : "User not found" })

        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password)

        if(!isPasswordCorrect) return res.status(400).json({ error : "Incorrect password" })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        user.password = hashedPassword
        await user.save()

        return res.status(200).json({ message : "Password changed successfully" })
    } catch (error) {
        logMessage('Error in changePassword', error)
        return res.status(500).json({ error : "Internal Server Error" })
    }
}

export { getUserProfile, getSuggestedUsers, toggleFollowUser, updateUserProfile, changePassword }