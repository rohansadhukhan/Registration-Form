require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('hbs');
require('./db/conn');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const User = require('./models/users');
const auth = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

console.log(process.env.SECRET_KEY);

const staticPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../template/views");
const partialsPath = path.join(__dirname, "../template/partials");

app.use(express.static(staticPath));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", viewsPath);

hbs.registerPartials(partialsPath)

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/secret", auth, (req, res) => {
    // console.log(`this is cookie ${req.cookies.jwt}`);
    res.render("secret");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((cur) => {
            return cur.token !== req.token;
        });

        // req.user.tokens = [];  // for sign out from all devices

        res.clearCookie("jwt");
        console.log("logout successful");
        await req.user.save();
        res.render("login");
    } catch (err) {
        res.status(500).send(err);        
    }
});

app.post("/register", async (req, res) => {
    try {
        if (req.body.password === req.body.confirmPassword) {
            const user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                age: req.body.age,
                gender: req.body.gender,
                phone: req.body.phone,
                password: req.body.password
            });


            const token = await user.generateAuthToken();
            console.log(token);

            res.cookie("jwt", token, { expires: new Date(Date.now() + 3600000), httpOnly: true });

            const u = await user.save();
            console.log(u);
            res.render('index');
        } else {
            console.log('wrong');
            res.send("wrong password");
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

app.post("/login", async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const data = await User.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, data.password);
        // console.log(isMatch);

        const token = await data.generateAuthToken();
        console.log(token);

        
        res.cookie("jwt", token, { expires: new Date(Date.now() + 3600000), httpOnly: true });

        if (isMatch) {
            res.status(201).render('index');
        } else {
            res.send('Invalid credentials');
        }

    } catch (err) {
        res.status(400).send('Invalid credentials');
    }
});

app.listen(port, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.error(`listening on port number ${port}`);
    }
});
