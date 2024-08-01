// src/components/prey/FoodComponent.tsx
import Prey from '@/classes/prey/prey';
import React from "react";
import { Circle as KonvaCircle } from '../KonvaWrapper';

interface PreyProps {
    preys: Prey[];
}

const PreyComponent: React.FC<PreyProps> = ({ preys }) => {
    return (
        <>
            {preys.map((circle, i) => (
                <>
                    <KonvaCircle key={i+"prey"} x={circle.x} y={circle.y} radius={circle.sizeStat} fill={circle.color} stroke='black' strokeWidth={2} />
                    <KonvaCircle key={i+"visionCone"} x={circle.x} y={circle.y} radius={circle.visionStat} stroke='black' strokeWidth={2} />
                </>
            ))}
        </>
    );
}

export default PreyComponent;
