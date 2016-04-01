// These are the parameters that you can play around with: 
var           delay =         10 ; // Delay between updates (ms)
var        timeStep =          1 ; // Increment in time in Earth days
var          center =          0 ; // Which satellite is at the center (0=sun, 1=Mercury, 2=Venus etc)
var         running =          1 ; // Turn the model on or off
var            home =          3 ; // Where to look from
var show_viewVector =          1 ; // Draw little arrow showing direction of view
var           time0 =  308557544 ; // Seconds since J2000.  14:00 today is 308557544
var            stop =         -1 ; // How long to run the simulation for
var       longitude =       -122 ; // -122 is the longitude of Stanford
var       lattitude =         37 ; // 37 is the latitude of Stanford

var scale = 3.0 ;

var canvas_sky          = null ;
var canvas_plan         = null ;
var canvas_plan_trails  = null ;
var canvas_side         = null ;
var context_sky         = null ;
var context_plan        = null ;
var context_plan_trails = null ;
var context_side        = null ;

// Some constants:
var AU = 149598000 ;
var dPerY = 1.00003878*365.25 ;
var sPerD = 23.9344696*3600 ;
var pi = Math.PI ;

// Settings to change the display.
var viewVectorLength = 15 ;
var viewVector = [1,0,0] ;

var J2000 = new Date() ;
var time  = new Date() ;

J2000.setUTCDate(2000,0,1,12,0,0) ;
time .setUTCDate(2000,0,1,12,0,0) ;
var theTime = new Date() ;

var debug = 1 ;
var counter = 0 ;

longitude = longitude*pi/180 ;
lattitude = lattitude*pi/180 ;
