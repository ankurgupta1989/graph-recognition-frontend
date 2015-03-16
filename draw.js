var points;
var x_last;
var y_last;
var c;
var ctx;
var first;
var canvas_width;
var canvas_length;
var cnt;  



function trackPoints() {
    var x = event.pageX;
    var y = event.pageY;
    
    if(first==0){
        x_last = x;
        y_last = y;
        first=1;
        cnt = 0;
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
        cnt += 1;
        point = ',{ "X":' + String(x)  + ','+ '"Y":' + String(y)  + '}';
    }
    $("#log").append(point); 
    $("#ankur").append(' ' + String(x) + ' ' + String(y));
}


function canvas_arrow(context, fromx, fromy, tox, toy){
    var headlen = 20;   // length of head in pixels
    var angle = Math.atan2(toy-fromy,tox-fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
    context.moveTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
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
                identifier = cur.identifier;
                if (identifier == "circle") {
                    center = cur.center;
                    radius = cur.radius;
                    ctx.beginPath();
                    ctx.arc(center.X, center.Y, radius, 0, 2*Math.PI);
                    ctx.stroke();
                    ctx.closePath();
                }
                else if (identifier == "line") {
                    ctx.beginPath();
                    ctx.moveTo(cur.startPoint.X, cur.startPoint.Y);
                    ctx.lineTo(cur.endPoint.X, cur.endPoint.Y);
                    ctx.stroke();
                    ctx.closePath();

                }
                else if (identifier == "arrow") {
                    ctx.beginPath();
                    canvas_arrow(ctx, cur.startPoint.X, cur.startPoint.Y, cur.endPoint.X, cur.endPoint.Y);
                    ctx.stroke();
                    ctx.closePath();
                }
                else if (identifier == "label" ) {
                    ctx.beginPath();
                    ctx.font = "25px Georgia";
                    bounding_box = cur.boundingBox;
                    bottom_left = bounding_box.bottomLeft;
                    top_right = bounding_box.topRight;
                    x_median = (bottom_left.X + top_right.X)/2;
                    y_median = (bottom_left.Y + top_right.Y)/2;
                    width = top_right.X - bottom_left.X;
                    ctx.fillText(cur.label, x_median, y_median, width);
                    ctx.closePath();
                }
                else if (identifier == "number" ) {
                    ctx.beginPath();
                    ctx.font = "25px Georgia";
                    bounding_box = cur.boundingBox;
                    bottom_left = bounding_box.bottomLeft;
                    top_right = bounding_box.topRight;
                    x_median = (bottom_left.X + top_right.X)/2;
                    y_median = (bottom_left.Y + top_right.Y)/2;
                    width = top_right.X - bottom_left.X;
                    ctx.fillText(cur.number, x_median, y_median, width);
                    ctx.closePath();
                }
            }
            // alert(' data ' + JSON.stringify(data) + ' textStatus ' + textStatus + ' xhr ' + xhr);
        }
    });
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
        $("#run_algorithms").show();
    	ctx.clearRect(0, 0, c.width, c.height);
        refreshBackend();
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
        $("#submitGraph").hide();
    });





    $("#runAlgorithm").click(function (e) {
        var name = $("#name").val();
        var source = $("#source").val();

        my_url = "http://localhost:9080/run_algorithm";

        $("#ankur").html("Running runAlgorithm with name " + name + " and source " + source);


        var to_be_posted = '{' +
                                '"algorithmName":"' + name + '",' +
                                '"arguments":' + 
                                    '{' +
                                        '"source":"' + source + '"' + 
                                    '}' +
                            '}'; 

        $.ajax({
            url: my_url,
            type: 'POST',
            async: false,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: to_be_posted,
            dataType: 'text'
        }).done(function(data, textStatus, xhr) {
                $("#ankur").html("Updating the results in text box");
                $("#show_results").show();
                $("#show_results").html('<h3>' + data + '</h3>');
                $("#ankur").html(data);
        });

    });


    $("#ankur").html('Starting the recognition ');



	$("#target").mouseup(function (e) {    
		$("#divmeta").show();

		var text = $("#log").text();
		text = text + "]";
		$("#log").html(text);
    	$("#target").unbind("mousemove", trackPoints);
    	$("#ankur").html(text);


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
    	$("#target").bind("mousemove", trackPoints);
    });

});






