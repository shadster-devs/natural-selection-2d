import Entity from "./Entity";
import { v4 as uuidv4 } from 'uuid';

class Food extends Entity {
    energy: number;
    size: number;
    isEaten: boolean;
    parents: [string, string];

    static  DEFAULT_SIZE = 5;
    static REPRODUCTION_PROBABILITY = 0.01;
    static DECAY_RATE = 0.01;

    static calculateInitialEnergy(size: number) {
        return size * 25;
    }


    constructor(id: string, x: number, y: number, size: number, parents: [string, string] = ["", ""]) {
        super(id, x, y);
        this.energy = Food.calculateInitialEnergy(size);
        this.size = size;
        this.isEaten = false;
        this.parents = parents;
    }

    update(entities: Entity[], width: number, height: number): Food | null {
        this.energy -= Food.DECAY_RATE;
        if (this.energy <= 0) {
            this.isEaten = true;
            return null;
        }

        // Reproduction logic
        let newFood: Food | null = null;
        if (Math.random() < Food.REPRODUCTION_PROBABILITY) {
            newFood = this.reproduce(width, height);
        }

        return newFood;
    }

    reproduce(width: number, height: number) {
        const offsetX = (Math.random() - 0.5) * this.size * 2;
        const offsetY = (Math.random() - 0.5) * this.size * 2;
        const newX = this.x + offsetX;
        const newY = this.y + offsetY;

        // Ensure new food doesn't go out of bounds
        const clampedX = Math.max(0, Math.min(newX, width));
        const clampedY = Math.max(0, Math.min(newY, height));

        return new Food(uuidv4(), clampedX, clampedY, this.size, [this.id, this.id]);
    }
}

export default Food;
