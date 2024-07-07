let programTileRenderer;

let tileRendererVertexSource = `#version 300 es
	precision highp float;
	precision highp int;
	precision highp usampler2D;
	uniform vec2 u_bounds;
	uniform vec2 u_start_pos;
	uniform vec2 u_step_x;
	uniform vec2 u_step_y;
	uniform int u_width_in_tiles;
	uniform ivec2 u_tex_size_in_tiles;
	uniform ivec2 u_top_tile;
	in vec2 a_data;
	out vec2 v_tex;
	uniform usampler2D u_textureMap;
	int posMod(int x, int y)
	{
		int ret = x % y;
		if (ret < 0)
			ret += y;
		return ret;
	}
	void main()
	{
		ivec2 tile_base = ivec2( gl_InstanceID % u_width_in_tiles, gl_InstanceID / u_width_in_tiles );
		vec2 coords = u_start_pos + (float( tile_base.x ) + a_data.x) * u_step_x + (float( tile_base.y ) + a_data.y) * u_step_y;
		ivec2 tex_size = textureSize( u_textureMap, 0 );
		ivec2 tex_fetch = ivec2( posMod((tile_base.x + u_top_tile.x), tex_size.x), posMod((tile_base.y + u_top_tile.y), tex_size.y) );
		int tile_num = int( texelFetch( u_textureMap, tex_fetch, 0 ).r ) - 1;
		vec2 tex_base = vec2( float( tile_num % u_tex_size_in_tiles.x ), float( tile_num / u_tex_size_in_tiles.x ) );
		v_tex = (tex_base + a_data) / vec2( u_tex_size_in_tiles );
		gl_Position = vec4( mix( -1.0, +1.0, (coords.x) / u_bounds.x ),
					mix( +1.0, -1.0, (coords.y) / u_bounds.y ), 0.0, 1.0 );
	}`;

let tileRendererFragmentSource = `#version 300 es
	precision highp float;
	uniform sampler2D u_texture;
	in vec2 v_tex;
	out vec4 color;
	void main()
	{
		color = texture( u_texture, v_tex );
		if ( color == vec4(1.0, 0.0, 1.0, 1.0) )
			discard;
	}`;

class MapLayer
{
	width;
	height;
	mapArray;
	texMap;
	tileSize;

	constructor(mapXML, layerName)
	{
		if ( !programTileRenderer )
			programTileRenderer = new GlProgram(tileRendererVertexSource, tileRendererFragmentSource);

		let mapLayer = mapXML.querySelector("layer[name='" + layerName + "']");
		let mapData = mapXML.querySelector("layer[name='" + layerName + "'] > data").textContent;
		mapData = mapData.replaceAll("\n", "");
		mapData = mapData.replaceAll("\r", "");
		mapData = mapData.replaceAll(" ", "");
		mapData = mapData.split(",");
		this.width = parseInt(mapLayer.getAttribute("width"));
		this.height = parseInt(mapLayer.getAttribute("height"))
		let mapTileSet = mapXML.querySelector("tileset");
		this.tileSize = parseInt(mapTileSet.getAttribute("tilewidth"))
		this.mapArray = new Uint16Array(mapData.length);
		for ( let i = 0; i < mapData.length; i++ )
			this.mapArray[i] = parseInt(mapData[i]);

		this.texMap = new GlTexture();	
		this.texMap.initCustom2D(gl.NEAREST, gl.REPEAT, gl.R16UI, this.width, this.height, gl.RED_INTEGER, gl.UNSIGNED_SHORT, this.mapArray);
	}

	render(tileMap, x, y)
	{
		let virtWidth = canvas.width / scaleFactor;
		let virtHeight = canvas.height / scaleFactor;

		let viewPortWidthInTiles = Math.floor(((virtWidth + this.tileSize - 1) / this.tileSize));
		let viewPortHeightInTiles = Math.floor(((virtHeight + this.tileSize - 1) / this.tileSize));

		programTileRenderer.use();
		tileMap.use(gl.TEXTURE_2D, 0, programTileRenderer.loc_u_texture);
		this.texMap.use(gl.TEXTURE_2D, 1, programTileRenderer.loc_u_textureMap);
		
		gl.uniform2f(programTileRenderer.loc_u_bounds,			virtWidth, virtHeight);
		gl.uniform2f(programTileRenderer.loc_u_start_pos,		-(x % this.tileSize),	-(y % this.tileSize));
		gl.uniform2f(programTileRenderer.loc_u_step_x,			this.tileSize,	0);
		gl.uniform2f(programTileRenderer.loc_u_step_y,			0,		this.tileSize);
		gl.uniform1i(programTileRenderer.loc_u_width_in_tiles,		viewPortWidthInTiles + 1);
		gl.uniform2i(programTileRenderer.loc_u_tex_size_in_tiles,	tileMap.width / this.tileSize, tileMap.height / this.tileSize);
		gl.uniform2i(programTileRenderer.loc_u_top_tile,		x / this.tileSize, y / this.tileSize);

		screenQuad.use(programTileRenderer.loc_a_data);
		screenQuad.draw( (viewPortWidthInTiles + 1) * (viewPortHeightInTiles + 1) );
	}
}