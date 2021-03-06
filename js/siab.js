/*
 *
 *	Star in a Box. Developed by Jon Yardley - October 2011
 *  Refactoring by Stuart Lowe - February 2012
 *  Updating following school testing - September 2013
 *
 */

// Elements with the class "accessible" are intended for people who don't 
// have Javascript enabled. If we are here they obviously do have Javascript.
document.write('<style type="text/css">.accessible { display: none; } .jsonly { display: block; }</style>');

// A global variable for our star in a box
var box;

$(document).ready(function () {

	$("body").queryLoader2();

	/*@cc_on
	// Fix for IE's inability to handle arguments to setTimeout/setInterval
	// From http://webreflection.blogspot.com/2007/06/simple-settimeout-setinterval-extra.html
	(function(f){
		window.setTimeout =f(window.setTimeout);
		window.setInterval =f(window.setInterval);
	})(function(f){return function(c,t){var a=[].slice.call(arguments,2);return f(function(){c.apply(this,a)},t)}});
	@*/
	// Page PreLoader

	// Get the URL query string and parse it
	jQuery.query = function() {
			var r = {length:0};
			var q = location.search;
		if(q && q != '#'){
			// remove the leading ? and trailing &
			q = q.replace(/^\?/,'').replace(/\&$/,'');
			jQuery.each(q.split('&'), function(){
				var key = this.split('=')[0];
				var val = this.split('=')[1];
				if(/^[0-9.]+$/.test(val)) val = parseFloat(val);	// convert floats
				r[key] = val;
				r['length']++;
			});
		}
		return r;
	};

	function StarInABox(inp){

		// Some boolean properties
		this.canopen = true;      // Can we open the box?
		this.open = false;        // Is the box open?
		this.infoopen = false;    // Is the info/help box open?
		this.tutorialstep = 0;    // Which tutorial step are we on

		// Get query string
		this.q = $.query();

		// Define which languages will appear in the language menu
		this.langs = ["en","en-GB","cy","ar"];
		// Create a lookup table for language codes and names
		// Country codes at http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
		this.langlookup = {
			'en':'English',
			'en-GB':'British English',
			'af':'Afrikaans',
			'ar':'&#1575;&#1604;&#1593;&#1585;&#1576;&#1610;&#1577;',
			'cs':'&#268;e&#353;tina',
			'cy':'Cymraeg',
			'de':'Deutsch',
			'dk':'Dansk',
			'el':'&#917;&#955;&#955;&#951;&#957;&#953;&#954;&#940;',
			'es':'Espa&#241;ol',
			'fa':'&#1601;&#1575;&#1585;&#1587;&#1740;',
			'fi':'Suomi',
			'fr':'Fran&#231;ais',
			'ga':'Gaeilge',
			'gu':'&#2711;&#2753;&#2716;&#2736;&#2750;&#2724;&#2752;',
			'he':'&#1506;&#1489;&#1512;&#1497;&#1514;',
			'hi':'&#2350;&#2366;&#2344;&#2325; &#2361;&#2367;&#2344;&#2381;&#2342;&#2368;',
			'it':'Italiano',
			'ja':'&#26085;&#26412;&#35486;',
			'ko':'&#54620;&#44397;&#50612;',
			'nl':'Nederlands',
			'pl':'Polski',
			'pt':'Portugu&#234;s',
			'ru':'&#1088;&#1091;&#1089;&#1089;&#1082;&#1080;&#1081;',
			'sv':'svenska',
			'tr':'T&#252;rk&#231;e',
			'zh':'&#20013;&#25991;',
			'zh-yue':'&#31925;&#35486;'
		};
		// See if there is a preferred language
		// Get the browser's language code e.g. "en-GB" and find the short version of it too e.g. "en"
		this.lang = (navigator) ? (navigator.userLanguage||navigator.systemLanguage||navigator.language||browser.language) : "";			// Set the user language
		// Over-ride with query string value if it exists
		if(typeof this.q.lang=="string") this.lang = this.q.lang;
		// Get the short version (2 characters) of the language code
		this.langshort = (this.lang.indexOf('-') > 0 ? this.lang.substring(0,this.lang.indexOf('-')) : this.lang.substring(0,2));
		this.langdir = "left";

		// Process the input parameters/query string
		this.init(inp);

		// Set the defaults
		// =================
		this.keys = new Array();
		this.mass = 1;
		// The stellar masses that we have data for
		this.massVM = [0.2, 0.65, 1, 2, 4, 6, 10, 20, 30, 40];
		// The stages indices must match indices used in the data
		this.stages = ["Main Sequence star","Main Sequence star","Main Sequence star","Giant Branch","Giant Branch","Giant Branch","Giant Branch","Main Sequence star","Wolf-Rayet star","Giant Branch","White Dwarf","White Dwarf","White Dwarf","Neutron Star","Black Hole","Supernova"]
		this.allstages = {
			"m0.2" : [ {"type":0, "lum":-2.2399, "t":639800, "radius":0.27, "temp":2942, "RGB":"#ffb765"}, {"type":2, "lum":-2.0034, "t":914000, "radius":0.36, "temp":2942, "RGB":"#ffb765"}, {"type":3, "lum":-2.2407, "t":962100, "radius":0.21, "temp":3463, "RGB":"#ffc885"}, {"type":10, "lum":1.9434, "t":1080000, "radius":0.02, "temp":56701, "RGB":"#9eb5ff"} ],
			"m0.65" : [{"type":0, "lum":-0.3403, "t":57610, "radius":0.97, "temp":4849, "RGB":"#ffe5c6"}, {"type":2, "lum":-0.0538, "t":60970, "radius":1.45, "temp":4664, "RGB":"#ffe2bf"}, {"type":3, "lum":0.3772, "t":61970, "radius":2.39, "temp":4664, "RGB":"#ffe2bf"}, {"type":10, "lum":2.3074, "t":62750, "radius":0.02, "temp":56701, "RGB":"#9eb5ff"} ],
			"m1" : [{"type":1, "lum":0.4503, "t":8992.81, "radius":1.69, "temp":5722, "RGB":"#fff1e5"}, {"type":2, "lum":0.5034, "t":9485.59, "radius":2.29, "temp":5164, "RGB":"#ffe9d2"}, {"type":3, "lum":0.5118, "t":9562.25, "radius":2.4, "temp":5052, "RGB":"#ffe8ce"}, {"type":4, "lum":1.7386, "t":10171.4, "radius":10.3, "temp":4948, "RGB":"#ffe6ca"}, {"type":5, "lum":2.1813, "t":10297.2, "radius":22.19, "temp":4322, "RGB":"#ffdbb0"}, {"type":6, "lum":3.6019, "t":10301.8, "radius":203.47, "temp":3234, "RGB":"#ffc178"}, {"type":11, "lum":1.4459, "t":10302.4, "radius":0.01, "temp":56701, "RGB":"#9eb5ff"}],
			"m2" : [{"type":1, "lum":1.5476, "t":1163.03, "radius":3.71, "temp":7218, "RGB":"#f3f2ff"}, {"type":2, "lum":1.3056, "t":1173.58, "radius":5.84, "temp":5052, "RGB":"#ffe8ce"}, {"type":3, "lum":2.3845, "t":1196.46, "radius":27.54, "temp":4322, "RGB":"#ffdbb0"}, {"type":4, "lum":2.1597, "t":1486.68, "radius":19.85, "temp":4489, "RGB":"#ffdfb8"}, {"type":5, "lum":3.6681, "t":1494.07, "radius":204.31, "temp":3463, "RGB":"#ffc885"}, {"type":6, "lum":1.6415, "t":1495.78, "radius":0.01, "temp":56701, "RGB":"#9eb5ff"}, {"type":11, "lum":-5.3886, "t":12000, "radius":0.01, "temp":2150, "RGB":"#ff9523"}],
			"m4" : [{"type":1, "lum":2.7699, "t":178.906, "radius":5.94, "temp":11677, "RGB":"#c4d2ff"}, {"type":2, "lum":2.5541, "t":180.102, "radius":28.35, "temp":4755, "RGB":"#ffe3c3"}, {"type":3, "lum":3.1815, "t":180.774, "radius":76.17, "temp":4159, "RGB":"#ffd8a9"}, {"type":4, "lum":2.9481, "t":212.88, "radius":51.27, "temp":4405, "RGB":"#ffddb4"}, {"type":5, "lum":4.1509, "t":214.706, "radius":353.02, "temp":3463, "RGB":"#ffc885"}, {"type":6, "lum":1.7754, "t":215.382, "radius":0.01, "temp":56701, "RGB":"#9eb5ff"}, {"type":11, "lum":-5.3245, "t":12000, "radius":0.01, "temp":2942, "RGB":"#ffb765"}],
			"m6" : [{"type":1, "lum":3.3591, "t":65.964, "radius":7.48, "temp":13674, "RGB":"#bbccff"}, {"type":2, "lum":3.2303, "t":68.6218, "radius":69.98, "temp":4489, "RGB":"#ffdfb8"}, {"type":3, "lum":3.7432, "t":68.7287, "radius":161.66, "temp":3892, "RGB":"#ffd29c"}, {"type":4, "lum":3.6142, "t":77.6749, "radius":121.23, "temp":4241, "RGB":"#ffdaad"}, {"type":5, "lum":4.3733, "t":78.2085, "radius":444.02, "temp":3463, "RGB":"#ffc885"}, {"type":6, "lum":1.8974, "t":78.7627, "radius":0.01, "temp":56701, "RGB":"#9eb5ff"}, {"type":11, "lum":-5.2134, "t":12000, "radius":0.01, "temp":3640, "RGB":"#ffcc8f"}],
			"m10" : [{"type":1, "lum":4.2272, "t":24.4625, "radius":9.34, "temp":22695, "RGB":"#aabfff"}, {"type":2, "lum":3.9663, "t":24.5267, "radius":191.38, "temp":4076, "RGB":"#ffd6a5"}, {"type":3, "lum":4.3855, "t":24.5362, "radius":386.1, "temp":3640, "RGB":"#ffcc8f"}, {"type":4, "lum":4.3817, "t":27.3394, "radius":340.41, "temp":3892, "RGB":"#ffd29c"}, {"type":5, "lum":4.8097, "t":27.4616, "radius":748, "temp":3463, "RGB":"#ffc885"}, {"type":13, "lum":4.8124, "t":27.4621, "radius":0, "temp":3463, "RGB":"#ffc885"}],
			"m20" : [{"type":1, "lum":5.0480, "t":8.8203, "radius":15.56, "temp":22695, "RGB":"#aabfff"}, {"type":2, "lum":5.0859, "t":8.8357, "radius":249.52, "temp":6967, "RGB":"#f8f6ff"}, {"type":4, "lum":5.1739, "t":9.8196, "radius":1222.08, "temp":3234, "RGB":"#ffc178"}, {"type":5, "lum":5.2799, "t":9.8441, "radius":1508.69, "temp":3234, "RGB":"#ffc178"}, {"type":13, "lum":5.2805, "t":9.8442, "radius":0, "temp":3234, "RGB":"#ffc178"}],
			"m30" : [{"type":1, "lum":5.4128, "t":5.9496, "radius":22.18, "temp":22695, "RGB":"#aabfff"}, {"type":2, "lum":5.4158, "t":5.9582, "radius":1142.88, "temp":3892, "RGB":"#ffd29c"}, {"type":4, "lum":5.3705, "t":6.4737, "radius":1.2, "temp":56701, "RGB":"#9eb5ff"}, {"type":7, "lum":5.2557, "t":6.629, "radius":0.89, "temp":56701, "RGB":"#9eb5ff"}, {"type":8, "lum":5.4248, "t":6.6577, "radius":1.04, "temp":56701, "RGB":"#9eb5ff"}, {"type":14, "lum":5.4248, "t":6.6577, "radius":0, "temp":56701, "RGB":"#9eb5ff"}],
			"m40" : [{"type":1, "lum":5.6288, "t":4.8716, "radius":29.01, "temp":22695, "RGB":"#aabfff"}, {"type":2, "lum":5.6187, "t":4.878, "radius":1433.51, "temp":3892, "RGB":"#ffd29c"}, {"type":4, "lum":5.5568, "t":5.1816, "radius":1.41, "temp":56701, "RGB":"#9eb5ff"}, {"type":7, "lum":5.3259, "t":5.448, "radius":0.95, "temp":56701, "RGB":"#9eb5ff"}, {"type":8, "lum":5.4786, "t":5.4732, "radius":1.06, "temp":56701, "RGB":"#9eb5ff"}, {"type":14, "lum":5.4841, "t":5.474, "radius":0, "temp":56701, "RGB":"#9eb5ff"}]
		}
		// Text descriptions - default phrasebook
		this.phrasebook = {
			"title": "Star in a Box",
			"modes": { "normal": "Normal","advanced": "Advanced", "toggle": "Toggle mode" },
			"error": {
				"langload": "Couldn't load the language from %FILE%",
				"starload": "The star failed to form. Please try again later."
			},
			"about": { "title": "About", "content": "<p>Star in a Box allows you to explore one of the most enigmatic tools in astronomy - the <a href=\"http://lcogt.net/book/h-r-diagram\">Hertzsprung-Russell diagram</a>.</p><p>When you first open the box you start with a star with the same mass as the Sun but you can change this to a different mass at any time. The tracks that you see on the graph (on the left) map the lifecycle of the star. You can play the animation of the star moving around the diagram, and see how its brightness, size, surface temperature, and mass change in the panels on the right.</p><p>Stars can take billions of years to go through their lives with the dramatic events taking place in relatively short periods of time. In the animation we speed up time when the star is not really changing much and slow things down for the dramatic phases of the star's life.</p><h3>Keyboard controls:</h3>%CONTROLLIST%<h3>Acknowledgments</h3><p><b>Design &amp; Development</b>: <a href=\"http://jyardley.co.uk\">Jon Yardley</a>, <a href=\"http://www.strudel.org.uk/\">Stuart Lowe</a>, <a href=\"http://lcogt.net/user/egomez\">Edward Gomez</a>, <a href=\"http://www.astro.cf.ac.uk/contactsandpeople/?page=full&id=151\">Haley Gomez</a> &amp; Chris North</p><p>Supported by <a href=\"http://lcogt.net/\">LCOGT</a> &amp; <a href=\"http://www.cf.ac.uk/\">Cardiff University</a></p><p>Based on the stellar evolution research of <a href=\"http://astronomy.swin.edu.au/~jhurley/\">Jarrod Hurley</a>, <a href=\"https://www.astro.ru.nl/wiki/general/people/onno_pols\">Onno Pols</a>, and <a href=\"http://www.ast.cam.ac.uk/~cat/\">Christopher Tout</a></p>" },
			"data": { "title": "Data Table", "content": "This is a summary of the star that is currently selected.</p><p>Mass: %MASS%</p>%TABLE%<p>Download data as %CSV%</p>" },
			"intro": {
				"title": "Welcome!",
				"content": "Welcome to Star in a Box."
			},
			"open": "&lsaquo; Open the lid",
			"close": "Close the lid &rsaquo;",
			"preparing": "Your star is being prepared.<br />Please wait...",
			"sun": "Sun",
			"stage": "Stage",
			"timescale": "Myrs",
			"lum": "Luminosity",
			"lumunit": "Solar luminosities",
			"temp" : "Temperature",
			"tempunit" : "Kelvin",
			"mass": "Mass",
			"massunit": "solar",
			"ms" : "Main Sequence",
			"speeds": ["&gt;&gt;&gt;&gt;&gt;","&gt;&gt;&gt;&gt;","&gt;&gt;&gt;","&gt;&gt;","&gt;"],
			"buttons": {
				"play": "Start/pause",
				"reset": "Reset",
				"size": "Size comparison",
				"temperature": "Surface temperature",
				"luminosity": "Brightness",
				"stage": "Stages in your star's life",
				"mass": "Mass"
			},
			'help' : {
				'tab' : 'Help',
				'content': {
					"m0_2" : '',
					"m0_65" : '',
					"m1" : '',
					"m2" : '',
					"m4" : '',
					"m6" : '',
					"m10" : '',
					"m20" : '',
					"m30" : '',
					"m40" : ''
				}
			},
			"tutorial": [
				"Welcome! At the moment you have a 1 solar mass star but you can change that here if you want to.",
				"This is your star at the start of its life. The <span style=\"color:%COLOR%\">dashed line</span> shows how the star's brightness and temperature will change over its life.",
				"Click the play button when you\'re ready to start animating your star."
			],
			'captions': {
				rScales: '<h2>Mass</h2><p>This shows how the mass of your star varies over its life. Stars lose mass gradually by converting hydrogen into helium and heavier elements. They can also lose mass through winds blowing off their surface and at dramatic moments in their lives.</p><p>Stars are massive so, rather than measure this in kilograms, we measure this in comparison to our Sun which has 1 Solar Mass - which is about 2 million million million million million kg!</p>',
				rStopwatch: '<h2>Stages in your star\'s life</h2><p>This stopwatch shows the relative time the star spends in each stage of its life. In the animation we speed up time when the star is not really changing much and slow things down for the dramatic phases of the star\'s life.</p>',
				rlum: '<h2>Brightness</h2><p>How the brightness of your star changes compared to the current brightness of our Sun (which has a value of 1 in this light meter).</p><p>This light meter also changes colour to match your star.</p>',
				thermometer: '<h2>Surface Temperature</h2><p>How the surface temperature of your star changes with time. The temperatures are given in Kelvin which is usually abbreviated to K. Remember that:</p><blockquote style="text-align:center;">0&deg;C = 273 K</blockquote>',
				rCanvas: '<h2>Size</h2><p>How your star changes in size and colour, compared to the current conditions of the Sun.</p>'
			}
		}

		// ==================
		
		// Now that we've set some defaults, load alternate config information
		this.loadConfig();

		// Main Objects
		this.stage = 0;
		this.stageLife = [];
		this.stageIndex = [];
		// array for animation data points...
		this.eAnimPoints = [];
		this.timestep = 0;
		this.time = 0;
		this.temperature = 0;
		this.animating = false;
		this.reduction = 5;	// A slower framerate for the size/thermometer animations

		//GET URL if one is passed
		this.fullurl = parent.document.URL;
		this.urlquery = Array;
		this.urlquery = this.fullurl.substring(this.fullurl.indexOf('?')+1, this.fullurl.length).split('=');
		this.initStarMass = (this.urlquery.length == 0 || this.urlquery[0] != 's') ? 1 : getNearestNumber(this.massVM, parseInt(this.urlquery[1]));

		// Get font-size
		this.fs = ($('#placeholder').css('font-size') ? parseInt($('#placeholder').css('font-size')) : 12);

		// Set HR-diagram options
		this.data = [];
		this.chart = {
			'offset' : {
				top: 7,
				left : 25,//62;
				right : 0,
				bottom : 46//18
			},
			'width': 600,
			'height': 492,
			'opts': {
				'color': ($('#placeholder').length > 0 ? $('#placeholder').css('color') : "black"),
				'font-size' : this.fs+'px',
				'mainsequence' : {
					'color' : '#000000',
					'background-color' : "#ffcc00",
					'opacity' : 1
				},
				'path' : {
					'color':'#ffcc00'
				},
				'grid': {
					'color': "rgb(0,0,0)",
					'opacity': 0.25,
					'width': "0.5",
					'sub': {
						'color': "rgb(0,0,0)",
						'opacity': 0.08,
						'width': "0.5"
					},
					'label': {
						'opacity' : 1
					}
				},
				'xaxis': {
					'invert': true,
					'min': 3.25, // 3
					'max': 5.75, //5.85, // 6.4
					'label': {
						'opacity': 1
					},
					'font-size' : Math.round(this.fs*0.9)+'px'
				},
				'yaxis': {
					'min': -5.4, //-11
					'max': 6.5, //8
					'label': {
						'opacity' : 1
					},
					'font-size' : Math.round(this.fs*0.9)+'px'
				}
			},
			'holder': []
		}
		this.chart.holder = Raphael("placeholder", this.chart.width, this.chart.height),

		// Add mousemove event to show cursor position on HR diagram
		$('#placeholder').on('mousemove',{me:this},function(e){
			var off = $(this).offset();
			var x = e.pageX-off.left;
			var y = e.pageY-off.top;

			e.data.me.removeCrosshair();
			e.data.me.drawCrosshair(x,y);
			e.data.me.starPathClicker.toFront();

		}).on('mouseleave',{me:this},function(e){
			e.data.me.removeCrosshair();
		});
		
		this.sizeComparison = {
			// Raphael Script for star comparison
			'paper': Raphael("rCanvas", 280, 390),
			'starX': 50,
			'starY': 200,
			'starR': 5,
			'starOffset': 45
		}
		this.massComparison = { 
			'r': this.sizeComparison.starR,
			'x': 140,
			'y': 250,
			'offset':this.sizeComparison.starOffset
		}
		if ($("#rScales #scales").length > 0) $("#rScales #scales").remove();
		this.rScales = Raphael("rScales");
		//draw sun
		this.sizeComparison.sun = this.sizeComparison.paper.circle(25, 200, 5).attr({"fill":"#fff3ea","stroke-width":"0"});
		this.sizeComparison.sunLabel = this.sizeComparison.paper.text(25, 220, this.phrasebook.sun).attr("fill", "#fff3ea");
		//draw comparison star
		this.sizeComparison.star = this.sizeComparison.paper.circle(this.sizeComparison.starX+this.sizeComparison.starR, this.sizeComparison.starY, this.sizeComparison.starR).attr({"fill":"#fff3ea","stroke-width":"0"});
		this.massComparison.star = this.rScales.circle(this.massComparison.x+this.massComparison.r, this.massComparison.y, this.massComparison.r).attr({"fill":"#fff3ea","stroke-width":"0"});

		// get default stages (1 solar mass)
		this.getStages(this.initStarMass);

		this.setupUI();
		this.setupMode();
	
		return this;
	}

	StarInABox.prototype.init = function(d){

		var n = "number";
		var s = "string";
		var b = "boolean";
		var o = "object";
		var f = "function";
		// Overwrite defaults with variables passed to the function
		if(typeof this.q.mode === s) this.mode = this.q.mode;

		return this;
	}

	StarInABox.prototype.loadConfig = function(lang){

		if(!lang) lang = this.lang;

		var dataurl = "config/"+lang+(this.mode ? "_"+this.mode : "")+".json";

		$.ajax({
			url: dataurl,
			method: 'POST',
			dataType: 'json',
			context: this,
			error: function(){
				if(lang == "en"){
					this.error((this.phrasebook && this.phrasebook.error && this.phrasebook.error.langload) ? this.phrasebook.error.langload.replace('%FILE%',dataurl) : "Couldn't load language from "+dataurl);
				}else{
					// Loop over to see if the current language shortcode is in our list
					var n = (this.langlookup[lang]) ? this.langlookup[lang] : lang;
					this.warn("Couldn't load "+n+".");
					if(lang!=this.langshort){
						// We couldn't find the long version of the language e.g. "en-GB" so try the short version
						this.warn('Attempting to load '+this.langshort+'.');
						this.loadConfig(this.langshort);
					}else{
						// Couldn't find anything so default to basic English
						this.loadConfig("en");
					}
				}
			},
			success: function(data){
				this.langcurrent = lang;
				this.langdir = data.language.alignment;
				this.stages = data.phrasebook.stages;
				$.extend(this.phrasebook, data.phrasebook);
				this.setupMode();
			}
		});
		return this;
	}

	StarInABox.prototype.warn = function(msg){
		if(console && typeof console.log==="function") console.log('Warning: '+msg)
		return this;
	}
	
	StarInABox.prototype.error = function(msg){
		if($('#loader #loaderror').length==0) $('#loader').append('<div id="loaderror"></div>');
		$('#loader #loaderror').html(msg);
		$('#loader').addClass('error').show().delay(5000).fadeOut();
		if(console && typeof console.log==="function") console.log('Error: '+msg)
		return this;
	}
	
	StarInABox.prototype.removeCrosshair = function(){

		// Draw a crosshair to show current cursor position
		if(this.chart.crosshair){
			this.chart.crosshair.remove();
			this.chart.crosshair = "";
		}
		if(this.chart.ycursor){
			this.chart.ycursor.remove();
			this.chart.ycursor = "";
		}
		if(this.chart.ycursorbg){
			this.chart.ycursorbg.remove();
			this.chart.ycursorbg = "";
		}
		if(this.chart.xcursor){
			this.chart.xcursor.remove();
			this.chart.xcursor = "";
		}
		if(this.chart.xcursorbg){
			this.chart.xcursorbg.remove();
			this.chart.xcursorbg = "";
		}
		return this;
	}

	// Draw a crosshair to show current cursor position
	StarInABox.prototype.drawCrosshair = function(x,y){

		var xy = this.getXYFromPix(x,y);

		if(typeof xy==="object"){
			this.chart.crosshair = this.chart.holder.path("M"+Math.max(x,this.chart.offset.left)+","+this.chart.offset.top+"L"+Math.max(x,this.chart.offset.left)+","+(this.chart.offset.top+this.chart.offset.height)+'M'+this.chart.offset.left+","+(y-0.5)+"L"+(this.chart.offset.left+this.chart.offset.width)+","+(y-0.5)).attr({'stroke':'#df0000'});
			this.chart.ycursorbg = this.chart.holder.rect(this.chart.offset.left+0.5, y, 10, parseInt(this.chart.opts.yaxis['font-size'])+10);
			this.chart.ycursor = this.chart.holder.text(this.chart.offset.left+5, y, (xy[1] < 100 ? xy[1].toPrecision(2) : Math.round(xy[1]))).attr({'text-anchor': 'start','fill': '#fff','font-size':this.chart.opts.yaxis['font-size']});
			this.chart.ycursorbg.attr({'width':this.chart.ycursor.getBBox().width+10,'height':this.chart.ycursor.getBBox().height+10,'y':y-this.chart.ycursor.getBBox().height/2-5,'fill': '#df0000','border':'0px','stroke-width':0});
			this.chart.xcursorbg = this.chart.holder.rect(x, this.chart.offset.top+this.chart.offset.height-parseInt(this.chart.opts.xaxis['font-size'])-10.5, 0, parseInt(this.chart.opts.xaxis['font-size'])+10);
			this.chart.xcursor = this.chart.holder.text(x, this.chart.offset.top+this.chart.offset.height-parseInt(this.chart.opts.xaxis['font-size']), Math.round(xy[0])).attr({'text-anchor': 'middle','fill': '#fff','font-size':this.chart.opts.xaxis['font-size']});
			this.chart.xcursorbg.attr({'width':this.chart.xcursor.getBBox().width+10,'x':x-this.chart.xcursor.getBBox().width/2-5,'fill': '#df0000','border':'0px','stroke-width':0});
		}

		return this;
	}

	StarInABox.prototype.findMassIndex = function(mass){
		for(var i = 0; i < this.massVM.length; i++){
			if(mass == this.massVM[i]) return i;
		}
		return 0;
	}
	StarInABox.prototype.setupUI = function(){
		// Define if we can open the box or not
		$('#welcome').bind('mouseover',{box:this},function(e){ e.data.box.canopen = false; }).bind('mouseout',{box:this},function(e){ e.data.box.canopen = true; });
		$("#box-lid").on('click',{box:this},function(e){
			//e.preventDefault();
			if(e.data.box.canopen) e.data.box.toggleLid();
		});

		$('#lid-open').before('<form id="modeform" action=""><label class="toggle-label1" for="optnormal">'+this.phrasebook.modes.normal+'</label><div class="toggle-bg"><input type="radio" value="" id="optnormal" name="togglemode"'+(this.mode=="advanced" ? "" : ' checked="checked"')+' title="'+this.phrasebook.modes.toggle+'"><input type="radio" value="advanced" id="optadvanced" name="togglemode"'+(this.mode=="advanced" ? ' checked="checked"' : '')+' title="'+this.phrasebook.modes.toggle+'"><span class="switch"></span><label for="optadvanced">'+this.phrasebook.modes.advanced+'</label></div></form>');
		$('#modeform input[name=togglemode]').on('change',{box:this},function(e){ e.data.box.toggleMode($(this).val()); });
		$('#modeform input').on('click',function(){ $(this).focus(); });

		this.registerKey('w',function(){ this.supernovaWarning() });
		this.registerKey('s',function(){ this.supernova() });
		this.registerKey('t',function(){ $('#summary').trigger('click'); });
		this.registerKey('a',function(){ $('#help').trigger('click'); });
		this.registerKey('l',function(){ this.toggleLid() },'lid');
		this.registerKey('m',function(){ this.toggleMode() },'mode');
		this.registerKey('1',function(){ this.slidePanel(0); },'size');
		this.registerKey('2',function(){ this.slidePanel(1); },'temperature');
		this.registerKey('3',function(){ this.slidePanel(2); },'luminosity');
		this.registerKey('4',function(){ this.slidePanel(3); },'stage');
		this.registerKey('5',function(){ this.slidePanel(4); },'mass');
		this.registerKey('-',function(){ this.slidePanelBy(-1); });
		this.registerKey('=',function(){ this.slidePanelBy(1); });
		this.registerKey(32,function(){ this.play(); },"play");
		this.registerKey(37,function(){ if(this.open) this.animateStep(-1); });
		this.registerKey(39,function(){ if(this.open) this.animateStep(1); });
		this.registerKey('>',function(){ $('#starMass select option:selected').removeAttr('selected').next('option').attr('selected', 'selected'); $('#starMass select').trigger('change'); });
		this.registerKey('<',function(){ $('#starMass select option:selected').removeAttr('selected').prev('option').attr('selected', 'selected'); $('#starMass select').trigger('change'); });

		$(document).bind('keypress',{box:this},function(e){
			if(!e) e = window.event;
			var code = e.keyCode || e.charCode || e.which || 0;
			e.data.box.keypress(code,e);
		});
		
		//make nav divs clickable
		$("#nav .item").click(function(e){
			e.preventDefault();
			if($(this).hasClass("active")){
				//if already active
			}else{
				el = $($(this).attr('href'));
				$("#nav .item").removeClass("active");	
				$(this).addClass("active");
				var sliderID = (el.attr("class").split(" "))[1];
				$("#slide").css({top:-((sliderID-1)*400)+"px"});
			}
			$(this).focus();
		});
		
		$("#right .info").click(function(){
			var clickedI = $(this);
			var clickedC = $(clickedI).siblings(".caption");
			if($(clickedI).hasClass("active")){
				$(clickedI).removeClass("active");
				$(clickedC).stop().animate({top:(0 - $(clickedC).outerHeight())},300);
			}else{
				$(clickedI).addClass("active");
				$(clickedC).stop().animate({top:0},300);
			}
		});
		$("#right .caption").each(function(){
			var mTop = $(this).outerHeight();
			$(this).css("top",(0 - mTop));
		});
		$('#lid-open a').click({box:this},function(e){ e.preventDefault(); e.data.box.toggleLid(); });
		// add gradient to buttons after loading as it breaks the pre-loader!
		if($.browser == "webkit" || $.browser == "safari") $("a#animateEvolve, a#animateEvolveReset").css("background","-webkit-gradient(linear, left top, left bottom, from(#ddd), to(#6b6b6b))");
		if($.browser == "mozilla") $("a#animateEvolve, a#animateEvolveReset").css("background","-moz-linear-gradient(top, #ddd, #6b6b6b)");

		// help
		$('#help').click({box:this},function(e){
			$('#welcome').removeClass('summary lang').addClass('help');
			if(e.data.box.open) e.data.box.toggleLid();
			$('#welcome #help-content').css({opacity: 0}).animate({opacity: 1},500);
		});
	
		// open/close info panel
		$("#info .tab").click({box:this},function(e){ e.data.box.toggleInfoPanel(); });

		//thermometer
		var txtprops = {'text-anchor': 'start','fill': '#fff','font-size': this.chart.opts.yaxis['font-size']};
		var txtprops2 = {'text-anchor': 'start','fill': '#fff','font-size': this.chart.opts['font-size']};

		this.thermometer = new Thermometer({'id':'thermometer','phrasebook':this.phrasebook,'txt':txtprops2,'labeltxt':txtprops});

		this.lightmeter = new LightMeter({'id':'rlum','phrasebook':this.phrasebook,'txt':txtprops2,'labeltxt':txtprops});

		this.stopwatch = new Stopwatch(this);

		// animate evolution over selected stages
		$("#evolve").change({box:this},function evolveStar(e) {
			var el = e.data.box.getData(e.data.box.timestep);
			e.data.box.sizeComparison.star.attr("fill", el.RGB);
			e.data.box.setcomparisonStarSize(el.radius);
		});

		this.eAnim = '';

		$('a.control_play').click({box:this},function (e) {
			e.preventDefault();
			e.data.box.play();
		});
		$("a.control_reset").click({box:this},function(e){
			e.preventDefault();
			e.data.box.reset();
		});
		$("a.control_rewind").click({box:this},function(e){
			e.preventDefault();
			e.data.box.animateStep(-1);
		});
		$("a.control_ff").click({box:this},function(e){
			e.preventDefault();
			e.data.box.animateStep(+1);
		});

		$("#evolveSpeed").on('change',{box:this},function(e){
			e.data.box.changeSpeed($(this).find("option:selected").attr("value"));
		});
		 
		//show summary
		$('#summary').click({box:this},function (e) {
			$('#welcome').removeClass('help lang').addClass('summary');
			if(e.data.box.open) e.data.box.toggleLid();
			e.data.box.displaySummary();
			$('#summary-content').focus();
		});

		if(this.langs.length > 1){
			$('#menu ul').prepend('<li><a id="lang" href="#selectlang">['+this.langcurrent+']</a></li>');
			//show summary
			$('#lang').click({box:this},function (e) {
				$('#welcome').removeClass('help summary').addClass('lang');
				if(e.data.box.open) e.data.box.toggleLid();
				$('#lang-content').focus();
			});
		}

		this.el = {
			"time": $("#tevTime"),
			"stagelabel": $('#current-stage')
		}
		return this;
	}
	
	StarInABox.prototype.setupMode = function(){

		// Update page title (make sure we encode the HTML entities)
		if(this.phrasebook.title) $('html title').text(htmlDecode(this.phrasebook.title));
		
		// Set language direction via attribute and a CSS class
		$('#container').attr('dir',(this.langdir=="right" ? 'rtl' : 'ltr')).removeClass('ltr rtl').addClass((this.langdir=="right" ? 'rtl' : 'ltr'));

		// Update lid image with one for this language
		// We'll try to load it in the background and if that is successful we replace it.
		// This allows for the non-existence of the appropriate file
		if($('#box-lid #lid').length == 0) $('#box-lid').prepend('<div id="lid"><img src="css/images/lid_en.jpg" /></div>');
		var cache = new Image();
		var fn = function(){ $('#box-lid #lid img').attr('src',cache.src); }
		cache.onload = fn;
		cache.src = 'css/images/lid_'+this.langcurrent+'.jpg';
		if(cache.complete) fn();

		// Update mode labels
		if(this.phrasebook.modes){
			if(this.phrasebook.modes.normal) $('#modeform label').eq(0).html(this.phrasebook.modes.normal);
			if(this.phrasebook.modes.advanced) $('#modeform label').eq(1).html(this.phrasebook.modes.advanced);
		}

		// Update intro message
		if(this.phrasebook.intro) $('#welcome-content h1').html(this.phrasebook.intro.title);
		if(this.phrasebook.intro) $('#welcome-content .jsonly').html(this.phrasebook.intro.content);

		$('#info .tab').text(this.phrasebook.help.tab);
		if($('#info .closer').length == 0){
			$('#infocontent').before('<div class="closer"><a href="#">&times;</a></div>');
			$('#info .closer a').on('click',{box:this},function(e){ e.data.box.toggleInfoPanel(); });
		}
		// The keys in the help use underscores rather than dots to avoid confusion with dot notation
		$('#infocontent').html(this.phrasebook.help.content["m"+((this.mass ? this.mass : this.initStarMass)+"").replace('.','_')]);
		this.thermometer.updateLanguage(this.phrasebook);
		this.lightmeter.updateLanguage(this.phrasebook);
		this.stopwatch.rebuild();
		if(this.phrasebook.mass) $('#starMass .value strong').html(this.phrasebook.mass);
		$(this.scaletext).find('.units').html(this.phrasebook.massunit);
		this.sizeComparison.sunLabel.attr('text',this.phrasebook.sun);
		this.el.stagelabel.find('strong').html(this.phrasebook.stage+":");
		this.el.time.find('.units').html(this.phrasebook.timescale);
		if(this.phrasebook.caution) $('.caution').html(this.phrasebook.caution);

		$("#lid-open a").html(this.open ? this.phrasebook.close : this.phrasebook.open);

		// Update panel buttons
		$('#nav a').eq(0).attr('title',htmlDecode(this.phrasebook.buttons.size));
		$('#nav a').eq(1).attr('title',htmlDecode(this.phrasebook.buttons.temperature));
		$('#nav a').eq(2).attr('title',htmlDecode(this.phrasebook.buttons.luminosity));
		$('#nav a').eq(3).attr('title',htmlDecode(this.phrasebook.buttons.stage));
		$('#nav a').eq(4).attr('title',htmlDecode(this.phrasebook.buttons.mass));

		// Update speed dropdown
		var _obj = this;
		$('#evolveSpeed option').each(function(i){
			$(this).text(_obj.phrasebook.speeds[i]);
		})
		
		// Update control buttons
		if(this.phrasebook.buttons.play) $('#controls img.play').attr('alt','').parent('a').attr('title',htmlDecode(this.phrasebook.buttons.play));
		if(this.phrasebook.buttons.reset) $('#controls img.reset').attr('alt','').parent('a').attr('title',htmlDecode(this.phrasebook.buttons.reset));

		if(this.tutorialstep < this.phrasebook.tutorial.length){
			$('#hinttext .poppitypin-inner').html(this.phrasebook.tutorial[this.tutorialstep].replace('%COLOR%',this.chart.opts.path.color));
		}

		// Update box border options
		if(this.phrasebook.data) $('#summary').text(this.phrasebook.data.title);
		if(this.phrasebook.about) $('#help').text(this.phrasebook.about.title);
		if(this.langs.length > 1) $('#lang').text('['+this.langcurrent+']').attr('title',htmlDecode((this.phrasebook.language ? this.phrasebook.language : '')));

		// Update title attribute for mass selector
		if(this.phrasebook.massunit) $('#starMass select').attr('title',htmlDecode(this.phrasebook.mass+' ('+this.phrasebook.massunit+')'));

		// Update info panels
		for(var name in this.phrasebook.captions){
			if($('#'+name).length > 0) $('#'+name+' .caption').html(this.phrasebook.captions[name])
		}

		// Update Data Table
		this.updateSummary();
		
		// Update About
		if($('#help-content').length > 0 && $('#help-content').text().length > 0 && typeof this.phrasebook.about==="object"){
			var o = "";
			if(this.phrasebook.keys){
				for(var i = 0; i < this.keys.length ; i++){ if(this.keys[i].txt && this.phrasebook.keys[this.keys[i].txt]) o += '<li><strong class="key">'+this.keys[i].str+'</strong> &rarr; '+(this.phrasebook.keys ? this.phrasebook.keys[this.keys[i].txt] : '')+'</li>'; }
			}
			if(o) o = "<ul class=\"keyboard-controls\">"+o+"</ul>";
			$('#help-content').html('<h2>'+this.phrasebook.about.title+'</h2>'+this.phrasebook.about.content.replace("%CONTROLLIST%",o));
		}
		
		$('#lang-content ul a').off('click');
		// Build the language selector
		var html = '<h2>'+this.phrasebook.language+'</h2><ul>';
		var css;
		for(var i = 0; i < this.langs.length ; i++){
			css = (this.langs[i]==this.langcurrent) ? ' class="selected"' : '';
			html += '<li'+css+'><a href="#" data="'+this.langs[i]+'">'+this.langlookup[this.langs[i]]+' ['+this.langs[i]+']</a></li>';
		}
		html += '</ul>';
		$('#lang-content').html(html);
		// Add the events
		$('#lang-content ul a').on('click',{me:this},function(e){
			e.data.me.loadConfig($(this).attr('data'));
		});

		this.updateChart();
		return this;
	}

	StarInABox.prototype.toggleMode = function(mode){
		if(!mode){
			this.mode = (this.mode=="advanced") ? "" : "advanced";
		}else{
			this.mode = mode;
		}
		if($('input#optadvanced').length > 0){
			if(this.mode=="advanced") $('input#optadvanced').attr('checked','checked');
			else $('input#optnormal').attr('checked','checked');
		}
		this.loadConfig();
		this.loadChartData(this.mass);
	}
	
	StarInABox.prototype.supernova = function(){
		var c = $('#container');
		var b = $('#box-top');
		if($('.supernova').length == 0) $('#container').append('<div class="supernova"></div>');
		if(this.open){
			if($('.supernovaflash').length == 0) $('body').append('<div class="supernovaflash"></div>');
			$('.supernovaflash').clearQueue().css({position:'absolute',left:0,top:0,right:0,bottom:0,opacity:1}).animate({opacity:0},500,function() { $(this).remove(); });
		}
		$('.caution').hide();
		$('.supernova').clearQueue().css({position:'absolute',width:c.width()-10,left:5,top:5,height:c.height()-10,'z-index':(b.css('z-index')-2),opacity:1}).delay(200).animate({opacity:0},1500,"easeOutExpo",function() { $(this).remove(); });
		c.clearQueue().css({left:'0px'}).animate({left:"-=12px"},20).animate({left:"+=20px"},20).animate({left:"-=4px"},50).animate({left:"+=7px"},50).animate({left:"-=15px"},50).animate({left:"+=5px"},70).animate({left:"-=2px"},80);
	}
	StarInABox.prototype.supernovaWarning = function(){
		c = $('#container');
		b = $('#box-top');
		if($('.caution').length == 0) $('#container').append('<div class="caution"></div>');
		$('.caution').show().css({top:"0px"}).animate({top: "30px"},500,function(){ setTimeout("$('.caution').hide()",7000); });
	}
	StarInABox.prototype.play = function(e){
		if($('#hinttext').length > 0) $('#hinttext').remove();
		if(this.animating){
			clearInterval(this.eAnim);
			$("a#animateEvolve").text('Start');
			$("a#animateEvolveReset").css('display', '');
			$("a.control_play img.pause").removeClass('pause').addClass('play');
			this.animating = false;
		}else{
			clearInterval(this.eAnim);
			this.animating = true;
			if(this.infoopen) this.toggleInfoPanel();
			$("a#animateEvolveReset").css('display', 'none');
			if(this.timestep == this.eAnimPoints.length-1) this.reset();

			//animate through stages...
			$("a#animateEvolve").text('Pause');
			this.duration = $("#evolveSpeed option:selected").attr("value");
			var _obj = this;
			this.eAnim = setInterval(function () { _obj.animateStep(1,_obj.reduction); }, this.duration);
			$("a.control_play img.play").removeClass('play').addClass('pause');
		}
		return this;
	}
	StarInABox.prototype.setTime = function(t){
		var old = this.timestep;
		t = (typeof t=="number") ? t : 0;
		if(this.data && this.data.data){
			for(var i = 0; i < this.data.data.length ; i++){
				if(this.data.data[i].t <= this.time){
					this.timestep = i;
					continue;
				}
			}
		}

		return this;
	}
	StarInABox.prototype.setTimeStep = function(i){
		var old = this.timestep;

		this.timestep = (typeof i=="number") ? i : l-1;
		if(this.data && this.data.data && this.timestep > this.data.data.length-1 && this.data.data[this.data.data.length-1].t < this.time) this.timestep = this.data.data.length-1;

		this.time = this.data.data[this.timestep].t;

		return this;
	}
	StarInABox.prototype.changeSpeed = function(d){
		this.duration = d;
		// If we are already animating we need to pause and start the animation again
		if(this.animating) this.play().play()
	}
	StarInABox.prototype.animateStep = function(delta,reduction){
		duration = this.duration;
		if(!reduction) reduction = 1;
		if(!this.timestep){ this.setTimeStep(0); }
		this.timestep += delta;

		if(this.timestep >= this.eAnimPoints.length){
			$("a#animateEvolve").text('Start');
			clearInterval(this.eAnim);
			$("a#animateEvolveReset").css('display', '');
			$("a#animateEvolveReset").css('display', 'n');
			$("a.control_play img.pause").removeClass('pause').addClass('play');
			if(delta > 0) this.setTimeStep(this.eAnimPoints.length-1);
			this.animating = false;
		} else {
			if(this.timestep < 0) this.setTimeStep(0);
			el = this.getData(this.timestep);
			if(typeof el=="object"){
				if(this.data.data[this.timestep].type > 10){
					if(this.data.data[this.timestep].type != this.data.data[this.timestep-1].type){
						if(this.data.data[this.timestep].type > 11) this.supernova();
					}
				}
				var ahead = this.timestep + 100;
				if(ahead < this.data.data.length){
					if(ahead == this.stageIndex[this.stageIndex.length-1] && this.data.data[ahead].type > 11) this.supernovaWarning();
				}
				if(this.timestep % reduction == 0){
					if(this.timestep < this.data.data.length) {
						r = this.sizeComparison.starR*el.radius
						this.sizeComparison.star.animate({
							cx: (this.sizeComparison.starX+r),
							r: r,
							fill: el.RGB
						}, (duration*reduction));
						this.massComparison.star.animate({
							cy: (this.massComparison.y-r),
							r: r,
							fill: el.RGB
						}, (duration*reduction));
						this.setThermometer(el.temp);
						this.lightmeter.level(el.lum, true, el.RGB);
						this.updateCurrentStage();
					}
				}
				this.stopwatch.update();
				this.updateScaleText();
				this.displayTime(el.t);
				// In the case of 0 luminosity the y-value is returned as negative.
				if(this.eAnimPoints[this.timestep][1] < 0 || this.eAnimPoints[this.timestep][0] < 0) {
					this.chart.star.attr({ cx: (-20), cy: (-20) });
				}else{
					this.chart.star.attr({ cx: (this.eAnimPoints[this.timestep][0]), cy: (this.eAnimPoints[this.timestep][1]) });
				}
			}
		}
	}
	StarInABox.prototype.setThermometer = function(temp){
		this.thermometer.setTemperature(temp);
	}
	StarInABox.prototype.slidePanelBy = function(p){

		var selected = 0;
		
		// Get currently selected panel
		$('#nav .item').each(function(i){
			if($(this).hasClass('active')) selected = i;
		});

		return this.slidePanel(selected + p);
	}
	StarInABox.prototype.slidePanel = function(p){

		var items = $('#nav .item');

		if(p >= items.length) p = items.length-1;
		if(p < 0) p = 0;

		// Remove the active class from all panels
		items.removeClass('active');
		
		// Make the requested panel the active one
		items.eq(p).addClass('active');
		
		sliderID = p+1;
		$("#slide").css({top:-((sliderID-1)*400)+"px"});

		return this;
	}
	StarInABox.prototype.slideMassTo = function(p){
		clearInterval(this.eAnim);
		var sMass = this.massVM[p];
		this.mass = sMass;
		this.loadingStar();
		//on change get stages for the mass of star!
		this.getStages(sMass);
		this.stageLife = Array();
		this.stageIndex = Array();
		this.setupMode();
		
		$("a#animateEvolve").text('Start');
		$("a#animateEvolveReset").css('display', '');
		this.displayTime(0);
		this.reset();
	}
/*
	StarInABox.prototype.createMassSlider = function(){
		//Add Mass Slider and set defaults
		var that = this;
		$("#mass-slider").slider({
			value: this.findMassIndex(this.initStarMass),
			min: 0,
			max: this.massVM.length - 1,
			step: 1,
			change: function (event, ui) { that.slideMassTo(ui.value); }
		});

		//add ticks
		$("#mass-slider").append('<div class="ticks"></div>');
		var i;
		var msLength = 700;
		var tickSpace = msLength / (this.massVM.length - 1);
		for (var i = 0; i < this.massVM.length; i++) {
			$("#mass-slider .ticks").append("<p class='tick'>" + this.massVM[i] + "</p>");
			$("#mass-slider .ticks p.tick:last").css('left', (i * tickSpace) - 20);
		}
	}
*/
	StarInABox.prototype.toggleLid = function(){
		var _obj = this;
		if(this.transitioning) return this;
		this.transitioning = true;
		if(this.open){
			$("#box-lid").animate({"left": "0px"},1000,function(){
				//move #content to top
				$("#container").removeClass("open").addClass("closed");
				$("#box-lid").removeClass("open");
				$("#lid-open a").html(_obj.phrasebook.open);
				_obj.transitioning = false;
			});
			this.open = false;
		}else{
			//move content underneath lid then animate shut.
			$("#container").removeClass("closed").addClass("open");
			$("#box-lid").animate({"left": "-"+($('#box-lid').outerWidth()-30)+"px"},1000,function(){ _obj.transitioning = false; }).addClass("open");
			$("#lid-open a").html(this.phrasebook.close);
			this.open = true;
		}
		if(this.tutorialstep == 0){
			var context = this;
			var orig = $('#starMass select').attr('title');
			$('#starMass select').attr('title',context.phrasebook.tutorial[0]).focus();
			var bp = new bubblePopup({
				id: 'hinttext', 
				el: $('#starMass select'),
				html: context.phrasebook.tutorial[0],
				align: 'north',
				context: this,
				w: 190,
				dismiss: true,
				animate: true,
				onpop: function(){
					context.tutorialstep++;
					$('#starMass select').attr('title',orig);
					var test;
					// If the user has changed the mass of the star it'll take a little 
					// while until it loads and we need to wait until it has so that we
					// know where to put the next bubble popup.
					function nextstep(context){
						if(!context.loading){
							clearTimeout(test);
							if(context.timestep > 0) return;
							var bp = new bubblePopup({ 
								id: 'hinttext',
								el: $('#chartstar'),
								html: context.phrasebook.tutorial[1].replace('%COLOR%',context.chart.opts.path.color),
								align: 'south',
								context: this,
								w: 200,
								dismiss: true,
								animate: true,
								onpop:function(){
									context.tutorialstep++;
									$('#controls .control_play').focus();
									var bp = new bubblePopup({ 
										id: 'hinttext',
										el: $('#controls .control_play img'),
										html: context.phrasebook.tutorial[2],
										align: 'north',
										w: 200,
										dismiss: true,
										animate: true
									});
			
								}
							});
						}
					}
					test = setInterval(nextstep,100,this);
				}
			});
		}
	}
	StarInABox.prototype.toggleInfoPanel = function(duration){
		//if(typeof duration!="number") duration = 300;
		//if(this.infoopen) $("#info").animate({"bottom": "-70px"}, duration).removeClass("open");
		//else $("#info").animate({"bottom": "0px"}, duration).addClass("open");
		if(this.infoopen) $("#info").removeClass("open");
		else $("#info").addClass("open");
		this.infoopen = !this.infoopen;
	}
	// get stages for current mass function
	StarInABox.prototype.getStages = function(mass){
		if(!this.allstages["m"+mass]) return;
		var data = this.allstages["m"+mass];
		var that = this;

		this.loadChartData(mass);
	}
	StarInABox.prototype.slideStages = function(p){
		clearInterval(this.eAnim);
		this.resetStage(p);
		this.updateEvolve();
		$("a#animateEvolve").text('Start');
		$("a#animateEvolveReset").css('display', '');
	}

	StarInABox.prototype.reset = function(){
		clearInterval(this.eAnim);
		this.animating = false;
		$("a.control_play img.pause").removeClass('pause').addClass('play');
		this.resetStage();
		$("a#animateEvolve").text('Start');
		this.updateCurrentStage();
	}
	// Jump to the start of a specific stage in the star's life
	// Input:
	//   i - the index of the life stage
	StarInABox.prototype.resetStage = function(i){
		this.stage = (typeof i==="number") ? i+1 : 1; //$('#stages').slider("value")+1;
		this.assessStages();
		if(i){
			if(i < 1 || i > this.stageIndex.length) return;
		}else i = this.stage;
		
		i = this.stageIndex[i];

		this.jumpTo(i);
		return this;
	}

	StarInABox.prototype.assessStages = function(){
		if(!this.data.data) return;
		if(!this.allstages["m"+this.data.mass]) return;
		var that = this;
		var ii = 0;
		var n = 0;
		var type = new Array(0, this.data.data[0].type);
		this.stageIndex = [0];
		var eType,change
		for (var i = 0; i < this.data.data.length; i++) {
			eType = this.data.data[i].type;
			change = false;
			if (eType != type[1] || i == this.data.data.length-1) {
				type[1] = eType;
				type[0]++;
				ii = 0;
				change = true;
				if(!this.stageIndex[type[0]]) this.stageIndex[type[0]] = n;
				n = i;
			}
			if(!this.stageLife[type[0]]) this.stageLife[type[0]] = new Array();
			this.stageLife[type[0]][ii] = [this.data.data[i].type, this.stages[this.data.data[i].type], this.data.data[i].t];
			ii++;
		}
		this.sEnd = 11;
		this.sStart = this.stage;

		if(typeof data=="object") this.sEnd = data[data.length - 1].type
	}

	// Jump to a specific data point in the star's life
	// Input:
	//   i - the index of the data point
	StarInABox.prototype.jumpTo = function(i) {

		this.setTimeStep(i);

		var p = this.getData(this.timestep);
		if(typeof p=="object"){
			this.displayTime(p.t);
			this.sStarReset();
			this.setComparisonStar(i);
			this.lightmeter.level(p.lum,false,p.RGB);
			this.setThermometer(p.temp);
			this.stopwatch.update();
			this.createScales();
			this.updateCurrentStage();
		}
		this.chart.star.attr("cx", (this.eAnimPoints[this.timestep][0]));
		this.chart.star.attr("cy", (this.eAnimPoints[this.timestep][1]));
		return this;	
	}


	StarInABox.prototype.createScales = function(){
		if(!this.rScales) return;
		if(!this.scales){
			var ox = 140;
			var oy = 250;
			var h = 10;
			var w = 80;
			var t = 4;
			this.balance = this.rScales.set();
			this.balance.push(this.rScales.path("M"+(ox-w*1.2-h)+" "+(oy-h)+" l "+h+" "+h+", "+(w*2.4)+" 0, "+h+" -"+h).attr({'stroke':'white','stroke-width':t,'stroke-linecap':'round'}));
			this.balance.push(this.rScales.rect(ox-w/4,oy,w/2,w/2).attr({'fill':'white','fill-opacity':0.5,'stroke-width':0}));
			this.scales = this.rScales.rect(ox-w,oy+w*0.2,w*2,w*0.8,10).attr({'fill':'black','stroke':'white','stroke-width':w*0.25});
			if(!this.scaletext) $('#rScales').append('<div id="scaletext">0.0</div>');
			this.scaletext = $('#scaletext')
			this.scaletext.css({'left':(ox-w*0.8)+'px','top':(oy+w*0.4)+'px','height':(w*0.4)+'px','width':(w*1.6)+'px','font-size':(w*0.4)+'px'})
			this.massComparison.x = ox;
			this.massComparison.y = oy-t/2;
		}
		this.updateScales();
		this.dropOnScales();
	}
	StarInABox.prototype.dropOnScales = function(){
		this.updateScaleText(0.0);
		var _obj = this;
		this.massComparison.star.animate({ cy: (this.massComparison.y-r) }, 1000,"bounce",function(){
			_obj.updateScaleText();
		});
	}
	StarInABox.prototype.updateScales = function(v){
		this.setComparisonStar();
		r = this.massComparison.star.attr('r');
		this.massComparison.star.attr({cy:(this.massComparison.y-r-100)});
		this.updateScaleText();
	}
	StarInABox.prototype.updateScaleText = function(v){
		if(typeof v!="number"){
			var s = this.getData(this.timestep);
			var v = parseFloat(s.mass);
		}
		this.scaletext.html(v.toFixed(3)+'<span class="units">'+this.phrasebook.massunit+'</span>');
	}
	StarInABox.prototype.fileName = function(mass) {
		// Only the 1 solar mass star has a different path at the moment
		return "db/star_"+mass+"_solar_mass"+(mass==1 && this.mode ? "_"+this.mode : "");
	}
	StarInABox.prototype.loadChartData = function(mass) {
	
		var dataurl = this.fileName(mass)+".json";

		$.ajax({
			url: dataurl,
			method: 'POST',
			dataType: 'json',
			context: this,
			error: function(blah){
				this.error((this.phrasebook && this.phrasebook.error && this.phrasebook.error.starload) ? this.phrasebook.error.starload : "The star failed to form. Sorry.");
			},
			success: function(data){
				this.data = data;
				this.setTime(this.time);
				this.rebuildCharts();
			}
		});
	}
	StarInABox.prototype.rebuildCharts = function() {
		this.assessStages();
		this.updateCurrentStage();
		this.updateChart();
		this.setComparisonStar(0);
		this.stopwatch.rebuild();
		this.createScales();
		this.doneLoadingStar();
	}
	StarInABox.prototype.setComparisonStar = function(i) {
		if(!i) i = this.timestep;
		if(i > this.data.data.length) return;
		var d = this.getData(i);
		if(typeof d=="object"){
			this.setcomparisonStarSize(d.radius);
			this.setcomparisonStarColour(d.RGB);
		}
	}
	StarInABox.prototype.setcomparisonStarSize = function(sm) {
		var r = sm*this.sizeComparison.starR;
		if(r){
			this.sizeComparison.star.attr({cx:(this.sizeComparison.starX+r),r:r});
			this.massComparison.star.attr({cx:this.massComparison.x,cy:(this.massComparison.y-r),r:r});
		}
	}
	StarInABox.prototype.setcomparisonStarColour = function(value) {
		this.sizeComparison.star.attr({"fill":value,"stroke-width":"0"});
		this.massComparison.star.attr({"fill":value,"stroke-width":"0"});
	}
	StarInABox.prototype.sStarReset = function() {
		this.sizeComparison.star.remove();
		this.sizeComparison.star = this.sizeComparison.paper.circle(this.sizeComparison.starX, this.sizeComparison.starY, this.sizeComparison.starR);
	}
	StarInABox.prototype.log10 = function(v) {
		return Math.log(v)/2.302585092994046;
	}
	// Get the pixel positions for the given temperature and luminosity
	// Inputs:
	//   T - the temperature (Kelvin)
	//   L - luminosity (Solar luminosities)
	//   type - is this "log" or not
	// Output:
	//   [x,y]
	StarInABox.prototype.getPixPos = function(T,L,type){
		var x = T;
		var y = L;
		if(!type || type!="log"){
			x = this.log10(x);
			y = this.log10(y);
		}
		if(typeof this.chart.opts.xaxis.max=="number" && x > this.chart.opts.xaxis.max) return [-1,-1]
		var newx = this.chart.offset.left + this.chart.offset.width*(Math.abs(this.chart.opts.xaxis.max-x)/(this.chart.opts.xaxis.max-this.chart.opts.xaxis.min));
		if(y < this.chart.opts.yaxis.min) return [newx,-1];
		else return [newx,this.chart.height-(this.chart.offset.bottom + this.chart.offset.height*((y-this.chart.opts.yaxis.min)/(this.chart.opts.yaxis.max-this.chart.opts.yaxis.min)))];
	}

	// Return the temperature and luminosity values for the xpx,y pixel positions
	// Inputs:
	//   x - the pixel position in the x-direction
	//   y - the pixel position in the y-direction
	//   type - is this "log" or not
	// Output:
	//   [T,L] - temperature (K) and luminosity (Solar luminosities)
	StarInABox.prototype.getXYFromPix = function(x,y,type){

		if(x < this.chart.offset.left || x > this.chart.offset.left+this.chart.offset.width) return;
		if(y < this.chart.offset.top || y > this.chart.offset.top+this.chart.offset.height) return;

		var x = this.chart.opts.xaxis.max - (x - this.chart.offset.left)*(this.chart.opts.xaxis.max-this.chart.opts.xaxis.min)/this.chart.offset.width;
		var y = this.chart.opts.yaxis.min - (this.chart.opts.yaxis.max-this.chart.opts.yaxis.min)*((y - this.chart.height + this.chart.offset.bottom)/this.chart.offset.height);

		var T = x;
		var L = y;
		
		if(!type || type!="log"){
			T = Math.pow(10,x);
			L = Math.pow(10,y);
		}

		return [T,L];
	}

	StarInABox.prototype.getChartOffset = function(){
		if(typeof this.chart!="object") this.chart = {'offset':{}}
		if(typeof this.chart.offset!="object") this.chart.offset = {}
		if(!this.chart.offset.top) this.chart.offset.top = 1;
		if(!this.chart.offset.left) this.chart.offset.left = 20;//62;
		if(!this.chart.offset.right) this.chart.offset.right = 1;
		if(!this.chart.offset.bottom) this.chart.offset.bottom = 20;//18;
		this.chart.offset.width = this.chart.width-this.chart.offset.right-this.chart.offset.left;
		this.chart.offset.height = this.chart.height-this.chart.offset.bottom-this.chart.offset.top;
	}
	StarInABox.prototype.updateChart = function() {
		var start = new Date();

		var p,p1,p2,mid,m,c,v,s,str,ms;
		this.getChartOffset();
		if(!this.chart.mainSequence){
			m = 6.1;
			c = 23.2;
			p1 = this.getPixPos(7352,6.3);
			p2 = this.getPixPos(17731,941);
			mid = this.getPixPos(11480,108);
			str = '';
			// Build path to describe Main Sequence using [temp,lum] points marking out its border
			ms = [[2700,0.0005],[2700,0.0016],[6000,5],[7500,30],[9000,90],[12500,630],[16367,2780],[21500,15000],[27000,107000],[33000,600000],[42000,500000],[45000,130000],[25000,1800],[19000,270],[15000,70],[9000,4.5],[5000,0.06],[3000,0.001]];
			for(var i = 0 ; i < ms.length ; i++){
				p = this.getPixPos(ms[i][0],ms[i][1]);
				str += p[0]+","+p[1]+" ";
				if(i == 0) str += 'R';
			}
			this.chart.ms = this.chart.holder.path("M"+str+'Z').attr({
				"fill" : this.chart.opts.mainsequence['background-color'],
				"fill-opacity": this.chart.opts.mainsequence.opacity,
				"stroke-width": 0
			});
			this.chart.mainSequenceLabel = this.chart.holder.text(mid[0],mid[1],this.phrasebook.ms).attr({ fill: this.chart.opts.mainsequence.color,'font-size': this.chart.opts['font-size'],'text-anchor':'middle' }).rotate(Raphael.angle(p1[0],p1[1],p2[0],p2[1]));

		}
		if(!this.chart.axes) this.chart.axes = this.chart.holder.rect(this.chart.offset.left,this.chart.offset.top,this.chart.offset.width,this.chart.offset.height).attr({stroke:'rgb(0,0,0)','stroke-opacity': 0.5,'stroke-width':2});
		if(this.chart.yLabel) this.chart.yLabel.remove();
		this.chart.yLabel = this.chart.holder.text(this.chart.offset.left - 10, this.chart.offset.top+(this.chart.offset.height/2), htmlDecode(this.phrasebook.lum+" ("+this.phrasebook.lumunit+")")).attr({fill: (this.chart.opts.yaxis.label.color ? this.chart.opts.yaxis.label.color : this.chart.opts.color),'fill-opacity': (this.chart.opts.yaxis.label.opacity ? this.chart.opts.yaxis.label.opacity : 1),'font-size': this.chart.opts['font-size'] }).rotate(270);
		if(!this.chart.sub){
			v = [2,3,4,5,6,7,8,9]
			this.chart.sub = []
			for(var i = 0 ; i < v.length ; i++){
				this.chart.sub[i] = this.log10(v[i]);
			}
		}
		if(!this.chart.yaxis){
			this.chart.yaxis = this.chart.holder.set();
			for(var i = Math.ceil(this.chart.opts.yaxis.min); i <= Math.floor(this.chart.opts.yaxis.max); i++) {
				p1 = this.getPixPos(this.chart.opts.xaxis.max,i,"log");
				p2 = this.getPixPos(this.chart.opts.xaxis.min,i,"log");
				this.chart.yaxis.push(this.chart.holder.path("M"+p1[0]+","+p1[1]+"L"+p2[0]+","+p2[1]).attr({ stroke: this.chart.opts.grid.color,'stroke-opacity':this.chart.opts.grid.opacity,'stroke-width':(this.chart.opts.grid.width ? this.chart.opts.grid.width : 0.5)}));
				this.chart.yaxis.push(this.chart.holder.text(p1[0]+5,p1[1],addCommas(Math.pow(10, i))).attr({
					'text-anchor': 'start',
					'fill': (this.chart.opts.grid.label.color ? this.chart.opts.grid.label.color : this.chart.opts.color),
					'fill-opacity': (this.chart.opts.grid.label.opacity ? this.chart.opts.grid.label.opacity : 0.5),
					'font-size': this.chart.opts.yaxis['font-size']
				}));
				for(var j = 0; j < this.chart.sub.length ; j++){
					if(i+this.chart.sub[j] < this.chart.opts.yaxis.max){
						p1 = this.getPixPos(this.chart.opts.xaxis.max,i+this.chart.sub[j],"log");
						p2 = this.getPixPos(this.chart.opts.xaxis.min,i+this.chart.sub[j],"log");
						s = this.chart.opts.grid.sub;
						this.chart.yaxis.push(this.chart.holder.path("M"+p1[0]+","+p1[1]+"L"+p2[0]+","+p2[1]).attr({ stroke: s.color,'stroke-opacity': s.opacity,'stroke-width':(s.width ? s.width : 0.5)}));
					}
				}
			}
		}
		if(this.chart.xLabel) this.chart.xLabel.remove();
		this.chart.xLabel = this.chart.holder.text(this.chart.offset.left+this.chart.offset.width/2, this.chart.height-this.chart.offset.bottom + 10, htmlDecode(this.phrasebook.temp+" ("+this.phrasebook.tempunit+")")).attr({ fill: (this.chart.opts.xaxis.label.color ? this.chart.opts.xaxis.label.color : this.chart.opts.color), 'fill-opacity': (this.chart.opts.xaxis.label.opacity ? this.chart.opts.xaxis.label.opacity : 1),'font-size': this.chart.opts['font-size'] });
		if(!this.chart.xaxis){
			this.chart.xaxis = this.chart.holder.set();
			for (var i = Math.floor(this.chart.opts.xaxis.min); i <= Math.floor(this.chart.opts.xaxis.max); i++) {
				p1 = this.getPixPos(i,this.chart.opts.yaxis.min,"log");
				p2 = this.getPixPos(i,this.chart.opts.yaxis.max,"log");
				this.chart.xaxis.push(this.chart.holder.path("M"+p1[0]+","+p1[1]+"L"+p2[0]+","+p2[1]).attr({ stroke: this.chart.opts.grid.color,'stroke-opacity':this.chart.opts.grid.opacity,'stroke-width':(this.chart.opts.grid.width ? this.chart.opts.grid.width : 0.5)}));
				this.chart.xaxis.push(this.chart.holder.text(p1[0],p1[1]-10,addCommas(Math.pow(10, i))).attr({
					'text-anchor': (i == Math.floor(this.chart.opts.xaxis.min)) ? "end" : 'middle',
					'fill': (this.chart.opts.grid.label.color ? this.chart.opts.grid.label.color : this.chart.opts.color),
					'fill-opacity': (this.chart.opts.grid.label.opacity ? this.chart.opts.grid.label.opacity : 0.5),
					'font-size' : this.chart.opts.xaxis['font-size'],
				}));
				for(var j = 0; j < this.chart.sub.length ; j++){
					if(i+this.chart.sub[j] < this.chart.opts.xaxis.max){
						p1 = this.getPixPos(i+this.chart.sub[j],this.chart.opts.yaxis.min,"log");
						p2 = this.getPixPos(i+this.chart.sub[j],this.chart.opts.yaxis.max,"log");
						s = this.chart.opts.grid.sub;
						this.chart.xaxis.push(this.chart.holder.path("M"+p1[0]+","+p1[1]+"L"+p2[0]+","+p2[1]).attr({ stroke: s.color,'stroke-opacity': s.opacity,'stroke-width':(s.width ? s.width : 0.5)}));
					}
				}
			}
		}

		if(this.data.data){
			this.eAnimPoints = [];
			//this.setTimeStep(this.timestep);

			var str = "";
			var strshadow = "";
			for (var i in this.data.data) {
				var ii = this.getPixPos(this.data.data[i].temp,this.data.data[i].lum);
				this.eAnimPoints.push(ii);
			}
			for(var i = 0 ; i < this.eAnimPoints.length ; i++){
				if(i == 0 || (this.eAnimPoints[i][1] <= 0 || this.eAnimPoints[i][0] <= 0) || (i > 1 && (this.eAnimPoints[i-1][1] <= 0 || this.eAnimPoints[i-1][0] <= 0))){
					str += "M";
					strshadow += "M";
				}else{
					str += "L";
					strshadow += "L";
				}
				str += this.eAnimPoints[i][0]+','+this.eAnimPoints[i][1];
				strshadow += (this.eAnimPoints[i][0]-1)+','+(this.eAnimPoints[i][1]-1);
			}
			if(this.starPath) this.starPath.remove();
			if(this.starPathShadow) this.starPathShadow.remove();
			if(strshadow) this.starPathShadow = this.chart.holder.path(strshadow).attr({stroke:'rgb(0,0,0)','stroke-opacity': 0.2,'stroke-width':3,'stroke-dasharray':'-'});
			if(str) this.starPath = this.chart.holder.path(str).attr({stroke:this.chart.opts.path.color,'stroke-width':2,'stroke-dasharray':'-'});
			if(str) this.starPathClicker = this.chart.holder.path(str).attr({stroke:'black','stroke-width':10,'stroke-opacity':0});

			var _obj = this;
			// Use the Raphael click function
			this.starPathClicker.click(function(e){
				var off = $('#placeholder').offset();
				var x = e.pageX-off.left;
				var y = e.pageY-off.top;
				var xy = _obj.getXYFromPix(x,y);
				// The index for the nearest data point to where we click
				var t = -1;
				// r2 is the square of the distance (no need to sqrt it as we 
				// just need to find the shortest distance and that would add
				// unnecessary overhead
				var r2;
				var r2min = 10000;	
				for(var i = 0 ; i < _obj.eAnimPoints.length ; i++){
					r2 = Math.pow((x-_obj.eAnimPoints[i][0]),2) + Math.pow((y-_obj.eAnimPoints[i][1]),2);
					if(r2 < r2min){
						r2min = r2;
						t = i;
					}
				}
				if(t >= 0) _obj.jumpTo(t);
			});

			if(this.chart.star) this.chart.star.remove();

			s = this.timestep;
			this.chart.star = this.chart.holder.circle((this.eAnimPoints[s][0]), (this.eAnimPoints[s][1]), 5).attr({"fill":"#000000"});
			this.chart.star.node.id = "chartstar";

			// Add to DOM if necessary
			if($('#starMass .value').length==0) $('#starMass').append('<span class="value"></span>');
			if($('#starMass .unit').length==0) $('#starMass').append(' <span class="unit"></span>');
			if($('#starMass select').length==0){
				var selector = '<strong>'+this.phrasebook.mass+':</strong> <select title="'+this.phrasebook.massunit+'">';
				for (var i = 0; i < this.massVM.length; i++) {
					selector += '<option value="'+i+'"'+(this.data.mass==this.massVM[i] ? ' selected="selected"' : "")+'>'+this.massVM[i]+'</option>';
				}
				selector += '</select>';
				$('#starMass .value').html(selector);
				// Add a change event to the <select>
				$('#starMass select').on('change',{box:this},function(e){
					if($('#hinttext').length > 0) $('#hinttext').click();
					e.data.box.slideMassTo(parseFloat($(this).find("option:selected").attr("value")));
				});
			}
			// Update the unit
			$('#starMass .unit').html(this.phrasebook.massunit);
		}
	};
	StarInABox.prototype.getStarShape = function(x,y,r,n){
		if(!n) n = 4;	// number of points
		if(!r) r = 8;
		r2 = r*0.3;
		p = "M"+x.toFixed(1)+" "+(y).toFixed(1)+"M"+x.toFixed(1)+" "+(y+r).toFixed(1)+"";
		var da = 2*Math.PI/n;
		var ang = 0;
		for(var i = 0; i <= n ; i++){
			x1 = x + Math.cos(ang+da/2)*r2;
			y1 = y + Math.sin(ang+da/2)*r2;
			x2 = x + Math.cos(ang+da)*r;
			y2 = y + Math.sin(ang+da)*r;
			p += "L"+(x1).toFixed(2)+" "+(y1).toFixed(2)+"L"+(x2).toFixed(2)+" "+(y2).toFixed(2);
			ang += da;
		}
		p += "Z";
		return p;
	}
	StarInABox.prototype.updateEvolve = function() {
		this.stopwatch.rebuild();
		this.createScales();
		this.updateCurrentStage();
	}
	StarInABox.prototype.loadingStar = function() {
		this.loading = true;
		$('#loader').removeClass('done').addClass('loading').html('<div id="loading">'+this.phrasebook.preparing+'</div>').width($(window).width()).height($(document).height());
	}
	StarInABox.prototype.doneLoadingStar = function() {
		$('#loader').removeClass('loading').addClass('done').find('.loading').html('');
		this.updateSummary();
		this.loading = false;
	}
	StarInABox.prototype.getData = function(i) {
		return this.data.data[i];
	}
	StarInABox.prototype.updateCurrentStage = function() {
		var el = this.getData(this.timestep);
		if(typeof el=="object") this.el.stagelabel.html('<strong>'+this.phrasebook.stage+':</strong> ' + this.stages[el.type]);
	}
	StarInABox.prototype.updateSummary = function() {
		$('#welcome #summary-content').html(this.generateSummary());
	}
	StarInABox.prototype.displaySummary = function() {
		$('#welcome').removeClass('help').addClass('summary');
		$('#welcome #summary-content').css({opacity: 0}).animate({opacity: 1},500);
	}
	StarInABox.prototype.generateSummary = function() {
		var o = "<h2>"+this.phrasebook.data.title+"</h2>";
		var table = "";
		table += '<div id="summary-table"><table border="1"><tr>';
		table += '<th>'+this.phrasebook.stage+'</th>';
		table += '<th>'+this.phrasebook.radius+' ('+this.phrasebook.radiusunit+')</th>';
		table += '<th>'+this.phrasebook.lum+' ('+this.phrasebook.lumunit+')</th>';
		table += '<th>'+this.phrasebook.temp+' ('+this.phrasebook.tempunit+')</th>';
		table += '<th>'+this.phrasebook.duration+' ('+this.phrasebook.timescale+')</th>';
		table += '</tr>';
		var s,t,n,e,r,l,d;
		var data = new Array();

		// Loop over stages creating summary data
		for (var i = 1 ; i < this.stageIndex.length ; i++){
			//var sValue = sEnd - sStart;
			s = this.getData(this.stageIndex[i]);
			n = (i < this.stageIndex.length-1) ? this.stageIndex[i+1]-1 : this.data.data.length-1;
			e = this.getData(n);
			t = e.t-s.t;
			if(typeof e=="object") data.push([this.stages[s.type],s.type,e.type,e.radius,e.lum,s.temp,t]);
		}
		// We now loop over the summary data rationalising the stages with the same name
		if(data.length > 0){
			for(var i = 0; i <= data.length ; i++){
				if(i == 0){
					s = data[i][1];
					e = data[i][2];
					r = data[i][3];
					l = data[i][4];
					t = data[i][5];
					d = data[i][6];
				}else{
					if(i < data.length && data[i][0]==data[i-1][0]){
						// Find the maximum
						r = Math.max(r,data[i][3]);
						l = Math.max(l,data[i][4]);
						t = Math.max(t,data[i][5]);
						// Find the sum
						d += data[i][6];
					}else{
						table += '<tr>';
						table += '<td>' + this.stages[s] + '</td>'; //Stage Name
						table += '<td>' + ((r >= 0.01) ? parseFloat(r).toFixed(2) : ((s==14) ? "&lt;&lt; 0.01" : "&lt; 0.01")) + '</td>';
						table += '<td>' + ((l < 0.01 && l!= 0) ? ((l < 0.0001) ? "&lt;&lt; 0.01" : "&lt; 0.01") : parseFloat(l).toFixed(2)) + '</td>';
						table += '<td>' + ((i == this.stageIndex.length-1 && e!=14) ? ((t > 1e6) ? this.phrasebook.cooldown.replace("%TEMP%",parseFloat(t)) : this.phrasebook.cooling) : ((t >= 1) ? parseFloat(t) : "&lt;&lt; 1")) + '</td>';
						table += '<td>' + ((i < this.stageIndex.length-1) ? d.toFixed(2) : this.phrasebook.longtime) + '</td>';
						table += '</tr>';
						if(i < data.length){
							// Reset the values
							s = data[i][1];
							e = data[i][2];
							r = data[i][3];
							l = data[i][4];
							t = data[i][5];
							d = data[i][6];
						}
					}
				}
			}
		}
		table += '</table></div>';

		o += this.phrasebook.data.content.replace("%MASS%",this.data.mass+' '+this.phrasebook.massunit).replace("%TABLE%",table).replace("%CSV%",'<a href="'+this.fileName(this.data.mass)+'.csv">CSV</a>');

		return o;
	}
	StarInABox.prototype.displayTime = function(t) {
		if(typeof t== "number") this.el.time.html(t.toFixed(3) + " <span class=\"units\">"+this.phrasebook.timescale+"</span>");
	}
	StarInABox.prototype.keypress = function(charCode,event){
		if(!event) event = { altKey: false };
		for(var i = 0 ; i < this.keys.length ; i++){
			if(this.keys[i].charCode == charCode && event.altKey == this.keys[i].altKey){
				this.keys[i].fn.call(this,{event:event});
				break;
			}
		}
	}
	// Register keyboard commands and associated functions
	StarInABox.prototype.registerKey = function(charCode,fn,txt){
		if(typeof fn!="function") return this;
		if(typeof charCode!="object") charCode = [charCode];
		var aok, ch, c, i, alt, str;
		for(c = 0 ; c < charCode.length ; c++){
			alt = false;
			if(typeof charCode[c]=="string"){
				if(charCode[c].indexOf('alt')==0){
					str = charCode[c];
					alt = true;
					charCode[c] = charCode[c].substring(4);
				}else str = charCode[c];
				ch = charCode[c].charCodeAt(0);
			}else{
				ch = charCode[c];
				if(ch==37) str = "&larr;";
				else if(ch==32) str = "space";
				else if(ch==38) str = "up";
				else if(ch==39) str = "&rarr;";
				else if(ch==40) str = "down";
				else str = String.fromCharCode(ch);
			}
			aok = true;
			for(i = 0 ; i < this.keys.length ; i++){ if(this.keys.charCode == ch && this.keys.altKey == alt) aok = false; }
			if(aok) this.keys.push({'str':str,'charCode':ch,'char':String.fromCharCode(ch),'fn':fn,'txt':txt,'altKey':alt});
		}
		return this;
	}

	// Create a Thermometer
	function Thermometer(inp){
		
		this.id = (typeof inp.id==="string") ? inp.id : 'thermometer';
		this.phrasebook = (inp.phrasebook) ? inp.phrasebook : { 'temp' : 'Temperature', 'tempunit': 'K' };
		this.txt = (inp.txt) ? inp.txt : {'font':'12px'};
		this.labeltxt = (inp.labeltxt) ? inp.labeltxt : {'font':'10px'};
		this.colour = (typeof inp.color==="string") ? inp.color : '#df0000';
		this.wide = 280;
		this.tall = 390;
		this.max = 60000;
		this.padding = 10;	// The light meter padding in pixels
		this.major = 5; // Number of major tick marks
		this.minor = 6; // Number of minor tick marks 

		// Properties of the thermometer SVG
		this.w = 83;
		this.h = 333;

		// Position to draw the SVG image
		this.x = (this.wide/2) - (this.w/2);
		this.y = (this.tall/2) - (this.h/2);

		// Scale
		this.bulb = this.y+this.h-56
		this.bottom = this.bulb-this.padding;
		this.top = this.y+33;
		this.maxscale = Math.abs(this.y+this.padding-this.bottom)/Math.abs(this.top-this.bottom);

		// Create a canvas to draw on
		this.thermo = Raphael(this.id, this.wide, this.tall);

		this.mercurybase = this.thermo.rect((this.wide/2 - 25), this.bulb, 50, 40).attr({"fill": this.colour,"stroke":0});
		this.mercuryzero = this.thermo.rect((this.wide/2 - 15), this.bottom-0.5, 30, Math.abs(this.bulb-this.bottom+1)).attr({"fill": this.colour,"stroke":0});
		this.mercury = this.thermo.rect((this.wide/2 - 15), this.top, 30, Math.abs(this.top-this.bottom)).attr({"fill": this.colour,"stroke":0});
		this.thermometer = this.thermo.path('M '+this.x+','+this.y+' m 41.5,1.5 c -20,0 -30,10 -30,20 0,9.96728 9.934984,188.79168 10,249.375 -11.953504,5.61993 -20,16.09695 -20,28.125 0,17.94927 17.90861,32.50007 40,32.50007 22.09139,0 40,-14.5508 40,-32.50007 0,-12.02805 -8.0465,-22.50507 -20,-28.125 0.0709,-50.81368 10,-239.41071 10,-249.375 0,-10 -10,-20 -30,-20 z m 0,20 c 10.04001,0 15.0625,6.19421 15.0625,12.375 0,6.01703 -4.80834,203.53327 -5.0625,242.625 8.80176,3.09568 15,11.81482 15,20 0,11.04569 -11.19288,20.00007 -25,20.00007 -13.807119,0 -25,-8.95438 -25,-20.00007 0,-8.18518 6.198243,-16.90432 15,-20 -0.226713,-43.69221 -5.0625,-236.58939 -5.0625,-242.625 0,-6.18079 5.022485,-12.375 15.0625,-12.375 z').attr({'fill':'#e4f6fe','fill-opacity':1,'stroke':'#000000','stroke-width':0,'stroke-opacity':1});
		this.burst = this.thermo.path('M '+this.x+','+this.y+' m 38,-45 c -5.189184,0.2028506 -11.748983,4.3926725 -13.03125,17.375 -1.709691,17.30977 2.487121,25.46647 0,27.71875 -6.135971,5.5566 -9.503834,-1.70652 -13.59375,-4.6875 -5.366689,-3.91157 -12.056373,-5.2697 -19.75,-1.375 -7.693615,3.89468 -10.463775,11.23029 -3.625,15.125 6.838764,3.89468 7.880996,-4.31523 13.4375,-1.71875 5.556504,2.59647 11.548467,7.35801 3,8.65625 -8.548466,1.29823 -11.536236,-0.875 -18.375,-0.875 -6.838776,0 -12.40625,1.31929 -12.40625,4.78125 0,3.46195 4.702566,8.65625 11.96875,8.65625 7.266194,0 22.651156,-8.65625 29.0625,-8.65625 6.411343,0 11.987309,6.06386 11.987309,14.71875 8.412727,0.324884 29.900381,0.06758 29.900381,0.06758 0,0 1.39471,-11.169376 6.42481,-16.098826 7.87794,-7.72031 17.16555,-2.08174 19.40625,-6.84375 2.35944,-5.01435 -4.43036,-10.6709 -13.40625,-7.875 -9.70031,3.02155 -11.58647,6.7022 -15.46875,11 -3.32215,3.67773 -5.3207,4.77153 -10.1875,3.46875 -5.540608,-1.48315 -5.12751,-10.89425 -3.21875,-15.25 2.64734,-6.04119 4.08314,-7.029207 10.0625,-10.03125 4.95419,-2.487337 5.6182,-10.089577 0.35723,-11.619131 -9.33935,-2.715291 -10.208,9.475131 -14.48223,7.744131 -4.274233,-1.73097 1.716709,-8.23233 4.28125,-15.15625 2.56454,-6.92391 6.85791,-15.59104 2.15625,-18.1875 -1.17542,-0.6491175 -2.77027,-1.0051169 -4.5,-0.937504 z M 121,31.75 c -1.62871,0.04288 -3.40324,0.56884 -5.28125,1.46875 -7.10696,3.40554 -9.03125,15.90625 -9.03125,15.90625 0,0 3.39363,-5.05349 6.53125,-6.28125 4.10714,-1.60714 6.14119,-0.0455 10.53125,-2.125 3.39285,-1.60714 4.09375,-5.35715 1.59375,-7.5 C 124.09375,32.14732 122.62871,31.70712 121,31.75 z').attr({"fill": this.colour,"stroke":0,'opacity':0});
		this.highlight = this.thermo.path('M '+this.x+','+this.y+' m 38.5,5.7 c -2.210204,0.0122 -4.805816,0.3542 -7.499997,1.09375 -7.184482,1.97213 -12.46767,5.89359 -11.78125,8.75 0.68642,2.85641 7.096768,3.56588 14.28125,1.59375 7.184487,-1.97213 12.436417,-5.86234 11.749997,-8.71875 -0.42901,-1.78526 -3.06632,-2.73916 -6.75,-2.71875 z m 2.40625,20.21875 c -0.85555,0.005 -1.78559,0.0667 -2.75,0.21875 -3.857621,0.60799 -6.810888,2.24728 -6.593747,3.625 0.217141,1.37772 3.517376,1.98299 7.374997,1.375 3.85763,-0.60799 6.81089,-2.21603 6.59375,-3.59375 -0.16285,-1.03329 -2.05834,-1.64142 -4.625,-1.625 z m -10.437497,12.84375 4.5625,238.875 2,0.53125 -4.03125,-238.9375 -2.53125,-0.46875 z m -7.90625,235.375 c 0,0 -13.027028,5.47669 -16.03125,18.46875 -3.004221,12.99206 14.34375,20.68749 14.34375,20.68749 0,0 -8.228079,-4.58486 -8.40625,-16.28124 -0.178171,-11.6964 14.6875,-22.0625 14.6875,-22.0625 l -4.59375,-0.8125 z m 9.15625,6.875 c 0,0 -4.582374,1.40844 -6.15625,5.625 -2.067315,5.53852 1.625,8.4375 1.625,8.4375 0,0 -0.64504,-3.33517 1.5625,-7.21875 2.20754,-3.88358 6.71875,-5.4375 6.71875,-5.4375 l -3.75,-1.40625 z').attr({'opacity':0.5,'fill':'#f7fcfe','fill-opacity':1,'stroke':0});
		this.shade = this.thermo.path('M '+this.x+','+this.y+' m 52,35.7 c -2.15625,2.15625 -5,2.125 -2.84375,237.46875 c 0,0 1.2164,0.53999 2.96875,0 1.75235,-0.53999 2.71875,-1.75 2.71875,-1.75 l 4.3125,-240 z m -1.96875,243.46875 c 0,0 -1.34065,1.98971 -3.53125,2.5 -2.19059,0.51007 -4.59375,0.53125 -4.59375,0.53125 0,0 18.46638,10.85707 9.375,21.96875 -9.09137,11.11164 -20.937497,6.31254 -20.937497,6.31254 0,0 9.702907,4.5342 20.437497,0.5 10.7346,-4.03435 14.09247,-13.16717 9.84375,-22.21879 -4.24873,-9.05162 -10.59375,-9.59375 -10.59375,-9.59375 z').attr({'opacity':0.2,'fill':'#000000','fill-opacity':1,'stroke':'#000000','stroke-width':1});

		// Thermometer labels and tick marks
		var step = this.max/this.major;
		var steppx = (this.top-this.bottom)/this.major;
		var steppxminor = steppx/this.minor;
		this.labels = this.thermo.set();
		this.ticks = this.thermo.set();
		var x,y;
		for(var i = 0 ; i <= this.major ; i++){
			y = (this.bottom + (i*steppx));
			this.labels.push(this.thermo.text((this.wide/2 + 24)+(i*2), y, addCommas(step*i)+" K").attr(this.labeltxt));
			this.ticks.push(this.thermo.path("M "+(this.wide/2 + 2)+","+y+" l "+(14+i*2)+",0").attr({'stroke':'#000000','stroke-width':1.5}));
			if(i < this.major){
				for(var j = 1; j < this.minor ; j++) this.ticks.push(this.thermo.path("M "+(this.wide/2 + 8)+","+(y+j*steppxminor)+" l "+(6+i*2)+",0").attr({'stroke':'#000000','stroke-width':0.5}));
			}
		}
		this.updateLanguage(this.phrasebook);
		return this;	
	}
	Thermometer.prototype.updateLanguage = function(lang){
		this.phrasebook = lang;
		if(this.ll){ this.ll.remove(); }
		this.ll = this.thermo.text(this.x-this.padding-parseInt(this.txt['font-size'])/2, this.y+this.h/2, this.phrasebook.temp+" ("+this.phrasebook.tempunit+")").attr(this.txt);
		this.ll.attr({'text-anchor':'middle',transform:"r-90"});
	}
	Thermometer.prototype.setTemperature = function(temp){
		s = Math.min(temp / this.max,this.maxscale);
		this.mercury.transform("s1,"+s+',0,'+this.bottom);
		if(temp > this.max){
			this.labels[this.labels.length-1].attr('text',addCommas(temp)+' K');
			this.burst.attr('opacity',1);
		}else{
			this.labels[this.labels.length-1].attr('text',addCommas(this.max)+' K');
			this.burst.attr('opacity',0);
		}
	}

	// Create a logarithmic light meter
	function LightMeter(inp){

		this.id = (typeof inp.id==="string") ? inp.id : 'thermometer';
		this.phrasebook = (inp.phrasebook) ? inp.phrasebook : { 'temp' : 'Temperature', 'tempunit': 'K' };
		this.txt = (inp.txt) ? inp.txt : {'font':'12px'};
		this.labeltxt = (inp.labeltxt) ? inp.labeltxt : {'font':'10px'};
		this.colour = (typeof inp.color==="string") ? inp.color : '#fac900';
		this.on = { opacity: 1 };
		this.off = { opacity: 0.1 };
		this.wide = 280;
		this.tall = 390;
		this.w = 63;
		this.h = 333;
		this.max = 1000000; // The maximum value
		this.min = 0.0001;  // The minimum value
		this.step = 100;    // Factor by which each step is separated
		this.minor = 4;     // Number of equalizer levels per step
		this.padding = 10;	// The light meter padding in pixels
		this.spacing = 2;	// The pixel spacing between equalizer levels


		// Calculate some properties
		this.maxlog = Math.round(this.log10(this.max));
		this.minlog = Math.round(this.log10(this.min));
		this.steplog = Math.round(this.log10(this.step));
		this.levels = Math.round((this.maxlog-this.minlog)/this.steplog);
		this.zero = Math.round(-this.minlog);	// Set the zero level at value of 1

		// Position to draw the SVG image
		this.x = (this.wide/2) - (this.w/2);
		this.y = (this.tall/2) - (this.h/2);

		this.totalBars = this.minor*this.levels;
		this.eqCurrentLevel = 0;
		this.numBars = 0;
		this.eq = [];	// The equalizer steps

		// Scale
		this.bottom = this.y+this.h-this.padding+this.spacing;
		this.top = this.y+this.padding;
		var steppx = (Math.abs(this.top-this.bottom)/this.totalBars);


		// Create a canvas to draw on
		this.meter = Raphael(this.id, this.wide, this.tall);

		this.bg = this.meter.rect(this.x-0.5,this.y-0.5,this.w,this.h).attr({'fill':'#999999','stroke':0});
		for(var i = 0 ; i < this.totalBars; i++) this.eq.push(this.meter.rect(this.x+this.padding-0.5,this.bottom-(i+1)*steppx,this.w-this.padding*2,steppx-this.spacing).attr({'fill':this.colour,'stroke':0}));
		this.labels = this.meter.set();
		for(var i = this.minlog ; i <= this.maxlog ; i+=this.steplog) this.labels.push(this.meter.text(this.x+this.w+this.padding, this.bottom-(i+this.zero)*this.minor*steppx/this.steplog, addCommas(Math.pow(10,i))).attr(this.labeltxt));

		this.updateLanguage(this.phrasebook);

		return this;
	}

	LightMeter.prototype.updateLanguage = function(lang){
		this.phrasebook = lang;
		if(this.ll){ this.ll.remove(); }
		this.ll = this.meter.text(this.x-this.padding-parseInt(this.txt['font-size'])/2, this.y+this.h/2, htmlDecode(this.phrasebook.lum+" ("+this.phrasebook.lumunit+")")).attr(this.txt);
		this.ll.attr({'text-anchor':'middle',transform:"r-90"});
	}

	LightMeter.prototype.log10 = function(v) {
		return Math.log(v)/2.302585092994046;
	}

	LightMeter.prototype.level = function(num, anim, colour){
		var n;
		if(typeof colour==="string"){
			for(var i = 0 ; i < this.totalBars; i++) this.eq[i].attr('fill',colour);
		}
		if (num != null) {
			n = Math.round((this.log10(num)-this.minlog)*this.minor/this.steplog);
			if(this.numBars != n){
				this.numBars = n;
				if(anim == true) this.eqChange();
				else {
					if(this.numBars >= 0) this.eqCurrentLevel = this.numBars;
					for (var i = 0; i < this.totalBars; i++) {
						if(i < this.numBars) this.eq[i].attr(this.on);
						else this.eq[i].attr(this.off);
					}
				}
			}
		}
		return this;
	}
	
	LightMeter.prototype.eqChange = function() {
		if(!this.eqCurrentLevel || this.eqCurrentLevel < 0) this.eqCurrentLevel = 0;
		if(this.numBars == this.eqCurrentLevel) return;
		if(this.numBars > this.eqCurrentLevel){
			// eq is indexed from 1
			if(this.eqCurrentLevel >= 0){
				this.eq[this.eqCurrentLevel].animate(this.on, 200);
				this.eqCurrentLevel++;
			}
		}
		if(this.numBars < this.eqCurrentLevel){
			// eq is indexed from 1
			if(this.eqCurrentLevel >= 0){
				this.eq[this.eqCurrentLevel].animate(this.off, 200);
				this.eqCurrentLevel--;
			}
		}
		if(this.numBars != this.eqCurrentLevel && this.eqCurrentLevel >= 0) window.setTimeout(function(box){ box.eqChange(); },50,this);
		return this;
	}


	function addCommas(nStr) {
		nStr += '';
		var x = nStr.split('.');
		var x1 = x[0];
		var x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	}
	function getNearestNumber(a, n){
		var closest = null;
    	for(i = 0; i < a.length; i++){
    		if(closest == null || Math.abs(a[i] - n) < Math.abs(closest - n)){
    			closest = a[i];
    		}
    	}
    	return closest;
	}
	
	function Stopwatch(box){
		this.box = box;

		//raphael script for stopwatch chart...
		if ($("#rStopwatch #stopwatch").length > 0) $("#rStopwatch #stopwatch").remove();
		this.x = 140;
		this.y = 160;
		this.r = 90;
		this.w = 18;
		this.h = 10;
		this.w2 = 12;
		this.h2 = 8;
		this.frac = 0.8;
		
		this.rStopwatch = Raphael("rStopwatch");
		this.dial = this.rStopwatch.set();

		// Draw top keyring
		this.dial.push(this.rStopwatch.circle(this.x,this.y-this.r-this.h2*3.5,this.h2*3).attr({'stroke-width':3,'stroke':'#b3b3b3'}));

		// Draw top button
		this.dial.push(this.rStopwatch.rect(this.x-this.w2*0.6,this.y-this.r-this.h2*3,this.w2*1.2,this.h2*3).attr({'fill':'0-#999-#b3b3b3-#ccc-#b3b3b3-#ccc-#999','stroke-width':0}));
		this.dial.push(this.rStopwatch.rect(this.x-this.w2,this.y-this.r-this.h2*4.5,this.w2*2,this.h2*2).attr({'fill':'0-#b3b3b3-#ccc-#e6e6e6-#ccc-#e6e6e6-#b3b3b3','stroke-width':0}));

		// Draw left-hand button
		this.stopwatchleft = this.rStopwatch.set();
		this.stopwatchleft.push(this.rStopwatch.rect(this.x-this.w*0.6,this.y-this.r-this.h2*2,this.w*1.2,this.h2*2).attr({'fill':'0-#999-#b3b3b3-#ccc-#b3b3b3-#ccc-#999','stroke-width':0}).transform('r-40,'+this.x+','+this.y));
		this.stopwatchleft.push(this.rStopwatch.rect(this.x-this.w,this.y-this.r-this.h-this.h2*2,this.w*2,this.h*2).attr({'fill':'0-#b3b3b3-#ccc-#e6e6e6-#ccc-#e6e6e6-#b3b3b3','stroke-width':0,'cursor':'pointer','title':""}).transform('r-40,'+this.x+','+this.y));
		var _obj = this.box;
		this.stopwatchleft.click(function(e){
			_obj.reset();
		});

		// Draw right-hand button
		this.stopwatchright = this.rStopwatch.set();
		this.stopwatchright.push(this.rStopwatch.rect(this.x-this.w*0.6,this.y-this.r-this.h2*2,this.w*1.2,this.h2*2).attr({'fill':'0-#999-#b3b3b3-#ccc-#b3b3b3-#ccc-#999','stroke-width':0}).transform('r40,'+this.x+','+this.y));
		this.stopwatchright.push(this.rStopwatch.rect(this.x-this.w,this.y-this.r-this.h-this.h2*2,this.w*2,this.h*2).attr({'fill':'0-#b3b3b3-#ccc-#e6e6e6-#ccc-#e6e6e6-#b3b3b3','stroke-width':0,'cursor':'pointer','title':""}).transform('r40,'+this.x+','+this.y));
		this.stopwatchright.click(function(e){
			_obj.play();
		});

		// Draw case
		this.dial.push(this.rStopwatch.circle(this.x,this.y,this.r).attr({'stroke-width':0,'fill':'300-#fff-#b3b3b3-#fff'}));
		this.dial.push(this.rStopwatch.circle(this.x,this.y,this.r*0.89).attr({'stroke-width':0,'fill':'300-#999-#303030-#999'}));
		this.dial.push(this.rStopwatch.circle(this.x,this.y,this.r*0.84).attr({'stroke-width':0,'fill':'300-#fff-#ccc-#fff'}));


		this.radius = this.r*this.frac;
		this.attr = {'colours':[this.box.chart.opts.mainsequence['background-color'],'#df0000','#3366dd','#009d00','#7ea0ee','#d6ccff','#ffcccc','#fff5cc','#ccffcc']};

		if(this.box.data.data) this.rebuild();

		return this;
	}

	Stopwatch.prototype.rebuild = function(){
		if(this.pie){
			for(var i = 0 ; i < this.pie.length; i++){
				this.pie[i].remove();
			}
			this.pie = [];
		}
		if(this.box.data.data){
			this.data = new Array();
			this.legend = new Array();
			// Don't include final state in calculation of the normal life of the star
			// as it is usually very, very long compared to the rest of the star's life.
			for (var i = 1 ; i < this.box.stageIndex.length-1 ; i++){
				var s = this.box.getData(this.box.stageIndex[i]);
				var n = (i < this.box.stageIndex.length-1) ? this.box.stageIndex[i+1]-1 : this.box.data.data.length-1;
				var e = this.box.getData(n);
				this.legend[i-1] = this.box.stages[s.type];
				this.data[i-1] = (e.t-s.t);
			}
			this.d = { values: this.data, labels:this.legend };
			this.pie = this.rStopwatch.piechart(this.x,this.y,this.radius,this.d,this.attr,this.box);
		}

		// Draw label
		this.dial.push(this.rStopwatch.text(this.x,this.y+this.r*0.3,"LCOGT").attr({'stroke-width':0,'fill':this.box.chart.opts.color,'text-anchor':'middle','font-style':'italic','font-family':'Times','font-size':'10px'}));
		this.dial.push(this.rStopwatch.text(this.x,this.y+this.r*0.4,"CHRONOGRAPH").attr({'stroke-width':0,'fill':this.box.chart.opts.color,'text-anchor':'middle','font-style':'italic','font-family':'Times','font-size':'6px'}));
		this.dial.push(this.rStopwatch.text(this.x,this.y+this.r*0.4+7,(new Date()).getFullYear()).attr({'stroke-width':0,'fill':this.box.chart.opts.color,'text-anchor':'middle','font-style':'italic','font-family':'Times','font-size':'6px'}));

		this.stopwatchleft[1].attr('title',(this.box.phrasebook && this.box.phrasebook.buttons.reset ? this.box.phrasebook.buttons.reset:""));
		this.stopwatchright[1].attr('title',(this.box.phrasebook && this.box.phrasebook.buttons.play ? this.box.phrasebook.buttons.play:""));
		
		//: this.stopwatchright[1]);
		//el.attr('text',txt);

		this.update();

		return this;
	}

	Stopwatch.prototype.update = function(){
		if(this.box.data.data && this.box.data.data.length > 0 && this.box.stageIndex.length > 0){
			var total = 324;
			var t = this.box.data.data[this.box.timestep].t;
			total = this.box.data.data[this.box.stageIndex[this.box.stageIndex.length-1]].t;
			if(t > total) t = total;
			if(t < 0) t = 0;
			var a = -Math.PI/2 + Math.PI*2*t/total;
			var x1 = (this.radius * Math.cos(a));
			var y1 = (this.radius * Math.sin(a));
			var a2 = a + Math.PI*0.93;
			var x2 = (0.2 * this.radius * Math.cos(a2));
			var y2 = (0.2 * this.radius * Math.sin(a2));
			var a3 = a - Math.PI*0.93;
			var x3 = (0.2 * this.radius * Math.cos(a3));
			var y3 = (0.2 * this.radius * Math.sin(a3));
			if(this.clockhand) this.clockhand.remove();
			this.clockhand = this.rStopwatch.set();
			this.clockhand.push(this.rStopwatch.path("M "+this.x+" "+this.y+" m "+x1+" "+y1+" l "+(x2-x1)+" "+(y2-y1)+" l "+(x3-x2)+" "+(y3-y2)+"Z").attr({'fill':'black','stroke-width':0}));
			this.clockhand.push(this.rStopwatch.circle(this.x,this.y,6).attr({'fill':'black','stroke-width':0}));
		}

		return this;
	}
	// functions to make the chart:
	// Input:
	//   x - The centre x position
	//   y - The centre y position
	//   radius - Radius of the piechart in pixels
	//   d - Data in the form { values: [], labels:[] }
	//   attr - Attributes in the form { 'colours' : ['#396bad','#fac000',...] }
	Raphael.fn.piechart = function(x,y,radius,d,attr,box){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.attr = attr;
		this.box = box;

		// Set defauls
		var TWO_PI = Math.PI * 2;
		var offsetAngle = -Math.PI/2;	// The rotation from east to start at
		var total = 0;			// A running total

		if(typeof d.values!="object") d = { values: d, labels:[] }
		var d2 = { values: [], labels:[], ids:[] };

		// Compress the data if they have the same labels
		var lastlabel = d.labels[0];
		var sum = 0;
		var j = 0;
		for (var i = 0; i < d.values.length; i++){
			if(d.labels[i] != lastlabel){
				d2.values.push(sum);
				d2.labels.push(d.labels[i-1]);
				d2.ids.push(j);
				lastlabel = d.labels[i];
				sum = 0;
				j = i;
			}
			sum += d.values[i];
			if(i == d.values.length-1){
				d2.values.push(sum);
				d2.labels.push(d.labels[i]);
				d2.ids.push(j);
			}
		}
		d = d2;
		this.d = d2;

		// Get the number of items to display
		var n = this.d.values.length;		// Number of data points

		// Calculate the total of all values so we can normalize
		for (var i = 0; i < n; i++) total += d.values[i];
		// Create each segment
		var keysize = 12;			// Size of the key boxes in pixels
		var yoff = this.y + this.radius*(1.5);
		var yspace = Math.floor(keysize*1.4);
		var pie = Array(n);
		var f = this.attr.colours;
		var ending = 0;

		for (var i = 0; i < n; i++){
			c = {'fill': (typeof this.attr.fill=="object" && this.attr.fill.length > i) ? this.attr.fill[i] : ((typeof this.attr.fill=="string") ? this.attr.fill : f[i % f.length]), 'stroke': (typeof this.attr.stroke=="object" && this.attr.stroke.length > i) ? this.attr.stroke[i] : ((typeof this.attr.stroke=="string") ? this.attr.stroke : "white")}
			var a = offsetAngle;
			var b = a+(TWO_PI * (d.values[i]/total));
			x1 = this.x+(this.radius * Math.cos(a));
			y1 = this.y+(this.radius * Math.sin(a));
			x2 = this.x+(this.radius * Math.cos(b));
			y2 = this.y+(this.radius * Math.sin(b));
			t = (d.labels[i].length > 1.8*this.radius*1.1*2/keysize) ? d.labels[i].substring(0,Math.floor(1.75*this.radius*1.1*2/keysize))+'...' : d.labels[i];

			pie[i] = this.set();
			// Add the pie segment
			pie.push(this.path("M "+this.x+" "+this.y+" L "+x1+" "+y1+" A "+this.radius+","+this.radius+" 0 "+((b-a >= Math.PI) ? 1 : 0)+" 1 "+x2+","+y2+" z").attr({cursor:'pointer',stroke:c.stroke,fill:c.fill,'stroke-width':0}).data('i',d.ids[i]+1).data('box',this.box).mouseover(function(){
					this.attr({'opacity':0.7});
					this.next.transform('s1.2');	// key
					this.next.next.attr({'font-weight':'bold'});	// key label
				}).mouseout(function(){
					this.attr({'opacity':1});
					this.next.transform('s1');	// key
					this.next.next.attr({'font-weight':'normal'});	// key label
				}).click(function(e){
					this.data('box').resetStage.call(this.data('box'),this.data('i'))				
				})
			);
			// Add the key box
			pie.push(
				this.rect(this.x-this.radius*1.1+Math.round(keysize/2)-0.5,yoff+(i*yspace)-Math.round(keysize/2)-0.5,keysize,keysize).attr({cursor:'pointer',stroke:c.stroke,fill:c.fill,'stroke-width':1.25}).data('i',d.ids[i]+1).data('box',this.box).click(function(e){
					this.data('box').resetStage.call(this.data('box'),this.data('i'));
				}).mouseover(function(){
					this.transform('s1.2');	// key box
					this.next.attr({'font-weight':'bold'});	// key label
				}).mouseout(function(){
					this.transform('s1');	// key
					this.next.attr({'font-weight':'normal'});	// key label
				})
			)
			// Add the key label
			pie.push(
				this.text(this.x-this.radius*1.1+keysize*2,yoff+(i*yspace),t).attr({cursor:'pointer',fill:'white','stroke-width':1,'font-size':keysize,'text-anchor':'start'}).data('i',d.ids[i]+1).data('box',this.box).click(function(e){
					this.data('box').resetStage.call(this.data('box'),this.data('i'))
				}).mouseover(function(){
					this.prev.transform('s1.2');	// key box
					this.attr({'font-weight':'bold'});	// key label
				}).mouseout(function(){
					this.prev.transform('s1');	// key
					this.attr({'font-weight':'normal'});	// key label
				})
			);
			offsetAngle = b;
		}

		return pie;
	}

	function htmlDecode(input){
		return $('<div />').html(input).text();
	}

	/**
	 * Create a popup bubble attached to an element. Requires an object with:
	 * @param inp {Object}
	 *		id = the name to use for the popup
	 *		el = the jQuery element to attach a popup to
	 *		html = the content
	 *		animate = true, false
	 *		align = how to attach the popup ("auto", "left", "right", "top", "bottom", "center")
	 *		fade = ms to fade
	 *		dismiss = true, false
	 */
	function bubblePopup(inp) {
		// Setup - check for existence of values
		if(typeof inp!="object") return this;
		if(typeof inp.id!="string")	return this;
		if(!inp.el) return this;
		if(typeof inp.el!="object" || inp.el.length == 0) return this;

		var w = inp.el.outerWidth();
		var w2 = w/2;
		var h = inp.el.outerHeight();
		var h2 = h/2;
		var x = inp.el.offset().left+w2;	// The centre of the element
		var y = inp.el.offset().top+h2;	// The centre of the element
	
		var onpop = (typeof inp.onpop=="function") ? inp.onpop : "";
		var context = (inp.context) ? inp.context : this;
		var id = inp.id;
		var el = $('#'+id);
		if(el.length == 0){
			$('body').append('<div id="'+id+'" class="poppitypin'+(style ? " "+style : "")+'"><div class="poppitypin-inner">'+inp.html+'</div><\/div>');
			el = $('#'+id);
		}else el.stop().attr('class','').addClass('poppitypin'+(style ? " "+style : "")).html('<div class="poppitypin-inner">'+(inp.html ? inp.html : el.html())+'</div>');
		
		var z = (typeof inp.z=="number") ? inp.z : 980;	// The z-index

		var animate = (typeof inp.animate=="boolean") ? inp.animate : false;
		var dismiss = (typeof inp.dismiss=="boolean") ? inp.dismiss : false;
		var triggers = (typeof inp.dismiss=="object") ? inp.triggers : false;
		var fade = (typeof inp.fade=="number") ? inp.fade : -1;
		this.wide = (typeof inp.w=="number") ? inp.w : el.outerWidth();
		var tall = (typeof inp.h=="number") ? inp.h : el.outerHeight();

		el.css({'position':'absolute','z-index':z,'display':'inline-block','visibility':'visible','width':this.wide});
	
	
		this.arr = 8;
		this.padding = (typeof inp.padding=="number") ? inp.padding : parseInt(el.css('padding-left'));
		this.align = (typeof inp.align=="string") ? inp.align : "auto";
		var talign = (typeof inp.textalign=="string") ? inp.textalign : "center";
		var style = (typeof inp.style=="string") ? " "+inp.style : (el ? " "+el.attr('class') : "");
	
	
		var y2 = (y - h2 - tall - this.arr - this.padding);
	
		if(this.align == "auto"){
			this.align = "north";
			if((y - h2 - tall - this.arr - this.padding) < window.scrollY || x + this.wide/2 > $(window).width() || x - this.wide/2 < 0){
				this.align = "south";
				if(x + this.wide/2 > $(window).width()) this.align = "west";
				if(x - this.wide/2 < 0) this.align = "east";
			}
		}
	
		el.addClass('poppitypin-'+this.align);
		var css = {};
		var css2 = {};
		if(this.align == "east"){
			l = x + w2 + this.padding + this.arr/2;
			lorig = l+w2;
			t = y - tall/2;
			torig = t;
			css = {'left':l+'px','top':t+'px'};
			css2 = {'left':lorig+'px','top':torig+'px'};
		}else if(this.align == "west"){
			l = x - w2 - this.padding - this.wide - this.arr/2;
			lorig = l-w2;
			t = y - tall/2;
			torig = t;
			css = {'left':l+'px','top':t+'px'};
			css2 = {'left':lorig+'px','top':torig+'px'};
		}else if(this.align == "north"){
			l = x - this.wide/2;
			lorig = l;
			t = y - h2 - this.padding - tall - this.arr/2;
			torig = t - h2;
			css = {'left':l+'px','bottom':(($(window).height()-inp.el.offset().top) + this.arr/2)+'px'};
			css2 = {'left':lorig+'px','bottom':(y - this.arr/2)+'px'};
		}else if(this.align == "south"){
			l = x - this.wide/2;
			lorig = l;
			t = y + h2 + this.padding + this.arr;
			torig = t + h2;
			css = {'left':l+'px','top':t+'px'};
			css2 = {'left':lorig+'px','top':torig+'px'};
		}else if(this.align == "center" || this.align == "centre"){
			l = x - this.wide/2;
			lorig = l;
			t = y - tall/2;
			torig = t;
			css = {'left':l+'px','top':t+'px'};
			css2 = {'left':lorig+'px','top':torig+'px'};
		}else return this;
	
		el.css({'text-align':talign});

		css.opacity = 1;
		css2.opacity = 0;
		
		if(animate) el.css(css2).animate(css,500)
		else el.css(css).show()
		if(fade > 0) el.delay(fade).fadeOut(fade);
		this.inp = inp;

		if(dismiss) el.on('click',{onpop:onpop,context:context},function(e){ $(this).remove(); if(e.data.onpop){ e.data.onpop.call(e.data.context); }});
		var _obj = this;
		$(window).off('resize').on('resize',function(){ _obj.position(); });

		return this;
	}
	bubblePopup.prototype.position = function(){
		var l,t,b,r;
		var css = {};
		if(this.align=="north" || this.align=="south"){
			l = (this.inp.el.offset().left+this.inp.el.outerWidth()/2 - this.wide/2);
			css = { 'left': l+'px','top': t+'px' };
		}
		if(this.align=="north"){
			css = { 'left': l+'px', 'bottom': (($(window).height()-this.inp.el.offset().top) + this.padding + this.arr/2)+'px' };
		}else if(this.align=="south"){
			css = { 'left': l+'px', 'top': ((this.inp.el.offset().top) + this.inp.el.outerHeight() + this.arr)+'px' };
		}
		css.display = "block";
		$('#hinttext').css({display:"none"}).css(css);
	}
	
	box = new StarInABox();

}); //ready.function


