import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  CatmullRomCurve3,
  BufferGeometry,
  Float32BufferAttribute,
  SRGBColorSpace,
  Curve,
  DataTexture,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  MathUtils,
  RepeatWrapping,
  RGBAFormat,
  TubeGeometry,
  Vector3,
} from "three";

// A continuous trefoil follows the interlocking silhouette of the brand mark.
class KnotPath extends Curve<Vector3> {
  constructor() {
    super();
  }
  getPoint(t: number, target = new Vector3()) {
    const a = t * Math.PI * 2;
    const radius = 1.02 * (2 + Math.cos(3 * a)) * 0.5;
    return target.set(radius * Math.cos(2 * a), radius * Math.sin(2 * a), 0.51 * Math.sin(3 * a));
  }
}
function ropeGeometry(segments: number) {
  const path = new KnotPath();
  const frames = path.computeFrenetFrames(segments, true);
  return [0, 1, 2].map((strand) => {
    const points = Array.from({ length: segments }, (_, i) => {
      const t = i / segments;
      const twist = t * Math.PI * 2 * 24 + (strand * Math.PI * 2) / 3;
      return path
        .getPointAt(t)
        .addScaledVector(frames.normals[i], Math.cos(twist) * 0.122)
        .addScaledVector(frames.binormals[i], Math.sin(twist) * 0.122);
    });
    const geometry = new TubeGeometry(
      new CatmullRomCurve3(points, true),
      segments,
      0.117,
      14,
      true,
    );
    // Project the print around the whole rope rather than stretching it around each ply.
    const uv = geometry.getAttribute("uv");
    const position = geometry.getAttribute("position");
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const center = path.getPointAt(t);
      let previous = 0;
      for (let j = 0; j <= 14; j++) {
        const vertex = i * 15 + j;
        const offset = new Vector3().fromBufferAttribute(position, vertex).sub(center);
        let v =
          Math.atan2(offset.dot(frames.binormals[i]), offset.dot(frames.normals[i])) /
          (Math.PI * 2);
        if (j > 0) v += Math.round(previous - v);
        previous = v;
        uv.setXY(vertex, t, v);
      }
    }
    return geometry;
  });
}
function looseFibres() {
  const path = new KnotPath();
  const frames = path.computeFrenetFrames(480, true);
  const positions: number[] = [];
  for (let i = 0; i < 480; i++) {
    const angle = i * 2.39996;
    const normal = frames.normals[i]
      .clone()
      .multiplyScalar(Math.cos(angle))
      .addScaledVector(frames.binormals[i], Math.sin(angle));
    const root = path.getPointAt(i / 480).addScaledVector(normal, 0.225);
    const tip = root
      .clone()
      .addScaledVector(normal, 0.014 + (Math.sin(i * 13.7) + 1) * 0.012)
      .addScaledVector(frames.tangents[i], 0.025);
    positions.push(...root.toArray(), ...tip.toArray());
  }
  return new BufferGeometry().setAttribute("position", new Float32BufferAttribute(positions, 3));
}
function signatureTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 512;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#b99361";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#3f3020";
  context.font = "500 26px monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const signature = "KNOT NOMAD 0123456789 ";
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 64; column++) {
      context.fillText(
        signature[(column + row * 7) % signature.length],
        column * 32 + 16,
        row * 64 + 32,
      );
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}
function fibreTexture(albedo = false) {
  const size = 256,
    pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const thread = Math.sin(((y + 0.6 * Math.sin((x * Math.PI) / 32)) * Math.PI) / 8);
      const fibre = Math.sin(y * 2.4 + Math.sin(x * 0.19)) * 12;
      const grain = Math.sin(x * 17.3 + y * 41.7) * 9;
      const value = albedo ? 238 + thread * 12 + grain * 0.3 : 145 + thread * 32 + fibre + grain;
      const index = (y * size + x) * 4;
      pixels[index] = pixels[index + 1] = pixels[index + 2] = value;
      pixels[index + 3] = 255;
    }
  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(26, 2);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}
export function PremiumKnot({ motion, medium }: { motion: boolean; medium: boolean }) {
  const group = useRef<Group>(null);
  const elapsed = useRef(0);
  const { size, camera } = useThree();
  const geometry = useMemo(() => ropeGeometry(medium ? 768 : 1280), [medium]);
  const fibres = useMemo(() => looseFibres(), []);
  useEffect(() => () => fibres.dispose(), [fibres]);
  const texture = useMemo(() => fibreTexture(), []);
  const colourTexture = useMemo(() => signatureTexture(), []);
  useEffect(
    () => () => {
      texture.dispose();
      colourTexture.dispose();
    },
    [texture, colourTexture],
  );
  useEffect(() => () => geometry.forEach((strand) => strand.dispose()), [geometry]);
  useEffect(() => {
    // Keep the complete silhouette in view on narrow phones and landscape screens.
    camera.position.set(
      0,
      0.04,
      Math.max(5.7, 2.05 / ((Math.tan((19 * Math.PI) / 180) * size.width) / size.height)),
    );
    camera.lookAt(0, 0, 0);
  }, [camera, size.width, size.height]);
  useFrame(({ pointer }, delta) => {
    if (!group.current || !motion) return;
    const step = Math.min(delta, 0.05);
    elapsed.current += step;
    const t = elapsed.current;
    const fine = window.matchMedia("(pointer:fine)").matches;
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      0.27 + Math.sin(t * 0.19) * 0.075 + (fine ? pointer.y * 0.09 : 0),
      3,
      step,
    );
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      -0.3 + Math.sin(t * 0.16) * 0.23 + (fine ? pointer.x * 0.16 : 0),
      3,
      step,
    );
    group.current.rotation.z = MathUtils.damp(
      group.current.rotation.z,
      -0.22 + Math.sin(t * 0.12) * 0.035,
      3,
      step,
    );
    group.current.position.y = MathUtils.damp(
      group.current.position.y,
      Math.sin(t * 0.48) * 0.045,
      3,
      step,
    );
  });
  return (
    <>
      <group ref={group} rotation={[0.27, -0.3, -0.22]} scale={0.68}>
        {geometry.map((strand, index) => (
          <mesh key={index} geometry={strand} castShadow receiveShadow>
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.92}
              metalness={0}
              clearcoat={0}
              clearcoatRoughness={0.6}
              sheen={0.25}
              sheenColor="#bfc5cf"
              map={colourTexture}
              bumpMap={texture}
              bumpScale={0.021}
            />
          </mesh>
        ))}
        <lineSegments geometry={fibres}>
          <lineBasicMaterial color="#ceb084" transparent opacity={0.3} depthWrite={false} />
        </lineSegments>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.16} />
      </mesh>
    </>
  );
}
