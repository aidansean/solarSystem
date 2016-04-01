function fill_tables(){
  var tr_header = Get('tr_satellite_config'       ) ;
  var tr_centre = Get('tr_satellite_config_centre') ;
  var tr_home   = Get('tr_satellite_config_home'  ) ;
  var tr_scale  = Get('tr_satellite_config_scale' ) ;
  var tr_show   = Get('tr_satellite_config_show'  ) ;
  var tbody = Get('tbody_satellite_variables') ;
  var tr = null ;
  var th = null ;
  var td = null ;
  var input_radio = null ;
  var input_check = null ;
  
  th = Create('th') ;
  tr_header.appendChild(th) ;
  
  for(var i=0  ; i<satellites_2016.length ; i++){
    var s = satellites_2016[i] ;
    var name  = s.name  ;
    var title = s.title ;
    var color = s.color ;
    th = Create('th') ;
    th.innerHTML = title ;
    th.style.color = color ;
    th.className = 'satellite_variable' ;
    tr_header.appendChild(th) ;
    
    td = Create('td') ;
    td.className = 'satellite_variable' ;
    td.style.color = color ;
    input_radio = Create('input') ;
    input_radio.type = 'radio' ;
    input_radio.id = 'input_centre_' + name ;
    td.appendChild(input_radio) ;
    tr_centre.appendChild(td) ;
    
    td = Create('td') ;
    td.className = 'satellite_variable' ;
    td.style.color = color ;
    input_radio = Create('input') ;
    input_radio.id = 'input_home_' + name ;
    input_radio.type = 'radio' ;
    td.appendChild(input_radio) ;
    tr_home.appendChild(td) ;
    
    td = Create('td') ;
    td.className = 'satellite_variable' ;
    td.style.color = color ;
    input_radio = Create('input') ;
    input_radio.id = 'input_scale_' + name ;
    input_radio.type = 'radio' ;
    td.appendChild(input_radio) ;
    tr_scale.appendChild(td) ;
    
    td = Create('td') ;
    td.className = 'satellite_variable' ;
    td.style.color = color ;
    input_radio = Create('input') ;
    input_radio.id = 'input_show_' + name ;
    input_radio.type = 'checkbox' ;
    td.appendChild(input_radio) ;
    tr_show.appendChild(td) ;
    
    tr = Create('tr') ;
    th = Create('th') ;
    th.style.color = color ;
    th.className = 'satellite_variable' ;
    th.innerHTML = title ;
    tr.appendChild(th) ;
    var cellNames = ['distanceToSun', 'distanceToEarth', 'X', 'Y', 'Z', 'anomaly', 'RA', 'DEC', 'speed'] ;
    for(var j=0 ; j<cellNames.length ; j++){
      td = Create('td') ;
      td.className = 'satellite_variable' ;
      td.style.color = color ;
      td.id = 'td_' + name + '_' + cellNames[j] ;
      td.innerHTML = '-' ;
      tr.appendChild(td) ;
    }
    tbody.appendChild(tr) ;
  }
}

function start(){
  theTime.setTime(J2000.valueOf()+time0*1000) ;
  fill_tables() ;
  canvas_sky          = Get('canvas_sky' ) ;
  canvas_plan         = Get('canvas_plan') ;
  canvas_side         = Get('canvas_side') ;
  canvas_plan_trails  = Get('canvas_plan_trails') ;
  context_sky         = canvas_sky        .getContext('2d') ;
  context_plan        = canvas_plan       .getContext('2d') ;
  context_side        = canvas_side       .getContext('2d') ;
  context_plan_trails = canvas_plan_trails.getContext('2d') ;
  
  for(var i=0 ; i<satellites_2016.length ; i++){
    var s = satellites_2016[i] ;
    if(s.name=='Mars') scale = s.semimajorAxis ;
  }
  go() ;
}
function go(){
  update() ;
  counter++ ;
  theTime.setTime(theTime.valueOf()+timeStep*86400*1000) ;
  if(running==1){
    if(stop<0){
      window.setTimeout(go, delay) ;
    }
    else if(stop>0 && counter<stop){
      window.setTimeout(go, delay) ;
    }
  }
}

