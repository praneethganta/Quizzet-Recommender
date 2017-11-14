// Controller file
var AM = require('./modules/account-manager');
var RE = require('./modules/recommendor');


module.exports = function(app) {

// Root login page redirects to home page if user already logged in else to the login page //
	app.get('/', function(req, res){
        if (req.session.loggedin == null || req.session.loggedin == false){
            res.render("form-login",{error:""})
        }
        else {
           res.redirect("/home");
        }
	});

    app.post('/login', function(req, res){
        if (req.session.loggedin == null || req.session.loggedin == false){
            AM.manualLogin(req.body.username, req.body.password, function(status, o){
                if(status) {
                    req.session.loggedin = true;
                    res.redirect("/home");
                }
                else {
                    res.render('form-login', {error : o});
                }
            });
        }
        else {
            if(req.session.loggedin == true) {
                res.redirect("/home");
            }
            else {
                res.render("form-login",{error:"Please login again"})
            }
        }
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

};
