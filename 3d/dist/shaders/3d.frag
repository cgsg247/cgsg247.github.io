#version 300 es
precision highp float;
layout(location = 0) out vec4 o_color;

// uniform float u_time;
// uniform vec2 u_screen_size;
// //uniform float u_roudness;
// uniform float u_cam_dist;
// uniform mat4 u_invVP;
// uniform vec3 u_fractal_color;

// float u_roudness = 1.9f;

// float sdfReule(vec3 p, float a, float roudness) {
//     // float R = roudness * a;

//     // float d0 = length(p - v0) - R;
//     // float d1 = length(p - v1) - R;
//     // float d2 = length(p - v2) - R;
//     // float d3 = length(p - v3) - R;

//     // return max(max(max(d0, d1), d2), d3);
//     float t = u_time * 0.5f;
//     mat3 rotY = mat3(cos(t), 0.0f, sin(t), 0.0f, 1.0f, 0.0f, -sin(t), 0.0f, cos(t));
//     mat3 rotX = mat3(1.0f, 0.0f, 0.0f, 0.0f, cos(t * 0.7f), -sin(t * 0.7f), 0.0f, sin(t * 0.7f), cos(t * 0.7f));
//     p = rotX * rotY * p;

//     float scale = 0.6f;
//     float r = 2.0f * scale;
//     float offset = scale / 1.41421356f;

//     vec3 v0 = vec3(offset, offset, offset);
//     vec3 v1 = vec3(-offset, -offset, offset);
//     vec3 v2 = vec3(-offset, offset, -offset);
//     vec3 v3 = vec3(offset, -offset, -offset);

//     float d0 = length(p - v0) - r;
//     float d1 = length(p - v1) - r;
//     float d2 = length(p - v2) - r;
//     float d3 = length(p - v3) - r;

//     return max(max(d0, d1), max(d2, d3));
// }

// vec3 getNormal(vec3 p, float a, float roudness) {
//     float e = 0.001f;
//     return normalize(vec3(sdfReule(p + vec3(e, 0.0f, 0.0f), a, roudness) - sdfReule(p - vec3(e, 0.0f, 0.0f), a, roudness), sdfReule(p + vec3(0.0f, e, 0.0f), a, roudness) - sdfReule(p - vec3(0.0f, e, 0.0f), a, roudness), sdfReule(p + vec3(0.0f, 0.0f, e), a, roudness) - sdfReule(p - vec3(0.0f, 0.0f, e), a, roudness)));
// }

// void main() {
//     vec2 uv = (gl_FragCoord.xy / u_screen_size) * 2.0f - 1.0f;
//     vec4 near = u_invVP * vec4(uv, -1.0f, 1.0f);
//     vec4 far = u_invVP * vec4(uv, 1.0f, 1.0f);

//     float t = 0.0f;
//     vec3 r0 = vec3(0, 0, -3.5f);//near.xyz / near.w;
//     vec3 rd = normalize(vec3(uv, 1.0f));//(far.xyz / far.w - r0);

//     float size = 5.0f;

//     for(int i = 0; i < 100; i++) {
//         vec3 p = r0 + rd * t;
//         float d = sdfReule(p, size, u_roudness);

//         if(d < 0.002f) {
//             vec3 n = getNormal(p, size, u_roudness);
//             float bright = 0.6f + 0.4f * n.y;
//             o_color = vec4(u_fractal_color * bright, 1.0f);
//             //o_color = vec4(1, 0, 0, 1);
//             return;
//         }
//         t += d;
//         if(t > 10.0f) {
//             break;
//         }
//     }

//     o_color = vec4(t, 0.47f, 0.8f, 1.0f);
//     //o_color = vec4(1, 0, 0, 1);
// }
uniform float u_time;
uniform vec2 u_screen_size;
uniform mat4 u_invVP;
uniform vec3 u_fractal_color;

// Глобальная матрица вращения, чтобы не пересчитывать её внутри циклов
mat3 g_rot;

