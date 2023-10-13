var gl;
var myShaderProgram;
var alpha, beta, gamma;
var tx, ty;
var sx, sy;

function init() {
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert("WebGL is not available");
  }

  gl.viewport(0, 0, 512, 512);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  myShaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(myShaderProgram);

  // will include depth test to render faces correctly!
  gl.enable(gl.DEPTH_TEST);

  setupTetra();

  render();
}

function setupTetra() {
  // Vertices of Tetrahedron
  var vertices = [
    vec4(-0.25, -0.25, -0.25, 1.0), // p0
    vec4(0.25, -0.25, -0.25, 1.0), // p1
    vec4(0.0, 0.25, -0.25, 1.0), // p2
    vec4(0.0, 0.0, 0.25, 1.0), // p3
  ];

  // Colors at Vertices of Tetrahedron
  var vertexColors = [
    vec4(0.0, 0.0, 1.0, 1.0), // p0
    vec4(0.0, 1.0, 0.0, 1.0), // p1
    vec4(1.0, 0.0, 0.0, 1.0), // p2
    vec4(1.0, 1.0, 0.0, 1.0), // p3
  ];

  // Every face on the cube is a triangle,
  // each triangle is described by three indices into
  // the array "vertices"
  var indexList = [
    0,
    1,
    2, // front face
    0,
    2,
    3, // right face
    0,
    3,
    1, // left face
    1,
    3,
    2, // bottom face
  ];

  alpha = 0.0;
  beta = 0.0;
  gamma = 0.0;
  tx = 0.0;
  ty = 0.0;
  sx = 1.0;
  sy = 1.0;

  // Code here to handle putting above lists into buffers
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var myPosition = gl.getAttribLocation(myShaderProgram, "myPosition");
  gl.vertexAttribPointer(myPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(myPosition);

  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

  var myColor = gl.getAttribLocation(myShaderProgram, "myColor");
  gl.vertexAttribPointer(myColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(myColor);

  // will populate to create buffer for indices
  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint8Array(indexList),
    gl.STATIC_DRAW
  );

  sxLoc = gl.getUniformLocation(myShaderProgram, "sx");
  gl.uniform1f(sxLoc, sx);

  syLoc = gl.getUniformLocation(myShaderProgram, "sy");
  gl.uniform1f(syLoc, sy);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // will populate to render the tetrahedron
  gl.drawElements(gl.TRIANGLES, 12, gl.UNSIGNED_BYTE, 0);
  requestAnimationFrame(render);
}

function rotateAroundX() {
  alpha += 0.1;
  alphaLoc = gl.getUniformLocation(myShaderProgram, "alpha");
  gl.uniform1f(alphaLoc, alpha);
}

function rotateAroundY() {
  beta += 0.1;
  betaLoc = gl.getUniformLocation(myShaderProgram, "beta");
  gl.uniform1f(betaLoc, beta);
}

function rotateAroundZ() {
  gamma += 0.1;
  gammaLoc = gl.getUniformLocation(myShaderProgram, "gamma");
  gl.uniform1f(gammaLoc, gamma);
}

function translateX(amount) {
  tx += amount;
  txLoc = gl.getUniformLocation(myShaderProgram, "tx");
  gl.uniform1f(txLoc, tx);
}

function translateY(amount) {
  ty += amount;
  tyLoc = gl.getUniformLocation(myShaderProgram, "ty");
  gl.uniform1f(tyLoc, ty);
}

function scaleX(amount) {
  sx += amount;
  sxLoc = gl.getUniformLocation(myShaderProgram, "sx");
  gl.uniform1f(sxLoc, sx);
}

function scaleY(amount) {
  sy += amount;
  syLoc = gl.getUniformLocation(myShaderProgram, "sy");
  gl.uniform1f(syLoc, sy);
}

function transform(event) {
  // show the keycode as a popup alert
  var key = event.keyCode;

  // rotation, translation, and scaling
  if (key == 88) {
    // x
    rotateAroundX();
  } else if (key == 89) {
    // y
    rotateAroundY();
  } else if (key == 90) {
    // z
    rotateAroundZ();
  } else if (key == 65) {
    // a
    translateX(-0.1);
  } else if (key == 68) {
    // d
    translateX(0.1);
  } else if (key == 83) {
    // s
    translateY(-0.1);
  } else if (key == 87) {
    // w
    translateY(0.1);
  } else if (key == 37) {
    // left arrow
    scaleX(-0.1);
  } else if (key == 39) {
    // right arrow
    scaleX(0.1);
  } else if (key == 38) {
    // up arrow
    scaleY(0.1);
  } else if (key == 40) {
    // down arrow
    scaleY(-0.1);
  }
}
