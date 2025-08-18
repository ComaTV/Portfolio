import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function BackgroundCube() {
  const { scene, camera } = useThree();
  const angle = useRef(0);

  useEffect(() => {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      "panorama/panorama_0.png",
      "panorama/panorama_2.png", 
      "panorama/panorama_4.png",
      "panorama/panorama_5.png", 
      "panorama/panorama_3.png",
      "panorama/panorama_1.png", 
    ]);
    scene.background = texture;
  }, [scene]);

  useFrame(() => {
    angle.current += 0.001;
    camera.position.x = Math.sin(angle.current) * 0.1;
    camera.position.z = Math.cos(angle.current) * 0.1;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function PanoramaBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-[-1]">
      <Canvas camera={{ position: [0, 0, 0.1] }}>
        <BackgroundCube />
      </Canvas>
    </div>
  );
}
