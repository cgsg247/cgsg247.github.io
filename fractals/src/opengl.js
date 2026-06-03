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

window.mouse_wheel = 1.0;
window.mouseX = 0.0;
window.mouseY = 0.0;

let isGrab = false;
let lastMouseX = 0, lastMouseY = 0;

let u_time_location;
let u_mouse_x;
let u_mouse_y;
let u_mouse_wheel;
let u_fractal_color;

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
    u_fractal_color = gl.getUniformLocation(program, "u_fractal_color");
}

let vertexBuffer;
function initBuffer() {
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let vertices = [-1, 3, -1, -1, 3, -1];
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

    let timeFromStart = new Date().getMilliseconds() - startTime;
    gl.uniform1f(u_time_location, timeFromStart / 1000.0);
    gl.uniform1f(u_mouse_x, window.mouseX);
    gl.uniform1f(u_mouse_y, window.mouseY);
    gl.uniform1f(u_mouse_wheel, window.mouse_wheel);
    gl.uniform3f(u_fractal_color, window.fractalColors.color.r / 255.0, window.fractalColors.color.g / 255.0, window.fractalColors.color.b / 255.0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    window.requestAnimationFrame(drawScene);
}

export function onStart() {
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

            window.mouseX -= dx * stepx / window.mouse_wheel;
            window.mouseY -= dy * stepy / window.mouse_wheel;
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
            window.mouse_wheel *= zoomFactor;
        else
            window.mouse_wheel /= zoomFactor;
        window.mouse_wheel = Math.max(0.1, window.mouse_wheel);
        console.log(`Scroll wheel: ${window.mouse_wheel}`);
    };

    initGL(canvas);
    initBuffer();

    Promise.all([
        loadShaderText("./shaders/fractal.vert"),
        loadShaderText(`./shaders/${window.fileName}.frag`)
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