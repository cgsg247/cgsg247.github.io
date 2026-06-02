#version 300 es
        precision highp float;
        layout (location = 0) out vec4 o_color;

        uniform float u_time;
        uniform float u_mouse_x;
        uniform float u_mouse_y;
        uniform float u_mouse_wheel;

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
            o_color = vec4(n * 0.03, n * 0.1, n * 0.01, 1);
        }