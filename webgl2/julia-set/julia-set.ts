<!doctype html>
<html>
	<head>
		<title>Julia Set</title>
		<style>
			body{ background-color: grey; }
			canvas{ background-color: white; }
		</style>
		<script id="shader-fs" type="x-shader/x-fragment">
		    varying highp vec2 position;
			const int MAX_ITERATIONS = 150;
			const highp float LIGHTNESS_FACTOR = 2.0;
			void main(void) {   		
				highp vec2 z = vec2(position.x, position.y);		
				//set c to any value within the mandelbrot set
				//highp vec2 c = vec2(-.5,.62);
				//highp vec2 c = vec2(-1.,.0);
				highp vec2 c = vec2(-.8,-.2);
		  
				highp vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
		
				for (int i = 0; i < MAX_ITERATIONS; i++)
				{
					z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
		            
					if (dot(z, z) > 4.0)
					{
						highp float f =  LIGHTNESS_FACTOR*float(i) / float(MAX_ITERATIONS);
						color = vec4(vec3(0.1, 0.1, 1.0)*f, 1.0);
						break;
					}		
				}
				gl_FragColor = color;		
			}
		</script>
      	<script>
			var gl = null,
				canvas = null,
				glProgram = null,
				fragmentShader = null,
				vertexShader = null;
				
			var vertexPositionAttribute = null,
				trianglesVerticeBuffer = null,
				vertexIndexBuffer = null;
			function initWebGL()
			{
				canvas = document.getElementById("my-canvas");  
				try{
					gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");					
				}catch(e){
				}
								
				if(gl)
				{
					gl = WebGLDebugUtils.makeDebugContext(gl);
					initShaders();
					createSquare();
					vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
	                gl.enableVertexAttribArray(vertexPositionAttribute);
    			    
    			    gl.viewport(0, 0, canvas.width, canvas.height);
					setupWebGL();
					drawScene(); 
				}else{	
					alert(  "Error: Your browser does not appear to support WebGL.");
				}
			}
			
			function setupWebGL()
			{
				//set the clear color to a shade of green
				gl.clearColor(0.1, 0.5, 0.1, 1.0); 	
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 	
				gl.enable(gl.DEPTH_TEST);
			}
			
			function initShaders()
			{
				var vs_source = null,
					fs_source = document.getElementById("shader-fs").innerHTML;	
				//get shader sources with jQuery Ajax
				$.ajax({
				    async: false,
				    url: './03_mandelbrot.vs',
				    success: function (data) {
				        vs_source = data.firstChild.textContent;
				    },
				    dataType: 'xml'
				});
				//compile shaders	
                vertexShader = makeShader(vs_source, gl.VERTEX_SHADER);
				fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);
				
				//create program
				glProgram = gl.createProgram();
				
				//attach and link shaders to the program
                gl.attachShader(glProgram, vertexShader);
                gl.attachShader(glProgram, fragmentShader);
                gl.linkProgram(glProgram);
                if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
                    alert("Unable to initialize the shader program.");
                }
				
				//use program
				gl.useProgram(glProgram);
			}
			
			function makeShader(src, type)
			{
				//compile the vertex shader
				var shader = gl.createShader(type);
                gl.shaderSource(shader, src);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    alert("Error compiling shader: " + gl.getShaderInfoLog(shader));
                }
				return shader;
			}
			
			function drawScene()
			{
				gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
				gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
				gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
			}
            function createSquare(size){
				size = (typeof size !== 'undefined') ? size : 1.0;
				var vertexPositionData = [
					0.0, 0.0, 0.0,
					-size, -size, 0.0,
					size, -size, 0.0,
					size, size, 0.0,
					-size,size, 0.0,  	
				];
				var indexData = [0,1,2,0,2,3,0,3,4,0,4,1];
				trianglesVerticeBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
				trianglesVerticeBuffer.itemSize = 3;
				trianglesVerticeBuffer.numItems = vertexPositionData.length / 3;
				vertexIndexBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
				vertexIndexBuffer.itemSize = 3;
				vertexIndexBuffer.numItems = indexData.length;
            }
		</script>
	</head>
	<body onload="initWebGL()">
		<canvas id="my-canvas" width="500" height="500">
		Your browser does not support the HTML5 canvas element.
		</canvas>
	</body>
</html>
