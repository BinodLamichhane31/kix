import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import ShoeModel from './ShoeModel';
import { ErrorBoundary } from './ErrorBoundary';

export default function ShoeViewer({ colors }) {
  return (
    <ErrorBoundary colors={colors}>
      <div className="w-full h-full bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-brand-black dark:via-brand-gray dark:to-brand-black rounded-3xl border-2 border-gray-200 dark:border-white/10 overflow-hidden relative shadow-2xl">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-purple-500/5 animate-pulse pointer-events-none" />
        
        <Canvas
          shadows
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          dpr={[1, 2]}
          className="w-full h-full relative z-10"
          onError={(error) => {
            console.error('Canvas error:', error);
          }}
        >
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.5}
            castShadow={false}
          />
          <directionalLight
            position={[-10, 5, -5]}
            intensity={0.8}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          <pointLight position={[10, -5, 5]} intensity={0.3} />
          
          {/* Environment for reflections and soft shadows */}
          <Environment preset="city" />
          
          {/* 3D Model */}
          <Suspense fallback={null}>
            <ShoeModel colors={colors} />
          </Suspense>
          
          {/* Orbit Controls for rotation and zoom */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.8}
            autoRotate={false}
          />
        </Canvas>
        
        {/* Enhanced help text overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="px-6 py-3 bg-black/70 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/20 dark:border-white/10 shadow-2xl">
            <p className="text-white dark:text-white text-xs font-medium flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                Drag to rotate
              </span>
              <span className="w-px h-4 bg-white/30" />
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                Scroll to zoom
              </span>
            </p>
          </div>
        </div>
        
        {/* Corner accent */}
        <div className="absolute top-4 right-4 z-20 w-2 h-2 rounded-full bg-brand-accent shadow-lg shadow-brand-accent/50 animate-pulse" />
      </div>
    </ErrorBoundary>
  );
}

