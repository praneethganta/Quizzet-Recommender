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

var elasticsearch = require('elasticsearch');
var esclient = new elasticsearch.Client({
    host: 'https://search-recommendelastic-ywwju7f53jk2b2nmic2y656it4.us-east-2.es.amazonaws.com',
    log: 'trace'
});

var stopWords = 'a,able,about,above,according,accordingly,across,actually,after,afterwards,again,against,all,allow,allows,almost,alone,along,already,also,although,always,am,among,amongst,an,and,another,any,anybody,anyhow,anyone,anything,anyway,anyways,anywhere,apart,appear,appreciate,appropriate,are,around,as,aside,ask,asking,associated,at,available,away,awfully,b,be,became,because,become,becomes,becoming,been,before,beforehand,behind,being,believe,below,beside,besides,best,better,between,beyond,both,brief,but,by,c,came,can,cannot,cant,cause,causes,certain,certainly,changes,clearly,co,com,come,comes,concerning,consequently,consider,considering,contain,containing,contains,corresponding,could,course,currently,d,definitely,described,despite,did,different,do,does,doing,done,down,downwards,during,e,each,edu,eg,eight,either,else,elsewhere,enough,entirely,especially,et,etc,even,ever,every,everybody,everyone,everything,everywhere,ex,exactly,example,except,f,far,few,fifth,first,five,followed,following,follows,for,former,formerly,forth,four,from,further,furthermore,g,get,gets,getting,given,gives,go,goes,going,gone,got,gotten,greetings,h,had,happens,hardly,has,have,having,he,hello,help,hence,her,here,hereafter,hereby,herein,hereupon,hers,herself,hi,him,himself,his,hither,hopefully,how,howbeit,however,i,ie,if,ignored,immediate,in,inasmuch,inc,indeed,indicate,indicated,indicates,inner,insofar,instead,into,inward,is,it,its,itself,j,just,k,keep,keeps,kept,know,knows,known,l,last,lately,later,latter,latterly,least,less,lest,let,like,liked,likely,little,look,looking,looks,ltd,m,mainly,many,may,maybe,me,mean,meanwhile,merely,might,more,moreover,most,mostly,much,must,my,myself,n,name,namely,nd,near,nearly,necessary,need,needs,neither,never,nevertheless,new,next,nine,no,nobody,non,none,noone,nor,normally,not,nothing,novel,now,nowhere,o,obviously,of,off,often,oh,ok,okay,old,on,once,one,ones,only,onto,or,other,others,otherwise,ought,our,ours,ourselves,out,outside,over,overall,own,p,particular,particularly,per,perhaps,placed,please,plus,possible,presumably,probably,provides,q,que,quite,qv,r,rather,rd,re,really,reasonably,regarding,regardless,regards,relatively,respectively,right,s,said,same,saw,say,saying,says,second,secondly,see,seeing,seem,seemed,seeming,seems,seen,self,selves,sensible,sent,serious,seriously,seven,several,shall,she,should,since,six,so,some,somebody,somehow,someone,something,sometime,sometimes,somewhat,somewhere,soon,sorry,specified,specify,specifying,still,sub,such,sup,sure,t,take,taken,tell,tends,th,than,thank,thanks,thanx,that,thats,the,their,theirs,them,themselves,then,thence,there,thereafter,thereby,therefore,therein,theres,thereupon,these,they,think,third,this,thorough,thoroughly,those,though,three,through,throughout,thru,thus,to,together,too,took,toward,towards,tried,tries,truly,try,trying,twice,two,u,un,under,unfortunately,unless,unlikely,until,unto,up,upon,us,use,used,useful,uses,using,usually,uucp,v,value,various,very,via,viz,vs,w,want,wants,was,way,we,welcome,well,went,were,what,whatever,when,whence,whenever,where,whereafter,whereas,whereby,wherein,whereupon,wherever,whether,which,while,whither,who,whoever,whole,whom,whose,why,will,willing,wish,with,within,without,wonder,would,would,x,y,yes,yet,you,your,yours,yourself,yourselves,z,zero,i,there,it,you';
var stopWordSet = new Set(stopWords.split(','));

function removeStopWords(str) {
    var wordSet = new Set(
        str.match(/\w+/ig).filter(function (word) {
            return !stopWordSet.has(word.toLowerCase());
        })
    );

    filteredString = '';
    wordSet.forEach(function (word) {
        filteredString += word + ' ';
    });

    return filteredString;
}

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

