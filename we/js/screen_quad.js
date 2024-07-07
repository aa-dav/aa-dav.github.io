class ScreenQuad
{
	vboPositions;
	
	constructor()
	{
		let positions = new Float32Array([0.0, 0.0,	0.0, 1.0,	1.0, 0.0,	1.0, 1.0]);
  
		this.vboPositions = gl.createBuffer(); 
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vboPositions); 
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW); 
	}

	use(posLocation)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vboPositions); 
		gl.enableVertexAttribArray(posLocation); 
		gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, gl.FALSE, 0, 0); 
	};

	draw(instanceCount)
	{
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, instanceCount);
	}

	dispose()
	{
		gl.deleteBuffer(this.vboPositions);
	}
};  