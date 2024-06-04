class GlProgram
{
	vertexShader;
	fragmentShader;
	program;
	
	constructor(vertexSource, fragmentSource)
	{
		// Create WebGl Shader objects 
		this.vertexShader = gl.createShader(gl.VERTEX_SHADER); 
		this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); 
  
		// sets the source code of the WebGL shader 
		gl.shaderSource(this.vertexShader, vertexSource); 
		gl.shaderSource(this.fragmentShader, fragmentSource); 
  
		// Compile GLSL Shaders to a binary data so 
		// WebGLProgram can use them 
		gl.compileShader(this.vertexShader); 
		gl.compileShader(this.fragmentShader); 
  
		// Create a WebGLProgram 
		this.program = gl.createProgram(); 
  
		// Attach pre-existing shaders 
		gl.attachShader(this.program, this.vertexShader); 
		gl.attachShader(this.program, this.fragmentShader); 
  
		gl.linkProgram(this.program);

		let attrCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
		for ( let i = 0; i < attrCount; i++ )
		{
			let attrib = gl.getActiveAttrib(this.program, i);
			let attribLocation = gl.getAttribLocation(this.program, attrib.name); 
			this[ "aLoc_" + attrib.name ] = attribLocation;
		}

		let unifCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
		for ( let i = 0; i < unifCount; i++ )
		{
			let uniform = gl.getActiveUniform(this.program, i);
			let uniformLocation = gl.getUniformLocation(this.program, uniform.name); 
			this[ "uLoc_" + uniform.name ] = uniformLocation;
		}
	}

	use()
	{
		gl.useProgram(this.program);
	};
};