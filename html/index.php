<?php


// Turn on error reporting.
ini_set('display_startup_errors',1) ;
ini_set('display_errors',1) ;
error_reporting(-1) ;

$title = 'SSS: Solar system simulator' ;

$g_analytics = false ;
$jquery      = false ;

$stylesheets = array('style.css') ;
$js_scripts  = array('settings.js', 'helper.js', 'orbit_data.js', 'functions.js') ;
include_once($_SERVER['FILE_PREFIX'] . '/_core/preamble.php') ;
?>
<div class="right">
  <h3>About</h3>
  <p>This page simulates the solar system, because planets.</p>
  
  <canvas id="canvas_plan" width="750" height="750" style="width:375px;height:375px"></canvas>
  <canvas id="canvas_sky"  width="750" height="750" style="width:375px;height:375px"></canvas>
  <canvas id="canvas_side" width="750" height="100" style="width:375px;height: 50px"></canvas>
  
  <table>
    <thead>
      <tr id="tr_satellite_config"></tr>
    </thead>
    <tbody>
      <tr id="tr_satellite_config_centre">
        <th>Centre</th>
      </tr>
      <tr id="tr_satellite_config_home">
        <th>Home</th>
      </tr>
      <tr id="tr_satellite_config_scale">
        <th>Scale</th>
      </tr>
      <tr id="tr_satellite_config_show">
        <th>Show</th>
      </tr>
    </tboy>
  </table>
  
  <table>
    <thead>
      <tr>
        <th class="satellite_variable">Satellite</th>
        <th class="satellite_variable">Distance<br /> to sun (AU)</th>
        <th class="satellite_variable">Distance<br /> to Earth (AU)</th>
        <th class="satellite_variable">X (AU)</th>
        <th class="satellite_variable">Y (AU)</th>
        <th class="satellite_variable">Z (AU)</th>
        <th class="satellite_variable">Anomaly (AU)</th>
        <th class="satellite_variable">RA</th>
        <th class="satellite_variable">DEC</th>
        <th class="satellite_variable">speed (km/s)</th>
      </tr>
    </thead>
    <tbody id="tbody_satellite_variables"></tbody>
  </table>
  
  <div id="div_hidden">
    <canvas id="canvas_plan_trails" width="750" height="750" style="width:375px;height:375px"></canvas>
    <canvas id="canvas_sky_trails"  width="750" height="750" style="width:375px;height:375px"></canvas>
  </div>
</div>

<?php foot() ; ?>
