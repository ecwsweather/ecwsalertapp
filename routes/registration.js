var nodemailer = require("nodemailer"),
	passport = require("passport"),
	User	= require("../models/users"),
	express = require("express"),
	router  = express.Router();

//=========================
//     Functions
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
//     Routes
//=========================

router.get("/", function(req, res) {
	res.render("authentication/register");
});

router.post("/", function(req, res) {
	var name = req.body.name;
	var username = req.body.username;
	var maryland = stateValue(req.body.maryland);
	var virginia = stateValue(req.body.virginia);
	var pennsylvania = stateValue(req.body.pennsylvania);
	var email = req.body.email
	
	var newUser = new User({name: name ,username: username,email: email,role: "User", maryland: maryland, virginia: virginia, pennsylvania: pennsylvania});
	User.register(newUser, req.body.password, function(error, user) {
		if(error) {
			console.log(error);
			return res.render("register")
		}
		passport.authenticate("local")(req, res, function() {
			sendConfirmationEmail(req.body.email, req.body.username, "User");
			req.flash("success", "Registration Successful! Check e-mail for confirmation!")
			res.redirect("/profile");
		});
	});
});

module.exports = router