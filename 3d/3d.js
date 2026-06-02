let gl;
let startTime;

function initGL(canvas) {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
}

const shaderFs = `#version 300 es
        precision highp float;
        layout (location = 0) out vec4 o_color;

        uniform float u_time;
        uniform float u_mouse_x;
        uniform float u_mouse_y;
        uniform float u_mouse_wheel;
        uniform vec3 u_fractal_color;

        vec2 cmplMulCmpl( vec2 Z1, vec2 Z2 ) 
        {
            vec2 r;
            
            r.x = Z1.x * Z2.x - Z1.y * Z2.y;
            r.y = Z1.x * Z2.y + Z2.x * Z1.y;
            return r;
        }

        void main() {
            float n = 0.0;
            float FRAME_W = 800.0, FRAME_H = 800.0;
            float X1 = 2.0, X0 = -2.0, Y1 = 2.0, Y0 = -2.0;
        
            float ys = gl_FragCoord.y;// + u_mouse_y;
            float xs = gl_FragCoord.x;// - u_mouse_x;

            vec2 Z = vec2((xs * (X1 - X0) / FRAME_W + X0) / u_mouse_wheel, (ys * (Y1 - Y0) / FRAME_H + Y0) / u_mouse_wheel);
            Z.x += u_mouse_x;
            Z.y -= u_mouse_y;
            vec2 Z0 = Z;
            
            while (n < 255.0 && (Z.x * Z.x + Z.y * Z.y) < 4.0)
            {
                Z = cmplMulCmpl(Z, Z) + Z0; // + vec2(abs(sin(u_time / 2.0) * 2.0) * 0.5, abs(sin(u_time / 3.0) * 3.0) * 2.0 + 0.5);
                n++;
            }
            o_color = vec4(vec3(n * u_fractal_color.x, n * u_fractal_color.y, n * u_fractal_color.z), 1);
        }`;

const shaderVs = `#version 300 es
        precision highp float;

        layout (location = 0) in vec2 a_pos;

        void main() {
            gl_Position = vec4(a_pos, 0, 1);
        }`;

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
let u_fractal_color;

let FRAME_W = 800.0, FRAME_H = 800.0;

function initShaders() {

    const vs = getShader(shaderFs, gl.FRAGMENT_SHADER);
    const fs = getShader(shaderVs, gl.VERTEX_SHADER);

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
    gl.uniform3f(u_fractal_color, window.fractalColors.color.r / 255.0, window.fractalColors.color.g / 255.0, window.fractalColors.color.b / 255.0);

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
    initShaders();
    initBuffer();

    startTime = new Date().getMilliseconds();
    drawScene();
}