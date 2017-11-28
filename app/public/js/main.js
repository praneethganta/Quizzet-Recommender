
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
            timeseries(data["timeSeries"],"Date", "Score");
            stackedBarChart(data["stackedBarChart"],"Date", "Counts");
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

function stackedBarChart(data, x_label, y_label){
    l = data.length;
    dateLen = data[0].length;

    dates = [];
    for (var i=1; i<dateLen; i++){
        dates.push(data[0][i]);
    }

    arrGroup = [];
    for (var i=1; i<l-1; i+=2){
        arrGroup.push([data[i][0],data[i+1][0]]);
    }

    arrData = [];
    for (var i=1; i<l; i++){
        arrData.push(data[i]);
    }

    colors = [];
    for (var i=1; i<l-1; i+=2){
        colors.push('#ef9400');
        colors.push('#0052cd');
    }
    console.log(colors);

    var chart = c3.generate({
        bindto: '#comparison',
        size: {
            width: $('#comparison')[0].offsetWidth - 100,
            //height: $('#ScoreSeries')[0].offsetHeight
        },
        data: {
            columns: arrData,
            type: 'bar',
            groups: arrGroup
        },
        axis: {
            x: {
                type: 'category',
                label: x_label,
                categories:dates

            },
            y : {
                label: y_label
            }
        },
        color: {
            pattern: colors
        },
    });
}



