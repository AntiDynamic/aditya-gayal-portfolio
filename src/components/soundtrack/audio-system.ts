export type AudioSystem = { context: AudioContext; output: GainNode; noise: AudioBuffer };
let shared: AudioSystem | undefined;

export function blackHoleSoundLevel(progress: number) {
  if (progress >= 0.575 && progress < 0.943) return 0;
  const fade = Math.max(0, Math.min(1, (progress - 0.535) / 0.04));
  return progress < 0.575 ? 1 - fade * fade * (3 - 2 * fade) : 1;
}

export function audioSystem(): AudioSystem {
  if (shared && shared.context.state !== "closed") return shared;
  const context = new AudioContext({ latencyHint: "interactive" });
  const output = context.createGain(); output.gain.value = 0.7;
  const highpass = context.createBiquadFilter(); highpass.type = "highpass"; highpass.frequency.value = 28;
  const limiter = context.createDynamicsCompressor();
  limiter.threshold.value = -12; limiter.knee.value = 6; limiter.ratio.value = 12;
  limiter.attack.value = 0.003; limiter.release.value = 0.18;
  output.connect(highpass).connect(limiter).connect(context.destination);
  const noise = context.createBuffer(1, context.sampleRate * 13, context.sampleRate);
  const samples = noise.getChannelData(0);
  let seed = 47291;
  for (let index = 0; index < samples.length; index++) {
    seed = seed * 16807 % 2147483647;
    samples[index] = seed / 1073741823.5 - 1;
  }
  shared = { context, output, noise };
  return shared;
}

export function closeAudioSystem() {
  if (!shared) return;
  void shared.context.close(); shared = undefined;
}

export class CosmicAudio {
  private system: AudioSystem;
  private bus: GainNode;
  private body: GainNode;
  private air: GainNode;
  private filter: BiquadFilterNode;
  private light: GainNode;
  private sources: (OscillatorNode | AudioBufferSourceNode)[] = [];
  private nodes: AudioNode[] = [];

  constructor() {
    this.system = audioSystem();
    const { context, output, noise } = this.system;
    this.bus = context.createGain(); this.bus.gain.value = 0; this.bus.connect(output);
    this.body = context.createGain(); this.body.gain.value = 0; this.body.connect(this.bus);
    this.air = context.createGain(); this.air.gain.value = 0; this.air.connect(this.bus);
    this.light = context.createGain(); this.light.gain.value = 0; this.light.connect(this.bus);
    this.filter = context.createBiquadFilter(); this.filter.type = "lowpass"; this.filter.frequency.value = 700;
    this.filter.connect(this.air);
    this.nodes.push(this.bus, this.body, this.air, this.light, this.filter);
    for (const [frequency, pan] of [[43, -0.2], [64.7, 0.2], [86.13, 0]] as const) {
      const tone = context.createOscillator(); tone.frequency.value = frequency;
      const level = context.createGain(); level.gain.value = frequency > 80 ? 0.12 : 0.3;
      const position = context.createStereoPanner(); position.pan.value = pan;
      tone.connect(level).connect(position).connect(this.body); tone.start();
      this.sources.push(tone); this.nodes.push(level, position);
    }
    for (const [pan, rate, frequency] of [[-0.65, 0.73, 420], [0.65, 0.91, 860]] as const) {
      const flow = context.createBufferSource(); flow.buffer = noise; flow.loop = true; flow.playbackRate.value = rate;
      const band = context.createBiquadFilter(); band.type = "bandpass"; band.frequency.value = frequency; band.Q.value = 0.45;
      const position = context.createStereoPanner(); position.pan.value = pan;
      flow.connect(band).connect(position).connect(this.filter); flow.start(0, pan > 0 ? 4 : 0);
      const orbit = context.createOscillator(); orbit.frequency.value = pan < 0 ? 0.047 : 0.071;
      const depth = context.createGain(); depth.gain.value = 0.18;
      orbit.connect(depth).connect(position.pan); orbit.start();
      const evolution = context.createOscillator(); evolution.frequency.value = pan < 0 ? 0.031 : 0.017;
      const variation = context.createGain(); variation.gain.value = frequency * 0.18;
      evolution.connect(variation).connect(band.frequency); evolution.start();
      this.sources.push(flow, orbit, evolution); this.nodes.push(band, position, depth, variation);
    }
    for (const frequency of [100, 150.07]) {
      const tone = context.createOscillator(); tone.frequency.value = frequency;
      const level = context.createGain(); level.gain.value = 0.25;
      tone.connect(level).connect(this.light); tone.start(); this.sources.push(tone); this.nodes.push(level);
    }
  }

  update(progress: number, visible: boolean) {
    const { context } = this.system;
    const target = (parameter: AudioParam, value: number, time = 0.3) => parameter.setTargetAtTime(value, context.currentTime, time);
    const approach = Math.max(0, Math.min(1, progress / 0.58));
    const interior = Math.max(0, Math.min(1, (progress - 0.58) / 0.13));
    const collapse = 1 - Math.max(0, Math.min(1, (progress - 0.80) / 0.055));
    const white = Math.max(0, Math.min(1, (progress - 0.943) / 0.04));
    const level = blackHoleSoundLevel(progress);
    if (level === 0) { this.bus.gain.cancelScheduledValues(context.currentTime); this.bus.gain.setValueAtTime(0, context.currentTime); }
    else target(this.bus.gain, visible ? level : 0, visible ? 0.15 : 0.12);
    target(this.body.gain, (0.045 + approach * 0.075) * collapse);
    target(this.air.gain, (0.09 + approach * 0.18) * collapse);
    target(this.filter.frequency, 650 + approach * 2300 - interior * 2500);
    target(this.light.gain, white * 0.035);
  }

  dispose() {
    this.sources.forEach(source => { source.stop(); source.disconnect(); });
    this.nodes.forEach(node => node.disconnect());
  }
}
