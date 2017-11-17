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
                res.render("form-login", {error : "Please login again"})
            }
        }
    });

// Logs in the user on based on the username and password entered or already logged in users are redirected to home page //

	app.get('/home', function(req, res){
	    /*
		AM.manualLogin(req.body['username'], req.body['password'], function(e, o){
        });*/
        question_id=Math.floor(Math.random() * 101);
        AM.displayQuestion(question_id, function(status, result){
            if(status){
                res.render('home.ejs', {
                    question: result.question,
                    num_choices: result.num_choices,
                    choice1 : result.choice_a,
                    choice2 : result.choice_b,
                    choice3 : result.choice_c,
                    choice4 : result.choice_d,
                    choice5 : result.choice_e,
                    correct : result.answer

                });
                console.log(result.answer);
            }
        });
	});

    app.get('/userProfile', function(req, res){

        res.render("user-profile")
        /*
        AM.manualLogin(req.body['username'], req.body['password'], function(e, o){
        });*/
    });

    app.post('/quiz', function(req, res){

        res.render("home")
        /*
        AM.manualLogin(req.body['username'], req.body['password'], function(e, o){
        });*/


    });

    app.get('/signup', function(req, res){

        res.render("form-register", {error : ""});
        /*
        AM.manualLogin(req.body['username'], req.body['password'], function(e, o){
        });*/
    });

};
