
    var control_states = {
             pavement : 0,
             parking : 1,
             road : 2};
    var img = {
        ouzounis : 0,
        arrow:1,
        car : 2,
        marker: 3,
        marker_me:7,
        marker_destination:8,
        traffic_car:4,
        antonis_car:5
    };

    var imageURLs = [];

    imageURLs[img.ouzounis] = 'images/zounis-label-sm.png';
    imageURLs[img.car] = 'images/car-xss.png';
    imageURLs[img.marker] = 'images/marker-sm.png';
    imageURLs[img.arrow] = 'images/arrow-xs.png';
    var imagesOK = 0;
    var images = 0;
    var imgs = [];

    imageCallbacks = new Array();
    // fully load every image, then call the start function
    loadAllImages(start);

    function loadAllImages(callback) {
        if( images!=0 && imagesOK >= images) {
            callback();
            return;
        }
        imageCallbacks.push( callback );
        if( images>0 ){
            return;
        }
        //for (var i=0; i<imageURLs.length; i++) {
        
        imageURLs.forEach(function(im, index) {
            ++images;
            var t_image = new Image();
            imgs[index] = t_image;
            t_image.onload = function() {
                imagesOK++;
                if (imagesOK == images) {
                    for( var i = 0; i<imageCallbacks.length; i++ ){
                        c = imageCallbacks[i];
                        c();
                    }
                    //callback();
                }
            };
            t_image.onerror = function() {
                //alert("image load failed" + im);
            };
            t_image.crossOrigin = "anonymous";
            t_image.src = im;
        });
    }

    function replaceColor(image, ra, ga, ba, r, g, b) {
        var canvas = document.createElement('canvas');
        canvas.height = image.height;
        canvas.width = image.width;
        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        
        var img_data = context.getImageData(0, 0, image.width, image.height);
        var data = img_data.data;

        for (var i = 0; i < data.length; i += 4) {
            if (data[i] <= 128) {
                data[i] = r;
            }
            if (data[i + 1] <= 128) {
                data[i + 1] = g;
            }
            if (data[i + 2] <= 128) {
                data[i + 2] = b;
            }
        }
        context.putImageData(img_data, 0, 0);
        image_new = new Image();
        image_new.src = canvas.toDataURL();
        return image_new;
    }
    var CONTROL_TARGET;
    var CONTROL_TARGET_ON_MOVE = null;
    var antonakis_car;

    var HEIGHT = 600;
    var WIDTH = $( '#container' ).width(); // 600;  

    var PARKING_AVAILABLE;

    function start() {
        console.log( "START" ); 
        //imgs[img.ouzounis] = replaceColor(imgs[img.ouzounis], 255 * 0.2126, 255 * 0.7152, 255 * 0.722, 105, 50, 170);
        imgs[img.traffic_car] = replaceColor(imgs[img.car], 255 * 0.2126, 255 * 0.7152, 255 * 0.722, 30, 70, 20);
        imgs[img.antonis_car] = replaceColor(imgs[img.car], 255 * 0.2126, 255 * 0.7152, 255 * 0.722, 130, 50, 120);

        imgs[img.marker_me] = replaceColor(imgs[img.marker], 255 * 0.2126, 255 * 0.7152, 255 * 0.722, 246,68,78);

        imgs[img.marker_destination] = replaceColor(imgs[img.marker], 255 * 0.2126, 255 * 0.7152, 255 * 0.722, 80,186,78);

        //var HEIGHT = 600;
        //var WIDTH = $( '#container' ).width(); // 600;
        var LINE_UPPER = 100;
        var LINE_MIDDLE = 180; 
        var LINE_LOWER = 260; 
        var LINE_PARKING_LOWER = 320;
        var LINE_PAVEMENT_LOWER = 360;
        
        
        var PARKING_SPACES = 8;
        var PARKING_WIDTH = Math.floor( WIDTH/ PARKING_SPACES );
        
        var PARKING_CENTERS = new Array( PARKING_SPACES );
        PARKING_AVAILABLE = new Array( PARKING_SPACES );
     //   var CONTROL_TARGET;
        var CONTROL_STATE = control_states.pavement;
        
        
        
        for( var i = 0; i<PARKING_SPACES; ++i ){
            PARKING_CENTERS[ i ] = (i+0.5) * PARKING_WIDTH;
            PARKING_AVAILABLE[ i ] = true;
        }
        var levels = {
            ROAD_LINE_2 : LINE_UPPER + (Math.floor( LINE_MIDDLE - LINE_UPPER) / 2), 
            ROAD        : LINE_MIDDLE + Math.floor( (LINE_LOWER - LINE_MIDDLE) / 2), 
            PARKING     : LINE_LOWER + Math.floor( (LINE_PARKING_LOWER -  LINE_LOWER) / 2),
            PAVEMENT    : LINE_PARKING_LOWER + Math.floor( (LINE_PAVEMENT_LOWER - LINE_PARKING_LOWER) / 2)
        };
        var stage = new Kinetic.Stage({
            container : 'container',
            width : WIDTH,
            height : HEIGHT
        });
        
/*background*/
        var background = new Kinetic.Layer();
        
        var background_rect = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: WIDTH,
            height: HEIGHT,
            fillLinearGradientStartPoint: {x:WIDTH/2, y:0},
            fillLinearGradientEndPoint: {x:WIDTH/2,y:200},
            fillLinearGradientColorStops: [0, '#7EC0EE', 1, '#B2FFFF'],
        });
        background.add( background_rect );
        
        stage.add( background );
        
