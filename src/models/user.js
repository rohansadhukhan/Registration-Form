const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 1
    },
    lastName: {
        type: String,
        required: true,
        minlength: 1
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email address');
            }
        }
    },
    gender: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 10
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

userSchema.pre("save", async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
        //this.confirmPassword = undefined; it will ignore this field and it will not store in db
    }
    next();
})

const User = new mongoose.model('User', userSchema);
module.exports = User;