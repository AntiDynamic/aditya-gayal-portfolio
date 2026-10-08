import { audioSystem, type AudioSystem } from "../soundtrack/audio-system";

export type RoomSound = "lamp" | "paper" | "drive" | "step" | "drawer" | "keyboard" | "relay" | "starter";
type Point = readonly [number, number, number];
const equipment: Record<RoomSound, Point> = {
  lamp: [-1.43, 1.23, -2.01], paper: [-1.03, 0.82, -1.65], drive: [0.22, 0.82, -2.14],
  step: [0, 0, 0], drawer: [2.72, 0.78, 1.325], keyboard: [-0.5, 0.8, -1.85], relay: [0.22, 0.82, -2.14], starter: [0, 2.985, 0.7],
};

export class RoomAudio {
  private system?: AudioSystem;
  private master?: GainNode;
  private room?: DelayNode;
  private nodes: AudioNode[] = [];
  private sources = new Set<OscillatorNode | AudioBufferSourceNode>();
  private fan?: GainNode;
  private fluorescent?: GainNode;
  private closed = false;
  private effectCount = 0;
  private lastFrame = 0;
  private ignition = 0;
  private voiceCount = 0;
  private footsteps = 0;
  private position: Point = [0, 1.65, 1.92];
  private samples = new Map<RoomSound, AudioBuffer[]>();
  private lastEffects = new Map<RoomSound, number>();

  async start() {
    if (this.closed) return;
    if (!this.system) {
      const system = audioSystem(); this.system = system;
      const { context, output } = system;
      this.master = context.createGain(); this.master.gain.value = 0;
      this.master.connect(output); this.master.gain.setTargetAtTime(0.65, context.currentTime, 0.25);
      this.room = context.createDelay(0.1); this.room.delayTime.value = 0.038;
      const reflection = context.createBiquadFilter(); reflection.type = "lowpass"; reflection.frequency.value = 2300;
      const wet = context.createGain(); wet.gain.value = 0.085;
      this.room.connect(reflection).connect(wet).connect(this.master);
      this.nodes.push(this.master, this.room, reflection, wet);
      this.bed(240, 0.045, [2.9, 2.6, 1.9], "lowpass", 0.63);
      this.bed(2100, 0.045, [-3.2, 1.89, -0.05], "lowpass", 0.82);
      this.fluorescent = context.createGain(); this.fluorescent.gain.value = 0.04;
      this.fluorescent.connect(this.spatial([0, 2.985, 0.7])); this.nodes.push(this.fluorescent);
      for (const [frequency, level] of [[50, 0.34], [100, 0.7], [150.03, 0.16]]) this.tone(frequency, level, this.fluorescent);
      this.fan = context.createGain(); this.fan.gain.value = 0;
      this.fan.connect(this.spatial([0.22, 0.82, -2.14])); this.nodes.push(this.fan);
      this.bed(650, 1, [0.22, 0.82, -2.14], "lowpass", 0.71, this.fan);
      this.tone(117, 0.18, this.fan);
      const assets: [RoomSound, string][] = [...[1, 2, 3, 4].flatMap(index => [["keyboard", `key-${index}`], ["step", `step-${index}`]] as [RoomSound, string][]), ...[1, 2, 3].map(index => ["paper", `paper-${index}`] as [RoomSound, string]), ["lamp", "switch-1"], ["relay", "switch-2"]];
      void Promise.all(assets.map(async ([kind, name]) => {
        const response = await fetch(`/audio/foley/${name}.ogg`);
        if (!response.ok) return;
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        if (!this.closed) { const samples = this.samples.get(kind) ?? []; samples.push(buffer); this.samples.set(kind, samples); if (kind === "relay") this.samples.set("starter", samples); }
      })).catch(() => {});
    }
    await this.system.context.resume();
  }

  private spatial(point: Point) {
    const context = this.system!.context;
    const position = context.createPanner(); position.panningModel = "equalpower"; position.distanceModel = "inverse";
    position.refDistance = 1.2; position.rolloffFactor = 0.65; position.maxDistance = 12;
    position.positionX.value = point[0]; position.positionY.value = point[1]; position.positionZ.value = point[2];
    position.connect(this.master!); position.connect(this.room!); this.nodes.push(position); return position;
  }

  private track(source: OscillatorNode | AudioBufferSourceNode) {
    this.sources.add(source); source.onended = () => { source.disconnect(); this.sources.delete(source); };
  }

  private tone(frequency: number, volume: number, destination: AudioNode) {
    const context = this.system!.context;
    const oscillator = context.createOscillator(); oscillator.frequency.value = frequency;
    const gain = context.createGain(); gain.gain.value = volume;
    oscillator.connect(gain).connect(destination); oscillator.start(); this.track(oscillator); this.nodes.push(gain);
  }

  private bed(frequency: number, volume: number, point: Point, type: BiquadFilterType, rate: number, destination?: AudioNode) {
    const { context, noise } = this.system!;
    const source = context.createBufferSource(); source.buffer = noise; source.loop = true; source.playbackRate.value = rate;
    const filter = context.createBiquadFilter(); filter.type = type; filter.frequency.value = frequency; filter.Q.value = 0.45;
    const gain = context.createGain(); gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(destination ?? this.spatial(point)); source.start(0, rate * 6);
    this.track(source); this.nodes.push(filter, gain);
  }

