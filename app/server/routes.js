// Controller file

var AM = require('./modules/account-manager');
var RE = require('./modules/recommendor');
var score = 0;

// Initializing Question Variables

var maxPoints = null;
var penalty = null;
var qScore = null;
var weight = null;
var weightUpdate = null;

var numAttempts = null;
var level = null;
var question = null;
var answer = null;
var topic = null;
var ansResult = null;
var attemptsLeft = null;

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
                    if (req.session.username === undefined) {
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
            AM.signup(req.body, function(status, o){
                if (status) {
                    RE.createWeightsTable(req.body.username, function(status, o){
                        if(status){
                            activity = {};
                            activity.question = "Joining Bonus";
                            activity.topic = 'All';
                            activity.result = true;
                            activity.score = 100;
                            RE.updateActivity(req.body.username,activity,function (status, result) {
                               if(status) {
                                    res.render('form-register', {error: 'Signup complete'})
                               }
                               else {
                                   res.render('form-register', {error : o});
                               }
                            });
                        }
                        else{
                            res.render('form-register', {error : o});
                        }
                    });
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
            RE.getScore(req.session.username,function(status, result){
                if (status){
                    score = result;
                }

            });
            var question_id = Math.floor(Math.random() * 101);
            RE.displayQuestion(question_id, function (status, result) {
                if (status) {
                    question = result.question.trim();
                    if (question[0] === '"') {
                        question = question.substring(1, question.length - 1);
                    }

                    // Resetting variables

                    maxPoints = 0;
                    penalty = 0;
                    qScore = 0;
                    weight = 0;
                    weightUpdate = 0;

                    numAttempts = result.num_choices / 2;
                    level = result.level;
                    answer = result.answer;
                    topic = result.topic;
                    ansResult = false;
                    attemptsLeft = numAttempts;


                    if (level === "Easy") {
                        maxPoints = 10;
                        penalty = -15;
                        weight = 50;
                    } else if (level === "Moderate") {
                        maxPoints = 20;
                        penalty = -10;
                        weight = 40;
                    } else if (level === "Difficult") {
                        maxPoints = 30;
                        penalty = -5;
                        weight = 30;
                    }

                    res.render('home', {
                        score: score,
                        questionInfo: {
                            question: question,
                            num_choices: result.num_choices,
                            choice_a: result.choice_a,
                            choice_b: result.choice_b,
                            choice_c: result.choice_c,
                            choice_d: result.choice_d,
                            choice_e: result.choice_e
                        },
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

            RE.getScore(req.session.username,function(status, result) {
                if (status) {
                    score = result;
                }
            });
            res.render('user-profile', {score:score,fullname:req.session.fullname, gender:req.session.gender});
        }
    });

    app.get('/settings', function(req, res){
        if (req.session.loggedin === undefined || req.session.loggedin === false){
            res.redirect('/');
        } else {
            RE.getScore(req.session.username,function(status, result) {
                if (status) {
                    score = result;
                }
            });
            AM.getUserDetails(req.session.username, function (status, results) {
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
                    universityName:universityName, universityLocation:universityLocation, score:score});
            });
        }
    });

    app.get('/leaderboard', function(req, res){
        RE.getScore(req.session.username,function(status, result) {
            if (status) {
                score = result;
            }
        });
        res.render('leaderboard', {score:score ,fullname:req.session.fullname, gender:req.session.gender});
    });

    app.get('/history', function(req, res){
        RE.getScore(req.session.username,function(status, result) {
            if (status) {
                score = result;
            }
        });
        res.render('history',{score:score, fullname:req.session.fullname, gender:req.session.gender});
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

    app.post('/verifyAnswer', function (req, res) {
        if (req.session.loggedin === true) {
            var userChoice = req.body.userChoice;
            var answerId = answer.substring(6,7).charCodeAt(0)-64;
            var activity = null;

            if (parseInt(userChoice) === answerId){
                ansResult = true;
                qScore = maxPoints;
                weightUpdate = weight / (numAttempts - attemptsLeft);

                RE.updateWeights(req.session.username, topic, weight, function (status, result) {
                    if (status) {
                        activity = {question: question, topic: topic, result: ansResult, score: qScore};
                        RE.updateActivity(req.session.username, activity, function (status, result) {
                            if (status) {
                                res.status(200).send(JSON.stringify({result: ansResult, attemptsLeft: attemptsLeft, error: false}));
                            } else {
                                res.status(200).send(JSON.stringify({result: ansResult, attemptsLeft: attemptsLeft, error: true}));
                            }
                        });
                    } else {
                        res.status(200).send(JSON.stringify({result: true, attemptsLeft: attemptsLeft, error: true}));
                    }
                });
            } else {
                attemptsLeft -= 1;
                qScore = penalty;

                activity = {question: question, topic: topic, result: ansResult, score: qScore};
                RE.updateActivity(req.session.username, activity, function (status, result) {
                    if (status) {
                        res.status(200).send(JSON.stringify({result: ansResult, attemptsLeft: attemptsLeft, error: false}));
                    } else {
                        attemptsLeft += 1;
                        res.status(200).send(JSON.stringify({result: ansResult, attemptsLeft: attemptsLeft, error: true}));
                    }
                });
            }
        }
    });

};
