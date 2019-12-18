var nodemailer = require("nodemailer"),
	Alert = require("../models/alerts"),
	express = require("express"),
	mongo = require("mongodb"),
	router  = express.Router();

//=========================
//     Functions
//=========================

var toEmails = [];

function stateValue(state) {
	if(state == undefined) {
		state = false;
	}
	else {
		state = true;
	}
	return state;
}

function sendTo(maryland,virginia,pennsylvania, body) {
	var mongo = require("mongodb");
	var url = "mongodb+srv://ecwsadmin:ecwsalertsadmin@ecwsalertapp-j9rsf.mongodb.net/test?retryWrites=true&w=majority";
	mongo.connect(url, function(error, db) {
		console.log("Successful Connection!")
		var query = [];
		if(error) {
			console.log(error)
		}
		if(maryland == true) {
			query.push({maryland: true});
		}
		if(virginia == true) {
			query.push({virginia: true});
		}
		if(pennsylvania == true) {
			query.push({pennsylvania: true});
		}
		
		var newQuery = "";
		
		if(query.length == 1) {
			newQuery = query[0]
		}
		else {
			newQuery = {$or: query}
		}
		var data = db.collection("users").find(newQuery);
		data.forEach(function(doc, error) {
			if(error) {
				console.log(error);
			}
			toEmails.push({name: doc.name ,email: doc.email});
		}, function(){
			emailAlert(body);
		});
		db.close();
	});
}

function emailAlert(body) {
	var nodemailer = require("nodemailer");
	
	var transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "ecwsalerts@gmail.com",
			pass: "ECWSWeather2019!"
  	}
	});	
	

	for(var m = 0; m < toEmails.length; m++) {
		var currentTime = new Date().getHours()-5;
		console.log(currentTime)
		var header = ""
		if(currentTime < 12) {
			header = "Good Morning " + toEmails[m].name + ",";
		}
		else if(12 <= currentTime < 5) {
			header = "Good Afternoon " + toEmails[m].name + ","; 
		}
		else if(5 <= currentTime <= 23) {
			header = "Good Evening" + toEmails[m].name  + ",";
		}
		var mailOptions = {
		  from: "ECWS Alert Center <ecwsalerts@gmail.com>",
		  to: toEmails[m].email,
		  subject: "Urgent Weather Message from ECWS Alert Center",
		  text: header + "\n" + body
		};
		
		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
			console.log(error);
		  } else {
			console.log('Email sent: ' + info.response);
		  }
		});
	}
}

//=========================
//     Routes
//=========================

router.get("/", function(req, res) {
	var url = "mongodb+srv://ecwsadmin:ecwsalertsadmin@ecwsalertapp-j9rsf.mongodb.net/test?retryWrites=true&w=majority";
	var current = new Date();
	
	mongo.connect(url, function(error, db) {
		var data = db.collection("alerts").find();
		data.forEach(function(item, error) {
			if(current > item.expires) {
				var removeQuery = {}
				removeQuery["_id"] = item._id;
				db.collection("alerts").remove(removeQuery);
			}
			}, function() {
			});
	});
	
	res.render("alerts/alerts_main");
});

router.get("/new", isAdmin, function(req, res) {
	res.render("alerts/new");
});

router.get("/:state", function(req, res) {
	var state = req.params.state;
	var url = "mongodb+srv://ecwsadmin:ecwsalertsadmin@ecwsalertapp-j9rsf.mongodb.net/test?retryWrites=true&w=majority";
	var current = new Date();

	mongo.connect(url, function(error, db) {
		if(error) {
			console.log(error)
		}
		var query = {}
		query[state]= true;
		var data = db.collection("alerts").find(query);
		var dataArray = [];
		data.forEach(function(doc, error) {
			dataArray.push(doc);
		}, function() {
			db.close();
			res.render("alerts/" + req.params.state + "_alerts", {alerts: dataArray, currentTime: current});
		});
	});
});

router.post("/", isAdmin, function(req, res) {
	var maryland = stateValue(req.body.maryland);
	var virginia = stateValue(req.body.virginia);
	var pennsylvania = stateValue(req.body.pennsylvania);
	var expires = new Date(req.body.expires);
	var body = req.body.body
	
	
	var newAlert = {subject: req.body.subject, body: req.body.body, expires: expires, maryland: maryland, virginia: virginia, pennsylvania: pennsylvania};
	Alert.create(newAlert, function(error, newlyCreated){
		if(error){
			console.log(error);
		}
		else {
			var emails = sendTo(maryland, virginia, pennsylvania, body);
			res.redirect("/alerts")
		}
	});
});



//checks to see if a user is logged in
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

module.exports = router