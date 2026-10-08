export const clamp = (value: number, minimum = 0, maximum = 1) => Math.max(minimum, Math.min(maximum, value));
export const smooth = (start: number, end: number, value: number) => {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
};
export const damp = (current: number, target: number, speed: number, delta: number) => current + (target - current) * (1 - Math.exp(-speed * delta));
export const mix = (first: number, second: number, progress: number) => first + (second - first) * progress;
