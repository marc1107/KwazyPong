var gl;
var shaderPlayerPile, shaderBall, shaderObject, shaderGoalObject;
var mousePositionUniform, ballPositionUniform, goalObjectPositionUniform;
var mouseX, mouseY;
var clipPlayerX,
  clipPlayerY,
  clipBallX,
  clipBallY,
  clipGoalObjectX,
  clipGoalObjectY,
  clipObjectsX,
  clipObjectsY;
var moveRight, moveUp, moveBallRight, moveBallUp;
var speed;
var bufferPlayerPile, bufferBall, bufferGoalObject;
var gameStarted;
var n;
var arrBufferObjects;
var objectColors;
var score;

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
  clipPlayerY = -0.95;
  clipBallX = 0.0;
  clipBallY = -0.85;
  clipGoalObjectX = 0.0;
  clipGoalObjectY = 0.75;
  clipObjectsX = [];
  clipObjectsY = [];
  speed = 0.01;
  moveRight = 0.0;
  moveUp = 0.0;
  moveBallRight = 0.0;
  moveBallUp = 1.0;
  n = 1000;
  gameStarted = 0;
  arrBufferObjects = [];
  objectColors = [];
  score = 0;

  colorUniform = gl.getUniformLocation(shaderPlayerPile, "color");

  mousePositionUniform = gl.getUniformLocation(
    shaderPlayerPile,
    "mousePosition"
  );
  gl.uniform2f(mousePositionUniform, mouseX, mouseY);

  ballPositionUniform = gl.getUniformLocation(shaderBall, "position");
  gl.uniform2f(ballPositionUniform, clipBallX, clipBallY);

  goalObjectPositionUniform = gl.getUniformLocation(
    shaderGoalObject,
    "position"
  );
  gl.uniform2f(goalObjectPositionUniform, clipGoalObjectX, clipGoalObjectY);

  setupPlayerPile();
  setupBall();
  setupGoalObject();
  setupObjects();
  render();
}

function setupPlayerPile() {
  // Enter array set up code here
  var p0 = vec2(-0.2, -0.05);
  var p1 = vec2(-0.2, 0.05);
  var p2 = vec2(0.2, -0.05);
  var p3 = vec2(0.2, 0.05);
  arrayOfPoints = [p0, p1, p2, p3];

  // Create a buffer on the graphics card,
  // and send array to the buffer for use
  // in the shaders
  bufferPlayerPile = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferPlayerPile);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(arrayOfPoints), gl.STATIC_DRAW);
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

function setupGoalObject() {
  // Enter array set up code here
  var p0 = vec2(-0.1, -0.1);
  var p1 = vec2(-0.1, 0.1);
  var p2 = vec2(0.1, -0.1);
  var p3 = vec2(0.1, 0.1);
  arrayOfPoints = [p0, p1, p2, p3];

  // Create a buffer on the graphics card,
  // and send array to the buffer for use
  // in the shaders
  bufferGoalObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferGoalObject);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(arrayOfPoints), gl.STATIC_DRAW);
}

function setColor(color) {
  objectColors.push(color);
  color++;
  if (color > 3) {
    color = 1;
  }
  return color;
}

function setupObjects() {
  var posY = 1;
  var heightDiff = 0.11;
  var color = 1;

  // left col
  for (var i = 0; i < 7; i++) {
    var p0 = vec2(-0.61, posY - 0.1);
    var p1 = vec2(-0.61, posY);
    var p2 = vec2(-0.21, posY - 0.1);
    var p3 = vec2(-0.21, posY);
    setupObject(p0, p1, p2, p3);
    posY -= heightDiff;
    color = setColor(color);
  }
  posY = 1;
  color = 1;
  // right col
  for (var i = 0; i < 7; i++) {
    var p0 = vec2(0.21, posY - 0.1);
    var p1 = vec2(0.21, posY);
    var p2 = vec2(0.61, posY - 0.1);
    var p3 = vec2(0.61, posY);
    setupObject(p0, p1, p2, p3);
    posY -= heightDiff;
    color = setColor(color);
  }

  posY = 1;
  color = 1;
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
    color = setColor(color);
  }
}

function setupObject(p0, p1, p2, p3) {
  arrayofPoints = [p0, p1, p2, p3];
  var height = 0.1;
  var width = 0.4;

  clipObjectsX.push(p0[0] + width / 2);
  clipObjectsY.push(p0[1] + height / 2);

  arrBufferObjects.push(gl.createBuffer());
  gl.bindBuffer(gl.ARRAY_BUFFER, arrBufferObjects[arrBufferObjects.length - 1]);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(arrayofPoints), gl.STATIC_DRAW);
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

function resetGame() {
  // reload the page
  location.reload();
}

function movePlayerPile(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;

  clipPlayerX = (2.0 * mouseX) / 512.0 - 1.0;
  //clipPlayerX = mouseX;

  gl.uniform2f(mousePositionUniform, clipPlayerX, clipPlayerY);
}

function setScore() {
  var scoreText = document.getElementById("score");
  scoreText.innerHTML = "Score: " + score;
}

function gameOver() {
  gameStarted = 0;
  score = 0;
  setScore();
  // show a text that the player lost
  var text = document.getElementById("text");
  text.innerHTML = "You lost!";
}

