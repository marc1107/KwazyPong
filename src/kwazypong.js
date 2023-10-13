var gl;
var myShaderProgram;
var thetaUniform;
var theta;
var flag;
var mousePositionUniform;
var mouseX;
var mouseY;
var clipX;
var clipY;
var moveRight;
var moveUp;
var nudge;

function init() {
  // Set up the canvas
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL is not available");
  }

  // Set up the viewport
  gl.viewport(0, 0, 512, 512); // x, y, width, height

  // Set up the background color
  gl.clearColor(0.8, 0.8, 0.8, 1.0);

  myShaderProgram = initShaders(
    gl,
    "vertex-shader-hexagon",
    "fragment-shader-hexagon"
  );
  gl.useProgram(myShaderProgram);

  // Force the WebGL context to clear the color buffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  theta = 0.0;
  thetaUniform = gl.getUniformLocation(myShaderProgram, "theta");
  gl.uniform1f(thetaUniform, theta);

  flag = 0;

  mouseX = 0.0;
  mouseY = 0.0;
  clipX = 0.0;
  clipY = 0.0;
  nudge = 0.001;
  moveRight = 0.0;
  moveUp = 0.0;

  colorUniform = gl.getUniformLocation(myShaderProgram, "color");

  mousePositionUniform = gl.getUniformLocation(
    myShaderProgram,
    "mousePosition"
  );
  gl.uniform2f(mousePositionUniform, mouseX, mouseY);

  setupPlayerPile();

  drawPlayerPile();
}

function setupPlayerPile() {
  // Enter array set up code here
  var p0 = vec2(-0.2, -1);
  var p1 = vec2(-0.2, -0.9);
  var p2 = vec2(0.2, -1);
  var p3 = vec2(0.2, -0.9);
  arrayOfPoints = [p0, p1, p2, p3];

  // Create a buffer on the graphics card,
  // and send array to the buffer for use
  // in the shaders
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(arrayOfPoints), gl.STATIC_DRAW);

  // Create a pointer that iterates over the
  // array of points in the shader code
  var myPositionAttribute = gl.getAttribLocation(myShaderProgram, "myPosition");
  gl.vertexAttribPointer(myPositionAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(myPositionAttribute);

  var myColorUniform = gl.getUniformLocation(myShaderProgram, "shapecolor");
  gl.uniform4f(myColorUniform, 0.0, 0.0, 0.0, 1.0);
}

function changeDirection(event) {
  // a = 65, d = 68, s = 83, w = 87
  var keyCode = event.keyCode;

  if (keyCode == 65) {
    moveRight = -1;
    moveUp = 0;
  } else if (keyCode == 68) {
    moveRight = 1;
    moveUp = 0;
  } else if (keyCode == 83) {
    moveRight = 0;
    moveUp = -1;
  } else if (keyCode == 87) {
    moveRight = 0;
    moveUp = 1;
  }
}

/* function moveShape(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;

  clipX = (2.0 * mouseX) / 512.0 - 1.0;
  clipY = -((2.0 * mouseY) / 512.0 - 1.0);

  gl.uniform2f(mousePositionUniform, clipX, clipY);
} */

function drawPlayerPile() {
  // Force WebGL context to clear the color buffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  theta += 0.01 * flag; // change this value to change the rotation speed
  clipX += moveRight * nudge;
  clipY += moveUp * nudge;

  gl.uniform1f(thetaUniform, theta);
  gl.uniform2f(mousePositionUniform, clipX, clipY);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimFrame(drawPlayerPile);
}
