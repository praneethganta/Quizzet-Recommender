// start coding here for backend functionality and processing

// create multiple files for different functionality

// This file is for recommender logic

const {Pool, Client} = require('pg');
const client = new Client({
    user: 'awuser',
    host: 'awdbinstance.crgkoefokbdm.us-east-1.rds.amazonaws.com',
    database: 'awDb',
    password: 'Adaptiveweb123',
    port: 5432
});
client.connect();

exports.updateActivity = function (user, activity, callback) {
    client.query("INSERT INTO user_history (username, question, topic, result, score) VALUES ($1, $2, $3, $4, $5)",
        [user, activity.question, activity.topic, activity.result,  activity.score], (err, result) => {
            if (err) {
                callback(false, "Error inserting into activity into table");
            } else {
                callback(true, "User activity updated");
            }
        });
};

exports.updateWeights = function (user, topic, weight, callback) {
    var tableName =  user + "_question_weights";
    var query = "UPDATE " + tableName + " SET weight=$1 WHERE course_topic=$2;";
    client.query(query, [weight, topic], (err, result) => {
        if (err) {
            callback(false, "Error updating weights");
        } else {
            callback(true, "Question weights updated");
        }
    });
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
    if ((user.indexOf('.')>-1) || (user.indexOf('-')>-1)){
        user.replace(/[.-]/g,'');
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

exports.getScore = function (user, callback) {
    if ((user.indexOf('.')>-1) || (user.indexOf('-')>-1)){
        user.replace(/[.-]/g,'');
    }
    client.query("SELECT sum(score) from user_history group by username having username=$1;",[user],(err,result) =>{
        if (result.rows.length === 1) {
            callback(true, result.rows[0]);
        } else {
            callback(false, 0);
        }
    })
};