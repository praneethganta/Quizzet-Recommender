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

exports.manualLogin = function (user, pass, callback) {
    client.query("SELECT * FROM user_details where username = $1", [user], (err, result) => {
        if (result.rows.length === 1) {
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
    client.query("SELECT * FROM user_details where username = $1", [user], (err, result) => {
        if (result.rows.length === 1) {
            callback(false, "Username is already taken. Please try again.");
        } else {
            bcrypt.hash(pass, 10, function(err, hash) {
                if (err) {
                    callback(false, "An unexpected error has occurred! Please try again.");
                }
                // add user to user_details
            });
            callback(true, "Signup complete");
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