function vector_object(x, y, z){
  this.x = x ;
  this.y = y ;
  this.z = z ;
  
  this.r      = function( ){ return  sqrt(this.x*this.x+this.y*this.y+this.z*this.z) ; }
  this.rho    = function( ){ return  sqrt(this.x*this.x+this.y*this.y) ; }
  this.phi    = function( ){ return atan2(this.y, this.x) ; }
  this.theta  = function( ){ return  acos(this.z, this.rho()) ; }
  this.dTheta = function(v){ return v.theta() - this.theta() ; }
  this.dPhi = function(v){
    var dPhi = v.phi() - this.phi() ;
    while(dPhi> pi) dPhi -= pi ;
    while(dPhi<-pi) dPhi += pi ;
    return dPhi ;
  }
  this.toUnitVector = function(){
    var r = this.r() ;
    this.x /= r ;
    this.y /= r ;
    this.z /= r ;
  }
  this.rotate = function(axis, angle){
    this.multiply(rotationMatrix(axis, angle)) ;
  }
  this.multiply = function(matrix){
    var x0 = this.x ;
    var y0 = this.y ;
    var z0 = this.z ;
    this.x = matrix[0][0]*x0 + matrix[0][1]*y0 + matrix[0][2]*z0 ;
    this.y = matrix[1][0]*x0 + matrix[1][1]*y0 + matrix[1][2]*z0 ;
    this.z = matrix[2][0]*x0 + matrix[2][1]*y0 + matrix[2][2]*z0 ;
  }
}

