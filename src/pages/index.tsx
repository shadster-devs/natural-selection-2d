// src/pages/index.tsx
import React, { useEffect, useState } from 'react';
import { Stage, Layer } from '@/components/KonvaWrapper';
import useHandleUpdate from "@/hooks/useHandleUpdate";
import useHandleScale from "@/hooks/useHandleScale";
import PreyComponent from "@/components/prey/PreyComponent";
import FoodComponent from "@/components/food/FoodComponent";
import SideMenu from "@/components/SideMenu";

const Home: React.FC = () => {
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [speedMultiplier, setSpeedMultiplier] = useState<number>(100);

    const [timePassed, setTimePassed] = useState<number>(0);

    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

    const { preys, updatePreys, initializePreys , foods,updateFoods, initializeFoods} = useHandleUpdate(10, 50, width, height, 200,200, true);
    const { scale, position } = useHandleScale();

    useEffect(() => {
        setHeight(window.innerHeight);
        setWidth(window.innerWidth);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            updateFoods();
            updatePreys();
            setTimePassed((prevTime) => prevTime + 1);
        }, 1000 / speedMultiplier);

        return () => clearInterval(interval);
    }, [speedMultiplier, updatePreys,updateFoods]);

    const restartPreys = () => {
        initializePreys();
        initializeFoods();
        setTimePassed(0);
    };

    return (
        <div>
            <Stage
                width={width}
                height={height}
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
            >
                <Layer>
                    <FoodComponent foods={foods} />
                    <PreyComponent preys={preys} />
                </Layer>
            </Stage>
            <div style={{ position: 'fixed', top: 10, left: 10 }}>
                <label>
                    Animation Speed Multiplier:
                    <input
                        type="number"
                        value={speedMultiplier}
                        onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                        min="1"
                        step="1"
                        max="100"
                    />
                </label>
                <p>Time Passed: {timePassed}</p>
                <p>Number of Preys: {preys.length}</p>
                <p>Number of Foods: {foods.length}</p>
                <button onClick={restartPreys}>Restart</button>
                <button onClick={() => setIsCollapsed((prev) => !prev)}>Open Side Panel</button>
                <SideMenu isCollapsed={isCollapsed} preys={preys} foods={foods} />
            </div>
        </div>
    );
};

export default Home;
