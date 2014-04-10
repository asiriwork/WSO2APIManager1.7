var t_on = {
    'apiChart':1,
    'subsChart':1,
    'userChart':1,
    'serviceTimeChart':1,
    'tempLoadingSpace':1,
    'subsChart':1
};
var currentLocation;

var chartColorScheme1 = ["#3da0ea","#bacf0b","#e7912a","#4ec9ce","#f377ab","#ec7337","#bacf0b","#f377ab","#3da0ea","#e7912a","#bacf0b"];
//fault colors || shades of red
var chartColorScheme2 = ["#ED2939","#E0115F","#E62020","#F2003C","#ED1C24","#CE2029","#B31B1B","#990000","#800000","#B22222","#DA2C43"];
//fault colors || shades of blue
var chartColorScheme3 = ["#0099CC","#436EEE","#82CFFD","#33A1C9","#8DB6CD","#60AFFE","#7AA9DD","#104E8B","#7EB6FF","#4981CE","#2E37FE"];
currentLocation=window.location.pathname;

require(["dojo/dom", "dojo/domReady!"], function(dom){
    currentLocation=window.location.pathname;
    //Initiating the fake progress bar
    jagg.fillProgress('apiChart');jagg.fillProgress('userChart');jagg.fillProgress('subsChart');jagg.fillProgress('serviceTimeChart');jagg.fillProgress('tempLoadingSpace');

    jagg.post("/site/blocks/stats/appAPICount/ajax/stats.jag", { action:"getFirstAccessTime",currentLocation:currentLocation  },
        function (json) {            

            if (!json.error) {

                if( json.usage && json.usage.length > 0){
                    
                    var d = new Date();
                    var firstAccessDay = new Date(json.usage[0].year, json.usage[0].month-1, json.usage[0].day);
                    var currentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                    if(firstAccessDay.valueOf() == currentDay.valueOf()){
                        currentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1);
                    }
                    var rangeSlider =  $("#rangeSlider");
                    //console.info(currentDay);
                    rangeSlider.dateRangeSlider({
                        "bounds":{
                            min: firstAccessDay,
                            max: currentDay
                        },
                        "defaultValues":{
                            min: firstAccessDay,
                            max: currentDay
                        }
                    });
                    rangeSlider.bind("valuesChanged", function(e, data){
                        var from = convertTimeString(data.values.min);
                        var to = convertTimeStringPlusDay(data.values.max);

                        drawAppAPIUsage(from,to);
                        drawAppUsers(from,to);
                        drawTopAppUsers(from,to);
                        drawAPIResponseFaultCountTable(from,to);
                        drawAppAPICallType(from,to); 
                        // drawAPIResponseFaultCountChart(from,to);
                      //  drawGraphAPIUsage(from,to);
                        drawRegisteredUserCountByApplications(from,to);
                        drawTopUsersGraph(from,to);

                       

                        
                    });
                    var width = $("#rangeSliderWrapper").width();
                    $("#rangeSliderWrapper").affix();
                    $("#rangeSliderWrapper").width(width);

                }
                else{
                    $('#middle').html("");
                    $('#middle').append($('<div class="errorWrapper"><span class="label top-level-warning"><i class="icon-warning-sign icon-white"></i>'
                        +i18n.t('errorMsgs.checkBAMConnectivity')+'</span><br/><img src="../themes/default/templates/stats/images/statsThumb.png" alt="Smiley face"></div>'));
                }


            }
            else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content:json.message,type:"error"});
                }
            }
            t_on['apiChart'] = 0;
            t_on['userChart'] = 1;
        }, "json");

});


