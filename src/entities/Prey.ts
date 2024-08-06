import Entity from "./Entity";
import Food from "./Food";
import Predator from "./Predator";
import QLearning from "../reinforcement/QLearning";
import {v4 as uuidv4} from 'uuid';

class Prey extends Entity {
    visionStat: number;
    sizeStat: number;
    speedStat: number;
    energy: number;
    maxEnergy: number;
    age: number = 0;
    static MUTATION_RATE = 1;
    static REPRODUCTION_TYPE: 'self' | 'cross' = 'cross';

    effectiveVision: number;
    effectiveSize: number;
    effectiveSpeed: number;

    entityConsumed: number;
    parents: [string, string];

    qLearning: QLearning;
    static CHANGE_DIRECTION_PROBABILITY = 0.2;

    static  DEFAULT_VISION_STAT = 10;
    static  DEFAULT_SIZE_STAT = 5;
    static  DEFAULT_SPEED_STAT = 10;


    static  DEFAULT_SELF_REPRODUCTION_PROBABILITY = 0.05;
    static  DEFAULT_CROSS_REPRODUCTION_PROBABILITY = 0.5;
    directionAngle = 0;

    static  MIN_MUTATED_VALUE = 1;
    static  MAX_MUTATED_VALUE = 50;
    actionState: string;


    static getReproductionProbability() {
        return Prey.REPRODUCTION_TYPE === 'self' ? Prey.DEFAULT_SELF_REPRODUCTION_PROBABILITY : Prey.DEFAULT_CROSS_REPRODUCTION_PROBABILITY;
    }


    static calculateInitialEnergy(sizeStat: number) {
        return sizeStat * 6;
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
        this.actionState = 'spawned';

        this.directionAngle = Math.random() * Math.PI * 2;
        this.qLearning = new QLearning(0.1, 0.9, 0.1);
        this.parents = parents;

        this.effectiveVision = Prey.calculateEffectiveVision(this.visionStat, this.sizeStat);
        this.effectiveSize = Prey.calculateEffectiveSize(this.sizeStat);
        this.effectiveSpeed = Prey.calculateEffectiveSpeed(this.speedStat, this.sizeStat);
    }

    static calculateNewBornEnergy(sizeStat: number) {
        return sizeStat * 2;
    }

    static calculateMaxEnergy(sizeStat: number) {
        return sizeStat * 8;
    }

