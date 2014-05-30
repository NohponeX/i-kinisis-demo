function map_start(){
    $( "#ask_parking" ).hide();
    $( "#instructions" ).hide();
    $( "#do_parking" ).hide();
    loadAllImages( map_start_ready );
}
function map_start_ready(){
    var MAP_WIDTH = $('#map').width();
    var MAP_HEIGHT = 400; 

	var map = new Kinetic.Stage({
        container : 'map',
        width : MAP_WIDTH,
        height : MAP_HEIGHT
    });

    var background = new Kinetic.Layer();
        
    var background_rect = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: map.getWidth(),
        height: map.getHeight(),
        fill: '#ECE8DE'
    });
    background.add( background_rect );
    
    map.add( background );

    function translate_x( x ){
        x = x;
        var length = ( MAP_WIDTH-50-80 );
        return 80 + length* (x /WIDTH )
    }

    function add_road( y, height, name ){
        var road = new Kinetic.Group();

        var road_background = new Kinetic.Rect({
            x: 0,
            y: y,
            width: MAP_WIDTH,
            height: height,
            fill:'#F5CB5B'
        });
        var road_line_middle = new Kinetic.Line({
             points: [0, y+height/2, MAP_WIDTH, y+height/2],
             stroke: '#EEEEEE',
             strokeWidth: 1,
             opacity:0.4,
             dash: [15, 10]
        });
        var road_name = new Kinetic.Text({
            x: MAP_WIDTH/2-name.length*5,
            y: y + height/4,
            text: name,
            fontSize: height/2,
            fontFamily: 'Arial',
            fill: '#222',
            align: 'center'
        });

        road.add( road_background );
        road.add( road_line_middle );
        road.add( road_name );
        return road;
    }

    function add_road_vertical( x, height, name ){
        var road = new Kinetic.Group();

        var road_background = new Kinetic.Rect({
            x: x,
            y: 0,
            width: height,
            height: MAP_HEIGHT,
            fill:'#F5CB5B'
        });
         var road_line_middle = new Kinetic.Line({
             points: [x+height/2, 0, x+height/2, MAP_HEIGHT],
             stroke: '#EEEEEE',
             strokeWidth: 1,
             opacity:0.4,
             dash: [15, 10]
        });
        var road_name = new Kinetic.Text({
            x: x + height/2+height/4,
            y: MAP_HEIGHT/2 + 60,
            rotation : 90,
            text: name,
            fontSize: height/2,
            fontFamily: 'Arial',
            fill: '#222',
            align: 'left'
        });

        road.add( road_background );
        road.add( road_line_middle );
        road.add( road_name );
        return road;
    }
    var road_center_height = MAP_HEIGHT*0.5 - 15 ;

    var road_top = add_road( MAP_HEIGHT*0.1 - 15, 30, 'Top Street' );

    var road_center = add_road( road_center_height, 30, 'Main Street' );

    var road_bottom = add_road( MAP_HEIGHT*0.9 - 15, 30, 'Bottom Street' );

    var road_left = add_road_vertical( 50, 30, 'Left Street' );

    var road_right = add_road_vertical( MAP_WIDTH-50, 30, 'Right Street' );

    var roads = new Kinetic.Layer();

    roads.add( road_left );
    roads.add( road_right );
    roads.add( road_top );
    roads.add( road_center );
    roads.add( road_bottom );

    map.add( roads );
    roads.draw();

    var markers = new Kinetic.Layer();

    var marker_me = new Kinetic.Image({
        x : 200,
        y : road_center_height,
        image : imgs[img.marker_me],
        width : imgs[img.marker_me].width,
        height : imgs[img.marker_me].height
    }); 
    markers.add( marker_me );

    var destination_position = {
        x : translate_x( antonakis_car.getX()) ,
        y : road_center_height,
    }
    var marker_destination = new Kinetic.Image({
        x : destination_position.x,
        y : destination_position.y,
        image : imgs[img.marker_destination],
        width : imgs[img.marker_destination].width,
        height : imgs[img.marker_destination].height
    }); 
    marker_destination.hide();
    markers.add( marker_destination );

    map.add( markers );

    

    CONTROL_TARGET_ON_MOVE = function(){
        //var x = CONTROL_TARGET.getX()-CONTROL_TARGET.getWidth()/2;
        //var length = ( MAP_WIDTH-50-80 );

        marker_me.setX( translate_x( CONTROL_TARGET.getX() ) );  
        markers.draw();
        if( destination_set && !arrived ){
            draw_instructions_arrow();
        }
    } 
    CONTROL_TARGET_ON_MOVE();

    var destination_set = false;
    $(map.getContent()).on('click touch', function(){
        if( destination_set ){
            return;
        }
        destination_set = true;
        marker_destination.show();
        markers.draw();
        $( "#ask_parking" ).show();
        $( "#instructions" ).show();
        draw_instructions_arrow();
    });
    $( "#parking_yes" ).on('click touch', function(){
        alert( 'yes');
        var mark_parking = new Kinetic.Image({
            x : destination_position.x,
            y : destination_position.y + 10 + imgs[img.parking].height,
            image : imgs[img.parking],
            width : imgs[img.parking].width,
            height : imgs[img.parking].height
        }); 
        markers.add( mark_parking );
        markers.draw();

    });
    var arrived = false;
    var instructions_layer = new Kinetic.Layer(); 

    var instructions_arrow = new Kinetic.Image({
        x : CONTROL_TARGET.getX() + 20,
        y : road_center_height + 15 - imgs[img.arrow].height/2,
        image : imgs[img.arrow],
        width : imgs[img.arrow].width,
        height : imgs[img.arrow].height
    }); 
    instructions_layer.hide();
    instructions_layer.add( instructions_arrow );
    map.add( instructions_layer );

    function draw_instructions_arrow(){
        if( arrived ){
            instructions_layer.hide();
            return;
        }
        var x  =translate_x(CONTROL_TARGET.getX()) ;
        var distance = Math.abs( x - destination_position.x );
        if( distance <= 10 ){
            arrived = true;
            //call parking
            instructions_layer.hide();
            $( "#do_parking" ).show();
            $( "#ask_parking" ).hide();
            $( "#instructions" ).hide();
        }else{
            instructions_layer.show();
            instructions_arrow.setX( x + 20 );
        }

        instructions_layer.draw();
    }
}