function update(){
  var home = 3 ;
  var tilt = satellites_2016[home].axialTilt*pi/180 ;
  
  context_plan.save() ;
  context_plan.fillStyle = 'rgb(0,0,0)' ;
  context_plan.fillRect(0, 0, 750, 750) ;
  context_plan.restore() ;
  
  context_sky .save() ;
  context_sky .fillStyle = 'rgb(0,0,0)' ;
  context_sky .fillRect(0, 0, 750, 750) ;
  context_sky .restore() ;
  
  context_side.save() ;
  context_side.fillStyle = 'rgb(0,0,0)' ;
  context_side.fillRect(0, 0, 750, 100) ;
  context_side.restore() ;
  
  var sun     = satellites_2016[0] ;
  var earth   = satellites_2016[3] ;
  var sHome   = satellites_2016[home] ;
  var sCenter = satellites_2016[center] ;
  
  // Sort out RA and DEC
  longitude += timeStep*360*pi/180 ;
  viewVector = new vector_object(0,0,1) ;
  viewVector.rotate([0,1,0],          -tilt) ;
  viewVector.rotate([0,0,1],      longitude) ;
  viewVector.rotate([0,1,0], pi/2-lattitude) ;
  if(show_viewVector) drawViewVector() ;
  
  var viewPhi   = viewVector.phi() ;
  var viewTheta = viewVector.theta() ;
  sun.X  = 0.0 ;
  sun.Y  = 0.0 ;
  sun.Z  = 0.0 ;
  sun.nu = -pi ;
  for(var i=0 ; i<satellites_2016.length ; i++){
    var s = satellites_2016[i] ;
    var V = XYZNu(i) ;
    
    if(s.X && i!=center){
      var x1 = SSPlanX(s.X -sCenter.X) ;
      var y1 = SSPlanY(s.Y -sCenter.Y) ;
      var x2 = SSPlanX(V[0]-sCenter.X) ;
      var y2 = SSPlanY(V[1]-sCenter.Y) ;
      var c = context_plan_trails ;
      c.save() ;
      c.beginPath() ;
      c.strokeStyle = s.color ;
      c.moveTo(x1,y1) ;
      c.lineTo(x2,y2) ;
      c.closePath() ;
      c.stroke() ;
      c.restore() ;
    }
    
    s.X  = V[0] ;
    s.Y  = V[1] ;
    s.Z  = V[2] ;
    s.nu = V[3] ;
    s.R = sqrt(s.X*s.X+s.Y*s.Y+s.Z*s.Z) ;
    if(s.name=='Moon'){
      s.X += earth.X ;
      s.Y += earth.Y ;
      s.Z += earth.Z ;
    }
    s.speed = (i==0) ? 0 : sqrt(398600*((2.0/s.R)-(1.0/s.semimajorAxis))) ;
  }
  context_plan.drawImage(canvas_plan_trails, 0, 0) ;
  
  for(var i=0 ; i<satellites_2016.length ; i++){
    var s = satellites_2016[i] ;
    var name  = s.name ;
    
    // Make a vector connecting the two satellites.
    var V12 = new vector_object(s.X-sHome.X, s.Y-sHome.Y, s.Z-sHome.Z) ;
    var dTheta = V12.dTheta(viewVector) ;
    var dPhi   = V12.dPhi  (viewVector) ;
    s.RA = dPhi*12/pi ;
    s.DEC = 180*dTheta/pi ;
    s.RA_text  =  ra(s.RA ) ;
    s.DEC_text = dec(s.DEC) ;
    
    var cx = SSPlanX(s.X-sCenter.X) ;
    var cy = SSPlanY(s.Y-sCenter.Y) ;
    var r = 5 ;
    context_plan.save() ;
    context_plan.fillStyle = s.color ;
    context_plan.beginPath() ;
    context_plan.arc(cx, cy, r, 0, 2*pi, true) ;
    context_plan.closePath() ;
    context_plan.fill() ;
    context_plan.restore() ;
    
    if(abs(dPhi)<2.5*pi){
      cx = SkyX(-dPhi  /pi) ;
      cy = SkyY(-dTheta) ;
      context_sky.save() ;
      context_sky.fillStyle = s.color ;
      context_sky.beginPath() ;
      context_sky.arc(cx, cy, r, 0, 2*pi, true) ;
      context_sky.closePath() ;
      context_sky.fill() ;
      context_sky.restore() ;
    }
    
    cx = SSSideX(s.X-sCenter.X) ;
    cy = SSSideY(s.Z-sCenter.Z) ;
    context_side.save() ;
    context_side.fillStyle = s.color ;
    context_side.beginPath() ;
    context_side.arc(cx, cy, r, 0, 2*pi, true) ;
    context_side.closePath() ;
    context_side.fill() ;
    context_side.restore() ;
  }
  for(var i=0 ; i<satellites_2016.length ; i++){
    var s = satellites_2016[i] ;
    var name  = s.name ;
    
    var dSun   = sqrt(pow(s.X-sun.X  ,2)+pow(s.Y-sun.Y  ,2) + pow(s.Z-sun.Z  ,2)) ;
    var dEarth = sqrt(pow(s.X-earth.X,2)+pow(s.Y-earth.Y,2) + pow(s.Z-earth.Z,2)) ;
    
    Get('td_' + name + '_distanceToSun'  ).innerHTML = round(dSun  ) ;
    Get('td_' + name + '_distanceToEarth').innerHTML = round(dEarth) ;
    Get('td_' + name + '_X'              ).innerHTML = round(s.X   ) ;
    Get('td_' + name + '_Y'              ).innerHTML = round(s.Y   ) ;
    Get('td_' + name + '_Z'              ).innerHTML = round(s.Z   ) ;
    Get('td_' + name + '_anomaly'        ).innerHTML = round(s.nu  ) ;
    
    Get('td_' + name + '_RA'             ).innerHTML = s.RA_text  ;
    Get('td_' + name + '_DEC'            ).innerHTML = s.DEC_text ;
    Get('td_' + name + '_speed'          ).innerHTML = round(s.speed) ;
  }
}
function XYZNu(i){
  if(i==0) return [ 0 , 0 , 0 , 0 ] ;
  var s     = satellites_2016[i] ;
  var a     = s.semimajorAxis ;
  var e     = s.eccentricity ;
  var P     = s.period ;
  var I     = s.inclination*pi/180 ;
  var Omega = s.longitudeAscending*pi/180 ;
  var omega = s.longitudePerihelion*pi/180 ;
  var L0    = s.longitudeJ2000*pi/180 ;
  var T   = ((theTime.valueOf()-J2000.valueOf())/1000)%P ;
  var eta = L0 + (T*2*pi)/P - omega ;
  var E0  = 10 ;
  var E1  = eta ;
  while(Math.abs(E0-E1)>0.000001){ // Ooh, Newtonian iteration!
    E0 = E1 ;
    E1 = E0 - (E0-e*sin(E0)-eta)/(1-e*cos(E0)) ;
  }
  var nu = 2*atan(sqrt((1+e)/(1-e))*tan(0.5*E1)) ;
  var r = a*(1-e*e)/(1+e*cos(nu)) ; 
  var theta = + omega + nu - Omega ;
  var x1 = r*(cos(Omega)*cos(theta) - sin(Omega)*sin(theta)*cos(I)) ;
  var y1 = r*(sin(Omega)*cos(theta) + cos(Omega)*sin(theta)*cos(I)) ;
  var z1 = r*sin(theta)*sin(I) ;
  var V = [ x1 , y1 , z1 , nu ] ;
  return V ;
}

