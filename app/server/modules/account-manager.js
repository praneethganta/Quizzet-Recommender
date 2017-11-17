// start coding here for backend functionalities and processing

const {Pool, Client} = require('pg');
const client = new Client({
    user: 'awuser',
    host: 'awdbinstance.crgkoefokbdm.us-east-1.rds.amazonaws.com',
    database: 'awDb',
    password: 'Adaptiveweb123',
    port: 5432,
});
client.connect();

const bcrypt = require('bcrypt');

// create multiple files for different fucntionalities

// This file is for Maintaining account

exports.manualLogin = function (user, pass, callback) {
    client.query("SELECT * FROM user_details where username = $1", [user], (err, result) => {
        if (result.rows.length == 1) {
            var password = result.rows[1];
            bcrypt.compare(pass, password, function(err, res) {
                if(res) {
                    callback(true, 'Logged in');
                } else {
                    callback(true, 'Invalid Password');
                }
            });
        }
        else {
            callback(false, "Invalid user");
        }
    });
}


exports.updateActivity = function (user, activity, callback) {
}

exports.displayQuestion = function(questionId, callback){

    client.query("SELECT * from question_and_answer where question_id =$1", [questionId], (err,result) =>{
        if (result.rows.length == 1) {
                callback(true, //JSON.stringify(result.rows[0]));
                                     result.rows[0]);
        }
        else {
            callback(false, "Invalid Question Id");
        }
    });

}