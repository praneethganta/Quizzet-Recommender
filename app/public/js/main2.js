$(document).ready(function(){
  load_charts();
});

function load_charts(){
  $.ajax({
    type: "POST",
    data: {},
    url: "/fetch_data",
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
       scatter_plot(data_scatter, 'scatterplot', 'customer score', 'agent score');
    }
  });  
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
function bar_chart(data, bind,x_label, y_label){
  var chart = c3.generate({
    bindto: '#'+bind,
        size: {
        height: 700,
        width: $('#'+bind)[0].offsetWidth - 50
        //width: $('#parentContainer')[0].offsetWidth - 10
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
            extent: [0, 10]
        },
        y: {
            label: y_label,
            min: 0,
            padding: { top: 10, bottom: 0 }
        },
    },
    color: {
          pattern: ['#e34a33']
    },
    bar: {
      width: 40
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
    l = data;
    var index_val = 0;
    var chart = c3.generate({
          bindto: '#'+bind,
        data: {
            xs: {
                'Customer sentiment score:':'Agent sentiment score:',
            },

        columns: [data[2],data[3]],
        type: 'scatter',
        color: 
             function (d) {
              console.log(d);
              // console.log(data[2][d.index + 1],data[3][d.index + 1], data[2][d.index + 1] >=0 && data[3][d.index + 1] >=0);
            if(data[2][d.index + 1] >=0 && data[3][d.index + 1] >=0){
              // console.log(data[2][d.index + 1] + " " + data[3][d.index + 1] + " green")
              // console.log('1');
              return "#0F0";
            }
            else if(data[2][d.index + 1] <0 && data[3][d.index + 1] <0) {
              // console.log(data[2][d.index+ 1] + " " + data[3][d.index+ 1] + " red")
              //               console.log('2');
              return "#F00";
            }
            else {
              //               // console.log('3');

              // console.log(data[2][d.index + 1] + " " + data[3][d.index + 1] + " orange")
              return "#00F";
            }
        }
        

        },
        // color: { pattern: ['#ff0000']},

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
        },/*
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
        }*/
        tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          console.log(data[0][d[0].index + 1] + " " + data[1][d[0].index + 1])
            return '<div style="background-color:#FFFFFF;width: 1500px;height: 250px;;padding:10px;border:1px solid gray;font-size:10px;">' + "<b>Agent Sentiment Score:</b> " + d[0].value + '</br>' + '<b>Agent Conversation:</b> ' +
                data[0][d[0].index + 1]+ '</br>' + '<b>Customer Sentiment Score:</b> '+ data[3][d[0].index]+ '</br>' + '<b>Cusotmer Conversation: </b>' + data[1][d[0].index + 1] + '</div>';
        }
    }
    });
}