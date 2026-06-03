let gl;
let startTime;

function initGL(canvas) {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
}

function getShader(shaderStr, type) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
    }

    return shader;
}

let mouse_wheel = 1;

let mouseX = 0.0, mouseY = 0.0;
let isGrab = false;
let lastMouseX = 0, lastMouseY = 0;

let u_time_location;
let u_mouse_x;
let u_mouse_y;
let u_mouse_wheel;

let FRAME_W = 800.0, FRAME_H = 800.0;

function loadShaderText(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw "Resource not found";
            }
            return response.text();
        });
}

function initShaders(shaderFs, shaderVs) {

    const fs = getShader(shaderFs, gl.FRAGMENT_SHADER);
    const vs = getShader(shaderVs, gl.VERTEX_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Program linkage error");
    }

    gl.useProgram(program);

    u_time_location = gl.getUniformLocation(program, "u_time");
    u_mouse_x = gl.getUniformLocation(program, "u_mouse_x");
    u_mouse_y = gl.getUniformLocation(program, "u_mouse_y");
    u_mouse_wheel = gl.getUniformLocation(program, "u_mouse_wheel");
}

let vertexBuffer;
function initBuffer() {
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    vertices = [-1, 3, -1, -1, 3, -1];
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );
}

function drawScene() {
    gl.clearColor(0.30, 0.47, 0.8, 1);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    timeFromStart = new Date().getMilliseconds() - startTime;
    gl.uniform1f(u_time_location, timeFromStart / 1000.0);
    gl.uniform1f(u_mouse_x, mouseX);
    gl.uniform1f(u_mouse_y, mouseY);
    gl.uniform1f(u_mouse_wheel, mouse_wheel);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    window.requestAnimationFrame(drawScene);
}

function onStart() {
    let canvas = document.getElementById("webgl-canvas");

    /* Mouse button pressed*/
    canvas.onmousedown = (ev) => {
        if (ev.button === 0) {
            isGrab = true;
            lastMouseX = ev.offsetX;
            lastMouseY = ev.offsetY;
        }
    };

    /* Mouse moved */
    canvas.onmousemove = (ev) => {
        if (isGrab) {
            console.log(`(${ev.x}, ${ev.y})`);
            const dx = ev.offsetX - lastMouseX;
            const dy = ev.offsetY - lastMouseY;
            const stepx = 4.0 / FRAME_W;
            const stepy = 4.0 / FRAME_H;

            mouseX -= dx * stepx / mouse_wheel;
            mouseY -= dy * stepy / mouse_wheel;
            lastMouseX = ev.offsetX;
            lastMouseY = ev.offsetY;
        }
    };

    /* Mouse button unpressed */
    canvas.onmouseup = () => {
        isGrab = false;
    };

    canvas.onwheel = (ev) => {
        const zoomFactor = 1.1;

        if (ev.deltaY < 0)
            mouse_wheel *= zoomFactor;
        else
            mouse_wheel /= zoomFactor;
        mouse_wheel = Math.max(0.1, mouse_wheel);
        console.log(`Scroll wheel: ${mouse_wheel}`);
    };

    initGL(canvas);
    initBuffer();

    Promise.all([
        loadShaderText("3d.vert"),
        loadShaderText("3d.frag")
    ])
        .then(([shaderVs, shaderFs]) => {
            initShaders(shaderFs, shaderVs);
            startTime = new Date().getMilliseconds();
            drawScene();
            console.log("Shaders loaded");
        })
        .catch(error => {
            console.error("Error:", error);
        });
}