function drawViewVector(){
  var sHome   = satellites_2016[home] ;
  var sCenter = satellites_2016[center] ;
  var x1a = SSPlanX(sHome.X-sCenter.X) ;
  var y1a = SSPlanY(sHome.Y-sCenter.Y) ;
  var x2a = SSPlanX(sHome.X-sCenter.X)-viewVectorLength*viewVector[0] ;
  var y2a = SSPlanY(sHome.Y-sCenter.Y)+viewVectorLength*viewVector[1] ;
  var x1b = SSSideX(sHome.X-sCenter.X) ;
  var y1b = SSSideY(sHome.Z-sCenter.Z) ;
  var x2b = SSSideX(sHome.X-sCenter.X)-viewVectorLength*viewVector[0] ;
  var y2b = SSSideY(sHome.Z-sCenter.Z)-viewVectorLength*viewVector[2] ;
  
  context_plan.save() ;
  context_plan.beginPath() ;
  context_plan.moveTo(x1a, y1a) ;
  context_plan.lineTo(x2a, y2a) ;
  context_plan.closePath() ;
  context_plan.strokeStyle = sHome.color ;
  context_plan.stroke() ;
  context_plan.restore() ;
  
  context_side.save() ;
  context_side.beginPath() ;
  context_side.moveTo(x1b, y1b) ;
  context_side.lineTo(x2b, y2b) ;
  context_side.closePath() ;
  context_side.strokeStyle = sHome.color ;
  context_side.stroke() ;
  context_side.restore() ;
}
function satellite_object(name, semimajorAxis, eccentricity, period, inclination, longitudeAscending, longitudePerihelion, longitudeJ2000, axialTilt, color){
  this.name = name ;
  this.semimajorAxis = semimajorAxis ;
  this.eccentricity = eccentricity ;
  this.period = period ;
  this.inclination = inclination ;
  this.longitudeAscending = longitudeAscending ;
  this.longitudePerihelion = longitudePerihelion ;
  this.longitudeJ2000 = longitudeJ2000 ;
  this.axialTilt = axialTilt ;
  this.color = color ;
}

function rotate(vector, axis, angle){ return multiplyV(rotationMatrix(axis, angle), vector) ; }
function multiplyV(matrix, vector){
  var x0 = vector[0] ;
  var y0 = vector[1] ;
  var z0 = vector[2] ;
  var x1 = matrix[0][0]*x0 + matrix[0][1]*y0 + matrix[0][2]*z0 ;
  var y1 = matrix[1][0]*x0 + matrix[1][1]*y0 + matrix[1][2]*z0 ;
  var z1 = matrix[2][0]*x0 + matrix[2][1]*y0 + matrix[2][2]*z0 ;
  var V = [ x1 , y1 , z1 ] ;
  return V ;
}
function rotationMatrix(axis, angle){
  //  Taken from http://en.wikipedia.org/wiki/Rotation_matrix#Dimension_three
  var size = sqrt(axis[0]*axis[0]+axis[1]*axis[1]+axis[2]*axis[2]) ;
  var ux = axis[0]/size ;
  var uy = axis[1]/size ;
  var uz = axis[2]/size ;
  var C = cos(angle) ;
  var S = sin(angle) ;
  var M11 = ux*ux+(1-ux*ux)*C ;
  var M12 = ux*uy*(1-C)-uz*S ;
  var M13 = ux*uz*(1-C)+uy*S ;
  var M21 = uy*ux*(1-C)+uz*S ;
  var M22 = uy*uy+(1-uy*uy)*C ;
  var M23 = uy*uz*(1-C)-ux*S ;
  var M31 = uz*ux*(1-C)-uy*S ;
  var M32 = uz*uy*(1-C)+ux*S ;
  var M33 = uz*uz+(1-uz*uz)*C ;
  var matrix = [
    [ M11 , M12 , M13 ] ,
    [ M21 , M22 , M23 ] ,
    [ M31 , M32 , M33 ] ] ;	
  return matrix ;
}
function ra(ra0){
  if(ra0<24) ra0 = ra0 + 24 ;
  if(ra0>24) ra0 = ra0 - 24 ;
  var hours = floor(ra0) ;
  var minutes = floor(60*(ra0-hours)) ;
  var string = "" + hours + "h " + minutes + "m" ;
  return string ;
}
function dec(dec0){
  if(dec0>90)  dec0 = dec0-90 ;
  if(dec0<-90) dec0 = dec0+90 ;
  var dec = floor(dec0) ;
  var minutes = floor(60*(dec0-dec)) ;
  var string = "" + dec + ", " + minutes + "'" ;
  return string ;
}

function unit(vector){
  var size = sqrt(vector[0]*vector[0]+vector[1]*vector[1]+vector[2]*vector[2]) ;
  vector = [ vector[0]/size , vector[1]/size , vector[2]/size ] ;
  return vector ;
}
function SSPlanX(x){ return 375 + 375*x/scale ; }
function SSPlanY(y){ return 375 + 375*y/scale ; }
function SSSideX(x){ return 375 + 375*x/scale ; }
function SSSideY(z){ return  50 +  50*z/scale ; }
function    SkyX(x){ return 375 + 375*x ; }
function    SkyY(y){ return 375 + 375*y ; }



