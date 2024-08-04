import Entity from "./Entity";
import Food from "./Food";
import Predator from "./Predator";
import QLearning from "../reinforcement/QLearning";
import { v4 as uuidv4 } from 'uuid';

class Prey extends Entity {
    visionStat: number;
    sizeStat: number;
    speedStat: number;
    energy: number;
    maxEnergy: number;
    age: number = 0;

    effectiveVision: number;
    effectiveSize: number;
    effectiveSpeed: number;

    entityConsumed: number;
    parents: [string, string];

    qLearning: QLearning;

    static  REPRODUCTION_TYPE: 'self' | 'cross' = 'cross';

    static  MUTATION_RATE = 4;
    static  DEFAULT_VISION_STAT = 10;
    static  DEFAULT_SIZE_STAT = 5;
    static  DEFAULT_SPEED_STAT = 10;
    static  DEFAULT_SELF_REPRODUCTION_PROBABILITY = 0.05;
    static  DEFAULT_CROSS_REPRODUCTION_PROBABILITY = 0.5;

    static  MIN_MUTATED_VALUE = 1;
    static  MAX_MUTATED_VALUE = 50;

    static getReproductionProbability() {
        return Prey.REPRODUCTION_TYPE === 'self' ? Prey.DEFAULT_SELF_REPRODUCTION_PROBABILITY : Prey.DEFAULT_CROSS_REPRODUCTION_PROBABILITY;
    }


    static calculateInitialEnergy(sizeStat: number) {
        return sizeStat * 6;
    }

    static calculateMaxEnergy(sizeStat: number) {
        return sizeStat * 6;
    }

    static calculateNewBornEnergy(sizeStat: number) {
        return sizeStat * 2;
    }

    static calculateReproductionEnergyCost(sizeStat: number) {
        return sizeStat * 3;
    }

    static calculateMovementEnergyCost(effectiveSize: number, effectiveSpeed: number, effectiveVision: number) {
        return effectiveSize * 0.5 + effectiveSpeed * 0.4 + effectiveVision * 0.1;
    }

    static mutateAttribute(value: number) {
        const positiveOrNegative = Math.random() < 0.5 ? -1 : 1;
        const mutationFactor = positiveOrNegative * Math.random() * Prey.MUTATION_RATE;
        const mutatedValue = value + mutationFactor;

        const min = Prey.MIN_MUTATED_VALUE;
        const max = Prey.MAX_MUTATED_VALUE;

        return Math.min(max, Math.max(min, mutatedValue));
    }

    static calculateEffectiveVision(visionStat: number, sizeStat: number) {
        return visionStat + sizeStat;
    }

    static calculateEffectiveSize(sizeStat: number) {
        return sizeStat;
    }

    static calculateEffectiveSpeed(speedStat: number, sizeStat: number) {
        return speedStat - sizeStat;
    }

    static calculateEnergyGain(food: Food) {
        return food.energy;
    }

    static calculateReward(action: string, energy: number, maxEnergy: number) {
        let reward = 0;
        switch (action) {
            case 'moveTowardsFood':
                reward = energy < maxEnergy ? 10 : 2;
                break;
            case 'moveAwayFromPredator':
                reward = 30;
                break;
            case 'moveTowardsMate':
                reward = energy >= maxEnergy ? 10 : 2;
                break;
            case 'randomMove':
                reward = -1;
                break;
        }
        return reward;
    }

