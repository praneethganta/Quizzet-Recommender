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
                res.render('form-login', {error : 'Please login again'})
            }
        }
    });

	app.get('/home', function(req, res){
        if (req.session.loggedin === undefined || req.session.loggedin === false){
            res.redirect('/');
        } else {
            question_id=Math.floor(Math.random() * 101);
            AM.displayQuestion(question_id, function (status, result) {
                var question = result.question.trim();
                if (question[0] === '"') {
                    question = question.substring(1, question.length - 1);
                }
                if (status) {
                    res.render('home.ejs', {
                        question: question,
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
        }
	});

    app.get('/userProfile', function(req, res){
        if (req.session.loggedin === undefined || req.session.loggedin === false){
            res.redirect('/');
        } else {
            res.render('user-profile');
        }
    });

    app.post('/quiz', function(req, res){
        res.render('home');
    });

    app.get('/signup', function(req, res){
        if (req.session.loggedin === undefined || req.session.loggedin === false){
            res.render('form-register', {error : ''});
        } else {
            res.redirect('/home');
        }
    });

    app.get('/logout', function(req, res){
        if (req.session.loggedin === true) {
            req.session.loggedin = false;
        }
        res.redirect('/');
    });

};
