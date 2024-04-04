const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./model/User");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer')

const Connect = process.env.CONNECTION;
mongoose.connect(Connect)
    .then(() => {
        console.log("Connection to db Succesfull");
    })
    .catch((err) => {
        console.log("Connection Failure");
    });

const Port = process.env.PORT;
const app = express();
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.urlencoded());
app.use("/", express.static(__dirname));

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL,
        pass:process.env.PASS,
    }
});

function mail1(Email,resetLink){
    const mail = {
        from:process.env.EMAIL,
        to:Email,
        subject:"Reset Password",
        html:`
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password:</p>
          <a href=${resetLink}>Reset Password</a>
          `
        
    }
    transporter.sendMail(mail);
}


app.get("/", (req, res) => {
    res.send("Welcome to LeetCode :>");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    const { username, password, cpassword, email } = req.body;
    const showPopup = true;
    try {
        if (!username || !password || !cpassword || !email) {
            const message = "All fields Are Required"; 
            return res.render("signup", { showPopup, message });
        }
        var existingUser = await User.findOne({ username });
        if (existingUser) {
            const message = "Username is already Taken"; // Example message
            return res.render("signup", { showPopup, message });
        }
        existingUser = await User.findOne({ email });
        if (existingUser) {
            const message = "Email is already in use"; // Example message
            return res.render("signup", { showPopup, message });
        }
        if (password != cpassword) {
            const message = "Password Doest Match "; // Example message
            return res.render("signup", { showPopup, message });
        }
        const hashedPass = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password,
            email,
        });
        user.password = hashedPass;
        await user.save();
        res.render("dashboard",{email});
    } catch (err) {
        console.log(err);
        res.send("There is Some error while sign up ");
    }
});

app.get("/signin", (req, res) => {
    res.render("signin");
});

app.post('/signin',async (req,res)=>{
    const {uore,password}= req.body;
    try{
        const showPopup = true;
        const message = "All Fields Are Required";
        if(!uore || !password)
        {
            return res.render("signin",{showPopup,message});
        }
        const user = await User.findOne({
            $or: [
                { username: uore },
                { email: uore }
            ]
        });
        if(!user)
        {
            const message = "Invalid username Or password";
            return res.render("signin",{showPopup,message});
        }
        const match = await bcrypt.compare(password,user.password);
        if(!match)
        {
            const message = "Invalid username Or password";
            return res.render("signin",{showPopup,message}); 
        }
        const email=user.email;
        res.render("dashboard",{email});
    }catch(err){
        console.log(err);
        res.send("There is Some error While trying to login please try again later");
    }
})


app.get("/reset", (req, res) => {
    res.render("forgotpass");
});


app.post('/reset',async (req,res)=>{
    const {email} = req.body;
    try{
        const showPopup = true;
        if(!email)
        {
            const message = "All Fields Are Required";
            return res.render("forgotpass",{showPopup,message});
        }
        const user =  await User.findOne({email});
        if(!user)
        {
            const message = "Please enter a valid email";
            return res.render("forgotpass",{showPopup,message});
        }
        const resetLink = `http://localhost:3000/newPass?email=${(email)}`;
        mail1(email, resetLink);

        const message = "Email has been sent to reset your pass";
        res.render("forgotpass",{showPopup,message});
    }catch(err){
        console.log(err);
        res.send("There is Some error");
    }
})

app.get('/newPass',(req,res)=>{
    const email = req.query.email;
    res.render("newPass",{email});
})
app.post('/newPass',async (req,res)=>{
    const {email,password,cpassword} = req.body;
    const user = await User.findOne({email});
    if(password!=cpassword)
    {
        const showPopup = true;
        const message = "Password Doest Match";
        return res.render('newPass',{showPopup,message});
    }
    const hash = await bcrypt.hash(password, 10);
    console.log(password);
    user.password=hash;
    await user.save();
    const showPopup = true;
    const message = "Password Reset Succesfull";
    res.render('signin',{showPopup,message});
})

// Function to generate a random OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}
const Otp = generateOTP();

// Function to send the verification email
function sendVerificationEmail(email, verificationLink) {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Verify Your Account",
        html: `
        click this link 
        <a href=${verificationLink}>Verify Account</a>
        `
        ,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
}

app.get("/verify",async (req,res)=>{
    const email=req.query.email;
    const user = await User.findOne({email});
    if(!user)
    {
        return res.render("dashboard");
    }
    if(user.verified)
    {
        const show = true;
        const message = "Email Already verifies";
        return res.render("dashboard",{show,message});
    }
    const verificationLink = `http://localhost:3000/verification?email=${(email)}&otp=${(Otp)}`;
    sendVerificationEmail(email,verificationLink);
    const show = true;
    const message = "Verification Link Send To Your email";
    res.render("dashboard",{show,message});
})

app.get("/verification",async (req,res)=>{
    const {email,otp} = req.query;
    const user = await User.findOne({email});
    if(!user)
    {
        return res.send("There is Some Error");
    }
    if(otp!=Otp)
    {
        return res.send("There is Some Error");
    }
    user.verified=true;
    await user.save();
    res.send("Account Verified SuccessFull");
})


app.listen(Port, () => {
    console.log(`http://localhost:${Port}`);
});