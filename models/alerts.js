var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var AlertSchema = new mongoose.Schema({
	subject: String,
	body: String,
	expires: Date,
	maryland: Boolean,
	virginia: Boolean,
	pennsylvania: Boolean
});


module.exports = mongoose.model("Alert", AlertSchema);