import React from "react";
import { Rect } from '../KonvaWrapper';
import Food from "@/oldcode/classes/food/food";

interface FoodComponentProps {
    foods: Food[];
}

const FoodComponent: React.FC<FoodComponentProps> = ({ foods }) => {
    return (
        <>
            {foods.map((food, i) => (
                <>
                    <Rect key={i +"Food"} x={food.x} y={food.y} height={food.size} width={food.size} fill={food.color}  />
                </>
            ))}
        </>
    );
}

export default FoodComponent;
