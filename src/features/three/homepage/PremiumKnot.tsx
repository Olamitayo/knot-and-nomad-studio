import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CatmullRomCurve3,
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

// Three continuous plies follow one closed trefoil. The rope's relief is real
// geometry, so its highlights and self-shadowing remain coherent as it moves.
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
function buildRope(segments: number) {
  const path = new KnotPath();
  path.arcLengthDivisions = segments * 2;
  const frame = path.computeFrenetFrames(segments, true);
  return [0, 1, 2].map((ply) => {
    const points: Vector3[] = [];
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * 19 + (ply * Math.PI * 2) / 3;
      points.push(
        path
          .getPointAt(t)
          .addScaledVector(frame.normals[i], Math.cos(angle) * 0.139)
          .addScaledVector(frame.binormals[i], Math.sin(angle) * 0.139),
      );
    }
    return new TubeGeometry(
      new CatmullRomCurve3(points, true, "centripetal"),
      segments,
      0.125,
      12,
      true,
    );
  });
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
  const geometry = useMemo(() => buildRope(medium ? 960 : 1536), [medium]);
  const texture = useMemo(() => fibreTexture(), []);
  const colourTexture = useMemo(() => fibreTexture(true), []);
  useEffect(
    () => () => {
      texture.dispose();
      colourTexture.dispose();
    },
    [texture, colourTexture],
  );
  useEffect(() => () => geometry.forEach((item) => item.dispose()), [geometry]);
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
        {geometry.map((shape, index) => (
          <mesh key={index} geometry={shape} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={["#cbbba0", "#c4b294", "#d1c1a6"][index]}
              roughness={0.83}
              metalness={0}
              sheen={0.35}
              sheenColor="#f3e4cd"
              sheenRoughness={0.85}
              map={colourTexture}
              bumpMap={texture}
              bumpScale={0.022}
            />
          </mesh>
        ))}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.16} />
      </mesh>
    </>
  );
}
