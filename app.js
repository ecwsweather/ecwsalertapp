var LocalStrategy = require("passport-local"),
	cookieParser  = require("cookie-parser"),
	bodyParser 	  = require("body-parser"),
	passport 	  = require("passport"),
	mongoose 	  = require("mongoose"),
	express 	  = require("express"),
	session		  = require("express-session"),
	Alert  		  = require("./models/alerts"),
	flash		  = require("connect-flash"),
	User		  = require("./models/users"),
	MongoClient   = require("mongodb"),
	app 		  = express();

var registrationRoutes = require("./routes/registration"),
	alertRoutes 	   = require("./routes/alerts"),
	loginRoutes 	   = require("./routes/login"),
	updateRoutes 	   = require("./routes/update"),
	profileRoutes 	   = require("./routes/profile"),
	adminRoutes 	   = require("./routes/admin");

//=========================
//     App Config
//=========================

mongoose.connect("mongodb://localhost:27017/ecws_alert_app", {useUnifiedTopology: true, useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");
mongoose.set('useCreateIndex', true);

app.use(cookieParser('secret'));

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	next();
});

//=========================
//    Passport Config
//=========================

var sessionStore = new session.MemoryStore;

app.use(session({
	cookie: { maxAge: 60000 },
	store: sessionStore,
	secret: "This is for the ECWS Alert Center",
	resave: false,
	saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	next();
})
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});

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

//=========================
//     Routes
//=========================

app.get("/", function(req, res) {
	res.render("home");
});


//use alert routes
app.use("/alerts", alertRoutes);

//use registration routes
app.use("/register", registrationRoutes);

//use login routes
app.use(loginRoutes);

//use update profile routes
app.use(updateRoutes);

//use profile routes
app.use(profileRoutes);

//use admin registration routes
app.use(adminRoutes);

app.listen(3000, function() {
	console.log("The Server has Started!")
})