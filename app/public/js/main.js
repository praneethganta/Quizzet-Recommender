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
            timeseries(data.timeseriesData,"Date", "Score");
            heatMap(data.heatMapData)
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

function heatMap(data) {
    var title="Overall Activity";
    var units=" questions answered";
    var breaks=[2,4,6];
    var colours=["#edf8b1","#7fcdbb","#1d91c0","#253494"];

    //general layout information
    var cellSize = 17;
    var xOffset=10;
    var yOffset=60;
    var calY=50;//offset of calendar in each group
    var calX=25;
    var width = 1000;
    var height = 163;
    var unitHeight = 240;
    var parseDate = d3.time.format("%Y-%m-%d").parse;
    format = d3.time.format("%Y-%m-%d");
    toolDate = d3.time.format("%Y-%m-%d");

    // d3.json("data.json", function(error, data) {

        //set up an array of all the dates in the data which we need to work out the range of the data
        var dates = new Array();
        var values = new Array();
        var years = new Set();

        //parse the data
        data.forEach((d)  =>  {
            dates.push(parseDate(d.date));
            values.push(d.value);
            d.date=parseDate(d.date);
            d.value=d.value;
            d.year=d.date.getFullYear();//extract the year from the data
            years.add(d.year);
        });

        var yearlyData = d3.nest()
            .key(function(d){return d.year;})
            .entries(data);

        var svg = d3.select("#heatMap").append("svg")
            .attr("width","100%")
            .attr("viewBox","-25 0 "+(xOffset+width)+ " "+ (years.size * unitHeight))

        //title
        svg.append("text")
            .attr("x",xOffset)
            .attr("y",20)
            .text(title);

        //create an SVG group for each year
        var cals = svg.selectAll("g")
            .data(yearlyData)
            .enter()
            .append("g")
            .attr("id",function(d){
                return d.key;
            })
            .attr("transform",function(d,i){
                return "translate(0,"+(yOffset+(i*(height+calY)))+")";
            })

        var labels = cals.append("text")
            .attr("class","yearLabel")
            .attr("x",xOffset)
            .attr("y",15)
            .text(function(d){return d.key});

        //create a daily rectangle for each year
        var rects = cals.append("g")
            .attr("id","alldays")
            .selectAll(".day")
            .data(function(d) { return d3.time.days(new Date(parseInt(d.key), 0, 1), new Date(parseInt(d.key) + 1, 0, 1)); })
            .enter().append("rect")
            .attr("id",function(d) {
                return "_"+format(d);
                //return toolDate(d.date)+":\n"+d.value+" dead or missing";
            })
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) {
                return xOffset+calX+(d3.time.weekOfYear(d) * cellSize);
            })
            .attr("y", function(d) { return calY+(d.getDay() * cellSize); })
            .datum(format);

        //create day labels
        var days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        var dayLabels=cals.append("g").attr("id","dayLabels")
        days.forEach(function(d,i)    {
            dayLabels.append("text")
                .attr("class","dayLabel")
                .attr("x",xOffset)
                .attr("y",function(d) { return calY+(i * cellSize); })
                .attr("dy","0.9em")
                .text(d);
        })

        //let's draw the data on
        var dataRects = cals.append("g")
            .attr("id","dataDays")
            .selectAll(".dataday")
            .data(function(d){
                return d.values;
            })
            .enter()
            .append("rect")
            .attr("id",function(d) {
                return format(d.date)+":"+d.value;
            })
            .attr("stroke","#ccc")
            .attr("width",cellSize)
            .attr("height",cellSize)
            .attr("x", function(d){return xOffset+calX+(d3.time.weekOfYear(d.date) * cellSize);})
            .attr("y", function(d) { return calY+(d.date.getDay() * cellSize); })
            .attr("fill", function(d) {
                if (d.value<breaks[0]) {
                    return colours[0];
                }
                for (i=0;i<breaks.length+1;i++){
                    if (d.value>=breaks[i]&&d.value<breaks[i+1]){
                        return colours[i + 1];
                    }
                }
                if (d.value>=breaks[length]){
                    return colours[breaks.length]
                }
            })

        //append a title element to give basic mouseover info
        dataRects.append("title")
            .text(function(d) { return toolDate(d.date)+":\n"+d.value+units; });

        //add montly outlines for calendar
        cals.append("g")
            .attr("id","monthOutlines")
            .selectAll(".month")
            .data(function(d) {
                return d3.time.months(new Date(parseInt(d.key), 0, 1),
                    new Date(parseInt(d.key) + 1, 0, 1));
            })
            .enter().append("path")
            .attr("class", "month")
            .attr("transform","translate("+(xOffset+calX)+","+calY+")")
            .attr("d", monthPath);

        //retreive the bounding boxes of the outlines
        var BB = new Array();
        var mp = document.getElementById("monthOutlines").childNodes;
        for (var i=0;i<mp.length;i++){
            BB.push(mp[i].getBBox());
        }

        var monthX = new Array();
        BB.forEach(function(d,i){
            boxCentre = d.width/2;
            monthX.push(xOffset+calX+d.x+boxCentre);
        })

        //create centred month labels around the bounding box of each month path
        //create day labels
        var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        var monthLabels=cals.append("g").attr("id","monthLabels")
        months.forEach(function(d,i)    {
            monthLabels.append("text")
                .attr("class","monthLabel")
                .attr("x",monthX[i])
                .attr("y",calY/1.2)
                .text(d);
        })

        //create key
        var key = svg.append("g")
            .attr("id","key")
            .attr("class","key")
            .attr("transform",function(d){
                return "translate("+xOffset+","+(yOffset-(cellSize*1.5))+")";
            });

        key.selectAll("rect")
            .data(colours)
            .enter()
            .append("rect")
            .attr("width",cellSize)
            .attr("height",cellSize)
            .attr("x",function(d,i){
                return i*130;
            })
            .attr("fill",function(d){
                return d;
            });

        key.selectAll("text")
            .data(colours)
            .enter()
            .append("text")
            .attr("x",function(d,i){
                return cellSize+5+(i*130);
            })
            .attr("y","1em")
            .text(function(d,i){
                if (i<colours.length-1){
                    return "up to "+breaks[i];
                }   else    {
                    return "over "+breaks[i-1];
                }
            });

    // });//end data load

    //pure Bostock - compute and return monthly path data for any year
    function monthPath(t0) {
        var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
            d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
            d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
        return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
            + "H" + w0 * cellSize + "V" + 7 * cellSize
            + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
            + "H" + (w1 + 1) * cellSize + "V" + 0
            + "H" + (w0 + 1) * cellSize + "Z";
    }
}



