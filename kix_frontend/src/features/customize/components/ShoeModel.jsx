import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

/**
 * Port of the reference "Shoe" component:
 * - Uses explicit meshes from the GLB (nodes.shoe, nodes.shoe_1, ...)
 * - Colors are driven by the `colors` prop instead of Valtio state
 * - Adds the same floating rotation animation
 */
export default function ShoeModel({ colors }) {
  const ref = useRef();
  const { nodes, materials } = useGLTF('/models/SneakerModel.glb');

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!ref.current) return;
    ref.current.rotation.set(
      Math.cos(t / 4) / 8,
      Math.sin(t / 4) / 8,
      -0.2 - (1 + Math.sin(t / 1.5)) / 20
    );
    ref.current.position.y = (1 + Math.sin(t / 1.5)) / 10;
  });

  return (
    <group ref={ref} dispose={null}>
      {/* These mesh mappings mirror the sample code, but use `colors` instead of valtio `snap.items` */}
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe?.geometry}
        material={materials.laces}
        material-color={colors.laces}
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_1?.geometry}
        material={materials.mesh}
        material-color={colors.mesh}
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_2?.geometry}
        material={materials.caps}
        material-color={colors.caps}
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_3?.geometry}
        material={materials.inner}
        material-color={colors.inner}
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_4?.geometry}
        material={materials.sole}
        material-color={colors.sole}
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_5?.geometry}
        material={materials.stripes}
        material-color={colors.stripes}
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_6?.geometry}
        material={materials.band}
        material-color={colors.band}
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_7?.geometry}
        material={materials.patch}
        material-color={colors.patch}
      />
    </group>
  );
}

useGLTF.preload('/models/SneakerModel.glb');