var drawTopUsersGraph = function(from,to){

    var fromDate = from;
    var toDate = to;
    jagg.post("/site/blocks/stats/appAPICount/ajax/stats.jag", { action:"getTopAppUsers",currentLocation:currentLocation,fromDate:fromDate,toDate:toDate  },
        function (json) {
            if (!json.error) {
                var lentth1 = json.usage.length;
                $('#ok1').empty();
                for(var k=0 ; k<lentth1 ;k++){

                     $('#ok1').append($('<div class="well"><div class="row-fluid"> <h3>Aplication Name:  '+json.usage[k].appName+'</h3><div class="span6" style="height:350px; width :350px"><div id="userChart'+(k+1)+'" style="height:350px;"><div class="progress progress-striped active"><div class="bar" style="width: 10%;"></div></div></div> </div> <div class="span6"> <table class="table graphTable" id="userTable'+(k+1)+'" style="display:none;"><tr> <th>'+ i18n.t("apiName")+'</th><th>'+ i18n.t("noOfAPICalls")+'</th></tr> </table> </div></div></div>'));
             } for(var k=0 ; k<lentth1 ;k++){
                var length = json.usage[k].userCountArray.length,data = [];

                $('#userTable'+(k+1)).find("tr:gt(0)").remove();
                $('#userChart'+(k+1)).empty();
                for (var i = 0; i < length; i++) {
                    data[i] = [ json.usage[k].userCountArray[i].user, parseInt( json.usage[k].userCountArray[i].count )];
                    $('#userTable'+(k+1)).append($('<tr><td>' +  json.usage[k].userCountArray[i].user + '</td><td class="tdNumberCell">' +json.usage[k].userCountArray[i].count + '</td></tr>'));

                }

                if (length > 0) {
                    $('#userTable'+(k+1)).show();
                    require([
                        // Require the basic chart class
                        "dojox/charting/Chart",

                        // Require the theme of our choosing
                        "dojox/charting/themes/Claro",

                        // Charting plugins:

                        //  We want to plot a Pie chart
                        "dojox/charting/plot2d/Pie",

                        // Retrieve the Legend, Tooltip, and MoveSlice classes  
                        "dojox/charting/action2d/Tooltip",
                        "dojox/charting/action2d/MoveSlice",

                        //  We want to use Markers
                        "dojox/charting/plot2d/Markers",

                        //  We'll use default x/y axes
                        "dojox/charting/axis2d/Default"
                    ], function(Chart, theme, Pie, Tooltip, MoveSlice) {                                             

                        // Create the chart within it's "holding" node
                        var userUsageChart = new Chart("userChart"+(k+1));

                        // Set the theme
                        userUsageChart.setTheme(theme);

                        // Add the only/default plot
                        userUsageChart.addPlot("default", {
                            type: Pie,
                            markers: true,
                            radius:130
                        });

                        // Add axes
                        userUsageChart.addAxis("x");
                        userUsageChart.addAxis("y", { min: 5000, max: 30000, vertical: true, fixLower: "major", fixUpper: "major" });

                        // Define the data
                        var chartData; var color = -1;
                        require(["dojo/_base/array"], function(array){
                            chartData= array.map(data, function(d){
                                color++;
                                return {y: d[1], tooltip: "<b>"+d[0]+"</b><br /><i>"+d[1]+" call(s)</i>",fill:chartColorScheme1[color]};

                            });
                        });

                        userUsageChart.addSeries("API Usage",chartData);
                      //  userUsageChart.addSeries("API Usage", [1, 2, 0.5, 1.5, 1, 2.8, 0.4])
                        //.addSeries("Series B", [2.6, 1.8, 2, 1, 1.4, 0.7, 2])
                        //.addSeries("Series C", [6.3, 1.8, 3, 0.5, 4.4, 2.7, 2])


                        // Create the tooltip
                        var tip = new Tooltip(userUsageChart,"default");

                        // Create the slice mover
                        var mag = new MoveSlice(userUsageChart,"default");

                        // Render the chart!
                        userUsageChart.render();



                    });

                } else {
                    // $('#userTable').hide();
                    // $('#userChart').css("fontSize", 14);
                    // $('#userChart').append($('<span class="label label-info">'+i18n.t('errorMsgs.noData')+'</span>'));
                }
            // });

            }
            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content:json.message,type:"error"});
                }
            }
            t_on['userChart'] = 0;
        }, "json");
}







