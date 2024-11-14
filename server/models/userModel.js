import mongoose from "mongoose";

const userSchema =  mongoose.Schema({
    fullname : {
        type: String,
        required: true,
    },
    username : {
        type: String,
        required: true,
        unique: true,
    },
    password : {
        type: String,
        required: true,
        minlength: 6
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    followers : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            default: []
        }
    ],
    following : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            default: []
        }
    ],
    profilePic : {
      type: String,
      default: ""  
    },
    coverImg : {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    links: {
        type: [String],
        default: ""
    }
}, {timestamps: true})

userSchema.index({ email: 1, username: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

export default User