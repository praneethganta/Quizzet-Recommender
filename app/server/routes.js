// Controller file

var AM = require('./modules/account-manager');
var RE = require('./modules/recommendor');

module.exports = function(app) {

	app.get('/', function(req, res){
        if (req.session.loggedin === undefined || req.session.loggedin === false){
            res.render('form-login', {error:''})
        } else {
           res.redirect('/home');
        }
	});

    app.post('/login', function(req, res){
        if (req.session.loggedin === undefined || req.session.loggedin === false){
            AM.manualLogin(req.body.username, req.body.password, function(status, o){
                if(status) {
                    req.session.loggedin = true;
                    res.redirect('/home');
                }
                else {
                    res.render('form-login', {error : o});
                }
            });
        } else {
            if(req.session.loggedin === true) {
                res.redirect('/home');
            } else {
                res.render('form-login', {error : 'Please login again.'})
            }
        }
    });

    app.get('/signup', function(req, res){
        if (req.session.loggedin === undefined || req.session.loggedin === false){
            res.render('form-register', {error : ''});
        } else {
            res.redirect('/home');
        }
    });

    app.post('/signup', function(req, res){
        if (req.session.loggedin === undefined || req.session.loggedin === false) {
            console.log(req.body);
            AM.signup(req.body, function(status, o){
                if (status) {
                    res.render('form-register', {error : o});
                }
                else {
                    res.render('form-register', {error : o});
                }
            });
        } else {
            if (req.session.loggedin === true) {
                res.redirect('/home');
            } else {
                res.render('form-register', {error : 'Please register again.'})
            }
        }
    });

	app.get('/home', function(req, res){
        if (req.session.loggedin === undefined || req.session.loggedin === false){
            res.redirect('/');
        } else {
            var question_id = Math.floor(Math.random() * 101);
            AM.displayQuestion(question_id, function (status, result) {
                if (status) {
                    var question = result.question.trim();
                    if (question[0] === '"') {
                        question = question.substring(1, question.length - 1);
                    }

                    res.render('home.ejs', {
                        questionInfo: result,
                        question: question
                    });
                }
            });
        }
	});

    app.get('/userProfile', function(req, res){
        if (req.session.loggedin === undefined || req.session.loggedin === false){
            res.redirect('/');
        } else {
            res.render('user-profile');
        }
    });

    app.get('/leaderboard', function(req, res){
        res.render('leaderboard');
    });

    app.get('/history', function(req, res){
        res.render('history');
    });



    app.get('/logout', function(req, res){
        if (req.session.loggedin === true) {
            req.session.loggedin = false;
        }
        res.redirect('/');
    });

};