var drawTopAppUsers = function(from,to){

    var fromDate = from;
    var toDate = to;
    jagg.post("/site/blocks/stats/appAPICount/ajax/stats.jag", { action:"getTopAppUsers",currentLocation:currentLocation,fromDate:fromDate,toDate:toDate  },
        function (json) {
            if (!json.error) {
                //last access table remove ??
                $('#topAppUsersTable').find("tr:gt(0)").remove();
                var length = json.usage.length;
                $('#topAppUsersTable').show();
                for (var i = 0; i < json.usage.length; i++) {
                    $('#topAppUsersTable').append($('<tr><td>' + json.usage[i].appName + '</td><td>' + json.usage[i].userCountArray[0].user + '</td><td class="tdNumberCell">' + json.usage[i].userCountArray[0].count + '</td></tr>'));
                     if(json.usage[i].userCountArray.length > 1){
                        for (var j =1 ; j < json.usage[i].userCountArray.length; j++) {
                             $('#topAppUsersTable').append($('<tr><td>' + "" + '</td><td>' + json.usage[i].userCountArray[j].user + '</td><td class="tdNumberCell">' + json.usage[i].userCountArray[j].count + '</td></tr>'));
                   
                        } 
                    }
                }
                if (length == 0) {
                    $('#topAppUsersTable').hide();
                    $('#tempLoadingSpace').html('');
                    $('#tempLoadingSpace').append($('<span class="label label-info">'+i18n.t('errorMsgs.noData')+'</span>'));

                }else{
                    $('#tempLoadingSpace').hide();
                }

            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content:json.message,type:"error"});
                }
            }
            t_on['tempLoadingSpace'] = 0;
        }, "json");
}









var drawRegisteredUserCountByApplications = function(from,to){
  var fromDate = from;
    var toDate = to;
    jagg.post("/site/blocks/stats/appAPICount/ajax/stats.jag", { action:"getPerAppSubscribers",currentLocation:currentLocation,fromDate:fromDate,toDate:toDate  },
        function (json) {
            if (!json.error) {
                var length = json.usage.length,data = [];
                if (length > 0) {
                    $('#subsChart').empty();
                    var easyPieChartDefaults = {
                        animate: 2000,
                        scaleColor: false,
                        lineWidth: 12,
                        lineCap: 'square',
                        size: 100,
                        trackColor: '#e5e5e5'
                    }
                    var allSubscriptionCount = 0;
                    for (var i = 0; i < length; i++) {
                        allSubscriptionCount+=json.usage[i].userArray.length;
                    }
              
                    for (var i = 0; i < length; i++) {
                        var k = i+1;
                        var chartId = "easyPieChart"+k;
                        var chartVal = Math.round((json.usage[i].userArray.length/ allSubscriptionCount)*100);
                        $('#subsChart').append("<div class='span2 easyPieWrapper'>" +
                            "<div style='color:"+chartColorScheme1[i]+"' data-percent='"+chartVal+"' id='"+chartId+"'>"+chartVal+"% </div>" +
                            "<b>"+json.usage[i].appName+"</b><br /><i>"+json.usage[i].userArray.length+" User(s)</i></div>");
                      
                        $('#'+chartId+'').easyPieChart({
                            animate: 2000,
                            scaleColor: false,
                            lineWidth: 12,
                            lineCap: 'square',
                            size: 110,
                            trackColor: '#e5e5e5',
                            barColor: chartColorScheme1[i]
                        });
                    }
                }



            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content:json.message,type:"error"});
                }
            }
            t_on['subsChart'] = 0;
        }, "json");
}


