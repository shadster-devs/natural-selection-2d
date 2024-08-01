import { useEffect, useState } from 'react';

const useHandleScale = () => {
    const [scale, setScale] = useState<number>(1);
    const [position, setPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const scaleBy = 1.1;
            const oldScale = scale;

            const mousePointTo = {
                x: (e.clientX - position.x) / oldScale,
                y: (e.clientY - position.y) / oldScale,
            };

            const newScale = e.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
            setScale(newScale);

            const newPos = {
                x: e.clientX - mousePointTo.x * newScale,
                y: e.clientY - mousePointTo.y * newScale,
            };
            setPosition(newPos);
        };

        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [scale, position]);

    return { scale, position };
};

export default useHandleScale;