// Чистая функция SDF: принимает уже повернутую точку p
float sdfReule(vec3 p) {
    float scale = 0.6f;
    float r = 2.0f * scale;
    float offset = scale / 1.41421356f;

    vec3 v0 = vec3(offset, offset, offset);
    vec3 v1 = vec3(-offset, -offset, offset);
    vec3 v2 = vec3(-offset, offset, -offset);
    vec3 v3 = vec3(offset, -offset, -offset);

    float d0 = length(p - v0) - r;
    float d1 = length(p - v1) - r;
    float d2 = length(p - v2) - r;
    float d3 = length(p - v3) - r;

    return max(max(d0, d1), max(d2, d3));
}

// Вычисление нормалей
vec3 getNormal(vec3 p) {
    float e = 0.001f;
    return normalize(vec3(sdfReule(p + vec3(e, 0.0f, 0.0f)) - sdfReule(p - vec3(e, 0.0f, 0.0f)), sdfReule(p + vec3(0.0f, e, 0.0f)) - sdfReule(p - vec3(0.0f, e, 0.0f)), sdfReule(p + vec3(0.0f, 0.0f, e)) - sdfReule(p - vec3(0.0f, 0.0f, e))));
}

void main() {
    // Корректный расчет UV с учетом соотношения сторон (чтобы объект не растягивался)
    vec2 uv = (gl_FragCoord.xy / u_screen_size) * 2.0f - 1.0f;
    uv.x *= u_screen_size.x / u_screen_size.y; 

    // Считаем вращение один раз для всего кадра
    float t_rot = u_time * 0.5f;
    mat3 rotY = mat3(cos(t_rot), 0.0f, sin(t_rot), 0.0f, 1.0f, 0.0f, -sin(t_rot), 0.0f, cos(t_rot));
    mat3 rotX = mat3(1.0f, 0.0f, 0.0f, 0.0f, cos(t_rot * 0.7f), -sin(t_rot * 0.7f), 0.0f, sin(t_rot * 0.7f), cos(t_rot * 0.7f));
    g_rot = rotX * rotY;

    // Честные лучи через u_invVP матрицы вашей камеры
    vec4 near = u_invVP * vec4(uv, -1.0f, 1.0f);
    vec4 far = u_invVP * vec4(uv, 1.0f, 1.0f);
    vec3 r0 = near.xyz / near.w;
    vec3 rd = normalize((far.xyz / far.w) - r0);

    float t = 0.0f;
    bool hit = false;
    vec3 rotated_p;

    for(int i = 0; i < 100; i++) {
        vec3 p = r0 + rd * t;

        // Вращаем саму точку пространства ПЕРЕД проверкой в SDF
        rotated_p = g_rot * p;

        float d = sdfReule(rotated_p);

        if(d < 0.001f) {
            hit = true;
            break;
        }
        t += d;
        if(t > 20.0f) {
            break;
        }
    }

    if(hit) {
        // Получаем нормаль для повернутой точки
        vec3 n_local = getNormal(rotated_p);

        // Возвращаем нормаль обратно в мировые координаты для корректного света
        vec3 n_world = transpose(g_rot) * n_local; 

        // Освещение (диффузный свет сверху + эмбиент)
        float bright = max(dot(n_world, vec3(0.0f, 1.0f, 0.0f)), 0.0f) * 0.6f + 0.4f;
        o_color = vec4(u_fractal_color * bright, 1.0f);
    } else {
        // Красивый задний фон (градиент вместо завязки на t, так как t на фоне уходит в даль)
        o_color = vec4(0.1f, 0.47f, 0.8f, 1.0f) * (1.0f - (gl_FragCoord.y / u_screen_size.y) * 0.5f);
        o_color = vec4(1.0f, 0.28f, 0.0f, 1.0f) * (1.0f - (gl_FragCoord.y / u_screen_size.y) * 0.5f);
    }
}
