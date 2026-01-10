import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import ShoeModel from './ShoeModel';
import { ErrorBoundary } from './ErrorBoundary';
import { Loader2 } from 'lucide-react';

export default function ShoeViewer({ colors, selectedPart, onPartSelect }) {
  const canvasRef = useRef(null);
  const canvasKeyRef = useRef(0);
  const [contextLost, setContextLost] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const glRef = useRef(null);

  useEffect(() => {
    const handleContextLost = (event) => {
      event.preventDefault();
      console.warn('WebGL context lost - attempting to restore');
      setContextLost(true);
      setIsRestoring(true);
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      setIsRestoring(false);
      // Force remount by updating key
      canvasKeyRef.current += 1;
      setContextLost(false);
    };

    // Get the canvas element and add event listeners
    const canvas = canvasRef.current?.querySelector('canvas');
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
  }, []);

  // If context is lost, show a message
  if (contextLost) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-brand-black dark:via-brand-gray dark:to-brand-black rounded-3xl border-2 border-gray-200 dark:border-white/10 overflow-hidden relative shadow-2xl flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              WebGL Context Lost
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isRestoring ? 'Restoring context...' : 'Please wait while we restore the 3D viewer'}
            </p>
          </div>
          {!isRestoring && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-lg font-semibold text-sm hover:bg-brand-accent dark:hover:bg-white transition-colors"
            >
              Reload Page
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary colors={colors}>
      <div 
        ref={canvasRef}
        className="w-full h-full bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-brand-black dark:via-brand-gray dark:to-brand-black rounded-3xl border-2 border-gray-200 dark:border-white/10 overflow-hidden relative shadow-2xl"
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-purple-500/5 animate-pulse pointer-events-none" />
        
        <Canvas
          key={canvasKeyRef.current}
          shadows={false}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "default",
            failIfMajorPerformanceCaveat: false,
            preserveDrawingBuffer: false,
            stencil: false,
            depth: true,
            logarithmicDepthBuffer: false,
            premultipliedAlpha: false,
            precision: "mediump",
          }}
          dpr={Math.min(window.devicePixelRatio, 2)}
          className="w-full h-full relative z-10"
          onCreated={({ gl }) => {
            glRef.current = gl;
            
            // Set up error handling
            const handleContextLost = (event) => {
              event.preventDefault();
              console.warn('WebGL context lost in Canvas');
            };
            
            const handleContextRestored = () => {
              console.log('WebGL context restored in Canvas');
              // Force remount
              canvasKeyRef.current += 1;
            };

            gl.domElement.addEventListener('webglcontextlost', handleContextLost);
            gl.domElement.addEventListener('webglcontextrestored', handleContextRestored);
            
            // Store cleanup function
            return () => {
              gl.domElement.removeEventListener('webglcontextlost', handleContextLost);
              gl.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
            };
          }}
          onError={(error) => {
            console.error('Canvas error:', error);
            // Don't throw, let ErrorBoundary handle it
          }}
        >
          {/* Optimized Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.2}
            castShadow={false}
          />
          <directionalLight
            position={[-10, 5, -5]}
            intensity={0.6}
          />
          
          {/* Simplified Environment - removed to reduce memory */}
          {/* <Environment preset="city" /> */}
          
          {/* 3D Model */}
          <Suspense fallback={null}>
            <ShoeModel 
              colors={colors} 
              selectedPart={selectedPart}
              onPartSelect={onPartSelect}
            />
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
              <span className="w-px h-4 bg-white/30" />
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                Click part to select
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