    static calculateDistance(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    constructor(id: string, x: number, y: number, visionStat: number, sizeStat: number, speedStat: number, parents: [string, string] = ["", ""], isChild: boolean = false) {
        super(id, x, y);
        this.visionStat = Prey.mutateAttribute(visionStat);
        this.sizeStat = Prey.mutateAttribute(sizeStat);
        this.speedStat = Prey.mutateAttribute(speedStat);
        this.energy = isChild ? Prey.calculateNewBornEnergy(this.sizeStat) : Prey.calculateInitialEnergy(this.sizeStat);
        this.maxEnergy = Prey.calculateMaxEnergy(this.sizeStat);
        this.entityConsumed = 0;
        this.age = 0;
        this.qLearning = new QLearning(0.1, 0.9, 0.1);
        this.parents = parents;

        this.effectiveVision = Prey.calculateEffectiveVision(this.visionStat, this.sizeStat);
        this.effectiveSize = Prey.calculateEffectiveSize(this.sizeStat);
        this.effectiveSpeed = Prey.calculateEffectiveSpeed(this.speedStat, this.sizeStat);
    }

    detectEntities(entities: Entity[]) {
        return entities.filter(entity => {
            const distance = Prey.calculateDistance(this.x, this.y, entity.x, entity.y);
            return distance <= this.effectiveVision;
        });
    }

    move(targetX: number, targetY: number) {
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        this.x += Math.cos(angle) * this.effectiveSpeed;
        this.y += Math.sin(angle) * this.effectiveSpeed;
        this.energy -= Prey.calculateMovementEnergyCost(this.sizeStat, this.speedStat, this.visionStat);
    }

    eat(food: Food) {
        this.entityConsumed += 1;
        this.energy = Math.min(this.maxEnergy, this.energy + Prey.calculateEnergyGain(food));
        food.energy = 0;
        food.isEaten = true;
    }

    scoreActions(state: any) {
        const actions = ['moveTowardsFood', 'moveAwayFromPredator', 'moveTowardsMate', 'randomMove'];
        const scores = actions.map(action => this.qLearning.getQValue(state, action) + Prey.calculateReward(action, this.energy, this.maxEnergy));
        return scores;
    }

    selectAction(scores: number[]) {
        const maxScore = Math.max(...scores);
        return scores.indexOf(maxScore);
    }

    update(entities: Entity[], width: number, height: number): Prey | null {
        this.age += 1;

        const foods = entities.filter(entity => entity instanceof Food) as Food[];
        const predators = entities.filter(entity => entity instanceof Predator) as Predator[];
        const mates = entities.filter(entity => entity instanceof Prey && entity !== this) as Prey[];

        if (this.energy <= 0) return null;

        const state = this.evaluateState(foods, predators, mates);
        const scores = this.scoreActions(state);
        const actionIndex = this.selectAction(scores);
        const action = ['moveTowardsFood', 'moveAwayFromPredator', 'moveTowardsMate', 'randomMove'][actionIndex];

        switch (action) {
            case 'moveTowardsFood':
                const food = foods.find(f => Prey.calculateDistance(this.x, this.y, f.x, f.y) === state.distanceToFood);
                if (!food) {
                    this.directedRandomMove(width, height);
                    break;
                }
                this.moveToEntity(food);
                break;
            case 'moveAwayFromPredator':
                const predator = predators.find(p => Prey.calculateDistance(this.x, this.y, p.x, p.y) === state.distanceToPredator);
                if (!predator) {
                    this.directedRandomMove(width, height);
                    break;
                }
                this.moveAwayFromEntity(predator);
                break;
            case 'moveTowardsMate':
                const mate = mates.find(m => Prey.calculateDistance(this.x, this.y, m.x, m.y) === state.distanceToMate);
                if (!mate || this.energy < Prey.calculateReproductionEnergyCost(this.maxEnergy)) {
                    this.directedRandomMove(width, height);
                    break;
                }
                this.moveToEntity(mate);
                break;
            case 'randomMove':
            default:
                this.directedRandomMove(width, height);
                break;
        }

        foods.forEach(food => {
            if (Prey.calculateDistance(this.x, this.y, food.x, food.y) <= food.size + this.effectiveSize) {
                this.eat(food);
            }
        });

        let offspring: Prey | null = null;

        if (this.energy > Prey.calculateReproductionEnergyCost(this.sizeStat)) {
            if (Prey.REPRODUCTION_TYPE === 'self') {
                offspring = this.reproduce(this, width, height);
            } else {
                mates.forEach(mate => {
                    if (Prey.calculateDistance(this.x, this.y, mate.x, mate.y) <= this.effectiveSize) {
                        offspring = this.reproduce(mate, width, height);
                    }
                });
            }
        }

        this.qLearning.updateQValue(state, action, Prey.calculateReward(action, this.energy, this.maxEnergy), this.evaluateState(foods, predators, mates));

        return offspring;
    }

    evaluateState(foods: Food[], predators: Predator[], mates: Prey[]) {
        const nearbyFood = this.detectEntities(foods);
        const nearbyPredators = this.detectEntities(predators);
        const nearbyMates = this.detectEntities(mates);

        return {
            energy: this.energy,
            distanceToFood: nearbyFood.length > 0 ? Prey.calculateDistance(this.x, this.y, nearbyFood[0].x, nearbyFood[0].y) : Infinity,
            distanceToPredator: nearbyPredators.length > 0 ? Prey.calculateDistance(this.x, this.y, nearbyPredators[0].x, nearbyPredators[0].y) : Infinity,
            distanceToMate: nearbyMates.length > 0 ? Prey.calculateDistance(this.x, this.y, nearbyMates[0].x, nearbyMates[0].y) : Infinity,
        };
    }

    moveToEntity(entity: any) {
        this.move(entity.x, entity.y);
    }

    moveAwayFromEntity(entity: any) {
        const angle = Math.atan2(this.y - entity.y, this.x - entity.x);
        const targetX = this.x + Math.cos(angle) * this.effectiveSpeed;
        const targetY = this.y + Math.sin(angle) * this.effectiveSpeed;
        this.move(targetX, targetY);
    }

    directedRandomMove(width: number, height: number) {
        const movementAngle = Math.random() * Math.PI * 2;
        const targetX = this.x + Math.cos(movementAngle) * this.effectiveSpeed;
        const targetY = this.y + Math.sin(movementAngle) * this.effectiveSpeed;

        this.x = Math.max(0, Math.min(targetX, width));
        this.y = Math.max(0, Math.min(targetY, height));

        this.energy -= Prey.calculateMovementEnergyCost(this.sizeStat, this.speedStat, this.visionStat);
    }

    reproduce(mate: Prey, width: number, height: number): Prey | null {
        if (Math.random() > Prey.getReproductionProbability()) return null;

        const reproductionEnergyCost = Prey.calculateReproductionEnergyCost(this.sizeStat);
        this.energy -= reproductionEnergyCost;

        const offspring = new Prey(
            uuidv4(),
            Math.random() * width,
            Math.random() * height,
            (this.visionStat + mate.visionStat) / 2,
            (this.sizeStat + mate.sizeStat) / 2,
            (this.speedStat + mate.speedStat) / 2,
            [this.id, mate.id],
            true
        );
        return offspring;
    }
}

export default Prey;
