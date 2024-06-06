class GlTexture
{
	textureId;
	modeFilter;
	modeWrap;
	
	constructor()
	{
		this.textureId = gl.createTexture();
	}

	initRGBA2D(modeFilter, modeWrap, source)
	{
		gl.bindTexture(gl.TEXTURE_2D, this.textureId);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
		if ( modeFilter != gl.NEAREST )
		{
			gl.generateMipmap(gl.TEXTURE_2D);
		};
		this.modeFilter = modeFilter;
		this.modeWrap = modeWrap;
	}

	initCustom2D(modeFilter, modeWrap, internalFormat, width, height, format, type, source)
	{
		gl.bindTexture(gl.TEXTURE_2D, this.textureId);
		gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, source);
		if ( modeFilter != gl.NEAREST )
		{
			gl.generateMipmap(gl.TEXTURE_2D);
		};
		this.modeFilter = modeFilter;
		this.modeWrap = modeWrap;
	}

	use(target, unit, location)
	{
		gl.activeTexture(gl.TEXTURE0 + unit);
		gl.bindTexture(target, this.textureId);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.modeFilter );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.modeFilter );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.modeWrap );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.modeWrap );
		gl.uniform1i(location, unit);
	};

	dispose()
	{
		gl.deleteTexture(this.textureId);
	}
}; 