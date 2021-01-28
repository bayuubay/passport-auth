const express=require('express');
const app = express();
const expresSession = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')
const connectEnsureLogin = require('connect-ensure-login');

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expresSession(({
    secret: 'bAyu999#696!',
    resave: false,
    saveUninitialized: false
})));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/authpassport',
  { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema
const UsersSchema = new Schema({
    username: String,
    password: String
});

UsersSchema.plugin(passportLocalMongoose)

const UsersModel = mongoose.model("users", UsersSchema);

passport.use(UsersModel.createStrategy());
passport.serializeUser(UsersModel.serializeUser());
passport.deserializeUser(UsersModel.deserializeUser());

// app.get('/login', (req, res) => res.send('you have to login first'));
app.post("/register", (req, res) => {
    UsersModel.register({username:req.body.username, active:true},req.body.password);
    res.send("success register user")
})
app.post('/login',(req,res,next)=>{
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.redirect('/404');
        }

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            return res.redirect('/users')
        })
    })(req, res, next);
 
})

app.get('/404',(req,res)=>{
	res.send("<h1>you're not authenticated!</h1>");
})

app.get('/users', connectEnsureLogin.ensureLoggedIn({ redirectTo: "/404" }),(req,res)=>{
	res.send("<h1>Welcome, You're authenticated<h1>");
})

const port=3000;
app.listen(port, () => console.log(`this app run at http://localhost:${port}`));