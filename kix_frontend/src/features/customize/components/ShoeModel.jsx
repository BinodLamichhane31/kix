import { useRef, useEffect, useState, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Port of the reference "Shoe" component:
 * - Uses explicit meshes from the GLB (nodes.shoe, nodes.shoe_1, ...)
 * - Colors are driven by the `colors` prop instead of Valtio state
 * - Adds the same floating rotation animation
 * - Handles WebGL context loss gracefully
 * - Supports click-to-select parts
 */
export default function ShoeModel({ colors, selectedPart, onPartSelect }) {
  const ref = useRef();
  const { gl } = useThree();
  const [hoveredPart, setHoveredPart] = useState(null);
  
  // Check if context is valid - gl is a WebGLRenderer, get the actual context
  try {
    const webglContext = gl?.getContext();
    if (webglContext && typeof webglContext.isContextLost === 'function' && webglContext.isContextLost()) {
      return null;
    }
  } catch (error) {
    // Context might not be available yet
    console.warn('Error checking WebGL context:', error);
  }
  
  const { nodes, materials } = useGLTF('/models/SneakerModel.glb');

  // Clone materials to ensure each part has its own independent state.
  // This prevents the issue where changing one part's color affects another 
  // because they share the same material object in the GLTF.
  const uniqueMaterials = useMemo(() => {
    const clones = {};
    if (materials) {
      Object.keys(materials).forEach((key) => {
        clones[key] = materials[key].clone();
      });
    }
    return clones;
  }, [materials]);

  // Handle WebGL context loss and cleanup
  useEffect(() => {
    if (!gl) return;
    
    const webglContext = gl.getContext();
    if (!webglContext) return;

    const handleContextLost = (event) => {
      event.preventDefault();
      console.warn('WebGL context lost in ShoeModel');
      // Dispose of resources
      if (ref.current) {
        ref.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored in ShoeModel');
    };

    const canvas = gl.domElement;
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      }
    };
  }, [gl]);

  useFrame((state) => {
    if (!ref.current) return;
    
    // Check if context is still valid
    try {
      const webglContext = gl?.getContext();
      if (webglContext && typeof webglContext.isContextLost === 'function' && webglContext.isContextLost()) {
        return;
      }
    } catch (error) {
      // Context check failed, continue anyway
    }
    
    const t = state.clock.getElapsedTime();
    try {
      ref.current.rotation.set(
        Math.cos(t / 4) / 8,
        Math.sin(t / 4) / 8,
        -0.2 - (1 + Math.sin(t / 1.5)) / 20
      );
      ref.current.position.y = (1 + Math.sin(t / 1.5)) / 10;
    } catch (error) {
      // Context might be lost, stop animation
      console.warn('Animation error (context may be lost):', error);
    }
  });

  // Handle click events on individual meshes
  const handleMeshClick = (partKey, event) => {
    event.stopPropagation();
    if (onPartSelect) {
      onPartSelect(partKey);
    }
  };

  // Mesh configurations
  const meshConfigs = [
    { node: nodes.shoe, material: uniqueMaterials.laces, part: 'laces' },
    { node: nodes.shoe_1, material: uniqueMaterials.mesh, part: 'mesh' },
    { node: nodes.shoe_2, material: uniqueMaterials.caps, part: 'caps' },
    { node: nodes.shoe_3, material: uniqueMaterials.inner, part: 'inner' },
    { node: nodes.shoe_4, material: uniqueMaterials.sole, part: 'sole' },
    { node: nodes.shoe_5, material: uniqueMaterials.stripes, part: 'stripes' },
    { node: nodes.shoe_6, material: uniqueMaterials.band, part: 'band' },
    { node: nodes.shoe_7, material: uniqueMaterials.patch, part: 'patch' },
  ];

  return (
    <group ref={ref} dispose={null}>
      {meshConfigs.map((config, index) => {
        const isSelected = selectedPart === config.part;
        const isHovered = hoveredPart === config.part;
        const baseColor = colors[config.part];
        
        // Use the exact color without any modification
        const displayColor = baseColor;
        
        // Use a scale pulse effect for selection instead of color/emissive changes
        // This provides visual feedback without affecting the color perception
        const scale = isSelected ? 1.025 : 1.0;

        return (
          <mesh
            key={index}
            receiveShadow
            castShadow
            geometry={config.node?.geometry}
            material={config.material}
            material-color={displayColor}
            scale={scale}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredPart(config.part);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredPart(null);
              document.body.style.cursor = 'default';
            }}
            onClick={(e) => handleMeshClick(config.part, e)}
          />
        );
      })}
    </group>
  );
}

useGLTF.preload('/models/SneakerModel.glb');

