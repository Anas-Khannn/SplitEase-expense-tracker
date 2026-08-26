declare module "threejs-components/build/cursors/tubes1.min.js" {
  interface TubesCursorLightsOptions {
    intensity?: number;
    colors?: [string, string, string, string];
  }

  interface TubesCursorTubesOptions {
    count?: number;
    colors?: string[];
    minRadius?: number;
    maxRadius?: number;
    minTubularSegments?: number;
    maxTubularSegments?: number;
    lerp?: number;
    noise?: number;
    lights?: TubesCursorLightsOptions;
  }

  interface TubesCursorBloomOptions {
    threshold?: number;
    strength?: number;
    radius?: number;
  }

  interface TubesCursorOptions {
    tubes?: TubesCursorTubesOptions;
    bloom?: TubesCursorBloomOptions | false;
  }

  interface TubesCursorApp {
    dispose(): void;
  }

  export default function TubesCursor(
    canvas: HTMLCanvasElement,
    options?: TubesCursorOptions
  ): TubesCursorApp;
}