var drawGraphAPIUsage = function(from,to){

    var fromDate = from;
    var toDate = to;
    jagg.post("/site/blocks/stats/appAPICount/ajax/stats.jag", { action:"getProviderAPIUsage",currentLocation:currentLocation,fromDate:fromDate,toDate:toDate  },
        function (json) {
            if (!json.error) {
                var lentth1 = json.usage.length;
                $('#ok').empty();
                for(var k=0 ; k<lentth1 ;k++){

                     $('#ok').append($('<div class="well"><div class="row-fluid"> <h3>Aplication Name:  '+json.usage[k].appName+'</h3><div class="span6" style="height:350px; width :350px"><div id="apiChart'+(k+1)+'" style="height:350px;"><div class="progress progress-striped active"><div class="bar" style="width: 10%;"></div></div></div> </div> <div class="span6"> <table class="table graphTable" id="apiTable'+(k+1)+'" style="display:none;"><tr> <th>'+ i18n.t("apiName")+'</th><th>'+ i18n.t("noOfAPICalls")+'</th></tr> </table> </div></div></div>'));
             } for(var k=0 ; k<lentth1 ;k++){
                var length = json.usage[k].apiCountArray.length,data = [];

                $('#apiTable'+(k+1)).find("tr:gt(0)").remove();
                $('#apiChart'+(k+1)).empty();
                for (var i = 0; i < length; i++) {
                    data[i] = [ json.usage[k].apiCountArray[i].apiName, parseInt( json.usage[k].apiCountArray[i].count )];
                    $('#apiTable'+(k+1)).append($('<tr><td>' +  json.usage[k].apiCountArray[i].apiName + '</td><td class="tdNumberCell">' +json.usage[k].apiCountArray[i].count + '</td></tr>'));

                }

                if (length > 0) {
                    $('#apiTable'+(k+1)).show();
                    require([
                        // Require the basic chart class
                        "dojox/charting/Chart",

                        // Require the theme of our choosing
                        "dojox/charting/themes/Claro",

                        // Charting plugins:

                        //  We want to plot a Pie chart
                        "dojox/charting/plot2d/Pie",

                        // Retrieve the Legend, Tooltip, and MoveSlice classes  
                        "dojox/charting/action2d/Tooltip",
                        "dojox/charting/action2d/MoveSlice",

                        //  We want to use Markers
                        "dojox/charting/plot2d/Markers",

                        //  We'll use default x/y axes
                        "dojox/charting/axis2d/Default"
                    ], function(Chart, theme, Pie, Tooltip, MoveSlice) {                                             

                        // Create the chart within it's "holding" node
                        var apiUsageChart = new Chart("apiChart"+(k+1));

                        // Set the theme
                        apiUsageChart.setTheme(theme);

                        // Add the only/default plot
                        apiUsageChart.addPlot("default", {
                            type: Pie,
                            markers: true,
                            radius:130
                        });

                        // Add axes
                        apiUsageChart.addAxis("x");
                        apiUsageChart.addAxis("y", { min: 5000, max: 30000, vertical: true, fixLower: "major", fixUpper: "major" });

                        // Define the data
                        var chartData; var color = -1;
                        require(["dojo/_base/array"], function(array){
                            chartData= array.map(data, function(d){
                                color++;
                                return {y: d[1], tooltip: "<b>"+d[0]+"</b><br /><i>"+d[1]+" call(s)</i>",fill:chartColorScheme1[color]};

                            });
                        });

                        apiUsageChart.addSeries("API Usage",chartData);
                      //  apiUsageChart.addSeries("API Usage", [1, 2, 0.5, 1.5, 1, 2.8, 0.4])
                        //.addSeries("Series B", [2.6, 1.8, 2, 1, 1.4, 0.7, 2])
                        //.addSeries("Series C", [6.3, 1.8, 3, 0.5, 4.4, 2.7, 2])


                        // Create the tooltip
                        var tip = new Tooltip(apiUsageChart,"default");

                        // Create the slice mover
                        var mag = new MoveSlice(apiUsageChart,"default");

                        // Render the chart!
                        apiUsageChart.render();



                    });

                } else {
                    // $('#apiTable').hide();
                    // $('#apiChart').css("fontSize", 14);
                    // $('#apiChart').append($('<span class="label label-info">'+i18n.t('errorMsgs.noData')+'</span>'));
                }
            // });

            }
            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content:json.message,type:"error"});
                }
            }
            t_on['apiChart'] = 0;
        }, "json");
}







