const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    verified:{
        type:Boolean,
        default:false
    }
})

const User = mongoose.model("User",userSchema);
module.exports = User;