// Controller file
var AM = require('./modules/account-manager');
var RE = require('./modules/recommendor');


module.exports = function(app) {

// Root login page redirects to home page if user already logged in else to the login page //
	app.get('/login', function(req, res){
		res.render("form-login");/*
			AM.manualLogin(req.cookies.user, req.cookies.pass, function(status, o){
				if(status)
				res.redirect("/home");
				else
				res.render('form-login', {error : o});
			});*/
	});

// Logs in the user on based on the username and password entered or already logged in users are redirected to home page //

	app.get('/home', function(req, res){

	    res.render("home")
	    /*
		AM.manualLogin(req.body['username'], req.body['password'], function(e, o){
        });*/
	});

    app.get('/userProfile', function(req, res){

        res.render("user-profile")
        /*
        AM.manualLogin(req.body['username'], req.body['password'], function(e, o){
        });*/
    });

    app.get('/quiz', function(req, res){

        res.render("home")
        /*
        AM.manualLogin(req.body['username'], req.body['password'], function(e, o){
        });*/
    });

    app.get('/', function(req, res){
        res.render("form-register");/*
			AM.manualLogin(req.cookies.user, req.cookies.pass, function(status, o){
				if(status)
				res.redirect("/home");
				else
				res.render('form-login', {error : o});
			});*/
    });

};