  effect(kind: RoomSound) {
    const context = this.system?.context;
    if (!context || context.state !== "running" || this.closed || this.voiceCount >= 12) return;
    const last = this.lastEffects.get(kind) ?? -1;
    if (context.currentTime - last < (kind === "step" ? 0.24 : 0.075)) return;
    this.lastEffects.set(kind, context.currentTime); this.effectCount++;
    const variation = (this.effectCount * 17 % 11) / 11;
    const source = context.createBufferSource();
    const samples = this.samples.get(kind);
    const sample = samples?.length ? samples[this.effectCount % samples.length] : undefined;
    source.buffer = sample ?? this.system!.noise;
    source.playbackRate.value = 0.94 + variation * 0.12;
    const duration = sample ? sample.duration / source.playbackRate.value : kind === "paper" ? 0.52 : kind === "drawer" ? 0.65 : kind === "drive" ? 0.8 : kind === "step" ? 0.21 : 0.12;
    const filter = context.createBiquadFilter(); filter.type = kind === "paper" ? "bandpass" : "lowpass";
    filter.frequency.value = sample ? 7800 : kind === "paper" ? 3400 : kind === "step" ? 680 : kind === "drawer" ? 1200 : 4500; filter.Q.value = 0.5;
    const gain = context.createGain();
    const level = sample ? kind === "paper" ? 0.65 : kind === "step" ? 0.55 : 0.4 : kind === "step" ? 0.25 : kind === "paper" ? 0.14 : kind === "drawer" ? 0.12 : 0.19;
    const now = context.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(level, now + (!sample && (kind === "paper" || kind === "drawer") ? 0.06 : 0.004));
    if (!sample && (kind === "paper" || kind === "drive" || kind === "drawer")) {
      gain.gain.linearRampToValueAtTime(level * 0.22, now + duration * 0.38);
      gain.gain.linearRampToValueAtTime(level * 0.55, now + duration * 0.57);
    }
    if (sample) gain.gain.setValueAtTime(level, now + Math.max(0.005, duration - 0.025));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    const point: Point = kind === "step" ? [this.position[0] + (this.footsteps++ % 2 ? 0.14 : -0.14), 0.06, this.position[2]] : equipment[kind];
    const position = this.spatial(point);
    source.connect(filter).connect(gain).connect(position); this.voiceCount++;
    source.start(now, sample ? 0 : variation * 8); source.stop(now + duration);
    this.sources.add(source);
    source.onended = () => {
      this.voiceCount--; this.sources.delete(source); source.disconnect(); filter.disconnect(); gain.disconnect(); position.disconnect();
      const index = this.nodes.indexOf(position); if (index >= 0) this.nodes.splice(index, 1);
    };
    if (kind !== "paper" && kind !== "keyboard" && !sample) {
      const body = context.createOscillator(); body.type = "sine";
      body.frequency.setValueAtTime(kind === "step" ? 115 : kind === "drawer" ? 185 : kind === "drive" ? 160 : 730, now);
      body.frequency.exponentialRampToValueAtTime(kind === "step" ? 52 : 125, now + Math.min(duration, 0.16));
      const envelope = context.createGain(); envelope.gain.setValueAtTime(0, now); envelope.gain.linearRampToValueAtTime(kind === "step" ? 0.12 : 0.035, now + 0.004); envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
      body.connect(envelope).connect(position); body.start(); body.stop(now + 0.17);
      this.sources.add(body); body.onended = () => { body.disconnect(); envelope.disconnect(); this.sources.delete(body); };
    }
  }

  frame(position: Point, forward: Point, up: Point, wake: number, handoff: number) {
    this.position = position;
    const context = this.system?.context;
    if (!context || context.state !== "running" || this.closed) return;
    if (context.currentTime - this.lastFrame < 1 / 30) return;
    this.lastFrame = context.currentTime;
    const listener = context.listener;
    const parameters = [listener.positionX, listener.positionY, listener.positionZ, listener.forwardX, listener.forwardY, listener.forwardZ, listener.upX, listener.upY, listener.upZ];
    const values = [...position, ...forward, ...up];
    parameters.forEach((parameter, index) => parameter.setTargetAtTime(values[index], context.currentTime, 0.025));
    const ignited = wake >= 1.63 ? 3 : wake >= 1.13 ? 2 : wake >= 0.85 ? 1 : 0;
    if (ignited > this.ignition) { this.ignition = ignited; if (wake < 2) this.effect("starter"); }
    const dark = wake > 0.85 && wake < 1.13 || wake > 1.36 && wake < 1.53;
    this.fluorescent?.gain.setTargetAtTime(dark ? 0.001 : 0.04, context.currentTime, 0.025);
    this.master?.gain.setTargetAtTime(0.65 * (1 - Math.min(1, handoff / 3.4)), context.currentTime, 0.12);
  }

  powered() {
    if (this.system && this.fan) { this.effect("relay"); this.fan.gain.setTargetAtTime(0.085, this.system.context.currentTime, 0.65); }
  }
  visibility() { if (document.hidden) void this.system?.context.suspend(); else void this.system?.context.resume().catch(() => {}); }
  dispose() {
    this.closed = true;
    this.sources.forEach(source => { source.stop(); source.disconnect(); }); this.sources.clear();
    this.nodes.forEach(node => node.disconnect()); this.nodes = []; this.system = undefined;
  }
}
