import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  PlaneGeometry,
  ShapeGeometry,
  LinearFilter,
  LinearMipmapLinearFilter,
  CatmullRomCurve3,
  DataTexture,
  ExtrudeGeometry,
  Group,
  MathUtils,
  RepeatWrapping,
  RGBAFormat,
  Shape,
  Vector3,
  Quaternion,
} from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { PremiumKnot } from "./PremiumKnot";
import { studioLooks, type ArtworkProps, type StudioLook } from "./studioLooks";

function FrameClock({
  fps,
  active,
  onReady,
  onError,
}: {
  fps: number;
  active: boolean;
  onReady: () => void;
  onError: () => void;
}) {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    onReady();
    invalidate();
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      if (!document.hidden && now - last >= 1000 / fps - 1) {
        invalidate();
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (active && !document.hidden) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibility);
      gl.domElement.removeEventListener("webglcontextlost", lost);
    };
  }, [gl, invalidate, fps, active, onReady, onError]);
  return null;
}
function Rod({
  start,
  end,
  radius = 0.025,
  colour = "#807766",
}: {
  start: [number, number, number];
  end: [number, number, number];
  radius?: number;
  colour?: string;
}) {
  const a = new Vector3(...start),
    b = new Vector3(...end),
    mid = a.clone().add(b).multiplyScalar(0.5);
  const direction = b.clone().sub(a);
  const quaternion = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    direction.clone().normalize(),
  );
  return (
    <mesh position={mid} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, direction.length(), 12]} />
      <meshStandardMaterial color={colour} roughness={0.38} metalness={0.65} />
    </mesh>
  );
}
function Rack({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <Rod start={[-2, 0, 0]} end={[-2, 3.7, 0]} radius={0.035} />
      <Rod start={[2, 0, 0]} end={[2, 3.7, 0]} radius={0.035} />
      <Rod start={[-2, 3.7, 0]} end={[2, 3.7, 0]} radius={0.035} />
      {[-2, 2].map((side) => (
        <group key={side}>
          <Rod start={[side, 0.06, -0.5]} end={[side, 0.06, 0.5]} radius={0.04} />
          <mesh position={[side, 0.06, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.08, 20]} />
            <meshStandardMaterial color="#776c59" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[4.1, 0.12, 1.15]} />
        <meshStandardMaterial color="#b4a187" roughness={0.82} />
      </mesh>
    </group>
  );
}
function Hanger() {
  const hook = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(0, 0.02, 0),
        new Vector3(0, 0.23, 0),
        new Vector3(0.11, 0.33, 0),
        new Vector3(0.23, 0.24, 0),
        new Vector3(0.18, 0.13, 0),
      ]),
    [],
  );
  return (
    <group>
      <mesh>
        <tubeGeometry args={[hook, 24, 0.014, 8, false]} />
        <meshStandardMaterial color="#71634e" metalness={0.7} roughness={0.35} />
      </mesh>
      <Rod start={[0, 0, 0]} end={[-0.58, -0.31, 0]} radius={0.035} colour="#b89160" />
      <Rod start={[0, 0, 0]} end={[0.58, -0.31, 0]} radius={0.035} colour="#b89160" />
      <Rod start={[-0.58, -0.31, 0]} end={[0.58, -0.31, 0]} radius={0.023} colour="#b89160" />
    </group>
  );
}
function garmentGeometry(kind: StudioLook["kind"]) {
  const shape = new Shape();
  shape.moveTo(-0.2, -0.15);
  shape.quadraticCurveTo(0, -0.32, 0.2, -0.15);
  shape.lineTo(0.54, -0.3);
  if (kind === "jacket") {
    shape.lineTo(0.75, -0.55);
    shape.lineTo(0.94, -1.65);
    shape.lineTo(0.67, -1.7);
    shape.lineTo(0.49, -0.92);
  } else {
    shape.lineTo(0.91, -0.76);
    shape.lineTo(0.65, -0.95);
    shape.lineTo(0.48, -0.73);
  }
  shape.lineTo(0.51, -1.87);
  shape.quadraticCurveTo(0, -1.99, -0.51, -1.87);
  shape.lineTo(-0.48, -0.73);
  if (kind === "jacket") {
    shape.lineTo(-0.67, -1.7);
    shape.lineTo(-0.94, -1.65);
    shape.lineTo(-0.75, -0.55);
  } else {
    shape.lineTo(-0.65, -0.95);
    shape.lineTo(-0.91, -0.76);
  }
  shape.lineTo(-0.54, -0.3);
  shape.lineTo(-0.2, -0.15);
  const geo = new ExtrudeGeometry(shape, {
    depth: 0.09,
    bevelEnabled: true,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    bevelSegments: 2,
    curveSegments: 20,
    steps: 1,
  });
  // Tessellate the surface before draping: the interior needs vertices too.
  const source = geo.getAttribute("position");
  const vertices: number[] = [];
  function subdivide(a: Vector3, b: Vector3, c: Vector3, depth = 0) {
    const lengths = [a.distanceToSquared(b), b.distanceToSquared(c), c.distanceToSquared(a)];
    const longest = Math.max(...lengths);
    if (longest < 0.0064 || depth > 11) {
      vertices.push(...a.toArray(), ...b.toArray(), ...c.toArray());
      return;
    }
    if (longest === lengths[0]) {
      const m = a.clone().lerp(b, 0.5);
      subdivide(a, m, c, depth + 1);
      subdivide(m, b, c, depth + 1);
    } else if (longest === lengths[1]) {
      const m = b.clone().lerp(c, 0.5);
      subdivide(a, b, m, depth + 1);
      subdivide(a, m, c, depth + 1);
    } else {
      const m = c.clone().lerp(a, 0.5);
      subdivide(a, b, m, depth + 1);
      subdivide(m, b, c, depth + 1);
    }
  }
  for (let i = 0; i < source.count; i += 3) {
    subdivide(
      new Vector3().fromBufferAttribute(source, i),
      new Vector3().fromBufferAttribute(source, i + 1),
      new Vector3().fromBufferAttribute(source, i + 2),
    );
  }
  geo.dispose();
  const raw = new BufferGeometry();
  raw.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  const result = mergeVertices(raw);
  raw.dispose();
  const position = result.getAttribute("position");
  const uv: number[] = [];
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i),
      y = position.getY(i),
      z = position.getZ(i);
    const fullness = Math.sin((Math.min(1, Math.abs(y) / 0.65) * Math.PI) / 2);
    const drape = fabricDrape(x, y);
    position.setZ(
      i,
      z + drape + (z > 0.045 ? 1 : -1) * 0.065 * fullness * Math.max(0, 1 - (x / 0.8) ** 2),
    );
    uv.push(x * 0.55 + 0.5, -y * 0.5);
  }
  result.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  result.computeVertexNormals();
  return result;
}
function fabricDrape(x: number, y: number) {
  const fall = Math.min(1, Math.max(0, (-y - 0.3) / 1.2));
  return (
    0.045 * Math.sin(x * 17 + y * 0.8) * (0.25 + fall * 0.75) +
    0.012 * Math.sin(x * 32 - y * 2) * fall +
    0.018 * Math.sin(y * 10 + Math.abs(x) * 12) * Math.exp(-((y + 0.65) ** 2) / 0.09)
  );
}
function fabricTexture(kind: StudioLook["kind"], albedo = false) {
  const size = 256,
    data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const knit = kind === "knit" || kind === "polo";
      const thread = knit
        ? Math.cos((x * Math.PI) / 8 + 0.7 * Math.sin((y * Math.PI) / 8)) * 43 +
          Math.cos((y * Math.PI) / 4) * 20
        : Math.sin((x * Math.PI) / 2) * 22 + Math.sin((y * Math.PI) / 2) * 22;
      const value = albedo ? 235 + thread * 0.3 : 155 + thread + 7 * Math.sin(x * 73 + y * 37);
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = value;
      data[i + 3] = 255;
    }
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(kind === "knit" ? 2 : 6, kind === "knit" ? 3 : 8);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function Seam({
  points,
  color,
  radius = 0.007,
}: {
  points: [number, number][];
  color: string;
  radius?: number;
}) {
  const curve = useMemo(
    () => new CatmullRomCurve3(points.map(([x, y]) => new Vector3(x, y, 0.17 + fabricDrape(x, y)))),
    [points],
  );
  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 64, radius, 6, false]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}
