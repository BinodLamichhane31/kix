import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function ModelContent({ colors, scene }) {
  const groupRef = useRef();

  // Update materials when colors change
  useEffect(() => {
    if (!scene) return;

    const updateMaterialColor = (object, partName, color) => {
      if (!object || !object.isMesh) return;
      
      const objectName = object.name.toLowerCase();
      const partNameLower = partName.toLowerCase();

      // Match parts by name patterns
      const matches = 
        (partNameLower === 'laces' && objectName.includes('lace')) ||
        (partNameLower === 'logo' && objectName.includes('logo')) ||
        (partNameLower === 'soleupper' && (objectName.includes('sole') || objectName.includes('outsole')) && (objectName.includes('upper') || !objectName.includes('lower'))) ||
        (partNameLower === 'solelower' && (objectName.includes('sole') || objectName.includes('midsole')) && objectName.includes('lower')) ||
        (partNameLower === 'heel' && objectName.includes('heel')) ||
        (partNameLower === 'tongue' && objectName.includes('tongue')) ||
        (partNameLower === 'upperbody' && (objectName.includes('upper') || objectName.includes('body')) && !objectName.includes('sole')) ||
        (partNameLower === 'stitching' && (objectName.includes('stitch') || objectName.includes('seam'))) ||
        (partNameLower === 'innerpadding' && (objectName.includes('inner') || objectName.includes('lining') || objectName.includes('inside')));

      if (matches && object.material) {
        // Clone material to avoid mutating shared materials
        if (!object.userData.originalMaterial) {
          object.userData.originalMaterial = object.material;
        }
        
        const material = object.material.clone();
        material.color.set(color);
        object.material = material;
      }
    };

    const traverseScene = (object) => {
      if (object.isMesh) {
        // Try to match each color part
        Object.entries(colors).forEach(([partName, color]) => {
          updateMaterialColor(object, partName, color);
        });
      }

      if (object.children) {
        object.children.forEach(traverseScene);
      }
    };

    // Traverse the entire scene
    traverseScene(scene);
  }, [scene, colors]);

  // Subtle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

function PlaceholderModel({ colors }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Simple placeholder sneaker shape */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 1.2, 1]} />
        <meshStandardMaterial color={colors.upperBody || '#888888'} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1.8, 0.3, 1]} />
        <meshStandardMaterial color={colors.soleLower || '#c5c5c5'} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[1, 0.2, 0.8]} />
        <meshStandardMaterial color={colors.tongue || '#ffffff'} />
      </mesh>
      <mesh position={[0.3, 0.5, 0.5]}>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial color={colors.laces || '#ffffff'} />
      </mesh>
    </group>
  );
}

export default function ShoeModel({ colors, modelPath = '/models/SneakerModel.glb' }) {
  // Hook must be called unconditionally
  // If model doesn't exist, useGLTF will throw
  // Suspense will catch async errors, ErrorBoundary will catch sync errors
  const { scene } = useGLTF(modelPath);
  
  if (!scene) {
    return <PlaceholderModel colors={colors} />;
  }
  
  return <ModelContent colors={colors} scene={scene} />;
}