/*road*/
        var road_layer = new Kinetic.Layer();
        
        var road_background = new Kinetic.Rect({
            x: 0,
            y: LINE_UPPER,
            width: WIDTH,
            height: LINE_LOWER-LINE_UPPER,
            fillLinearGradientStartPoint: {x:WIDTH/2, y:LINE_UPPER},
            fillLinearGradientEndPoint: {x:WIDTH/2,y:LINE_UPPER+50},
            fillLinearGradientColorStops: [0, '#C9CDBF', 1, '#A7AB9D'],
        });
        road_layer.add( road_background );
        
        var road_parking_background = new Kinetic.Rect({
            x: 0,
            y: LINE_LOWER,
            width: WIDTH,
            height: LINE_PARKING_LOWER-LINE_LOWER,
            fillLinearGradientStartPoint: {x:WIDTH/2, y:LINE_PARKING_LOWER},
            fillLinearGradientEndPoint: {x:WIDTH/2,y:LINE_PARKING_LOWER+50},
            fillLinearGradientColorStops: [0, '#A9AD9F', 1, '#979B7D'],
        });
        road_layer.add( road_background );
        road_layer.add( road_parking_background );
          
        var road_line_upper = new Kinetic.Line({
             points: [0, LINE_UPPER, WIDTH, LINE_UPPER],
             stroke: '#FFFFFF',
             strokeWidth: 10
        });
        
        var road_line_lower = new Kinetic.Line({
             points: [0, LINE_LOWER, WIDTH, LINE_LOWER],
             stroke: 'yellow',
             strokeWidth: 10
        });
        
        var road_line_middle = new Kinetic.Line({
             points: [0, LINE_MIDDLE, WIDTH, LINE_MIDDLE],
             stroke: '#EEEEEE',
             strokeWidth: 5,
             dash: [33, 10]
        });
        
        road_layer.add( road_line_upper );
        road_layer.add( road_line_lower );
        road_layer.add( road_line_middle );
/*pavement*/
        var pavement_background = new Kinetic.Rect({
            x: 0,
            y: LINE_PARKING_LOWER,
            width: WIDTH,
            height: HEIGHT-LINE_PARKING_LOWER,
            fill: '#8E9DA5'
        });
        road_layer.add( pavement_background );
        
