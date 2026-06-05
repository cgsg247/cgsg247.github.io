#version 300 es
precision highp float;
layout(location = 0) out vec4 o_color;
uniform float u_roudness;
uniform mat4 u_invVP;
uniform vec2 u_screen_size;
uniform vec3 u_fractal_color;

vec3 v0 = vec3(0.0, 0.0, sqrt(6.0) / 3.0);
vec3 v1 = vec3(2.0 * sqrt(2.0) / 3.0, 0.0, -sqrt(6.0) / 6.0);
vec3 v2 = vec3(-sqrt(2.0) / 3.0, sqrt(6.0) / 3.0, -sqrt(6.0) / 6.0);
vec3 v3 = vec3(-sqrt(2.0) / 3.0, -sqrt(6.0) / 3.0, -sqrt(6.0) / 6.0);

float sdf( vec3 p, float R ) {
    float d1 = length(p - v0) - R;
    float d2 = length(p - v1) - R;
    float d3 = length(p - v2) - R;
    float d4 = length(p - v3) - R;
    return max(max(max(d1, d2), d3), d4);
}

vec3 norm( vec3 p, float R ) {
    vec2 e = vec2(0.001f, 0);
    return normalize(vec3(sdf(p + e.xyy, R) - sdf(p - e.xyy, R), sdf(p + e.yxy, R) - sdf(p - e.yxy, R), sdf(p + e.yyx, R) - sdf(p - e.yyx, R)));
}

void main() {
    vec2 st = gl_FragCoord.xy / u_screen_size * 2.0f - 1.0f;
    st.x *= u_screen_size.x / u_screen_size.y;

    vec4 near = u_invVP * vec4(st, -1, 1);
    vec4 far = u_invVP * vec4(st, 1, 1);
    vec3 ro = near.xyz / near.w;
    vec3 rd = normalize((far.xyz / far.w) - ro);

    float t = 0.0f;
    float R = u_roudness;
    int MAX_STEPS = 120;
    float MAX_DIST = 20.0f;
    float EPS = 0.002f;

    for( int i = 0; i < MAX_STEPS; i++ ) {
        vec3 p = ro + rd * t;
        float d = sdf(p, R);
        if( d < EPS ) {
            vec3 n = norm(p, R);

            float brightness = 0.5f + 0.5f * n.y;
            brightness = clamp(brightness, 0.4f, 1.0f);

            vec3 viewDir = normalize(-rd);
            float spec = pow(max(0.0f, dot(n, viewDir)), 16.0f);

            vec3 albedo = u_fractal_color;
            vec3 color = albedo * (brightness + spec * 0.8f);
            color = min(color, 1.0f);
            o_color = vec4(color, 1.0f);
            return;
        }
        t += d;
        if(t > MAX_DIST)
            break;
    }
    o_color = vec4(0.3f, 0.47f, 0.8f, 1);
}