    static calculateReproductionEnergyCost(sizeStat: number) {
        return sizeStat * 2;
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

    static calculateDistance(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    static calculateMovementEnergyCost(sizeSate: number, speedStat: number, sizeStat: number) {
        return sizeSate * 0.5 + speedStat * 0.4 + sizeStat * 0.1;
    }

    detectEntities(entities: Entity[], entityType: 'food' | 'predator' | 'prey') {
        const nearByEntities = entities.filter(entity => {
            let distance: number;
            if (entityType === 'food') {
                distance = Prey.calculateDistance(this.x, this.y, entity.x, entity.y);
                return entity instanceof Food && distance < this.effectiveVision + entity.size;
            }
            if (entityType === 'predator') {
                distance = Prey.calculateDistance(this.x, this.y, entity.x, entity.y);
                return entity instanceof Predator && distance < this.effectiveVision + entity.effectiveSize;
            }
            if (entityType === 'prey') {
                distance = Prey.calculateDistance(this.x, this.y, entity.x, entity.y);
                return entity instanceof Prey && distance < this.effectiveVision + entity.effectiveSize;
            }
        });

        nearByEntities.sort((a, b) => {
            return Prey.calculateDistance(this.x, this.y, a.x, a.y) - Prey.calculateDistance(this.x, this.y, b.x, b.y);
        });

        return nearByEntities;
    }

    move(angle: number, width: number, height: number) {
        this.x += Math.cos(angle) * this.effectiveSpeed;
        this.y += Math.sin(angle) * this.effectiveSpeed;

        this.directionAngle = angle;

        // Ensure the prey stays within the simulation bounds
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.x = Math.max(0, Math.min(width, this.x));
            this.y = Math.max(0, Math.min(height, this.y));
            this.directionAngle = Math.random() * Math.PI * 2;
        }

        this.energy -= Prey.calculateMovementEnergyCost(this.sizeStat, this.speedStat, this.visionStat);
    }

    eat(food: Food) {
        this.entityConsumed += 1;
        this.energy = Math.min(this.maxEnergy, this.energy + Prey.calculateEnergyGain(food));
        food.energy = 0;
        food.isEaten = true;
    }

    calculateReward(action: string, state: any) {
        let reward = 0;
        const energyForReproductionAndAMove = Prey.calculateReproductionEnergyCost(this.sizeStat) + Prey.calculateMovementEnergyCost(this.sizeStat, this.speedStat, this.visionStat);

        switch (action) {
            case 'moveTowardsFood':
                if (this.energy < energyForReproductionAndAMove) {
                    reward = 2 * this.effectiveVision - state.distanceToFood;
                } else {
                    reward = -1;
                }
                break;
            case 'moveAwayFromPredator':
                reward = 2 * this.effectiveVision - state.distanceToPredator;
                break;
            case 'moveTowardsMate':
                if (this.energy > energyForReproductionAndAMove) {
                    reward = 2 * this.effectiveVision - state.distanceToMate + this.age;
                } else {
                    reward = -1;
                }
                break;
            case 'randomMove':
                reward = -1;
                break;
        }
        return reward;
    }

    evaluateState(food: Food | null, predator: Predator | null, mate: Prey | null) {
        return {
            distanceToFood: food ? Prey.calculateDistance(this.x, this.y, food.x, food.y) : Infinity,
            distanceToPredator: predator ? Prey.calculateDistance(this.x, this.y, predator.x, predator.y) : Infinity,
            distanceToMate: mate ? Prey.calculateDistance(this.x, this.y, mate.x, mate.y) : Infinity,
        };
    }


    scoreActions(state: any) {
        const actions = ['moveTowardsFood', 'moveAwayFromPredator', 'moveTowardsMate', 'randomMove'];
        const scores = actions.map(action => this.qLearning.getQValue(state, action) + this.calculateReward(action, state));
        return scores;
    }

    selectAction(scores: number[]) {
        const maxScore = Math.max(...scores);
        return scores.indexOf(maxScore);
    }

    update(entities: Entity[], width: number, height: number): Prey | null {
        if (this.energy <= 0) return null;

        this.age += 1;
        const foods = entities.filter(entity => entity instanceof Food) as Food[];
        const predators = entities.filter(entity => entity instanceof Predator) as Predator[];

        const mates = entities.filter(entity => entity instanceof Prey && entity !== this) as Prey[];
        const nearbyFood = this.detectEntities(foods, 'food') as Food[];
        const nearbyPredators = this.detectEntities(predators, 'predator') as Predator[];

        const nearbyMates = this.detectEntities(mates, 'prey') as Prey[];
        const nearestFood = nearbyFood[0] || null;
        const nearestPredator = nearbyPredators[0] || null;

        const nearestMate = nearbyMates[0] || null;

        const state = this.evaluateState(nearestFood, nearestPredator, nearestMate);
        const scores = this.scoreActions(state);
        const actionIndex = this.selectAction(scores);
        const action = ['moveTowardsFood', 'moveAwayFromPredator', 'moveTowardsMate', 'randomMove'][actionIndex];

        switch (action) {
            case 'moveTowardsFood':
                this.actionState = 'moveTowardsFood';
                if (!nearestFood) {
                    this.actionState = 'randomMove';
                    this.directedRandomMove(width, height);
                    break;
                }
                this.moveToEntity(nearestFood, width, height);
                break;
            case 'moveAwayFromPredator':
                this.actionState = 'moveAwayFromPredator';
                if (!nearestPredator) {
                    this.actionState = 'randomMove';
                    this.directedRandomMove(width, height);
                    break;
                }
                this.moveAwayFromEntity(nearestPredator, width, height);
                break;
            case 'moveTowardsMate':
                this.actionState = 'moveTowardsMate';
                if (!nearestMate || this.energy < Prey.calculateReproductionEnergyCost(this.maxEnergy)) {
                    this.actionState = 'randomMove';
                    this.directedRandomMove(width, height);
                    break;
                }
                this.moveToEntity(nearestMate, width, height);
                break;
            case 'randomMove':
                this.actionState = 'randomMove';
                this.directedRandomMove(width, height);
                break;
            default:
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
                    if (Prey.calculateDistance(this.x, this.y, mate.x, mate.y) < this.effectiveSize + mate.effectiveSize) {
                        offspring = this.reproduce(mate, width, height);
                    }
                });
            }
        }

        this.qLearning.updateQValue(state, action, this.calculateReward(action, state), this.evaluateState(nearestFood, nearestPredator, nearestMate));

        return offspring;
    }

    moveToEntity(entity: any, width: number, height: number) {
        const angle = Math.atan2(this.y - entity.y, this.x - entity.x);
        this.move(angle, width, height);
    }

    moveAwayFromEntity(entity: any, width: number, height: number) {
        const angle = Math.atan2(entity.y - this.y, entity.x - this.x);
        this.move(angle, width, height);
    }

    directedRandomMove(width: number, height: number) {
        if (Math.random() < Prey.CHANGE_DIRECTION_PROBABILITY) {
            this.directionAngle = Math.random() * Math.PI * 2;
        }

        this.move(this.directionAngle, width, height);
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