var drawAPIResponseFaultCountTable = function(from,to){

    var fromDate = from;
    var toDate = to;
    jagg.post("/site/blocks/stats/appAPICount/ajax/stats.jag", { action:"getPerAppAPIFaultCount",currentLocation:currentLocation,fromDate:fromDate,toDate:toDate  },
        function (json) {
            if (!json.error) {
                $('#PerAppAPIFaultCountTable').find("tr:gt(0)").remove();
                var length = json.usage.length;
                $('#PerAppAPIFaultCountTable').show();
                for (var i = 0; i < json.usage.length; i++) {
                    var k = json.usage[i].apiCountArray[0].apiName; 
                    $('#PerAppAPIFaultCountTable').append($('<tr><td>' + json.usage[i].appName + '</td><td>' +json.usage[i].apiCountArray[0].apiName + '</td><td class="tdNumberCell">' + json.usage[i].apiCountArray[0].count + '</td></tr>'));
                     if(json.usage[i].apiCountArray.length > 1){
                     for (var j =1 ; j < json.usage[i].apiCountArray.length; j++) {
                         $('#PerAppAPIFaultCountTable').append($('<tr><td>' + "" + '</td><td>' + json.usage[i].apiCountArray[j].apiName + '</td><td class="tdNumberCell">' + json.usage[i].apiCountArray[j].count + '</td></tr>'));
                } }
                }
                if (length == 0) {
                    $('#PerAppAPIFaultCountTable').hide();
                    $('#tempLoadingSpace').html('');
                    $('#tempLoadingSpace').append($('<span class="label label-info">'+i18n.t('errorMsgs.noData')+'</span>'));

                }else{
                    $('#tempLoadingSpace').hide();
                }

            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content:json.message,type:"error"});
                }
            }
            t_on['tempLoadingSpace'] = 0;
        }, "json");
}




var drawAppAPICallType = function(from,to){

    var fromDate = from;
    var toDate = to;
    jagg.post("/site/blocks/stats/appAPICount/ajax/stats.jag", { action:"getAppApiCallType",currentLocation:currentLocation,fromDate:fromDate,toDate:toDate  },
        function (json) {
            if (!json.error) {
                $('#AppApiCallTypeTable').find("tr:gt(0)").remove();
                var length = json.usage.length;
                $('#AppApiCallTypeTable').show();
              for (var i = 0; i < json.usage.length; i++) {
                    $('#AppApiCallTypeTable').append($('<tr><td>' + json.usage[i].appName + '</td><td>' + json.usage[i].apiCallTypeArray[0].apiName + '</td><td class="tdNumberCell">' + json.usage[i].apiCallTypeArray[0].callType[0] + '</td></tr>'));
                    if(json.usage[i].apiCallTypeArray[0].callType.length > 1){
                        for(var k =1 ; k < json.usage[i].apiCallTypeArray[0].callType.length ; k++){
                             $('#AppApiCallTypeTable').append($('<tr><td>' + "" + '</td><td>' +"" + '</td><td class="tdNumberCell">' + json.usage[i].apiCallTypeArray[0].callType[k] + '</td></tr>'));
                         }
                     }
                    if(json.usage[i].apiCallTypeArray.length > 1){
                        for(var j = 1 ; j< json.usage[i].apiCallTypeArray.length ; j++){
                            $('#AppApiCallTypeTable').append($('<tr><td>' + "" + '</td><td>' +json.usage[i].apiCallTypeArray[j].apiName + '</td><td class="tdNumberCell">' + json.usage[i].apiCallTypeArray[j].callType[0] + '</td></tr>'));
                            if(json.usage[i].apiCallTypeArray[j].callType.length > 1){
                                for(var k =1 ; k < json.usage[i].apiCallTypeArray[j].callType.length ; k++){
                                    $('#AppApiCallTypeTable').append($('<tr><td>' + "" + '</td><td>' +"" + '</td><td class="tdNumberCell">' + json.usage[i].apiCallTypeArray[j].callType[k] + '</td></tr>'));
                                }
                            }
                        }
                    }
                }
                if (length == 0) {
                    $('#AppApiCallTypeTable').hide();
                    $('#tempLoadingSpace').html('');
                    $('#tempLoadingSpace').append($('<span class="label label-info">'+i18n.t('errorMsgs.noData')+'</span>'));

                }else{
                    $('#tempLoadingSpace').hide();
                }

            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content:json.message,type:"error"});
                }
            }
            t_on['tempLoadingSpace'] = 0;
        }, "json");
}