/*parking*/        
        var road_parking_line = new Kinetic.Line({
             points: [0, LINE_PARKING_LOWER, WIDTH, LINE_PARKING_LOWER],
             stroke: 'yellow',
             strokeWidth: 5,
        });
        road_layer.add( road_parking_line );
        var parking_sign_layer = new Kinetic. Group();
        
        for( var i = 0; i<PARKING_SPACES; ++i ){
            var parking_sign_line = new Kinetic.Line({
                 points: [ i*PARKING_WIDTH, LINE_LOWER, i*PARKING_WIDTH, LINE_PARKING_LOWER],
                 stroke: 'yellow',
                 strokeWidth: 2,
            });
            var parking_sign_text = new Kinetic.Text({
                x: PARKING_CENTERS[ i ] - 10,
                y: LINE_LOWER + (LINE_PARKING_LOWER-LINE_LOWER)/3,
                text: 'P',
                fontSize: 30,
                fontFamily: 'Arial',
                fill: '#FFFFFF',
                align: 'center'
              });
              parking_sign_layer.add( parking_sign_line );
              parking_sign_layer.add( parking_sign_text );
        }
         
        road_layer.add( parking_sign_layer );
        stage.add( road_layer );
      
        var layer = new Kinetic.Layer();

        var ouzounis = new Kinetic.Image({
            x : 200,
            y : Math.floor( levels.PAVEMENT - imgs[img.ouzounis].height/2 ),
            image : imgs[img.ouzounis],
            width : imgs[img.ouzounis].width,
            height : imgs[img.ouzounis].height,
            dragable: true,
        });
        
        layer.add(ouzounis);
        
        var ouzounis_car = new Kinetic.Image({
            x : PARKING_CENTERS[0] - Math.floor( imgs[img.car].width/2 ),
            y : levels.PARKING - Math.floor( imgs[img.car].height/2 ),
            image : imgs[img.car],
            width : imgs[img.car].width,
            height : imgs[img.car].height,
            parking_space : 0
        });
        /*var antonakis_car = new Kinetic.Image({
            x : PARKING_CENTERS[5] - Math.floor( imgs[img.antonis_car].width/2 ),
            y : levels.PARKING - Math.floor( imgs[img.antonis_car].height/2 ),
            image : imgs[img.antonis_car],
            width : imgs[img.antonis_car].width,
            height : imgs[img.antonis_car].height,
        });
        
        layer.add(antonakis_car);
        */
        
        layer.add(ouzounis_car);
        ouzounis.moveToTop();
        // add the shape to the layer
        stage.add(layer);
        //background.draw();
        layer.draw();
        
        CONTROL_TARGET = ouzounis;
/*traffic*/        
        var traffic_layer = new Kinetic.Layer();
        var traffic_car = new Kinetic.Image({
            x : 0,
            y : Math.floor( levels.ROAD_LINE_2 - imgs[img.traffic_car].height/2 ),
            image : imgs[img.traffic_car],
            width : imgs[img.traffic_car].width,
            height : imgs[img.traffic_car].height
        });
        traffic_layer.add( traffic_car );
        stage.add( traffic_layer );
        
        var traffic_interval = setInterval(traffic_function,70);
        
        function traffic_function() {
            if( traffic_car.getX() > WIDTH + 200 ){
                traffic_car.setX( - 100 );
            }
            traffic_car.setX(traffic_car.getX() + 5); 
            traffic_layer.draw();
        }
