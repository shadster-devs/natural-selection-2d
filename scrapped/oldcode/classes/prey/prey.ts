// src/classes/prey/prey.ts
import { getPreyRandomMutation } from "@/oldcode/classes/prey/utils";
import Food from "@/oldcode/classes/food/food";

export const preyMutationRate =10;

export default class Prey {
    x: number;
    y: number;
    color: string;

    sizeStat: number;
    speedStat: number;
    visionStat: number;

    movementAngle: number;
    energy: number;
    energyCostPerMove: number;
    energyCostPerReproduction: number;
    energyGainFromFood: number;

    numOfFoodToUnlockReproduction: number = 7;
    numOfFoodEaten: number;
    isReproductionUnlocked: boolean = false;

    reproductionProbability = 0.06;
    deathProbability = 0.02;

    hasMoved = false;

    constructor(x: number, y: number, speedStat: number, visionStat: number, sizeStat: number, color: string) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.sizeStat = sizeStat;
        this.speedStat = speedStat;
        this.visionStat = visionStat;

        this.energy = sizeStat * 5;
        this.energyCostPerMove = sizeStat * 0.2;
        this.energyCostPerReproduction = sizeStat * 1.5;
        this.energyGainFromFood = sizeStat * 0.5;

        this.numOfFoodEaten = 0;
        this.numOfFoodToUnlockReproduction = 0;


        this.isReproductionUnlocked =false;
        this.movementAngle = 0;
    }

    move(width: number, height: number, movementAngle?: number) {
        if (!this.isAlive()) {
            return;
        }

        let angle: number = movementAngle !== undefined ? movementAngle : Math.random() * 2 * Math.PI;


        this.movementAngle = angle;
            let dx = Math.cos(angle) * this.speedStat;
            let dy = Math.sin(angle) * this.speedStat;
            this.x += dx;
            this.y += dy;

        if (this.x < 0 || this.x > width) this.x = Math.max(0, Math.min(width, this.x));
        if (this.y < 0 || this.y > height) this.y = Math.max(0, Math.min(height, this.y));

        this.energy -= this.energyCostPerMove; // Reduce energy on move
        this.hasMoved = true;
    }

    eat() {
        this.numOfFoodEaten++;
        this.isReproductionUnlocked = this.numOfFoodEaten >= this.numOfFoodToUnlockReproduction;
        this.energy += this.energyGainFromFood; // Increase energy on eating food
    }

    isCollidingWithPrey(prey: Prey) {
        const distance = Math.sqrt((this.x - prey.x) ** 2 + (this.y - prey.y) ** 2);
        return distance < this.sizeStat + prey.sizeStat;
    }

    isFoodVisible(food: Food) {
        if (!food) {
            return false;
        }
        const distance = this.getDistanceToFood(food);
        return distance < this.visionStat;
    }

    getDistanceToFood(food: Food) {
        return Math.sqrt((this.x - food.x) ** 2 + (this.y - food.y) ** 2);
    }

    isCollidingWithFood(food: Food) {
        if (!food) {
            return false;
        }
        const closestX = Math.max(food.x, Math.min(this.x, food.x + food.size));
        const closestY = Math.max(food.y, Math.min(this.y, food.y + food.size));
        const distance = Math.sqrt((this.x - closestX) ** 2 + (this.y - closestY) ** 2);
        return distance < this.sizeStat;
    }

    isAlive() {
        const isDeathByProbability = Math.random() < this.deathProbability;
        const isDeathByEnergyDepletion = this.energy <= 0;

        return !isDeathByProbability  && !isDeathByEnergyDepletion;
    }

    moveTowardsFood(food: Food) {
        const angle = Math.atan2(food.y - this.y, food.x - this.x);
        this.move(0, 0, angle);
    }

    moveAwayFromPrey(width: number, height: number, movementAngle: number) {
        this.move(width, height, movementAngle + Math.PI);
    }

    moveTowardsPrey(width: number, height: number, movementAngle: number) {
        this.move(width, height, movementAngle);
    }

    reproduceAlone(width: number, height: number) {
        const allowReproduction = Math.random() < this.reproductionProbability;
        if (allowReproduction && this.energy >= this.energyCostPerReproduction) {
            this.energy -= this.energyCostPerReproduction; // Reduce energy for reproduction
            return new Prey(
                Math.random() * width,
                Math.random() * height,
                getPreyRandomMutation(this.speedStat),
                getPreyRandomMutation(this.visionStat),
                getPreyRandomMutation(this.sizeStat),
                'red'
            );
        }
    }

    reproduceWith(prey: Prey, width: number, height: number) {
        const allowReproduction = Math.random() < this.reproductionProbability;
        const thisMovementAngle = this.movementAngle;
        const preyMovementAngle = prey.movementAngle;
        this.moveAwayFromPrey(width, height, preyMovementAngle);
        prey.moveAwayFromPrey(width, height, thisMovementAngle);

        if (allowReproduction && this.energy >= this.energyCostPerReproduction) {
            this.energy -= this.energyCostPerReproduction; // Reduce energy for reproduction
            return new Prey(
                Math.random() * width,
                Math.random() * height,
                getPreyRandomMutation((this.speedStat + prey.speedStat) / 2),
                getPreyRandomMutation((this.visionStat + prey.visionStat) / 2),
                getPreyRandomMutation((this.sizeStat + prey.sizeStat) / 2),
                'red'
            );
        }
    }
}
