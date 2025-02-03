import React, { useRef, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import * as THREE from 'three';

export function Logo3D({ className }: { className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cubeRef = useRef<THREE.Mesh | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Initialize camera
        const camera = new THREE.PerspectiveCamera(
            75, // FOV
            1, // Aspect ratio (will be updated)
            0.1, // Near plane
            1000 // Far plane
        );
        camera.position.z = 2.5;
        cameraRef.current = camera;

        // Initialize renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(100, 100);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;

        // Create cube
        const geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 0,
            specular: 0x444444
        });
        const cube = new THREE.Mesh(geometry, material);
        cubeRef.current = cube;
        scene.add(cube);

        // Add lighting
        const light1 = new THREE.DirectionalLight(0xffffff, 1);
        light1.position.set(1, 1, 1);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
        light2.position.set(-1, -1, -1);
        scene.add(light2);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        // Add renderer to DOM
        containerRef.current.appendChild(renderer.domElement);

        // Handle resize
        const handleResize = () => {
            if (!containerRef.current || !renderer || !camera) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
        };

        // Initial size
        handleResize();

        // Add resize listener
        window.addEventListener('resize', handleResize);

        // Animation loop
        let startTime = Date.now();
        let animationFrame: number;

        const animate = () => {
            if (!cube || !renderer || !scene || !camera) return;

            const elapsedTime = (Date.now() - startTime) / 1000;

            // Rotate cube
            cube.rotation.x = elapsedTime * 0.5;
            cube.rotation.y = elapsedTime * 0.7;

            // Change color
            const r = Math.sin(elapsedTime * 0.5) * 0.5 + 0.5;
            const g = Math.sin(elapsedTime * 0.63 + 2) * 0.5 + 0.5;
            const b = Math.sin(elapsedTime * 0.76 + 4) * 0.5 + 0.5;

            (cube.material as THREE.MeshPhongMaterial).color.setRGB(r, g, b);

            renderer.render(scene, camera);
            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrame);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={twMerge('*:w-[100px] *:h-[100px]', className)}
            style={{
                height: '100px',
                width: '100px',
                minWidth: '100px',
                minHeight: '100px'
            }}
        />
    );
}