var drawAppAPIUsage = function(from,to){

    var fromDate = from;
    var toDate = to;
    jagg.post("/site/blocks/stats/appAPICount/ajax/stats.jag", { action:"getProviderAPIUsage",currentLocation:currentLocation,fromDate:fromDate,toDate:toDate  },
        function (json) {
            if (!json.error) {
                $('#lastAccessTable').find("tr:gt(0)").remove();
                var length = json.usage.length;
                $('#lastAccessTable').show();
                for (var i = 0; i < json.usage.length; i++) {
                    var k = json.usage[i].apiCountArray[0].apiName; 
                    $('#lastAccessTable').append($('<tr><td>' + json.usage[i].appName + '</td><td>' +json.usage[i].apiCountArray[0].apiName + '</td><td class="tdNumberCell">' + json.usage[i].apiCountArray[0].count + '</td></tr>'));
                     if(json.usage[i].apiCountArray.length > 1){
                     for (var j =1 ; j < json.usage[i].apiCountArray.length; j++) {
                         $('#lastAccessTable').append($('<tr><td>' + "" + '</td><td>' + json.usage[i].apiCountArray[j].apiName + '</td><td class="tdNumberCell">' + json.usage[i].apiCountArray[j].count + '</td></tr>'));
                } }
                }
                if (length == 0) {
                    $('#lastAccessTable').hide();
                    $('#tempLoadingSpace').html('');
                    $('#tempLoadingSpace').append($('<span class="label label-info">'+i18n.t('errorMsgs.noData')+'</span>'));

                }else{
                    $('#tempLoadingSpace').hide();
                }

            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content:json.message,type:"error"});
                }
            }
            t_on['tempLoadingSpace'] = 0;
        }, "json");
}






var drawAppUsers = function(from,to){
    var fromDate = from;
    var toDate = to;
    jagg.post("/site/blocks/stats/appAPICount/ajax/stats.jag", { action:"getPerAppSubscribers",currentLocation:currentLocation,fromDate:fromDate,toDate:toDate  },
        function (json) {
            if (!json.error) {
                $('#appUsersTable').find("tr:gt(0)").remove();
                var length = json.usage.length;
                $('#appUsersTable').show();
                for (var i = 0; i < json.usage.length; i++) {
                    $('#appUsersTable').append($('<tr><td>' + json.usage[i].appName + '</td><td>' + json.usage[i].userArray.length + '</td></tr>'));
                   
                }
                if (length == 0) {
                    alert("drawAppUsers length 0");
                    $('#appUsersTable').hide();
                    $('#tempLoadingSpace').html('');
                    $('#tempLoadingSpace').append($('<span class="label label-info">'+i18n.t('errorMsgs.noData')+'</span>'));

                }else{
                    $('#tempLoadingSpace').hide();
                }

            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content:json.message,type:"error"});
                }
            }
            t_on['tempLoadingSpace'] = 0;
        }, "json");
}





var convertTimeString = function(date){
    var d = new Date(date);
    var formattedDate = d.getFullYear() + "-" + formatTimeChunk((d.getMonth()+1)) + "-" + formatTimeChunk(d.getDate());
    return formattedDate;
};



var convertTimeStringPlusDay = function(date){
    var d = new Date(date);
    var formattedDate = d.getFullYear() + "-" + formatTimeChunk((d.getMonth()+1)) + "-" + formatTimeChunk(d.getDate()+1);
    return formattedDate;
};

var formatTimeChunk = function (t){
    if (t<10){
        t="0" + t;
    }
    return t;
};