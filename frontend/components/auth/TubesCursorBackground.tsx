"use client";

import { useRef, useCallback, useEffect } from "react";
import * as THREE from "three";

const GOLD_PALETTE = ["#FFD400", "#FFEB3B", "#FFA000", "#FFC107", "#FFB300"];

interface Tube {
  points: THREE.Vector3[];
  mesh: THREE.Mesh;
  speed: number;
  offset: number;
  radius: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isWebGLAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function TubesCursorBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const tubesRef = useRef<Tube[]>([]);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const mouseNDCRef = useRef(new THREE.Vector2(0, 0));
  const frameRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());
  const animateRef = useRef<(() => void) | null>(null);

  const createTube = useCallback(
    (scene: THREE.Scene, idx: number): Tube => {
      const color = GOLD_PALETTE[idx % GOLD_PALETTE.length];
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: 0.7,
      });

      const radius = 0.03 + Math.random() * 0.04;
      const points: THREE.Vector3[] = [];
      const numPoints = 8;
      for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - 1)) * 2.4 - 1.2;
        const y = (Math.random() - 0.5) * 0.8;
        const z = (Math.random() - 0.5) * 0.4;
        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 64, radius, 8, false);
      const mesh = new THREE.Mesh(geometry, material);

      scene.add(mesh);

      return {
        points,
        mesh,
        speed: 0.3 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2,
        radius,
      };
    },
    []
  );

  const onPointerMove = useCallback((e: PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseRef.current.set(x, y);
    mouseNDCRef.current.set(
      (x / rect.width) * 2 - 1,
      -(y / rect.height) * 2 + 1
    );
  }, []);

  const onResize = useCallback(() => {
    const container = containerRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!container || !renderer || !camera) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }, []);

  useEffect(() => {
    function animate() {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (!renderer || !scene || !camera) return;

      const elapsed = clockRef.current.getElapsedTime();
      const ndc = mouseNDCRef.current;

      tubesRef.current.forEach((tube) => {
        const t = elapsed * tube.speed + tube.offset;
        tube.points.forEach((pt, i) => {
          const baseX = (i / (tube.points.length - 1)) * 2.4 - 1.2;
          const baseY = pt.y + Math.sin(t + i * 0.5) * 0.15;
          const baseZ = pt.z + Math.cos(t + i * 0.3) * 0.1;

          pt.x += (baseX + ndc.x * 0.3 - pt.x) * 0.02;
          pt.y += (baseY + ndc.y * 0.15 - pt.y) * 0.02;
          pt.z += (baseZ - pt.z) * 0.02;
        });

        const curve = new THREE.CatmullRomCurve3(tube.points);
        const geo = new THREE.TubeGeometry(curve, 64, tube.radius, 8, false);
        tube.mesh.geometry.dispose();
        tube.mesh.geometry = geo;

        tube.mesh.position.x += (ndc.x * 0.15 - tube.mesh.position.x) * 0.01;
        tube.mesh.position.y += (ndc.y * 0.1 - tube.mesh.position.y) * 0.01;
      });

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    }

    animateRef.current = animate;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (window.innerWidth < 768 || prefersReducedMotion() || !isWebGLAvailable()) {
      return;
    }

    const w = container.clientWidth;
    const h = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.z = 2.5;
    cameraRef.current = camera;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffd400, 200, 10);
    pointLight1.position.set(1.5, 1, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffa000, 200, 10);
    pointLight2.position.set(-1.5, -1, 2);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffeb3b, 200, 10);
    pointLight3.position.set(0, 0, 3);
    scene.add(pointLight3);

    const tubes: Tube[] = [];
    for (let i = 0; i < 12; i++) {
      tubes.push(createTube(scene, i));
    }
    tubesRef.current = tubes;

    clockRef.current.start();

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove);

    if (animateRef.current) {
      frameRef.current = requestAnimationFrame(animateRef.current);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frameRef.current);

      tubesRef.current.forEach((tube) => {
        tube.mesh.geometry.dispose();
        (tube.mesh.material as THREE.Material).dispose();
      });

      if (rendererRef.current) {
        rendererRef.current.dispose();
        const canvas = rendererRef.current.domElement;
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        rendererRef.current = null;
      }
    };
  }, [createTube, onResize, onPointerMove]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
