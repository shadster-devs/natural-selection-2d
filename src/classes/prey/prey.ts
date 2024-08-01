// src/components/prey/prey.ts
import { getPreyRandomMutation } from "@/classes/prey/utils";
import Food from "@/classes/food/food";

export const preyMutationRate = 20;

export default class Prey {
    type: 'prey';

    x: number;
    y: number;
    color: string;

    sizeStat: number;
    speedStat: number;
    visionStat: number;

    movementAngle: number;


    timeWithoutFood: number;
    maxTimeWithoutFood = 60;

    reproductionProbability = 0.05;
    deathProbability = 0.02;

    hasMoved = false;

    constructor(x: number, y: number, speedStat: number, visionStat: number, sizeStat: number, color: string) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.sizeStat = sizeStat;
        this.speedStat = speedStat;
        this.visionStat = visionStat;

        this.timeWithoutFood = 0;
        this.movementAngle = 0;
    }

    move(width: number, height: number, movementAngle?: number) {
        if (!this.isAlive()) {
            return;
        }

        let angle: number = 0;
        if (movementAngle) {
            angle = movementAngle;
        } else {
            angle = Math.random() * 2 * Math.PI;
        }

        this.timeWithoutFood += 1;

        this.movementAngle = angle;
        let dx = Math.cos(angle) * this.speedStat;
        let dy = Math.sin(angle) * this.speedStat;
        this.x += dx;
        this.y += dy;

        if (this.x < 0 || this.x > width) dx = -dx;
        if (this.y < 0 || this.y > height) dy = -dy;


        this.hasMoved = true;

    }

    eat(){
        this.timeWithoutFood = 0;
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
        return    Math.sqrt((this.x - food.x) ** 2 + (this.y - food.y) ** 2);
    }

    isCollidingWithFood(food: Food) {
        if (!food) {
            return false;
        }
        // Find the closest point on the square to the center of the circle
        const closestX = Math.max(food.x, Math.min(this.x, food.x + food.size));
        const closestY = Math.max(food.y, Math.min(this.y, food.y + food.size));

        // Calculate the distance from the circle's center to this closest point
        const distance = Math.sqrt((this.x - closestX) ** 2 + (this.y - closestY) ** 2);



        return distance < this.sizeStat;
    }



    isAlive() {
        const isDeathByProbability = Math.random() < this.deathProbability;
        const isDeathByNoFood = this.timeWithoutFood > this.maxTimeWithoutFood;

        //id dead log the reason
        if(isDeathByProbability){
            console.log('Death by Probability');
        }



        return !isDeathByProbability  && !isDeathByNoFood;
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
        if (allowReproduction) {
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

        if (allowReproduction) {
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
