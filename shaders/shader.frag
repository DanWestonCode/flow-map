precision mediump float;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

uniform sampler2D uFlow;
uniform sampler2D uWater;
uniform sampler2D uBump;
uniform sampler2D uNoise;

uniform vec4 filterArea;

uniform float time;
uniform vec2 lightPos;

void main (void) {
    
    // time taken for texture to scroll
    float cycleTime = 20.0;
    // speed for water flow
    float flowSpeed = 0.5;

    vec2 uv = vTextureCoord.xy;

    // unroll normal from flow map
    vec2 flowDirection = (texture2D(uFlow, uv).rg - 0.5) * 2.0; 

    // sample noise texture for added "perturb" on flow cycle
    float noise = texture2D (uNoise, uv).r * .5;

    // calc flow offsets
    float t1 = noise + time / cycleTime;
	float t2 = t1 + 0.5;

    float cycleTime1 = t1 - floor(t1);
    float cycleTime2 = t2 - floor(t2);

    // calc flow direction
    vec2 flowDirection1 = flowDirection * cycleTime1 * flowSpeed;
    vec2 flowDirection2 = flowDirection * cycleTime2 * flowSpeed;

    vec2 uv1 = uv + flowDirection1;
    vec2 uv2 = uv + flowDirection2;

    // sample bump map
    vec3 color1 = normalize (texture2D (uBump, uv1).rgb * 2.0 - 1.0);
    vec3 color2 = normalize (texture2D (uBump, uv2).rgb * 2.0 - 1.0);
    
    // get color based on current cycle    
    vec3 bumpNormal = mix (color1, color2, abs(cycleTime1-0.5)*2.0);  

    // sample water texture
    color1 = texture2D (uWater, uv1).rgb;
    color2 = texture2D (uWater, uv2).rgb;

    // get color based on current cycle
    vec3 waterCol = mix (color1, color2, abs(cycleTime1-0.5)*2.0);

    // simple diffuse lighting for normal map    
    // vec3 light_pos = normalize(vec3(1, 1.0, 10.5));
    // float diffuse = max(dot(bumpNormal, light_pos), 0.0); 
    // vec3 color = diffuse * waterCol;
    
    gl_FragColor = vec4 (waterCol, 1);
}