/*parked_cars*/
        function add_parked_car( position, image ){
            image = typeof image !== 'undefined' ? image : img.traffic_car;
            
            PARKING_AVAILABLE[ position ] = false;
            var parked_car = new Kinetic.Image({
                x : PARKING_CENTERS[ position ] - Math.floor( imgs[ image ].width/2 ) ,
                y : levels.PARKING - Math.floor(  imgs[ image ].height/2 ),
                image : imgs[ image ],
                width : imgs[ image ].width,
                height : imgs[ image ].height,
                parking_space : position,
            });
            traffic_layer.add( parked_car );
            return parked_car;
        }
        add_parked_car(1);
        add_parked_car(2);
        add_parked_car(3);
        add_parked_car(4);
        add_parked_car(5);
        add_parked_car(7);
        antonakis_car = add_parked_car( 6, img.antonis_car );
        function getPosition( ){
            var x = CONTROL_TARGET.getX();
            
            for( var i = 0; i < PARKING_SPACES; ++i ){
                if( ( x >= i* PARKING_WIDTH || x < -CONTROL_TARGET.attrs.width ) && ( x <= (i+1)* PARKING_WIDTH || i+1 == PARKING_SPACES ) ){
                    return i;
                }
            }
            return NaN;
        }
        function runAntonakis(){
            if( antonakis_car != null && antonakis_car.getX() < WIDTH + 50 ){
                antonakis_car.setY( levels.ROAD - Math.floor( antonakis_car.attrs.height/2 ) );
                antonakis_car.setX( antonakis_car.getX() + 0.5 );
                setInterval( runAntonakis, 200 );
                PARKING_AVAILABLE[ antonakis_car.attrs.parking_space ] = true; 
            }else{
                antonakis_car = null;
                clearInterval( runAntonakis );
            }
            traffic_layer.draw();
        }
        
        function moveVertical( up ){
            var position = getPosition();
            if( position == NaN ){
                return;
            }
            if( !up && CONTROL_STATE == control_states.pavement ){
                return; 
            }
            if( up && CONTROL_STATE == control_states.road ){
                return; 
            }
            if( up ){
                if( CONTROL_STATE == control_states.pavement && position == ouzounis_car.attrs.parking_space ){
                    AudioPlayer.set_alarm();
                    CONTROL_STATE = control_states.parking;
                    ouzounis.hide();
                    CONTROL_TARGET = ouzounis_car;
                    if( antonakis_car != null ){
                        setTimeout( runAntonakis, 2200 );
                        setTimeout( function(){ AudioPlayer.start_engine(); }, 2000 );
                        setTimeout( function(){ AudioPlayer.antonakis(); }, 3000 );
                    }
                }else if( CONTROL_STATE == control_states.parking ){
                    AudioPlayer.start_engine();
                    CONTROL_STATE = control_states.road;
                    CONTROL_TARGET.setY( levels.ROAD - Math.floor( ouzounis_car.attrs.height/2 ) );   
                }
            }else{
                if( CONTROL_STATE == control_states.road && PARKING_AVAILABLE[ position ] ){
                    CONTROL_STATE = control_states.parking;
                    ouzounis_car.attrs.position;
                    CONTROL_TARGET.setY( levels.PARKING - Math.floor( ouzounis_car.attrs.height/2 ) );
                    CONTROL_TARGET.setX( PARKING_CENTERS[ position ] - Math.floor( ouzounis_car.attrs.width/2 ) );
                }else if( CONTROL_STATE == control_states.parking ){
                    AudioPlayer.set_alarm();
                    CONTROL_STATE = control_states.pavement ;
                    ouzounis_car.attrs.parking_space = position; 
                    ouzounis.show();
                    ouzounis.setX( ouzounis_car.getX() );
                    CONTROL_TARGET = ouzounis;
                }
            }
            layer.draw();
        }
        AudioPlayer.Initialize();
        $(document).keydown(function(event) {
            switch (event.keyCode) {
                case 37:
                case 65:
                    // left
                    if( CONTROL_STATE != control_states.parking ){
                        if( CONTROL_TARGET_ON_MOVE!= null ){
                            CONTROL_TARGET_ON_MOVE();
                        }
                        if( CONTROL_TARGET.getX() > 0  ){
                            CONTROL_TARGET.setX(CONTROL_TARGET.getX() - ( CONTROL_STATE == control_states.pavement ? 10 : 2 ) );                        
                        }


                    }
                    layer.draw();
                    event.preventDefault();
                    break;
                case 39:
                case 68:
                    // right
                    if( CONTROL_STATE != control_states.parking ){
                        if( CONTROL_TARGET_ON_MOVE!= null ){
                            CONTROL_TARGET_ON_MOVE();
                        }
                        CONTROL_TARGET.setX(CONTROL_TARGET.getX() + 10);                        
                        if( CONTROL_TARGET.getX() > WIDTH + 10 ){
                            CONTROL_TARGET.setX( -5 );
                        }
                        layer.draw();
                    }
                    event.preventDefault();
                    break;
                case 38:
                case 87:
                    // up
                    moveVertical( true );
                    event.preventDefault();
                    break;
                case 40:
                case 83:
                    moveVertical( false );
                    event.preventDefault();
                    break;
                case 13:
                    
                    alert('enter');
                    break;
                case 80:
                    alert('pause');
                    event.preventDefault();
                    break;
            }
        });
    }

var AudioPlayer = {
    sounds : {},
    start_engine : function() {
        this.sounds.start_engine.play();
    },
    set_alarm : function() {
        this.sounds.set_alarm.play();
    },
    antonakis : function() {
        this.sounds.antonakis.play();
    },
    Initialize : function() {
        this.sounds.start_engine = new Audio();
        
        this.sounds.start_engine.setAttribute('src', 'sounds/start_engine2.wav');
        this.sounds.start_engine.repeat = false;
        this.sounds.start_engine.loop = false;
        this.sounds.start_engine.volume = 0.9;
        
        this.sounds.set_alarm = new Audio();
        
        this.sounds.set_alarm.setAttribute('src', 'sounds/set_alarm.wav');
        this.sounds.set_alarm.repeat = false;
        this.sounds.set_alarm.loop = false;
        this.sounds.set_alarm.volume = 1;
        
        this.sounds.antonakis = new Audio();
        
        this.sounds.antonakis.setAttribute('src', 'sounds/antonakis.wav');
        this.sounds.antonakis.repeat = false;
        this.sounds.antonakis.loop = false;
        this.sounds.antonakis.volume = 0.15;
        
    }
}; 