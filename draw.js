var points;
var arr;
var x_last;
var y_last;
var c;
var ctx;
var first;
var dbl_x;
var dbl_y;
var canvas_width
var canvas_length 



function trackPoints() {
    var x = event.pageX;
    var y = event.pageY;
    
    if(first==0){
        x_last = x;
        y_last = y;
        first=1;
        point = '{ "X":' + String(x)  + ','+ '"Y":' + String(y)  + '}';
    }
    else{
        ctx.beginPath();
        ctx.moveTo(x_last,y_last);
        ctx.lineTo(x,y);
        ctx.stroke();
        ctx.closePath();
        x_last = x;
        y_last = y;
        point = ',{ "X":' + String(x)  + ','+ '"Y":' + String(y)  + '}';
    }
    $("#log").append(point);    
    arr.push([x, y]);
}


function submitLabel() {

    // Submitting the label.
    labelVal = $("#inputlabel").val();
    $("#ankur").html("Label is " + labelVal);
    len = arr.length;
    firstPoint = Math.floor(len/4);
    ctx.beginPath();
    ctx.font = "20px Georgia";
    ctx.fillText(labelVal, arr[firstPoint][0], arr[firstPoint][1]);
    ctx.closePath();

    my_data = '{' +
                '"point":{' +
                    '"X":' + x_last + ',' +
                    '"Y":' + y_last +
                '},' +
                '"externalLabel":"' + labelVal + '"' +
              '}';

    $.ajax({url:"http://localhost:9080/add_external_label",
        type: 'POST',
        async: false,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        data: my_data,
        success:function(result) {
            // $("#ankur").html("Successfully posted the data");
        }
    });

}

function submitValue() {
    // Submitting the number.
    numberVal = $("#inputnumber").val();
    $("#ankur").html("Value is " + numberVal);
    len = arr.length;
    secondPoint = Math.floor(len/2);
    ctx.beginPath();
    ctx.font = "20px Georgia";
    ctx.fillText(numberVal, arr[secondPoint][0], arr[secondPoint][1]);
    ctx.closePath();

    my_data = '{' +
                '"point":{' +
                    '"X":' + x_last  + ',' +
                    '"Y":' + y_last +
                '},' +
                '"value":' + numberVal +
              '}';

    $.ajax({url:"http://localhost:9080/add_value",
        type: 'POST',
        async: false,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        data: my_data
    }).done(function(data) { 
    });


}


function redraw() {
    c.width = c.width;
    $.ajax({url:"http://localhost:9080/get_all_shapes",
        type: 'POST',
        async: false,
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        data: '',
        success: function(data, textStatus, xhr) {
            len = data.length;

            for (i=0; i < len; i++) {
                cur = data[i];
                myLabel = cur.label;
                myValue = cur.value;
                circleOrLine = cur.circleOrLine;
                if (circleOrLine) {
                    circle = cur.circle;
                    center = circle.center;
                    radius = circle.radius;
                    ctx.beginPath();
                    ctx.arc(center.X, center.Y, radius, 0, 2*Math.PI);
                    ctx.stroke();
                    ctx.closePath();

                    if (myLabel != null) { 
                        ctx.beginPath();
                        ctx.font = "15px Georgia";
                        ctx.fillText(myLabel, center.X - radius/4, center.Y);
                        ctx.closePath();
                    }

                    if (myValue != null) {
                        ctx.beginPath();
                        ctx.font = "15px Georgia";
                        ctx.fillText(myValue, center.X + radius/4, center.Y);
                        ctx.closePath();
                    }
                }
                else {
                    line = cur.line;
                    ctx.beginPath();
                    ctx.moveTo(line.start.X, line.start.Y);
                    ctx.lineTo(line.end.X, line.end.Y);
                    ctx.stroke();
                    ctx.closePath();

                    midX = (line.start.X + line.end.X)/2;
                    midY = (line.start.Y + line.end.Y)/2;

                    if (myLabel != null) {
                        ctx.beginPath();
                        ctx.font = "15px Georgia";
                        ctx.fillText(myLabel, midX, midY + 15);
                        ctx.closePath();
                    }

                    if (myValue != null) {
                        ctx.beginPath();
                        ctx.font = "15px Georgia";
                        ctx.fillText(myValue, midX, midY - 15);
                        ctx.closePath();
                    }

                }
            }
            // alert(' data ' + JSON.stringify(data) + ' textStatus ' + textStatus + ' xhr ' + xhr);
        }
    });

    // $.getJSON( 'http://localhost:9080/get_all_shapes' , function(data) {
    //     alert(data);
    // });
    // ctx.clearRect(0, 0, canvas_width, canvas_length);
}

function refreshBackend() {

    $.ajax({url:"http://localhost:9080/start",
        type: 'POST',
        async: false,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        data: '',
        success:function(result) {
            $("#ankur").html("Successfully posted the data");
        }
    }); 

}


$(document).ready(function() {
	c = document.getElementById("myCanvas");
    canvas_width = c.width
    canvas_length = c.length

    ctx = c.getContext("2d");
    ctx.font = "20px Georgia";
    $("#run_algorithms").hide();


    refreshBackend();



    $("#clear").click(function (e){
    	$("#divnumber").hide();
    	$("#divlabel").hide();
        $("#run_algorithms").show();
    	ctx.clearRect(0, 0, c.width, c.height);
        refreshBackend();
    	$("#log").html("");
    });

    



    $("#finishDrawing").click(function (e){
    	$.ajax({url:"http://localhost:9080/finish",
    		type: 'POST',
            async: false,
            dataType: 'json',
    		headers: {
    			'Content-Type': 'application/json',
    			'Accept': 'application/json'
    		},
    		data: '',
    		success:function(result) {
      			$("#ankur").html("Successfully posted the data");
    		}
    	});
        redraw();
        $("#run_algorithms").show();
        $("#submitMeta").hide();
        $("#submitGraph").hide();
    });



    $("#submitMeta").click(function (e){
        submitValue();
        submitLabel();
        redraw();
    });


    $("#runAlgorithm").click(function (e) {
        var name = $("#name").val();
        var source = $("#source").val();

        my_url = "http://localhost:9080/" + name;

        $("#ankur").html("Running runAlgorithm with name " + name + " and source " + source);


        $.ajax({
            url: my_url,
            type: 'POST',
            async: false,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: source,
            dataType: 'text'
        }).done(function(data, textStatus, xhr) {
                // alert(textStatus);
                $("#ankur").html("Updating the results in text box");
                $("#show_results").show();
                $("#show_results").html(data);
                // $("#ankur").html(data);
        });

    });


    $("#ankur").html('Starting the recognition ');



	$("#target").mouseup(function (e) {    
		$("#divmeta").show();

		var text = $("#log").text();
		text = text + "]";
		$("#log").html(text);
    	$("#target").unbind("mousemove", trackPoints);
    	$("#ankur").html('Array loaded Mouse is up');

    	my_url = "http://localhost:9080/add_shape";

    	$.ajax({url:"http://localhost:9080/add_shape",
    		type: 'POST',
            async: false,
    		headers: {
    			'Content-Type': 'application/json',
    			'Accept': 'application/json'
    		},
    		data: text,
    		success:function(result) {
      			$("#ankur").html("Successfully posted the data");
    		}
    	});
        redraw();
	});



	$("#target").mousedown(function (e) {
		$("#divmeta").hide();

		first = 0;
		$("#log").html('[');
		$("#ankur").html('Array loaded Mouse is down');
		arr = []
    	$("#target").bind("mousemove", trackPoints);
    });

});






