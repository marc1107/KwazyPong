var gl;
var shaderPlayerPile;
var shaderBall;
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
var n;
var bufferPlayerPile, bufferBall;

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

  shaderPlayerPile = initShaders(
    gl,
    "vertex-shader-playerpile",
    "fragment-shader-playerpile"
  );

  shaderBall = initShaders(gl, "vertex-shader-ball", "fragment-shader-ball");

  // Force the WebGL context to clear the color buffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  flag = 0;

  mouseX = 0.0;
  mouseY = 0.0;
  clipX = 0.0;
  clipY = 0.0;
  nudge = 0.001;
  moveRight = 0.0;
  moveUp = 0.0;
  n = 1000;

  colorUniform = gl.getUniformLocation(shaderPlayerPile, "color");

  mousePositionUniform = gl.getUniformLocation(
    shaderPlayerPile,
    "mousePosition"
  );
  gl.uniform2f(mousePositionUniform, mouseX, mouseY);

  setupPlayerPile();
  setupBall();
  render();
}

function setupBall() {
  var arrayOfPointsForCircle = [];

  var theta = 0.0;
  var x = 0.0;
  var y = 0.0;

  var i = 0;

  var a = 0.0;
  var b = 0.0;
  var c = 0.05;
  var d = 0.05;

  for (i = 0; i < n; i++) {
    theta = (2 * Math.PI * i) / n;
    x = a + c * Math.cos(theta);
    y = b + d * Math.sin(theta);
    var p = vec2(x, y);
    arrayOfPointsForCircle.push(p);
  }

  bufferBall = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferBall);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    flatten(arrayOfPointsForCircle),
    gl.STATIC_DRAW
  );
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
  bufferPlayerPile = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferPlayerPile);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(arrayOfPoints), gl.STATIC_DRAW);
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

function render() {
  // Force WebGL context to clear the color buffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw the player pile
  gl.useProgram(shaderPlayerPile);

  clipX += moveRight * nudge;
  clipY += moveUp * nudge;

  gl.uniform2f(mousePositionUniform, clipX, clipY);

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferPlayerPile);

  // Create a pointer that iterates over the
  // array of points in the shader code
  var myPositionPlayerPile = gl.getAttribLocation(
    shaderPlayerPile,
    "myPosition"
  );
  gl.vertexAttribPointer(myPositionPlayerPile, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(myPositionPlayerPile);

  var myColorPlayerPile = gl.getUniformLocation(shaderPlayerPile, "shapecolor");
  gl.uniform4f(myColorPlayerPile, 0.0, 0.0, 0.0, 1.0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // draw the ball
  gl.useProgram(shaderBall);

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferBall);

  // Create a pointer that iterates over the
  // array of points in the shader code
  var myPositionBall = gl.getAttribLocation(shaderBall, "myPosition");
  gl.vertexAttribPointer(myPositionBall, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(myPositionBall);

  var myColorBall = gl.getUniformLocation(shaderBall, "shapecolor");
  gl.uniform4f(myColorBall, 0.5, 0.0, 1.0, 1.0);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);

  requestAnimFrame(render);
}
