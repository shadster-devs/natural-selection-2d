import { useState, useCallback, useEffect } from 'react';

const useCanvasZoom = (initialWidth: number, initialHeight: number) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const scaleBy = 1.1;
        const stage = e.target as HTMLElement;
        const stageRect = stage.getBoundingClientRect();
        const oldScale = zoomLevel;
        const mousePointTo = {
            x: (e.clientX - stageRect.left - canvasPosition.x) / oldScale,
            y: (e.clientY - stageRect.top - canvasPosition.y) / oldScale,
        };

        const newScale = e.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        setZoomLevel(newScale);

        const newPos = {
            x: e.clientX - stageRect.left - mousePointTo.x * newScale,
            y: e.clientY - stageRect.top - mousePointTo.y * newScale,
        };
        setCanvasPosition(newPos);
    }, [zoomLevel, canvasPosition]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (e.buttons !== 1) return;
        setCanvasPosition(pos => ({ x: pos.x + e.movementX, y: pos.y + e.movementY }));
    }, []);

    const handleReset = () => {
        setZoomLevel(1);
        setCanvasPosition({ x: 0, y: 0 });
    };

    useEffect(() => {
        window.addEventListener('wheel', handleWheel);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleWheel, handleMouseMove]);

    return {
        zoomLevel,
        canvasPosition,
        handleReset
    };
};

export default useCanvasZoom;
