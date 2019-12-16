var nodemailer = require("nodemailer"),
	passport = require("passport"),
	User	= require("../models/users"),
	express = require("express"),
	router  = express.Router();

//=========================
//    Function
//=========================

function stateValue(state) {
	if(state == undefined) {
		state = false;
	}
	else {
		state = true;
	}
	return state;
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
};


function sendConfirmationEmail(email, username, role) {
	var transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "ecwsalerts@gmail.com",
			pass: "ECWSWeather2019!"
  	}
	});	
	var mailOptions = {
	  from: "ECWS Alert Center <ecwsalerts@gmail.com>",
	  to: email,
	  subject: "Account Confirmation",
	  text: "Welcome to ECWS Alert Center! Thank you for registering. You will now start recieving e-mail alerts for the states you selected during registration. You can update your e-mail alert settings in your profile, by clicking on your name at the top of the website when signed in. Your account information is below \n \nUsername: " + username +"\nRole: " + role + " \n \nFrom,\nECWS Technical Support"
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
		console.log(error);
	  } else {
		console.log('Email sent: ' + info.response);
	  }
	});
}

//=========================
//      Routes
//=========================

//shows registration form
router.get("/admin/register", isAdmin, function(req, res) {
	res.render("authentication/register_admin");
});

//handles user registration
router.post("/admin/register", isAdmin, function(req, res) {
	var maryland = stateValue(req.body.maryland);
	var virginia = stateValue(req.body.virginia);
	var pennsylvania = stateValue(req.body.pennsylvania);
	var newUser = new User({name: req.body.name ,username: req.body.username,email: req.body.email, maryland: maryland, virginia: virginia, pennsylvania: pennsylvania, role: req.body.role});
	User.register(newUser, req.body.password, function(error, user) {
		if(error) {
			return console.log(error);
		}
		else {
			sendConfirmationEmail(req.body.email, req.body.username, req.body.role);
			res.redirect("/")
		}
	})
});

module.exports = router