function Collar({ side, color, texture }: { side: number; color: string; texture: DataTexture }) {
  const geometry = useMemo(() => {
    const outline = new Shape();
    outline.moveTo(side * 0.2, -0.15);
    outline.lineTo(side * 0.37, -0.24);
    outline.quadraticCurveTo(side * 0.32, -0.39, side * 0.24, -0.49);
    outline.lineTo(side * 0.045, -0.32);
    outline.lineTo(side * 0.2, -0.15);
    const geo = new ShapeGeometry(outline, 16);
    const points = geo.getAttribute("position");
    for (let i = 0; i < points.count; i++) points.setZ(i, 0.22 + (-points.getY(i) - 0.15) * 0.17);
    geo.computeVertexNormals();
    return geo;
  }, [side]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial
        color={color}
        roughness={0.93}
        bumpMap={texture}
        bumpScale={0.008}
        side={2}
      />
    </mesh>
  );
}
function Pocket({ side, texture }: { side: number; texture: DataTexture }) {
  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(0.29, 0.35, 16, 20);
    const points = geo.getAttribute("position");
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i) + side * 0.28,
        y = points.getY(i) - 0.76;
      points.setXYZ(i, x, y, 0.18 + fabricDrape(x, y));
    }
    geo.computeVertexNormals();
    return geo;
  }, [side]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color="#829077" roughness={0.94} bumpMap={texture} bumpScale={0.009} />
    </mesh>
  );
}
function Garment({
  index,
  x,
  selected,
  onSelect,
  view,
}: {
  view: number;
  index: number;
  x: number;
  selected: boolean;
  onSelect: (index: number) => void;
}) {
  const look = studioLooks[index];
  const geometry = useMemo(() => garmentGeometry(look.kind), [look.kind]);
  const texture = useMemo(() => fabricTexture(look.kind), [look.kind]);
  const colorTexture = useMemo(() => fabricTexture(look.kind, true), [look.kind]);
  useEffect(() => () => colorTexture.dispose(), [colorTexture]);
  useEffect(() => () => texture.dispose(), [texture]);
  const group = useRef<Group>(null);
  const [hover, setHover] = useState(false);
  const { gl, invalidate } = useThree();
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    gl.domElement.style.cursor = hover ? "pointer" : "auto";
    return () => {
      gl.domElement.style.cursor = "auto";
    };
  }, [gl, hover]);
  useFrame((_, delta) => {
    if (group.current) {
      const target = selected ? 3.3 : hover ? 0.18 : 0;
      group.current.position.x = MathUtils.damp(
        group.current.position.x,
        selected ? 0 : x,
        6,
        Math.min(delta, 0.05),
      );
      group.current.position.z = MathUtils.damp(
        group.current.position.z,
        target,
        6,
        Math.min(delta, 0.05),
      );
      group.current.rotation.y = MathUtils.damp(
        group.current.rotation.y,
        selected ? view * 4 : hover ? -0.1 : -0.05,
        7,
        delta,
      );
      if (
        Math.abs(group.current.position.z - target) > 0.001 ||
        Math.abs(group.current.position.x - (selected ? 0 : x)) > 0.001 ||
        Math.abs(group.current.rotation.y - (selected ? view * 4 : hover ? -0.1 : -0.05)) > 0.001
      )
        invalidate();
    }
  });
  const collar = look.kind !== "tee";
  return (
    <>
      <group position={[x, 3.38, 0]}>
        <Hanger />
      </group>
      <group ref={group} position={[x, 3.38, 0]} rotation={[0, -0.05, 0]}>
        <group
          onClick={(event) => {
            event.stopPropagation();
            onSelect(index);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHover(true);
          }}
          onPointerOut={() => setHover(false)}
        >
          <mesh castShadow receiveShadow>
            <primitive object={geometry} attach="geometry" />
            <meshStandardMaterial
              color={look.hex}
              roughness={0.88}
              map={colorTexture}
              bumpMap={texture}
              bumpScale={look.kind === "knit" ? 0.027 : 0.012}
              emissive={hover || selected ? "#302518" : "#000000"}
              emissiveIntensity={0.12}
            />
          </mesh>
          {collar &&
            [-1, 1].map((side) => (
              <Collar key={side} side={side} color={look.hex} texture={texture} />
            ))}
          {collar && (
            <mesh position={[0, look.kind === "jacket" ? -1.04 : -0.45, 0.24]}>
              <boxGeometry args={[0.035, look.kind === "jacket" ? 1.58 : 0.4, 0.02]} />
              <meshStandardMaterial color={look.kind === "jacket" ? "#707d66" : "#c3b29b"} />
            </mesh>
          )}
          {collar &&
            [0, 1, 2].map((i) => (
              <mesh key={i} position={[0, -0.35 - i * 0.11, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 0.014, 10]} />
                <meshStandardMaterial color="#4b4338" />
              </mesh>
            ))}
          {look.kind === "jacket" &&
            [-1, 1].map((side) => (
              <group key={side}>
                <Pocket side={side} texture={texture} />
                <Seam
                  color="#69775f"
                  points={[
                    [side * 0.28 - 0.145, -0.59],
                    [side * 0.28, -0.61],
                    [side * 0.28 + 0.145, -0.59],
                  ]}
                />
              </group>
            ))}
          <Seam
            color={look.hex}
            radius={0.012}
            points={[
              [-0.2, -0.16],
              [-0.12, -0.22],
              [0, -0.24],
              [0.12, -0.22],
              [0.2, -0.16],
            ]}
          />
          <Seam
            color={look.hex}
            points={[
              [-0.49, -1.84],
              [-0.25, -1.89],
              [0, -1.91],
              [0.25, -1.89],
              [0.49, -1.84],
            ]}
          />
          <mesh position={[0.32, -1.73, 0.2]}>
            <boxGeometry args={[0.09, 0.07, 0.015]} />
            <meshStandardMaterial color="#e6ddcb" roughness={1} />
          </mesh>
        </group>
      </group>
    </>
  );
}
function Showroom({
  view,
  selected,
  onSelect,
}: {
  view: number;
  selected: number | null;
  onSelect: (index: number) => void;
}) {
  const { camera, invalidate, size } = useThree();
  const aim = useRef(new Vector3(0, 1.85, 0));
  const initialized = useRef(false);
  useFrame((_, delta) => {
    const distance = Math.max(
      7.2,
      5.1 / (Math.tan((19 * Math.PI) / 180) * (size.width / size.height)),
    );
    const closeDistance =
      3.3 + Math.max(3.7, 1.15 / ((Math.tan((19 * Math.PI) / 180) * size.width) / size.height));
    const target = new Vector3(
      selected === null ? view * 8 : 0,
      selected === null ? 3.1 : 2.45,
      selected === null ? distance : closeDistance,
    );
    if (!initialized.current) {
      camera.position.copy(target);
      initialized.current = true;
    }
    camera.position.lerp(target, 1 - Math.exp(-5 * Math.min(delta, 0.05)));
    const focus = new Vector3(0, selected === null ? 1.85 : 2.3, selected === null ? 0 : 3.3);
    aim.current.lerp(focus, 1 - Math.exp(-5 * Math.min(delta, 0.05)));
    camera.lookAt(aim.current);
    if (camera.position.distanceTo(target) > 0.001 || aim.current.distanceTo(focus) > 0.001)
      invalidate();
  });
  return (
    <>
      <Rack x={-2.35} />
      <Rack x={2.35} />
      {[-3.35, -1.35, 1.35, 3.35].map((x, index) => (
        <Garment
          key={index}
          index={index}
          x={x}
          selected={selected === index}
          onSelect={onSelect}
          view={view}
        />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#e7e1d5" roughness={1} />
      </mesh>
      <mesh position={[0, 3, -2.6]} receiveShadow>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#f0eadd" roughness={1} />
      </mesh>
      {[-5.3, 5.3].map((x) => (
        <mesh key={x} position={[x, 2.8, -2.4]} receiveShadow>
          <boxGeometry args={[0.3, 6, 0.6]} />
          <meshStandardMaterial color="#ded5c4" roughness={1} />
        </mesh>
      ))}
    </>
  );
}
export default function StudioRenderer(props: ArtworkProps) {
  const mobile = props.quality === "medium";
  return (
    <Canvas
      frameloop="demand"
      shadows
      dpr={[1, mobile ? 1 : 1.5]}
      camera={{
        position: props.kind === "knot" ? [0, 0.1, 6.5] : [0, 3.1, 12.8],
        fov: 38,
        near: 0.1,
        far: 150,
      }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      }}
    >
      <ambientLight intensity={props.kind === "showroom" ? 0.6 : 0.25} />
      <hemisphereLight args={["#fff9e9", "#b8a58b", props.kind === "showroom" ? 0.8 : 0.45]} />
      <directionalLight
        position={[-3, 7, 5]}
        intensity={props.kind === "showroom" ? 2.6 : 3.8}
        castShadow
        shadow-mapSize={[mobile ? 1024 : 2048, mobile ? 1024 : 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0002}
        shadow-normalBias={0.008}
        shadow-radius={4}
      />
      <directionalLight
        position={[5, 2, -3]}
        intensity={props.kind === "knot" ? 4 : 1.5}
        color={props.kind === "knot" ? "#e2ebff" : "#fff2d1"}
      />
      {props.kind === "knot" && (
        <directionalLight position={[-4, -1, 2]} intensity={0.65} color="#c4ad87" />
      )}
      {props.kind === "knot" ? (
        <PremiumKnot motion={props.motion} medium={mobile} />
      ) : (
        <Showroom view={props.view} selected={props.selected} onSelect={props.onSelect} />
      )}
      <FrameClock
        fps={mobile ? 30 : 60}
        active={props.kind === "knot" && props.motion}
        onReady={props.onReady}
        onError={props.onError}
      />
    </Canvas>
  );
}
