import { mat4, vec3 } from 'gl-matrix';

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

window.azimuth = 0.0;
window.elevation = 0.2;
window.camDistance = 2.8;
window.isGrab = false;
window.lastMouseX = 0, window.lastMouseY = 0;

let u_time_location;
let u_mouse_x, u_mouse_y, u_mouse_wheel;
let u_fractal_color;
let u_screen_size, u_cam_dist, u_roudness, u_invVP;

let FRAME_W = 1920.0, FRAME_H = 1080.0;

const viewMatrix = mat4.create();
const projMatrix = mat4.create();
const invVP = mat4.create();

function UpdateMatrices() {
    const x = window.camDistance * Math.cos(window.azimuth) * Math.cos(window.elevation);
    const y = window.camDistance * Math.sin(window.elevation);
    const z = window.camDistance * Math.sin(window.azimuth) * Math.cos(window.elevation);
    const eye = vec3.fromValues(x, y, z);
    const at = vec3.fromValues(0, 0, 0);
    const up = vec3.fromValues(0, 1, 0);
    mat4.lookAt(viewMatrix, eye, at, up);

    const aspect = FRAME_W / FRAME_H;
    mat4.perspective(projMatrix, Math.PI / 3, aspect, 0.1, 10.0);

    const vp = mat4.create();
    mat4.multiply(vp, projMatrix, viewMatrix);
    mat4.invert(invVP, vp);
}

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
    u_fractal_color = gl.getUniformLocation(program, "u_fractal_color");
    u_screen_size = gl.getUniformLocation(program, "u_screen_size");
    u_roudness = gl.getUniformLocation(program, "u_roudness");
    u_invVP = gl.getUniformLocation(program, "u_invVP");
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
    gl.uniform3f(u_fractal_color, window.fractalColors.color.r / 255.0, window.fractalColors.color.g / 255.0, window.fractalColors.color.b / 255.0);
    gl.uniform1f(u_roudness, window.roudness.size);
    gl.uniform2f(u_screen_size, FRAME_W, FRAME_H);
    gl.uniformMatrix4fv(u_invVP, false, invVP);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    window.requestAnimationFrame(drawScene);
}

export function onStart() {
    let canvas = document.getElementById("webgl-canvas");

    /* Mouse button pressed*/
    canvas.onmousedown = (ev) => {
        if (ev.button === 0) {
            window.isGrab = true;
            window.lastMouseX = ev.clientX;
            window.lastMouseY = ev.clientY;
            canvas.style.cursor = 'grabbing';
        }
    };

    /* Mouse moved */
    window.onmousemove = (ev) => {
        if (window.isGrab) {
            const dx = ev.clientX - window.lastMouseX;
            const dy = ev.clientY - window.lastMouseY;
            window.azimuth += dx * 0.008;
            window.elevation += dy * 0.008;
            window.elevation = Math.max(-1.4, Math.min(1.4, window.elevation));
            window.lastMouseX = ev.clientX;
            window.lastMouseY = ev.clientY;
            UpdateMatrices();
        }
    };

    /* Mouse button unpressed */
    window.onmouseup = () => {
        window.isGrab = false;
        canvas.style.cursor = 'default';
    };

    /* Mouse wheel */
    canvas.onwheel = (ev) => {
        window.camDistance += ev.deltaY * 0.006;
        window.camDistance = Math.max(0.05, Math.min(10.0, window.camDistance));
        UpdateMatrices();
        ev.preventDefault();
    };

    window.UpdateMatrices = UpdateMatrices;

    initGL(canvas);
    initBuffer();

    Promise.all([
        loadShaderText("./shaders/3d.vert"),
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
