import { Component, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

// Placeholder model component
function PlaceholderModel({ colors }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 1.2, 1]} />
        <meshStandardMaterial color={colors?.upperBody || '#888888'} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1.8, 0.3, 1]} />
        <meshStandardMaterial color={colors?.soleLower || '#c5c5c5'} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[1, 0.2, 0.8]} />
        <meshStandardMaterial color={colors?.tongue || '#ffffff'} />
      </mesh>
      <mesh position={[0.3, 0.5, 0.5]}>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial color={colors?.laces || '#ffffff'} />
      </mesh>
    </group>
  );
}

// Placeholder Canvas component
function PlaceholderCanvas({ colors }) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-brand-black dark:via-brand-gray dark:to-brand-black rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden relative">
      <Canvas
        gl={{ 
          antialias: true, 
          alpha: true,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -5]} intensity={0.4} />
        <Environment preset="city" />
        <PlaceholderModel colors={colors} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 dark:bg-white/10 backdrop-blur-sm rounded-lg text-white dark:text-white text-xs">
        Drag to rotate • Scroll to zoom
      </div>
      <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-xs text-yellow-700 dark:text-yellow-400">
        Placeholder model - Add SneakerModel.glb to public/models/
      </div>
    </div>
  );
}

// Error boundary for Canvas/WebGL errors
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Don't treat model loading errors as critical - show placeholder instead
    const isModelError = error?.message?.includes('model') || 
                        error?.message?.includes('glb') || 
                        error?.message?.includes('gltf') ||
                        error?.message?.includes('404');
    
    if (isModelError) {
      console.log('Model file not found - showing placeholder. Add SneakerModel.glb to public/models/ when ready.');
    } else {
      console.error('3D Viewer Error:', error);
    }
    
    return { hasError: true, error, isModelError };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging but don't treat model errors as critical
    if (!this.state.isModelError) {
      console.error('3D Viewer Error Details:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // For model errors, show placeholder canvas instead of error message
      if (this.state.isModelError) {
        return <PlaceholderCanvas colors={this.props.colors} />;
      }
      
      // For other errors (WebGL context loss, etc.), show error message
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-brand-black/40 rounded-2xl p-8">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {this.state.error?.message || 'Failed to initialize 3D viewer'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-lg font-semibold text-sm hover:bg-brand-accent dark:hover:bg-white transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
