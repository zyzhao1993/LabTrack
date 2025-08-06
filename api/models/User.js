const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {Schema, model} = mongoose;

const UserSchema = new Schema({
    username: {type: String, required: true, min:4, unique: true},
    password: {type: String, required: true},
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const UserModel = model('User', UserSchema);

module.exports = UserModel;