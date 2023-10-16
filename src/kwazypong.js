var gl;
var shaderPlayerPile, shaderBall, shaderObject, shaderGoalObject;
var mousePositionUniform, ballPositionUniform;
var mouseX, mouseY;
var clipPlayerX, clipPlayerY, clipBallX, clipBallY;
var moveRight, moveUp, moveBallRight, moveBallUp;
var speed;
var bufferPlayerPile, bufferBall, bufferGoalObject;
var gameStarted;
var n;
var arrBufferObjects;

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

  shaderObject = initShaders(
    gl,
    "vertex-shader-object",
    "fragment-shader-object"
  );

  shaderGoalObject = initShaders(
    gl,
    "vertex-shader-goalobject",
    "fragment-shader-goalobject"
  );

  // Force the WebGL context to clear the color buffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  mouseX = 0.0;
  mouseY = 0.0;
  clipPlayerX = 0.0;
  clipPlayerY = 0.0;
  clipBallX = 0.0;
  clipBallY = 0.0;
  speed = 0.001;
  moveRight = 0.0;
  moveUp = 0.0;
  moveBallRight = 0.0;
  moveBallUp = 1.0;
  n = 1000;
  gameStarted = 0;
  arrBufferObjects = [];

  colorUniform = gl.getUniformLocation(shaderPlayerPile, "color");

  mousePositionUniform = gl.getUniformLocation(
    shaderPlayerPile,
    "mousePosition"
  );
  gl.uniform2f(mousePositionUniform, mouseX, mouseY);

  ballPositionUniform = gl.getUniformLocation(shaderBall, "position");
  gl.uniform2f(ballPositionUniform, clipBallX, clipBallY);

  setupPlayerPile();
  setupBall();
  setupGoalObject();
  setupObjects();
  render();
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

function setupGoalObject() {
  // Enter array set up code here
  var p0 = vec2(-0.1, 0.65);
  var p1 = vec2(-0.1, 0.85);
  var p2 = vec2(0.1, 0.65);
  var p3 = vec2(0.1, 0.85);
  arrayOfPoints = [p0, p1, p2, p3];

  // Create a buffer on the graphics card,
  // and send array to the buffer for use
  // in the shaders
  bufferGoalObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferGoalObject);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(arrayOfPoints), gl.STATIC_DRAW);
}

function setupObjects() {
  var posY = 1;
	var heightDiff = 0.11;
  // left col
  for (var i = 0; i < 7; i++) {
    var p0 = vec2(-0.61, posY - 0.1);
    var p1 = vec2(-0.61, posY);
    var p2 = vec2(-0.21, posY - 0.1);
    var p3 = vec2(-0.21, posY);
    setupObject(p0, p1, p2, p3);
    posY -= heightDiff;
  }
  posY = 1;
  // right col
  for (var i = 0; i < 7; i++) {
    var p0 = vec2(0.61, posY - 0.1);
    var p1 = vec2(0.61, posY);
    var p2 = vec2(0.21, posY - 0.1);
    var p3 = vec2(0.21, posY);
    setupObject(p0, p1, p2, p3);
    posY -= heightDiff;
  }

  posY = 1;
  // middle col
  for (var i = 0; i < 5; i++) {
    posY -= heightDiff;
  }
  for (var i = 0; i < 2; i++) {
    var p0 = vec2(-0.2, posY - 0.1);
    var p1 = vec2(-0.2, posY);
    var p2 = vec2(0.2, posY - 0.1);
    var p3 = vec2(0.2, posY);
    setupObject(p0, p1, p2, p3);
    posY -= heightDiff;
  }
}

function setupObject(p0, p1, p2, p3) {
  arrayofPoints = [p0, p1, p2, p3];

  arrBufferObjects.push(gl.createBuffer());
  gl.bindBuffer(gl.ARRAY_BUFFER, arrBufferObjects[arrBufferObjects.length - 1]);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(arrayofPoints), gl.STATIC_DRAW);
}

function setupBall() {
  var arrayOfPointsForCircle = [];

  var theta = 0.0;
  var x = 0.0;
  var y = 0.0;

  var i = 0;

  var a = 0.0;
  var b = -0.85;
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

function startGame() {
  gameStarted = 1;
}

function movePlayerPile(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;

  clipPlayerX = (2.0 * mouseX) / 512.0 - 1.0;
  //clipPlayerX = mouseX;

  gl.uniform2f(mousePositionUniform, clipPlayerX, clipPlayerY);
}

function render() {
  // Force WebGL context to clear the color buffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw the player pile
  gl.useProgram(shaderPlayerPile);

  gl.uniform2f(mousePositionUniform, clipPlayerX, clipPlayerY);

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

  clipBallX += moveBallRight * speed * gameStarted;
  clipBallY += moveBallUp * speed * gameStarted;

  gl.uniform2f(ballPositionUniform, clipBallX, clipBallY);

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferBall);

  // Create a pointer that iterates over the
  // array of points in the shader code
  var myPositionBall = gl.getAttribLocation(shaderBall, "myPosition");
  gl.vertexAttribPointer(myPositionBall, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(myPositionBall);

  var myColorBall = gl.getUniformLocation(shaderBall, "shapecolor");
  gl.uniform4f(myColorBall, 0.5, 0.0, 1.0, 1.0);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);

	// draw the goal object
	gl.useProgram(shaderGoalObject);

	gl.bindBuffer(gl.ARRAY_BUFFER, bufferGoalObject);

  var myPositionGoalObject = gl.getAttribLocation(shaderGoalObject, "myPosition");
  gl.vertexAttribPointer(myPositionGoalObject, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(myPositionGoalObject);

  var myColorGoalObject = gl.getUniformLocation(shaderGoalObject, "shapecolor");
  gl.uniform4f(myColorGoalObject, 0.83, 0.69, 0.22, 1.0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // draw the objects
  gl.useProgram(shaderObject);

  var col = 0;
  for (var i = 0; i < arrBufferObjects.length; i++) {
    gl.bindBuffer(gl.ARRAY_BUFFER, arrBufferObjects[i]);

    // Create a pointer that iterates over the
    // array of points in the shader code
    var myPositionObject = gl.getAttribLocation(shaderObject, "myPosition");
    gl.vertexAttribPointer(myPositionObject, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(myPositionObject);

    var myColorObject = gl.getUniformLocation(shaderObject, "shapecolor");

    if (i % 7 == 0) {
      col = 0;
    }

    if (col == 0) {
      gl.uniform4f(myColorObject, 1.0, 0.0, 0.0, 1.0);
      col = 1;
    } else if (col == 1) {
      gl.uniform4f(myColorObject, 0.0, 0.0, 1.0, 1.0);
      col = 2;
    } else if (col == 2) {
      gl.uniform4f(myColorObject, 0.0, 1.0, 0.0, 1.0);
      col = 0;
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  requestAnimFrame(render);
}
