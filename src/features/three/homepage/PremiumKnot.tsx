import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
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
function signatureTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 512;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#141516";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#e7e4dc";
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
  const geometry = useMemo(
    () => new TubeGeometry(new KnotPath(), medium ? 384 : 768, 0.235, medium ? 24 : 40, true),
    [medium],
  );
  const texture = useMemo(() => fibreTexture(), []);
  const colourTexture = useMemo(() => signatureTexture(), []);
  useEffect(
    () => () => {
      texture.dispose();
      colourTexture.dispose();
    },
    [texture, colourTexture],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
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
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.57}
            metalness={0.05}
            clearcoat={0.12}
            clearcoatRoughness={0.6}
            sheen={0.25}
            sheenColor="#bfc5cf"
            map={colourTexture}
            bumpMap={texture}
            bumpScale={0.005}
          />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.16} />
      </mesh>
    </>
  );
}
