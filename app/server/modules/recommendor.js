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

var difficultyMap = {"Beginner" : "Easy", "Intermediate":"Moderate","Advanced":"Difficult"}
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
    var query = "UPDATE " + tableName + " SET weight= weight + $1 WHERE course_topic=$2;";
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
};

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
};

exports.displayQuestion = function (user, score, proficiencyLevel, courseInterests, callback) {
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
    var query = "select t.*from question_and_answer t, " + tableName + " a WHERE a.weight < $1 and a.question_id = t.question_id";
    var diffultyLevelList = [];
    var courseTopicsList = [];
    var combineList = [];
    client.query(query, [weight_level], (err,result) => {
        if (result.rows.length >= 1) {
            rows = result.rows;
            for(var i =0;i <rows.length; i++) {
                if(courseInterests.indexOf(rows[i].course_topic) >=0 && difficultyMap[proficiencyLevel] == rows[i].level) {
                    combineList.push(rows[i]);
                }
                else if(courseInterests.indexOf(rows[i].course_topic) >=0){
                    courseTopicsList.push(rows[i]);
                }
                else if(difficultyMap[proficiencyLevel] == rows[i].level){
                    diffultyLevelList.push(rows[i]);
                }
                else{
                    continue;
                }
            }
            if(combineList.length > 0) {
                var randomPick = Math.floor(Math.random() * combineList.length);
                callback(true, combineList[randomPick]);
            }
            else if(courseTopicsList.length > 0) {
                var randomPick = Math.floor(Math.random() * courseTopicsList.length);
                callback(true, courseTopicsList[randomPick]);
            }
            else if(diffultyLevelList.length > 0) {
                var randomPick = Math.floor(Math.random() * diffultyLevelList.length);
                callback(true, diffultyLevelList[randomPick]);
            }
            else {
                var randomPick = Math.floor(Math.random() * rows.length);
                callback(true, rows[randomPick]);

            }
        } else {
            callback(false, "Question not retrieved please reload");
        }
    });
};

exports.getRecommendations = function(topic, callback) {
  client.query("select links from topic_links where topic = $1", [topic], (err, result) => {
      if (err) {
          callback(false, err);
      }
      else {
          if(result.rows.length >= 1){
              links = result.rows[0].links.split(',');
              callback(true, links);
          }
          else {
              callback(false, null);
          }
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

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}


exports.getHeatMapdata = function (username, callback) {
  client.query('select date(time), count(distinct question) as value from user_history where to_char(time,\'YYYY\') = to_char(now(),\'YYYY\') and username = $1 group by date;', [username], (err, result) => {
     if(err) {
         callback(false,"Error getting user data. Please reload");
     }
     else {
         rows = result.rows;
         for (var i = 0;i<rows.length; i++ ) {
             rows[i].date = formatDate(rows[i].date);
         }
         callback(true, rows);
     }
  });
};

exports.getScoreTimeline = function (user, callback) {
    client.query("SELECT sum(score), date(time) FROM user_history WHERE username= $1 GROUP BY date;", [user], (err, result) => {
        if (err) {
            callback(false, "Error retrieving user's score trend! Please reload.");
        } else {
            if (result.rows.length) {
                xaxis = ['x'];
                yaxis = [user];
                var rows = result.rows;
                for (var i = 0; i < rows.length; i++) {
                    xaxis.push(formatDate(rows[i].date));
                    yaxis.push(rows[i].sum);
                }
                callback(true, [xaxis, yaxis]);
            } else {
                callback(false, "Error retrieving logs! Please reload.");
            }
        }
    });
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