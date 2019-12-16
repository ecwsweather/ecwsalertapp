var nodemailer = require("nodemailer"),
	passport = require("passport"),
	User	= require("../models/users"),
	express = require("express"),
	router  = express.Router();

//=========================
//    Functions
//=========================

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	else {
		
	}
	res.redirect("/login");
}

//checks if user is an admin
function isAdmin(req, res, next) {
	if(req.user) {
		if(req.user.role == "Admin") {
			return next();
		}
		else if(req.user.role == "User") {
			return res.send("You must be an Admin!")
		}
	}
	res.redirect("/login")
}

//determines which profile to go to
function checkRole(req, res, next) {
	if(req.user) {
		if(req.user.role == "Admin") {
			return res.redirect("/admin");
		}
		else if(req.user.role == "User") {
			return next();
		}
	}
	res.redirect("/login")
}

//=========================
//    Routes
//=========================

//admin profile
router.get("/admin", isAdmin, function(req, res) {
	res.render("profiles/admin")
});

//user profile
router.get("/profile", checkRole, function(req, res) {
	res.render("profiles/profile");
});

module.exports = router