exports.displayQuestion = function (user, score, proficiencyLevel, courseInterests, algoCount, callback) {
    if (algoCount % 3 == 0){
        var randomPick = Math.floor(Math.random() * 101);
        client.query("select *from question_and_answer where question_id = $1", [randomPick], (err, result) => {
            if(err) {
                callback(false,null);
            }
            else {
                if(result.rows.length >= 1){
                    callback(true, result.rows[0]);
                } else {
                    callback(false, null);
                }
            }
        });

    }
    else {
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
    }

};

exports.getRecommendations = function(question, topic, callback) {
    var urls = new Set();

    var query = removeStopWords(question);
    esclient.search({
        index: 'adaptive',
        size: 10,
        body: {
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": [
                        "url",
                        "content",
                        "heading",
                        "subHeading"
                    ]
                }
            }
        }
    }).then(function (resp) {
        resp.hits.hits.forEach(function (rec) {
            urls.add(rec._source.url);
        });

        client.query("select links from topic_links where topic = $1", [topic], (err, result) => {
            if (err) {
                callback(false, err);
            }
            else {
                if(result.rows.length >= 1){
                    links = result.rows[0].links.split(',');
                    urls.forEach(function (url) {
                        links.push(url);
                    });
                    links = links.sort( function() { return 0.5 - Math.random() } );
                    callback(true, links.slice(0, 5));
                }
                else {
                    callback(false, null);
                }
            }
        });
    }, function (err) {
        callback(false, err);
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
    var dt = new Date(date),
        month = '' + (dt.getMonth() + 1),
        day = '' + dt.getDate(),
        year = dt.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}


exports.getHeatMapdata = function (username, callback) {
  client.query('select date(time), count(*) as value from user_history where to_char(time,\'YYYY\') = to_char(now(),\'YYYY\') and username = $1 and result = true group by date;', [username], (err, result) => {
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



Array.prototype.unique = function()
{
    var tmp = {}, out = [];
    for(var i = 0, n = this.length; i < n; ++i)
    {
        if(!tmp[this[i]]) { tmp[this[i]] = true; out.push(this[i]); }
    }
    return out;
}
function zeros([rows, cols]) {
    var x = new Array(rows);
    for (var i =0; i<rows; i++){
        x[i] = new Array(cols);
        for (var j=0; j<cols; j++){
            x[i][j] = 0;
        }
    }
    return x;
}

exports.getAllActivityCounts = function(user, callback){
    client.query('select username, date(time) "day", count( distinct question) from user_history group by username,2 order by 2', (err,res) => {
        if (err) {
            console.log(err.stack)
        } else {
            var values = res.rows;
            dates = [];
            usernames = [];
            for(var i = 0; i <values.length;i++) {
                dates.push(String(values[i]["day"]));
            }
            for(var i = 0; i <values.length;i++) {
                usernames.push(values[i]["username"]);
            }

            uniqueDates = dates.unique();
            uniqueUsers = usernames.unique();
            dataMatrix = zeros([uniqueUsers.length*2,uniqueDates.length]);
            //console.log(dataMatrix);

            for (var i = 0;i <values.length;i++){
                dataMatrix[uniqueUsers.indexOf(values[i]["username"])*2][uniqueDates.indexOf(String(values[i]["day"]))] = values[i]["count"];
            }
            //console.log(dataMatrix);
            var finalDates= ['x'];
            var finalData = [];
            for(var i = 0;i<uniqueDates.length;i++){
                uniqueDates[i] = formatDate(uniqueDates[i]);
            }
            finalDates.push.apply(finalDates,uniqueDates);
            finalData.push(finalDates);
            for (var i =0;i <uniqueUsers.length;i++){
                var row = [uniqueUsers[i]+"_questions"];
                var row1 = [uniqueUsers[i]+"_links"];
                row.push.apply(row,dataMatrix[i*2]);
                row1.push.apply(row1, dataMatrix[(i*2)+1]);
                finalData.push(row);
                finalData.push(row1);
            }
            callback(true,finalData);
        }
    });
};

exports.getTopics = function( username, callback) {
    query = 'select course_topic , sum(weight) "sum" from '+ username +'_question_weights where weight>0 group by course_topic;';
    client.query(query, (err,result) =>{
        if (err){
            callback(false, "Error retrieving question coverage.");
        } else{
            if (result.rows.length){
                var rows = result.rows;
                var finalResult = [];
                for( var i =0; i<rows.length; i++){
                    row = [rows[i]["course_topic"]];
                    row.push(rows[i]["sum"]);
                    finalResult.push(row);
                }
                callback(true, finalResult);

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