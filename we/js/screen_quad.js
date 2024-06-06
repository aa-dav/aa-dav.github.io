class ScreenQuad
{
	vboPositions;
	vboTexCoords;
	
	constructor()
	{
		let positions = new Float32Array([-1.0, -1.0,	1.0, -1.0,	1.0, 1.0,
						-1.0, -1.0,	-1.0, 1.0,	1.0, 1.0]);
		let texCoords = new Float32Array([0.0, 1.0,	1.0, 1.0,	1.0, 0.0,
						0.0, 1.0,	0.0, 0.0,	1.0, 0.0]);
  
		// Create an initialize vertex buffers 
		this.vboPositions = gl.createBuffer(); 
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vboPositions); 
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW); 

	        this.vboTexCoords = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vboTexCoords); 
		gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW); 
	}

	use(posLocation, texLocation)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vboPositions); 
		gl.enableVertexAttribArray(posLocation); 
		gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, gl.FALSE, 0, 0); 

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vboTexCoords); 
		gl.enableVertexAttribArray(texLocation); 
		gl.vertexAttribPointer(texLocation, 2, gl.FLOAT, gl.FALSE, 0, 0); 
	};

	draw()
	{
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	dispose()
	{
		gl.deleteBuffer(this.vboPositions);
		gl.deleteBuffer(this.vboTexCoords);
	}
};  