function gameWon() {
  // check if the ball hits the goal object, then set gameStarted to 0
  if (
    clipBallY + 0.05 > clipGoalObjectY - 0.1 &&
    clipBallX + 0.05 > clipGoalObjectX - 0.1 &&
    clipBallX - 0.05 < clipGoalObjectX + 0.1
  ) {
    gameStarted = 0;
    // show a text that the player won
    var text = document.getElementById("text");
    text.innerHTML = "You won!";
  }
}

function moveBallUpInAngle() {
  // Calculate the distance between the ball and the center of the player pile
  var distanceX = clipBallX - clipPlayerX;
  var distanceY = clipBallY - clipPlayerY;

  // Calculate the angle based on the x and y distance
  var angle = (Math.atan(distanceX / distanceY) * 180) / Math.PI;

  // Make sure the angle is facing upwards
  angle -= 90;
  // invert the angle
  angle *= -1;

  // Calculate the new ball direction based on the angle
  moveBallRight = Math.cos((angle * Math.PI) / 180);
  moveBallUp = Math.sin((angle * Math.PI) / 180);
}

function ballCollision() {
  gameWon();
  // Check if the ball hits the right wall
  if (clipBallX + 0.05 > 1.0) {
    moveBallRight *= -1.0;
  }

  // Check if the ball hits the top wall
  if (clipBallY + 0.05 > 1.0) {
    moveBallUp *= -1.0;
  }

  // Check if the ball hits the left wall
  if (clipBallX - 0.05 < -1.0) {
    moveBallRight *= -1.0;
  }

  // Check if the ball hits the bottom wall
  if (clipBallY - 0.05 < -1.0) {
    gameOver();
  }

  // Check if the ball hits any of the objects
  for (var i = 0; i < clipObjectsX.length; i++) {
    // check if ball hits the bottom of the pile
    if (
      clipBallY + 0.05 > clipObjectsY[i] - 0.05 &&
      clipBallY + 0.05 < clipObjectsY[i] - 0.03 &&
      clipBallX - 0.05 < clipObjectsX[i] + 0.2 &&
      clipBallX + 0.05 > clipObjectsX[i] - 0.2
    ) {
      moveBallUp *= -1.0;
      score += objectColors[i];
      arrBufferObjects.splice(i, 1);
      clipObjectsX.splice(i, 1);
      clipObjectsY.splice(i, 1);
      objectColors.splice(i, 1);
    }

    // check if ball hits the top of the pile
    if (
      clipBallY - 0.05 < clipObjectsY[i] + 0.05 &&
      clipBallY - 0.05 > clipObjectsY[i] + 0.03 &&
      clipBallX - 0.05 < clipObjectsX[i] + 0.2 &&
      clipBallX + 0.05 > clipObjectsX[i] - 0.2
    ) {
      moveBallUp *= -1.0;
      score += objectColors[i];
      arrBufferObjects.splice(i, 1);
      clipObjectsX.splice(i, 1);
      clipObjectsY.splice(i, 1);
      objectColors.splice(i, 1);
    }

    // check if ball hits the right of the pile
    if (
      clipBallX - 0.05 > clipObjectsX[i] + 0.15 &&
      clipBallX - 0.05 < clipObjectsX[i] + 0.2 &&
      clipBallY - 0.05 < clipObjectsY[i] + 0.05 &&
      clipBallY + 0.05 > clipObjectsY[i] - 0.05
    ) {
      moveBallRight *= -1.0;
      score += objectColors[i];
      arrBufferObjects.splice(i, 1);
      clipObjectsX.splice(i, 1);
      clipObjectsY.splice(i, 1);
      objectColors.splice(i, 1);
    }

    // check if ball hits the left of the pile
    if (
      clipBallX + 0.05 < clipObjectsX[i] - 0.15 &&
      clipBallX + 0.05 > clipObjectsX[i] - 0.2 &&
      clipBallY - 0.05 < clipObjectsY[i] + 0.05 &&
      clipBallY + 0.05 > clipObjectsY[i] - 0.05
    ) {
      moveBallRight *= -1.0;
      score += objectColors[i];
      arrBufferObjects.splice(i, 1);
      clipObjectsX.splice(i, 1);
      clipObjectsY.splice(i, 1);
      objectColors.splice(i, 1);
    }

    setScore();
  }

  // Check if the ball hits the player pile
  if (
    clipBallY - 0.05 < clipPlayerY + 0.05 &&
    clipBallX - 0.05 < clipPlayerX + 0.2 &&
    clipBallX + 0.05 > clipPlayerX - 0.2
  ) {
    moveBallUpInAngle();
  }
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

  ballCollision();

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

  gl.uniform2f(goalObjectPositionUniform, clipGoalObjectX, clipGoalObjectY);

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferGoalObject);

  var myPositionGoalObject = gl.getAttribLocation(
    shaderGoalObject,
    "myPosition"
  );
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

    if (objectColors[i] == 1) {
      gl.uniform4f(myColorObject, 1.0, 0.0, 0.0, 1.0);
    } else if (objectColors[i] == 2) {
      gl.uniform4f(myColorObject, 0.0, 0.0, 1.0, 1.0);
    } else if (objectColors[i] == 3) {
      gl.uniform4f(myColorObject, 0.0, 1.0, 0.0, 1.0);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  requestAnimFrame(render);
}
