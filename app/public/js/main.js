$(document).ready(function(){
    load_charts();
});

function load_charts() {
    $.ajax({
        type: "POST",
        data: {},
        url: "/fetchdata",
        success: function (data) {
            data = JSON.parse(data);
            timeseries(data.data,"Date", "Score");
        }
    })
}


function timeseries(data,x_label,y_label)
{
    //alert(data);
    var chart = c3.generate({
        bindto: '#ScoreSeries',
        size: {
            width: $('#ScoreSeries')[0].offsetWidth - 100,
            height: $('#ScoreSeries')[0].offsetHeight - 100
        },
        data: {
            x: 'x',
            xFormat: '%Y-%m-%d', // 'xFormat' can be used as custom format of 'x'
            columns:
                [data[0], data[1]]
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%Y-%m-%d',
                    rotate: 90,
                    fit: false,
                    multiline: false
                },
                label: x_label
            },
            y : {
                label: y_label
            }
        }
    });
}



/*
$(document).ready(function(){
  load_charts();
});

function load_charts(){
  $.ajax({
    type: "POST",
    data: {},
    url: "/fetchdata",
    success: function(data){

      bar_chart(data['trigram'], 'trigram','Trigrams','Frequency');
      bar_chart(data['bigram'], 'bigram','Bigrams','Frequency');
      bar_chart(data['aspect'], 'aspect','Aspects','Frequency');
      table(data['topic15'],'topic15','Topic','keywords');
      table(data['topic20'],'topic20','Topic','keywords');
        data_scatter = data["sentiment_data"];
        for(var i = 1; i<data_scatter[2].length;i++){
        data_scatter[2][i] = Number(data_scatter[2][i])
        }
        for(var i = 1; i<data_scatter[3].length;i++){
        data_scatter[3][i] = Number(data_scatter[3][i])
        }
       //scatter_plot(data_scatter, 'scatterplot', 'customer score', 'agent score');

var xhrWords = new XMLHttpRequest();
xhrWords.onreadystatechange = function() {
    if (xhrWords.readyState == 4) {
        data = xhrWords.responseText;
        data = JSON.parse(data);
        wordCloud(data["words"]);
    }
}
xhrWords.open('POST', 'fetchdata', true);
xhrWords.setRequestHeader( "Content-Type", "application/json; charset=UTF-8" );
xhrWords.send(JSON.stringify({"chart" : "wordcloud","userselect" :"Me"}));


var xhrSeries = new XMLHttpRequest();
xhrSeries.onreadystatechange = function() {
    if (xhrSeries.readyState == 4) {
        data = xhrSeries.responseText;
        data = JSON.parse(data);
        timeseries(data["seriesData"],"prosecuting_agency","dfdf","sdsad");
    }
}
xhrSeries.open('POST', 'fetchdata', true);
xhrSeries.setRequestHeader( "Content-Type", "application/json; charset=UTF-8" );
xhrSeries.send(JSON.stringify({"chart" : "timeseries"}));

}



var xhrPerformance = new XMLHttpRequest();
xhrPerformance.onreadystatechange = function() {
    if (xhrPerformance.readyState == 4) {
        data = xhrPerformance.responseText;
        data = JSON.parse(data);
        bar_chart(data["barData"], 'trigram','Type','Frequency');
    }
}
xhrPerformance.open('POST', 'fetchdata', true);
xhrPerformance.setRequestHeader( "Content-Type", "application/json; charset=UTF-8" );
xhrPerformance.send(JSON.stringify({"chart" : "perfomanceBar"}));


function timeseries(data,bind,x_label,y_label){
  var chart = c3.generate({
    bindto: '#'+bind,
    size: {
       //width: $('#'+bind)[0].offsetWidth - 50
    },
    data: {
        x: 'x',
//        xFormat: '%Y%m%d', // 'xFormat' can be used as custom format of 'x'
        columns: data//[
            //['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06'],
//            ['x', '20130101', '20130102', '20130103', '20130104', '20130105', '20130106'],
            //['data1', 30, 200, 100, 400, 150, 250],
          //  ['data2', 130, 340, 200, 500, 250, 350]
        //]
    },
    axis: {
        x: {
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d',
                rotate: 75,
                fit: false,
                multiline: false
            }
        }
    }
});
}

function changeCloud(selectedValue) {
  var xhrWords = new XMLHttpRequest();
  xhrWords.onreadystatechange = function() {
      if (xhrWords.readyState == 4) {
          data = xhrWords.responseText;
          data = JSON.parse(data);
           $('#scatterplot').jQCloud('update', data["words"]);
      }
  }
  xhrWords.open('POST', 'fetchdata', true);
  xhrWords.setRequestHeader( "Content-Type", "application/json; charset=UTF-8" );
  xhrWords.send(JSON.stringify({"chart" : "wordcloud","userselect" :selectedValue}));
}

function table(data,bind,x_label,y_label){
    var table = document.getElementById(bind);
    var column1 = data[0];
    var column2 = data[1];
    for(var i = 0;i < column2.length;i++)
    {
      var row = table.insertRow();
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      cell1.innerHTML = column1[i][0];
      cell2.innerHTML = column2[i][0];
    }
}

function wordCloud(data) {
$('#scatterplot').jQCloud(data, {
  shape: 'circular',//'rectangular'
  center: {x:0.6,y:0.5},
   colors: ["#800026", "#bd0026", "#e31a1c", "#fc4e2a"],
  fontSize: {
    from: 0.1,
    to: 0.02
  },
  autoResize: true
});
}
function bar_chart(data, bind,x_label, y_label){
  var chart = c3.generate({
    bindto: '#'+bind,
      size: {
       height: 500,
     width: $('#'+bind)[0].offsetWidth - 10
    //     //width: $('#parentContainer')[0].offsetWidth - 10
  },
    data: {
      x: 'x',
      columns: data,
      type: 'bar',
    },
       subchart: {
        show: true
    },
    axis: {
        x: {
            type: 'category',
            label: x_label,
            tick: {
                rotate: 75,
                multiline: false
            },
            extent: [0, 3]
        },
        y: {
            label: y_label,
            min: 0,
            padding: { top: 10, bottom: 0 }
        },
    },
    // color: {
    //       pattern: ['#e34a33']
    // },
    bar: {
      //width: 40
      ratio : 0.5
    },
    legend: {
        show: false
    },
    padding:{
      bottom: 10
    },
    tooltip: {
        format: {
            title: function (d) {
                return x_label;
            }
        }
    }
  });
}

function scatter_plot(data, bind, x_label, y_label) {
    var index_val = 0;
    var chart = c3.generate({
          bindto: '#'+bind,
        data: {
            xs: {
                'Customer sentiment score:':'Agent sentiment score:',
            },

        columns: [data[2],data[3]]
                 ,
            type: 'scatter',


        color: function (x,d) {
          // console.log(x,d);
            if(data [2][d.index + 1] >=0 && data[3][d.index + 1] >=0){
              console.log(" green");
              return "#0F0";}
            else if(data[2][d.index + 1] <0 && data[3][d.index + 1] <0) {
              console.log(" red");
              return "#F00";}
            else {
              console.log(" blue");
              return "#00F";}
        },
},
         legend: {
    show: false
  },
        axis: {
            x: {
                label: 'customer sentiment score',
                tick: {
                    fit: false
                }
            },
            y: {
                label: 'agent sentiment score'
            }
        },
        tooltip: {
        format: {
            title: function (d) {
              if( d >= 0) {flag =  true}
              return 'Agent sentiment score:   |' + d + '</br>' + data[0][index_val]; },
            value: function (value, ratio, id, index) {
                var format = id === 'data1' ? d3.format(',') : d3. format('$');
                index_val = index + 1;
                return value + "</br>" + data[1][index + 1];
             }
        }
        }
        tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          // console.log(data[0][d[0].index + 1] + " " + data[1][d[0].index + 1])
            return '<div style="background-color:#FFFFFF;width: 1500px;height: 250px;;padding:10px;border:1px solid gray;font-size:10px;">' + "<b>Agent Sentiment Score:</b> " + d[0].value + '</br>' + '<b>Agent Conversation:</b> ' +
                data[0][d[0].index + 1]+ '</br>' + '<b>Customer Sentiment Score:</b> '+ data[3][d[0].index]+ '</br>' + '<b>Cusotmer Conversation: </b>' + data[1][d[0].index + 1] + '</div>';
        }
    }
    });
}

*/