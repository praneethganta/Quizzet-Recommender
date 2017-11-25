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
                updateScore(user);
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


exports.updateComment = function (username, question_id, comment, callback) {
    client.query("INSERT INTO question_comments (username, question_id, comment) values ($1, $2, $3)", [username, question_id, comment], (err,result) => {
       if(err){
           callback(false, "none");
       }
       else {
           callback(true, "success");
       }
    });
}

exports.getAllComments = function (question_id, callback) {
    client.query("select username, comment from question_comments where question_id = $1 order by time", [question_id], (err,result) => {
        if(err){
            callback(false, "none");
        }
        else {
            if(result != null && result.rows.length >= 1){
                callback(true, result.rows);
            }
            else{
                callback(false, "none");
            }
        }
    });
}

exports.displayQuestion = function (user, score, callback) {
    var level = 0;
    if (score <=150) {
        level = 1;
    }
    else if(score > 150 && score <=250) {
        level = 2;
    }
    else {
        level = 3;
    }
    weight_level = level * 100;
    var tableName =  user + "_question_weights";
    var query = "select question_id from " + tableName + " WHERE weight < $1;";
    client.query(query, [weight_level], (err,result) => {
        if (result.rows.length >= 1) {
            var randomPick = Math.floor(Math.random() * result.rows.length);
            var question_id = result.rows[randomPick].question_id;
            client.query("select *from question_and_answer where question_id = $1", [10], (err,result) => {
                if(err){
                    callback(false, "Question not retrieved please reload");
                }
                else {
                    callback(true, result.rows[0]);
                }

            });

        } else {
            callback(false, "Question not retrieved please reload");
        }
    });
};

exports.createWeightsTable = function (user, callback) {
    if ((user.indexOf('.')>-1) || (user.indexOf('-')>-1)){
        user.replace(/[.-]/g,'');
    }

    var tablename =  user + "_question_weights";
    var queryString = "CREATE TABLE "+ tablename + "(question_id integer, course_topic text, weight integer);";

    client.query(queryString, (err,result) =>{
        if (err) {
            callback(false, err);
        }
        else{
            var query = "INSERT INTO "+ tablename + " SELECT question_id, course_topic, weight from dummy_question_weights;"
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

function updateScore(user) {
    client.query("update user_complete_details set overall_score = t.overall_score from (SELECT sum(score) as overall_score from user_history group by username having username= $1) t where username = $1;",[user],(err,result) =>{
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
    })

}

exports.getScore = function (user, callback) {
    client.query("SELECT overall_score from user_complete_details where  username=$1;", [user], (err, result) => {
        if (err) {
            callback(false, "Error retrieving score! Please reload.");
        } else {
            if (result.rows.length === 1) {
                callback(true, result.rows[0].overall_score);
            } else {
                callback(false, "Error retrieving score! Please reload.");
            }
        }
    })
};

exports.getHistory = function (user, callback) {
    client.query("SELECT * FROM user_history WHERE username=$1;", [user], (err, result) => {
        if (err) {
            callback(false, "Error retrieving logs! Please reload.");
        } else {
            if (result.rows.length) {
                callback(true, result.rows);
            } else {
                callback(false, "Error retrieving logs! Please reload.");
            }
        }
    })
};

exports.getLeaderboard = function (callback) {
    client.query("SELECT username, university, overall_score FROM user_complete_details ORDER BY overall_score DESC;", (err, result) => {
        if (err) {
            callback(false, "Error retrieving user data! Please reload.");
        } else {
            if (result.rows.length) {
                callback(true, result.rows);
            } else {
                callback(false, "Error retrieving user data! Please reload.");
            }
        }
    })
};

exports.addRemoveFriend = function (currentUser, friend, requestType, callback) {
    if (requestType === "add") {
        client.query("INSERT INTO friends VALUES ($1, $2);", [currentUser, friend], (err, result) => {
            if (err) {
                callback(false, "Error adding friend! Please reload.");
            } else {
                callback(true, "");
            }
        });
    } else if (requestType === "remove") {
        client.query("DELETE FROM friends WHERE username = $1 AND friend = $2;", [currentUser, friend], (err, result) => {
            if (err) {
                callback(false, "Error removing friend! Please reload.");
            } else {
                callback(true, "");
            }
        });
    }
};

exports.getFriends = function (currentUser, callback) {
    client.query("SELECT friend FROM friends WHERE username = $1;", [currentUser], (err, result) => {
        if (err) {
            callback(false, "Error retrieving friends! Please reload.");
        } else {
            if (result.rows.length) {
                var arr = [];
                result.rows.forEach(function (row) {
                    arr.push(row.friend);
                });

                callback(true, arr);
            } else {
                callback(true, []);
            }
        }
    });
};