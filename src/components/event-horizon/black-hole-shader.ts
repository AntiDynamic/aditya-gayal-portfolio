// Schwarzschild RK4, thermal disk and sky projection adapted from 0xydev/blackhole.
// Copyright (c) 2026 Furkan. MIT — see public/event-horizon/THIRD_PARTY_LICENSES.txt.
// Camera, tidal typography, restrained sky and emissive-sphere coda are local adaptations.
export const blackHoleFragment = /* glsl */ `
precision highp float;

uniform vec2 uResolution;
uniform float uProgress;
uniform float uExterior;
uniform float uReduced;
uniform sampler2D uIdentity;
uniform float uTime;
uniform vec4 uPlasma;
uniform vec3 uHotStrength;
uniform vec3 uCamPos;
uniform mat3 uCamMat;
uniform float uTanHalfFov;
uniform float uStepScale;
uniform float uDiskInner;
uniform float uDiskOuter;
uniform float uDiskTemp;
uniform float uTempNorm;
uniform float uDiskBrightness;
uniform float uBeaming;
uniform float uOrbitDir;
uniform float uTimeScale;
uniform float uStarIntensity;
uniform float uExposure;
uniform float uToneMap;
uniform float uSpin;
uniform float uHorizon;

out vec4 fragColor;

const float PI = 3.14159265358979;
const float TAU = 6.28318530717959;
const float M = 0.5;
const float SQRT_M = 0.70710678118655;
const float HCK = 14387.77;
const float DISK_NOISE_PERIOD = 26.0;


float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float pnoise2(vec2 p, float period) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 s = f * f * (3.0 - 2.0 * f);
  float x0 = mod(i.x, period);
  float x1 = mod(i.x + 1.0, period);
  float a = hash12(vec2(x0, i.y));
  float b = hash12(vec2(x1, i.y));
  float c = hash12(vec2(x0, i.y + 1.0));
  float d = hash12(vec2(x1, i.y + 1.0));
  return mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
}

float diskFbm(vec2 p, float period) {
  float value = 0.0;
  float amplitude = 0.55;
  for (int i = 0; i < DISK_OCTAVES; i++) {
    value += amplitude * pnoise2(p, period);
    p = p * 2.0 + vec2(0.0, 9.17);
    period *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

vec3 blackbody(float temperature) {
  float t = max(temperature, 800.0);
  vec3 wavelength = vec3(0.610, 0.549, 0.468);
  vec3 wavelength5 = vec3(0.084459, 0.049866, 0.022442);
  vec3 radiance = 1.0 / (wavelength5 * (exp(vec3(HCK) / (wavelength * t)) - 1.0));
  return radiance / max(radiance.r, max(radiance.g, radiance.b));
}

vec2 octWrap(vec2 v) {
  return (1.0 - abs(v.yx)) * vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0);
}

vec2 dirToOct(vec3 d) {
  d /= abs(d.x) + abs(d.y) + abs(d.z);
  vec2 p = d.y >= 0.0 ? d.xz : octWrap(d.xz);
  return p * 0.5 + 0.5;
}

vec3 starLayer(vec2 uv, float cells) {
  vec2 grid = uv * cells;
  vec2 id = floor(grid);
  vec2 f = fract(grid);
  if (hash12(id) > 0.16) {
    return vec3(0.0);
  }
  vec2 starPos = vec2(hash12(id + 4.7), hash12(id + 9.2)) * 0.6 + 0.2;
  float d = length(f - starPos);
  float magnitude = pow(hash12(id + 2.3), 6.0);
  float temperature = mix(2600.0, 14000.0, pow(hash12(id + 6.1), 2.0));
  float intensity = magnitude * exp(-d * d * 260.0);
  return blackbody(temperature) * intensity;
}

vec3 sampleSky(vec3 dir) {
  if(uStarIntensity<=0.0)return vec3(0.0);
  vec2 uv = dirToOct(dir);
  vec3 color = (starLayer(uv, 75.0) * .55 + starLayer(uv + .31, 155.0) * .22) * uStarIntensity;
  return color;
}


void shadeDisk(
  vec3 hitPoint,
  float r,
  float lz,
  float camGravFactor,
  inout vec3 color,
  inout float transmittance
) {
  float theta = atan(hitPoint.z, hitPoint.x);
  float sqrtR = sqrt(r);
  float r32 = r * sqrtR;

  float omega = uOrbitDir * SQRT_M / (r32 + uOrbitDir * uSpin * SQRT_M);
  float utDenom = r32 - 3.0 * M * sqrtR + 2.0 * uOrbitDir * uSpin * SQRT_M;
  float ut = (r32 + uOrbitDir * uSpin * SQRT_M)
    / (pow(r, 0.75) * sqrt(max(utDenom, 1e-5)));

  float edgeFade = smoothstep(uDiskInner, uDiskInner * 1.12, r)
    * (1.0 - smoothstep(uDiskOuter * 0.72, uDiskOuter, r));

  float gRaw = clamp(camGravFactor / (ut * (1.0 - omega * lz)), 0.05, 4.0);
  float g = mix(1.0, gRaw, uBeaming);

  float flowAngle = theta - omega * uTime * uTimeScale;
  float azimuth = flowAngle / TAU;
  float innerActivity = 1.0-smoothstep(uDiskInner,uDiskOuter,r);
  vec2 noiseCoord = vec2(azimuth * DISK_NOISE_PERIOD + r * 1.1, r * 3.0);
  noiseCoord += vec2(uPlasma.x*.055*sin(flowAngle*2.0+r),uPlasma.y*.045*cos(flowAngle*3.0-r))*(.25+.75*innerActivity);
  float turbulence = diskFbm(noiseCoord, DISK_NOISE_PERIOD);
  float structure = smoothstep(0.24, 0.78, turbulence);
  float filamentPhase = flowAngle*7.0+r*10.0+turbulence*4.0+uPlasma.z*.08;
  float filaments = smoothstep(.75,.97,sin(filamentPhase)) * smoothstep(.35,.7,turbulence);
  float lanes = smoothstep(.65,.95,sin(flowAngle*3.0+r*4.0+turbulence*2.0));
  float density = .4+.8*structure;
  density *= 1.0+filaments*(.14+.24*innerActivity)-lanes*.14;
#if DISK_OCTAVES > 3
  float fine = pnoise2(vec2(azimuth*DISK_NOISE_PERIOD*2.0+r*2.2,r*9.0+uPlasma.z*.05),DISK_NOISE_PERIOD*2.0);
  density *= 1.0+(fine-.5)*.12*innerActivity;
#endif
  float heat = 0.0;
  for (int region = 0; region < HOT_REGIONS; region++) {
    float regionId = float(region);
    float regionRadius = 4.1+regionId*2.1;
    float radialOffset = (r-regionRadius)/(.38+regionId*.16);
    float angularOffset = 1.0-cos(flowAngle-(.7+regionId*2.2));
    float arc = exp(-radialOffset*radialOffset-angularOffset*(12.0-regionId*2.0));
    heat += arc*uHotStrength[region];
  }
  density *= 1.0+heat;

  float profile = pow(max(0.0, (1.0 - sqrt(uDiskInner / r)) / (r * r * r)), 0.25);
  float temperature = uDiskTemp * uTempNorm * profile * (1.0+heat*.035+uPlasma.w*.006*innerActivity*(structure-.35));

  float observedTemp = temperature * g;
  float luminance = pow(observedTemp / uDiskTemp, 4.0);
  float alpha = edgeFade * (0.48 + 0.52 * structure);

  vec3 source = blackbody(observedTemp)
    * (luminance * uDiskBrightness * density * 2.0);
  color += transmittance * alpha * source;
  transmittance *= 1.0 - alpha;
}

vec3 acesToneMap(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

vec3 linearToSrgb(vec3 c) {
  vec3 lo = c * 12.92;
  vec3 hi = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
  return mix(lo, hi, step(0.0031308, c));
}

void finalize(vec3 color) {
  color *= uExposure * (1.0-smoothstep(.73,.82,uExterior));
  color = linearToSrgb(acesToneMap(color));
  color += (hash12(gl_FragCoord.xy) - .5) / 255.0;
  fragColor = vec4(color,1.0);
}

void main() {
  vec2 ndc = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
  // After the physical ray-traced approach, a deliberately non-scientific coda.
  // An emissive sphere overtakes the observer. No opacity-based white overlay.
  if(uProgress>.95) {
    // Retreat from an inked physical plane: perspective reveals the letter surface.
    // This is a camera/plane intersection, not a scale transform on DOM typography.
    float retreat=smoothstep(.951,.978,uProgress);
    vec3 origin=vec3(mix(.8,0.0,retreat),mix(.55,0.0,retreat),-mix(.015,4.8*max(1.0,1.2/(uResolution.x/uResolution.y)),retreat));
    vec3 direction=normalize(vec3(ndc*.46,1.0));
    vec3 hit=origin+direction*(-origin.z/direction.z);
    vec2 uv=hit.xy/vec2(6.8,3.4)+.5;
    float ink=0.0;
    if(all(greaterThanEqual(uv,vec2(0.0)))&&all(lessThanEqual(uv,vec2(1.0))))ink=texture(uIdentity,uv).r;
    float reveal=smoothstep(.951,.958,uProgress)*(1.0-smoothstep(.978,.986,uProgress));
    fragColor=vec4(mix(vec3(.972,.965,.945),vec3(.06,.065,.07),ink*reveal),1.0);
    return;
  }
  if(uProgress > .855) {
    float birth = smoothstep(.861,.884,uProgress);
    float travel = smoothstep(.882,.95,uProgress);
    float radius = .022;
    // Author the approach distance so the last metre remains readable: a pure
    // exponential rush made the final expansion feel like a flash.
    float viewReach=length(vec2(uResolution.x/uResolution.y,1.0))+.3;
    float projectedRadius=.002+viewReach*pow(travel,2.8);
    float distanceToPoint=radius*sqrt(1.0+4.0/(projectedRadius*projectedRadius));
    vec3 ray = normalize(vec3(ndc*.5,1.0));
    vec3 center = vec3(0.0,0.0,distanceToPoint);
    float closest = length(center - ray*dot(center,ray));
    float edge = max(fwidth(closest),radius*mix(.025,.07,travel));
    float point = 1.0-smoothstep(radius-edge,radius+edge,closest);
    if(distanceToPoint < radius) point=1.0;
    if(uReduced>.5) point=mix(point,1.0,smoothstep(.91,.945,uProgress));
    fragColor=vec4(vec3(.972,.965,.945)*point*birth,1.0);
    return;
  }
  if(uProgress >= .655){fragColor=vec4(0.002,0.003,0.005,1.0);return;}
  vec3 rayDir = normalize(uCamMat * vec3(ndc * uTanHalfFov, 1.0));
  vec3 rayOrigin = uCamPos;
  float r0 = length(rayOrigin);

  vec3 color = vec3(0.0);
  float transmittance = 1.0;
  bool escaped = false;
  vec3 escapeDir = vec3(0.0);

  float camGravFactor = min(2.5,inversesqrt(max(.001,1.0 - 1.0 / r0)));


  float skyBoost = 1.0;

  vec3 radialDir = rayOrigin / r0;
  float radialDot = dot(rayDir, radialDir);
  vec3 tangential = rayDir - radialDot * radialDir;
  float sinPsi = length(tangential);

  if (sinPsi < 1e-5) {
    if (radialDot >= 0.0) {
      color = sampleSky(rayDir) * skyBoost;
    }
    finalize(color);
    return;
  }

  vec3 planeE2 = tangential / sinPsi;
  float orbitNormalY = cross(radialDir, planeE2).y;

  float u = 1.0 / r0;
  float impactParameter = r0 * sinPsi * inversesqrt(1.0 - u);
  float dudphi = -sign(radialDot)
    * sqrt(max(0.0, 1.0 / (impactParameter * impactParameter) - u * u * (1.0 - u)));
  float lz = impactParameter * orbitNormalY;

  float escapeRadius = max(30.0, r0 * 1.6);
  float escapeU = 1.0 / escapeRadius;

  float phi = 0.0;
  vec3 prevPoint = rayOrigin;

  for (int i = 0; i < MAX_STEPS; i++) {
    float prevU = u;
    float prevDu = dudphi;
    float prevPhi = phi;
    float dphi = uStepScale * 0.22 / (1.0 + 4.0 * u);

    float k1u = dudphi;
    float k1v = 1.5 * u * u - u;
    float u2 = u + 0.5 * dphi * k1u;
    float v2 = dudphi + 0.5 * dphi * k1v;
    float k2v = 1.5 * u2 * u2 - u2;
    float u3 = u + 0.5 * dphi * v2;
    float v3 = dudphi + 0.5 * dphi * k2v;
    float k3v = 1.5 * u3 * u3 - u3;
    float u4 = u + dphi * v3;
    float v4 = dudphi + dphi * k3v;
    float k4v = 1.5 * u4 * u4 - u4;

    u += dphi / 6.0 * (k1u + 2.0 * v2 + 2.0 * v3 + v4);
    dudphi += dphi / 6.0 * (k1v + 2.0 * k2v + 2.0 * k3v + k4v);
    phi += dphi;

    if (u > 1.0 || phi > 6.0 * PI) {
      break;
    }

    if (u < escapeU && dudphi < 0.0) {
      float t = clamp((prevU - escapeU) / max(prevU - u, 1e-9), 0.0, 1.0);
      float ue = max(mix(prevU, u, t), 0.0);
      float ve = mix(prevDu, dudphi, t);
      float pe = mix(prevPhi, phi, t);
      vec3 escRadial = cos(pe) * radialDir + sin(pe) * planeE2;
      vec3 escTangent = -sin(pe) * radialDir + cos(pe) * planeE2;
      escapeDir = normalize(ue * escTangent - ve * escRadial);
      escaped = true;
      break;
    }

    vec3 orbitRadial = cos(phi) * radialDir + sin(phi) * planeE2;
    vec3 point = orbitRadial / u;

    if (prevPoint.y * point.y < 0.0) {
      float t = prevPoint.y / (prevPoint.y - point.y);
      vec3 hitPoint = mix(prevPoint, point, t);
      float hitRadius = length(hitPoint);
      if (hitRadius > uDiskInner && hitRadius < uDiskOuter) {
        shadeDisk(hitPoint, hitRadius, lz, camGravFactor, color, transmittance);
        if (transmittance < 0.02) {
          break;
        }
      }
    }
    prevPoint = point;
  }


  if (escaped) color += transmittance * sampleSky(escapeDir) * skyBoost;
  finalize(color);
}

`;
