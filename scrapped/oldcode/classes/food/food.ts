// src/classes/food/food.ts
import Prey from "@/oldcode/classes/prey/prey";

export default class Food {
    x: number;
    y: number;
    size: number;
    color: string;
    isEaten: boolean = false;

    reproductionProbability = 0.4;
    deathProbability = 0.0005;

    constructor(x: number, y: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }

    isAlive() {
        return !this.isEaten;
    }

    grow(width: number, height: number) {
        if (Math.random() < this.reproductionProbability) {
            const offsetX = this.size * (Math.random() > 0.5 ? 1 : 0) * (Math.random() > 0.5 ? 1 : -1);
            const offsetY = this.size * (Math.random() > 0.5 ? 1 : 0) * (Math.random() > 0.5 ? 1 : -1);
            return new Food(Math.random() * width, Math.random() * height, this.size, this.color);
        }
    }
}
