#version 300 es
precision highp float;
layout(location = 0) out vec4 o_color;

uniform float u_time;
uniform float u_mouse_x;
uniform float u_mouse_y;
uniform float u_mouse_wheel;
uniform vec3 u_fractal_color;

vec2 cmplMulCmpl(vec2 Z1, vec2 Z2) {
    vec2 r;

    r.x = Z1.x * Z2.x - Z1.y * Z2.y;
    r.y = Z1.x * Z2.y + Z2.x * Z1.y;
    return r;
}

void main() {
    float n = 0.0f;
    float FRAME_W = 800.0f, FRAME_H = 800.0f;
    float X1 = 2.0f, X0 = -2.0f, Y1 = 2.0f, Y0 = -2.0f;

    float ys = gl_FragCoord.y;
    float xs = gl_FragCoord.x;

    vec2 Z = vec2((xs * (X1 - X0) / FRAME_W + X0) / u_mouse_wheel, (ys * (Y1 - Y0) / FRAME_H + Y0) / u_mouse_wheel);
    Z.x += u_mouse_x;
    Z.y -= u_mouse_y;
    vec2 Z0 = Z;

    while(n < 255.0f && (Z.x * Z.x + Z.y * Z.y) < 4.0f) {
        Z = cmplMulCmpl(Z, Z) + Z0;
        n++;
    }
    o_color = vec4(vec3(n * u_fractal_color.x, n * u_fractal_color.y, n * u_fractal_color.z), 1);
}