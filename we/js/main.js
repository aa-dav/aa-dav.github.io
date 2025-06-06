let canvas;
let gl;
let loadedResources = 0;
let images = {};
let maps = {};

let resources = [ 
	{ type: "img", name: "tileset01", src: "data/tileset-01.bmp" },
	{ type: "map", name: "map01", src: "data/map-01.tmx?1" },
	{ type: "map", name: "map01bg", src: "data/map-01-bg.tmx?0" },
	{ type: "img", name: "tileset02", src: "data/dwd-01.bmp" },
	{ type: "map", name: "map02", src: "data/dwd-01.tmx?0" },
	{ type: "map", name: "map02bg", src: "data/dwd-01-bg.tmx?0" }
	];

let texTileMap;
let screenQuad;
let time = 0;
let mainLayer;
let backLayer;
let vpx = 0;
let vpy = 0;
let scaleFactor = 1;
let keysState = { up: 0, down: 0, right: 0, left: 0, fire: 0, jump: 0 };

function virtualWidth()
{
	return canvas.width / scaleFactor;
}

function virtualHeight()
{
	return canvas.height / scaleFactor;
}

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

	//gl.viewport(0, 0, canvas.width, canvas.height);

	time += 1;

	//gl.clearColor(0.0, (1.0 + Math.sin(time / 100)) / 2.0, 0.0, 1.0); 
	//gl.clear(gl.COLOR_BUFFER_BIT); 
	let step = 10;
	vpx += step * (keysState.right - keysState.left);
	vpy += step * (keysState.down - keysState.up);
	if ( vpx < 0 )
		vpx = 0;
	if ( vpy < 0 )
		vpy = 0;

	let virtWidth = virtualWidth();
	let virtHeight = virtualHeight();

	let tx = mainLayer.width * mainLayer.tileSize - virtWidth;
	let ty = mainLayer.height * mainLayer.tileSize - virtHeight;
	let sx = 6 * backLayer.width * backLayer.tileSize - virtWidth; // back layers is x times bigger (repeating pattern)
	let sy = backLayer.height * backLayer.tileSize - virtHeight;
	
	backLayer.render(texTileMap, Math.floor( vpx * sx / tx ), Math.floor( vpy * sy / ty ));
	mainLayer.render(texTileMap, vpx, vpy);

	window.requestAnimationFrame( tick );
};

function keyDown(evt)
{
	// Continous keys
	if( evt.key == 'ArrowLeft' )
	{
		keysState.left = 1;
	}
	else if( evt.key == 'ArrowRight' )
	{
		keysState.right = 1;
	}
	else if( evt.key == 'ArrowUp' )
	{
		keysState.up = 1;
	}
	else if( evt.key == 'ArrowDown' )
	{
		keysState.down = 1;
	}
	// Activation keys
	else if( evt.key == '1' )
	{
		scaleFactor = 1;
	}
	else if( evt.key == '2' )
	{
		scaleFactor = 2;
	}
	else if( evt.key == '3' )
	{
		scaleFactor = 3;
	}
	else if( evt.key == '4' )
	{
		scaleFactor = 4;
	}
}

function keyUp(evt)
{
	if( evt.key == 'ArrowLeft' )
	{
		keysState.left = 0;
	}
	else if( evt.key == 'ArrowRight' )
	{
		keysState.right = 0;
	}
	else if( evt.key == 'ArrowUp' )
	{
		keysState.up = 0;
	}
	else if( evt.key == 'ArrowDown' )
	{
		keysState.down = 0;
	}
}

function appInit()
{
	let body = document.getElementById("idBody"); 
	canvas = document.getElementById("canvas"); 
	canvas.width = body.clientWidth - 4;
	canvas.height = body.clientHeight - 4;
	
	gl = canvas.getContext("webgl2"); 
	if ( !gl ) 
	{ 
		alert("Your browser does not support WebGL 2!"); 
		return;
	} 

	texTileMap = new GlTexture();
	texTileMap.initRGBA2D(gl.NEAREST, gl.CLAMP_TO_EDGE, images.tileset01);

	screenQuad = new ScreenQuad();

	mainLayer = new MapLayer(maps.map01.responseXML, "map");
	vpx = 0;
	vpy = Math.floor((mainLayer.height * mainLayer.tileSize - virtualHeight()) / 2);
	backLayer = new MapLayer(maps.map01bg.responseXML, "map");

	gl.disable(gl.CULL_FACE);
	gl.disable(gl.DEPTH_TEST);

	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyUp);
  
	window.requestAnimationFrame( tick );
};