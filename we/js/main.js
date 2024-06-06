let canvas;
let gl;
let loadedResources = 0;
let images = {};
let maps = {};

let resources = [ 
	{ type: "img", name: "tileset01", src: "data/tileset-01.bmp" },
	{ type: "map", name: "map01", src: "data/map-01.tmx" }
	];

let programTileRenderer;
let texTileMap;
let screenQuad;
let texMap;
let time = 0;
let mapWidth;
let mapHeight;

function onResourceLoad()
{
	loadedResources++;
	if ( loadedResources == resources.length )
		appInit();
};

function onReadyStateChange(event)
{
	if (event.target.readyState == 4)
		onResourceLoad();
};

function appLoadResources(event)
{
	for (const resource of resources)
	{
		if ( resource.type == "img" )
		{
			item = new Image;
			images[resource.name] = item;
			item.onload = onResourceLoad;
			item.src = resource.src;
		}
		else if ( resource.type == "map" )
		{
			item = new XMLHttpRequest();
			maps[resource.name] = item;
			item.overrideMimeType('text/xml');
			item.onreadystatechange = onReadyStateChange;
			item.open("GET", resource.src);
			item.send(null);
		};
	};
};

function tick( timeStamp )
{
	if ( gl == null )
		return;

	time += 1;

	gl.clearColor(0.0, (1.0 + Math.sin(time / 100)) / 2.0, 0.0, 1.0); 
	gl.clear(gl.COLOR_BUFFER_BIT); 
	
	programTileRenderer.use();
	screenQuad.use(programTileRenderer.aLoc_a_pos, programTileRenderer.aLoc_a_tex);
	texTileMap.use(gl.TEXTURE_2D, 0, programTileRenderer.uLoc_u_texture); // bind to texture unit 0

	screenQuad.draw();

	window.requestAnimationFrame( tick );
};

function appInit()
{
	canvas = document.getElementById("canvas"); 
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	gl = canvas.getContext("webgl2"); 
	if ( !gl ) 
	{ 
		alert("Your browser does not support WebGL 2!"); 
		return;
	} 

	mapXML = maps.map01.responseXML;
	mapLayer = mapXML.querySelector("layer[name='map']");
	mapData = mapXML.querySelector("layer[name='map'] > data").textContent;
	mapData = mapData.replaceAll("\n", "");
	mapData = mapData.replaceAll("\r", "");
	mapData = mapData.replaceAll(" ", "");
	mapData = mapData.split(",");
	mapWidth = parseInt(mapLayer.getAttribute("width"));
	mapHeight = parseInt(mapLayer.getAttribute("height"))
	mapArray = new Uint16Array(mapData.length);
	for ( let i = 0; i < mapData.length; i++ )
		mapArray[i] = parseInt(mapData[i]);

	texMap = new GlTexture();	
	texMap.initCustom2D(gl.NEAREST, gl.CLAMP_TO_EDGE, gl.R16UI, mapWidth, mapHeight, gl.RED_INTEGER, gl.UNSIGNED_SHORT, mapArray);

	texTileMap = new GlTexture();
	texTileMap.initRGBA2D(gl.NEAREST, gl.CLAMP_TO_EDGE, images.tileset01);

	screenQuad = new ScreenQuad();

	vsSource = `	#version 300 es 
			in vec2 a_pos; 
			in vec2 a_tex;
			out vec2 v_tex;

			void main() { 
				v_tex = a_tex;
				gl_Position = vec4(a_pos, 0, 1); 
			}`;

	fsSource = `	#version 300 es 
			precision mediump float; 
			in vec2 v_tex;
			uniform sampler2D u_texture;
			out vec4 outColor; 

			void main() { 
				vec4 color = texture(u_texture, v_tex);
				if ( color == vec4(1.0, 0.0, 1.0, 1.0) )
					discard;
				outColor = color;
			}`;

	programTileRenderer = new GlProgram(vsSource, fsSource);  
  
	window.requestAnimationFrame( tick );
};