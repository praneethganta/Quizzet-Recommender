// Backend functionality

const {Pool, Client} = require('pg');
const client = new Client({
    user: 'awuser',
    host: 'awdbinstance.crgkoefokbdm.us-east-1.rds.amazonaws.com',
    database: 'awDb',
    password: 'Adaptiveweb123',
    port: 5432
});
client.connect();


const bcrypt = require('bcrypt');

exports.getUserDetails = function(user, callback) {
    client.query("select *from user_details a, user_complete_details b where a.username = $1 and b.username = $2", [user,user], (err, result) => {
        if (err) {
            callback(false, "Something went wrong please login again.");
        }
        else {
            callback(true, result.rows[0]);
        }
    });

};

exports.manualLogin = function (user, pass, callback) {
    client.query("SELECT * FROM user_details where username = $1", [user], (err, result) => {
        if (result.rows.length === 1) {
            username = user;
            var password = result.rows[0].password;
            bcrypt.compare(pass, password, function(err, res) {
                if (res) {
                    callback(true, 'Logged in');
                } else {
                    callback(false, 'Invalid Password.');
                }
            });
        } else {
            callback(false, "Invalid user.");
        }
    })
};

exports.signup = function (userDetails, callback) {
    var user = userDetails.username;
    var pass = userDetails.password;
    var firstName = userDetails.firstName;
    var lastName = userDetails.lastName;
    var gender = userDetails.gender;
    var age = userDetails.age;
    var javaProficiency = userDetails.javaProficiency;
    if (typeof(userDetails.knownTopics) == 'string'){
        var knownTopics = userDetails.knownTopics
    }
    else{
        var knownTopics = userDetails.knownTopics.join();
    }
    var academicExperience = userDetails.academicExperience;
    var professionalExperience = userDetails.professionalExperience;
    var educationLevel = userDetails.educationLevel;
    var universityName = userDetails.universityName;
    var universityLocation = userDetails.universityLocation;

    client.query("SELECT * FROM user_details where username = $1", [user], (err, result) => {
        if (result.rows.length === 1) {
            callback(false, "Username is already taken. Please try again.");
        } else {
            bcrypt.hash(pass, 10, function(err, hash) {
                if (err) {
                    callback(false, "An unexpected error has occurred! Please try again.");
                }
                client.query("INSERT INTO user_details VALUES ($1 , $2)", [user, hash], (err, result) => {
                    if (err) {
                        callback(false, err);
                    }
                    else {
                        client.query("INSERT INTO user_complete_details VALUES ($1 , $2, $3, $4, $5, $6, $7, $8, $9, " +
                            "$10, $11, $12)", [user, firstName, lastName, gender, knownTopics, javaProficiency,
                        professionalExperience, academicExperience, age, educationLevel, universityName, universityLocation], (err, result) => {
                            if (err){
                                callback(false, err);
                            }
                            else {
                                callback(true, "Signup complete");
                            }
                        });
                    }

                });
            });
        }
    })
};

exports.updateActivity = function (user, activity, callback) {
};

exports.displayQuestion = function (questionId, callback) {
    client.query("SELECT * from question_and_answer where question_id =$1", [questionId], (err,result) => {
        if (result.rows.length === 1) {
                callback(true, //JSON.stringify(result.rows[0]));
                                     result.rows[0]);
        } else {
            callback(false, "Invalid Question Id.");
        }
    })
};

exports.createWeightsTable = function (user, callback) {
    if (user.indexOf('.')>-1){
        user.replace('.','_');
    }

    var tablename =  user + "_question_weights";
    var queryString = "CREATE TABLE "+ tablename + "(question_id integer, course_topic text, level text, weight integer);";

    client.query(queryString, (err,result) =>{
        if (err) {
            callback(false, err);
        }
        else{
            var query = "INSERT INTO "+ tablename + " SELECT question_id, course_topic, level, weight from dummy_question_weights;"
            client.query(query, (errr,result) => {
                if (errr) {
                callback(false, errr);

            } else
            {
                callback(true,"Created Successfully!" );
            }
        });
    }

    });

};