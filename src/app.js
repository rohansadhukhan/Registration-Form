const express = require('express');
const path = require('path');
const hbs = require('hbs');
require('./db/conn');
const bcrypt = require('bcryptjs');

const User = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

const staticPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../template/views");
const partialsPath = path.join(__dirname, "../template/partials");

app.use(express.static(staticPath));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.set("view engine", "hbs");
app.set("views", viewsPath);

hbs.registerPartials(partialsPath)

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/register", async (req, res) => {
    try {
        if(req.body.password === req.body.confirmPassword) {
            const user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                age: req.body.age,
                gender: req.body.gender,
                phone: req.body.phone,
                password: req.body.password
            });
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

        const data = await User.findOne({ email: email});

        const isMatch = await bcrypt.compare(password, data.password);
        // console.log(isMatch);

        if(isMatch) {
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
