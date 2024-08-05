import React from 'react';
import {Circle, Layer, Line, Stage, Text} from './KonvaWrapper';
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
                    <React.Fragment key={prey.id}>
                        <Circle x={prey.x} y={prey.y} radius={prey.effectiveSize} fill="blue"/>
                        <Line
                            points={[prey.x, prey.y, prey.x + Math.cos(prey.directionAngle + Math.PI) * prey.effectiveSize, prey.y + Math.sin(prey.directionAngle + Math.PI) * prey.effectiveSize]}
                            stroke="black"/>
                        <Circle x={prey.x} y={prey.y} radius={prey.effectiveVision} strokeWidth={1} stroke='black'/>
                        <Text
                            x={prey.x - prey.effectiveSize}
                            y={prey.y - prey.effectiveSize - 10}
                            text={prey.actionState}
                            fontSize={10}
                            fill="black"
                        />
                    </React.Fragment>
                ))}
                {predators.map((predator) => (
                    <React.Fragment key={predator.id}>
                        <Circle x={predator.x} y={predator.y} radius={predator.effectiveSize} fill="red"/>
                        <Line
                            points={[predator.x, predator.y, predator.x + Math.cos(predator.directionAngle + Math.PI) * predator.effectiveSize, predator.y + Math.sin(predator.directionAngle + Math.PI) * predator.effectiveSize]}
                            stroke="black"/>
                        <Circle x={predator.x} y={predator.y} radius={predator.effectiveVision} strokeWidth={1}
                                stroke='black'/>
                        <Text
                            x={predator.x - predator.effectiveSize}
                            y={predator.y - predator.effectiveSize - 10}
                            text={predator.actionState}
                            fontSize={10}
                            fill="black"
                        />
                    </React.Fragment>
                ))}
            </Layer>
        </Stage>
    );
};

export default CanvasRenderer;
