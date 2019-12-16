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

//=========================
//    Routes
//=========================

router.get("/update", function(req, res) {
	res.render("update/update", {currentUser: req.user});
});

router.post("/update", isLoggedIn, function(req, res) {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.newusername;
	var maryland = req.body.maryland;
	var virginia = req.body.virginia;
	var pennsylvania = req.body.pennsylvania;
	var url = "mongodb://localhost:27017/ecws_alert_app";
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
	  	var myquery = {username: username };
	  	db.collection('users').update ({username: req.body.username}, {$set: {
			name: name,
			username: username,
			email: email,
			maryland: maryland,
			virginia: virginia,
			pennsylvania: pennsylvania
		 }
		 }, function (err, result) {
			  if (err) {
			  console.log(err);
			} else {
			 console.log("Profile Updated!");
			 res.redirect("/profile");
		 }
		});
	});
});

//shows form to update user role
router.get("/admin/update", isAdmin, function(req, res) {
	res.render("update_user_role");
});

//updates user role in database
router.post("/admin/update", isAdmin, function(req, res) {
	var username = req.body.username;
	var role = req.body.role;
	var url = "mongodb://localhost:27017/ecws_alert_app";
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
	  	var myquery = {username: username };
	  	var newvalues = {$set: {role: role}};
	  	db.collection('users').update ({username: username}, {$set: {
			role: role
		 }
		 }, function (err, result) {
			  if (err) {
			  console.log(err);
			} else {
			 console.log("User role Updated!");
			 res.redirect("/profile");
		 }
		});
	});
});

module.exports = router;