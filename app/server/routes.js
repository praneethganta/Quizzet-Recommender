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
                    if (req.session.username == null) {
                        req.session.username = req.body.username;
                        AM.getUserDetails(req.session.username, function (status, result) {
                            if (status){
                                req.session.fullname = result.firstname + " " + result.lastname;
                                req.session.gender = result.sex;
                                res.redirect('/home');
                            }
                            else {
                                res.render('form-login', {error : result});
                            }
                        });
                    }
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
                    AM.createWeightsTable(req.body.username, function(status, o){
                        if(status){
                            console.log(o);
                        }
                        else{
                            console.log(o);
                        }
                    });
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

                    res.render('home', {
                        questionInfo: result,
                        question: question,
                        fullname : req.session.fullname,
                        gender : req.session.gender
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

    app.get('/settings', function(req, res){
        if (req.session.loggedin === undefined || req.session.loggedin === false){
            res.redirect('/');
        } else {
            AM.getUserDetails(req.session.username, function (status, results) {
                var username = results.username;
                var firstName = results.firstname;
                var lastName = results.lastname;
                var password = results.password;
                var gender = results.sex;
                var age = results.age;
                var javaProficiency = results.java_proficiency;
                var knownTopics = results.topics_known;
                var academicExperience = results.academic_experience;
                var professionalExperience = results.professional_experience;
                var educationLevel = results.highest_education_level_completed;
                var universityName = results.university;
                var universityLocation = results.university_location;
                res.render('settings',{error: "", firstName:firstName,lastName:lastName,password:password,gender:gender
                , age:age,javaProficiency:javaProficiency, knownTopics:knownTopics, academicExperience:academicExperience,
                    professionalExperience:professionalExperience, educationLevel:educationLevel,
                    universityName:universityName, universityLocation:universityLocation});

            });
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
            req.session.username = null;
            req.session.fullname = "";
            req.session.gender = "";
            req.session.loggedin = false;
        }
        res.redirect('/');
    });

    app.post('/logActivity', function (req, res) {
        if (req.session.loggedin === true) {
            var activity = req.body;
            AM.updateActivity(req.session.username, activity, function (status, result) {
                if (status) {
                    res.status(200).send();
                }
                console.log('/logActivity - ' + result);
            });
        }
    });

    app.post('/updateWeight', function (req, res) {
        if (req.session.loggedin === true) {
            AM.updateWeight(req.session.username, req.body.questionId, req.body.weight, function (status, result) {
                if (status) {
                    res.status(200).send();
                }
                console.log('/updateWeight - ' + result);
            });
        }
    });

};
