import React from 'react';
import { Stage, Layer, Circle } from './KonvaWrapper';
import Prey from '../entities/Prey';
import Food from '../entities/Food';
import Predator from '../entities/Predator';

interface CanvasRendererProps {
    preys: Prey[];
    foods: Food[];
    predators: Predator[];
    width: number;
    height: number;
    zoomLevel: number;
    canvasPosition: { x: number; y: number };
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ preys, foods, predators, width, height, zoomLevel, canvasPosition }) => {
    return (
        <Stage width={width} height={height} scaleX={zoomLevel} scaleY={zoomLevel} x={canvasPosition.x} y={canvasPosition.y}>
            <Layer>
                {foods.map((food) => (
                    <Circle key={food.id} x={food.x} y={food.y} radius={food.size} fill="green" />
                ))}
                {preys.map((prey) => (
                    <Circle key={prey.id} x={prey.x} y={prey.y} radius={prey.effectiveSize} fill="blue" />
                ))}
                {preys.map((prey) => (
                    <Circle key={prey.id} x={prey.x} y={prey.y} radius={prey.effectiveVision} strokeWidth={1} stroke='black'/>
                ))}
                {predators.map((predator) => (
                    <Circle key={predator.id} x={predator.x} y={predator.y} radius={predator.effectiveSize} fill="red" />
                ))}
                {predators.map((predator) => (
                    <Circle key={predator.id} x={predator.x} y={predator.y} radius={predator.effectiveVision} strokeWidth={1} stroke='black' />
                ))}
            </Layer>
        </Stage>
    );
};

export default CanvasRenderer;
