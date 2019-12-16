var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose"),
	bcrypt 				  = require("bcrypt-nodejs");

var UserSchema = new mongoose.Schema({
	name: String,
	username: String,
	email: {type: String, unique: true, required: true},
	password: String,
	role: String,
	maryland: {type: Boolean, default: false},
	virginia: {type: Boolean, default: false},
	pennsylvania: {type: Boolean, default: false},
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);