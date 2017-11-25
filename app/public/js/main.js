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
            //height: $('#ScoreSeries')[0].offsetHeight
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



