import Entity from "./Entity";
import Prey from "./Prey";
import QLearning from "../reinforcement/QLearning";
import {v4 as uuidv4} from 'uuid';

class Predator extends Entity {
    visionStat: number;
    sizeStat: number;
    speedStat: number;
    energy: number;
    maxEnergy: number;
    age: number = 0;
    static MUTATION_RATE = 1;
    static DEFAULT_VISION_STAT = 12;

    effectiveVision: number;
    effectiveSize: number;
    effectiveSpeed: number;

    entityConsumed: number;
    parents: [string, string];

    qLearning: QLearning;
    static DEFAULT_SIZE_STAT = 7;
    static DEFAULT_SPEED_STAT = 12;
    static DEFAULT_SELF_REPRODUCTION_PROBABILITY = 0.05;
    static DEFAULT_CROSS_REPRODUCTION_PROBABILITY = 0.5;
    static REPRODUCTION_TYPE: 'self' | 'cross' = 'cross';
    static MIN_MUTATED_VALUE = 1;
    static MAX_MUTATED_VALUE = 50;
    static CHANGE_DIRECTION_PROBABILITY = 0.2;
    directionAngle: number;
    actionState: string;

    static calculateInitialEnergy(sizeStat: number) {
        return sizeStat * 6;
    }

    constructor(id: string, x: number, y: number, visionStat: number, sizeStat: number, speedStat: number, parents: [string, string] = ["", ""], isChild: boolean = false) {
        super(id, x, y);
        this.visionStat = Predator.mutateAttribute(visionStat);
        this.sizeStat = Predator.mutateAttribute(sizeStat);
        this.speedStat = Predator.mutateAttribute(speedStat);
        this.energy = isChild ? Predator.calculateNewBornEnergy(this.sizeStat) : Predator.calculateInitialEnergy(this.sizeStat);
        this.maxEnergy = Predator.calculateMaxEnergy(this.sizeStat);
        this.age = 0;
        this.directionAngle = Math.random() * Math.PI * 2;
        this.actionState = 'spawned';

        this.entityConsumed = 0;
        this.qLearning = new QLearning(0.1, 0.9, 0.1);
        this.parents = parents;

        this.effectiveVision = Predator.calculateEffectiveVision(this.visionStat, this.sizeStat);
        this.effectiveSize = Predator.calculateEffectiveSize(this.sizeStat);
        this.effectiveSpeed = Predator.calculateEffectiveSpeed(this.speedStat, this.sizeStat);
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
        const mutationFactor = positiveOrNegative * Math.random() * Predator.MUTATION_RATE;
        const mutatedValue = value + mutationFactor;

        const min = Predator.MIN_MUTATED_VALUE;
        const max = Predator.MAX_MUTATED_VALUE;

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

    static calculateEnergyGain(prey: Prey) {
        return prey.energy/2;
    }

    static getReproductionProbability() {
        return Predator.REPRODUCTION_TYPE === 'self' ? Predator.DEFAULT_SELF_REPRODUCTION_PROBABILITY : Predator.DEFAULT_CROSS_REPRODUCTION_PROBABILITY;
    }

    static calculateDistance(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    static calculateMovementEnergyCost(sizeSate: number, speedStat: number, sizeStat: number) {
        return sizeSate * 0.5 + speedStat * 0.4 + sizeStat * 0.1;
    }

    detectEntities(entities: Entity[], entityType: 'prey' | 'predator') {
        const nearByEntities = entities.filter(entity => {
            let distance: number;
            if (entityType === 'prey') {
                distance = Predator.calculateDistance(this.x, this.y, entity.x, entity.y);
                return entity instanceof Prey && distance < this.effectiveVision + entity.effectiveSize;
            }
            if (entityType === 'predator') {
                distance = Predator.calculateDistance(this.x, this.y, entity.x, entity.y);
                return entity instanceof Predator && distance < this.effectiveVision + entity.effectiveSize && entity.id !== this.id;
            }
        });

        nearByEntities.sort((a, b) => {
            return Predator.calculateDistance(this.x, this.y, a.x, a.y) - Predator.calculateDistance(this.x, this.y, b.x, b.y);
        });

        return nearByEntities;
    }

    move(angle: number, width: number, height: number) {
        this.x += Math.cos(angle) * this.effectiveSpeed;
        this.y += Math.sin(angle) * this.effectiveSpeed;

        this.directionAngle = angle;

        // Ensure the predator stays within the simulation bounds and change directionAngle to random
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.x = Math.max(0, Math.min(width, this.x));
            this.y = Math.max(0, Math.min(height, this.y));
            this.directionAngle = Math.random() * Math.PI * 2;
        }

        this.energy -= Predator.calculateMovementEnergyCost(this.sizeStat, this.speedStat, this.visionStat);
    }

    eat(prey: Prey) {
        this.entityConsumed += 1;
        this.energy = Math.min(this.maxEnergy, this.energy + Predator.calculateEnergyGain(prey));
        prey.energy = 0;
    }

    evaluateState(prey: Prey | null, mate: Predator | null) {
        return {
            distanceToPrey: prey ? Predator.calculateDistance(this.x, this.y, prey.x, prey.y) : Infinity,
            distanceToMate: mate ? Predator.calculateDistance(this.x, this.y, mate.x, mate.y) : Infinity,
        };
    }

    calculateReward(action: string, state: any) {
        let reward = 0;
        const energyForReproductionAndAMove = Predator.calculateReproductionEnergyCost(this.sizeStat) + Predator.calculateMovementEnergyCost(this.sizeStat, this.speedStat, this.visionStat);

        switch (action) {
            case 'moveTowardsPrey':
                if (this.energy < energyForReproductionAndAMove) {
                    reward = 2 * this.effectiveVision - state.distanceToPrey;
                } else {
                    reward = -1;
                }
                break;
            case 'moveTowardsMate':
                if (this.energy > energyForReproductionAndAMove) {
                    reward = 2 * this.effectiveVision + this.age - state.distanceToMate;
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


    scoreActions(state: any) {
        const actions = ['moveTowardsPrey', 'moveTowardsMate', 'randomMove'];
        const scores = actions.map(action => this.qLearning.getQValue(state, action) + this.calculateReward(action, state));
        return scores;
    }

    selectAction(scores: number[]) {
        const maxScore = Math.max(...scores);
        return scores.indexOf(maxScore);
    }

    update(entities: Entity[], width: number, height: number): Predator | null {
        if (this.energy <= 0) return null;

        this.age += 1;
        const preys = entities.filter(entity => entity instanceof Prey) as Prey[];

        const mates = entities.filter(entity => entity instanceof Predator && entity !== this) as Predator[];

        const nearbyPrey = this.detectEntities(preys, 'prey') as Prey[];
        const nearbyMates = this.detectEntities(mates, 'predator') as Predator[];

        const nearestPrey = nearbyPrey[0] || null;
        const nearestMate = nearbyMates[0] || null;


        const state = this.evaluateState(nearestPrey, nearestMate);
        const scores = this.scoreActions(state);
        const actionIndex = this.selectAction(scores);
        const action = ['moveTowardsPrey', 'moveTowardsMate', 'randomMove'][actionIndex];

        switch (action) {
            case 'moveTowardsPrey':
                this.actionState = 'moveTowardsPrey';
                if (!nearestPrey) {
                    this.actionState = 'randomMove';
                    this.directedRandomMove(width, height);
                    break;
                }
                this.moveToEntity(nearestPrey, width, height);
                break;
            case 'moveTowardsMate':
                this.actionState = 'moveTowardsMate';
                if (!nearestMate) {
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

        preys.forEach(prey => {
            if (Predator.calculateDistance(this.x, this.y, prey.x, prey.y) <= prey.effectiveSize +  this.effectiveSize) {
                this.eat(prey);
            }
        });


        let offspring: Predator | null = null;

        if (this.energy > Predator.calculateReproductionEnergyCost(this.sizeStat)) {
            if (Predator.REPRODUCTION_TYPE === 'self') {
                offspring = this.reproduce(this, width, height);
            }else{
                mates.forEach(mate => {
                    if (Predator.calculateDistance(this.x, this.y, mate.x, mate.y) <= this.effectiveSize) {
                        offspring = this.reproduce(mate, width, height);
                    }
                });
            }

        }

        if (this.energy > Predator.calculateReproductionEnergyCost(this.maxEnergy)) {
            offspring = this.reproduce(this, width, height);
        }

        this.qLearning.updateQValue(state, action, this.calculateReward(action, state), this.evaluateState(nearestPrey, nearestMate));

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
        if (Math.random() < Predator.CHANGE_DIRECTION_PROBABILITY) {
            this.directionAngle = Math.random() * Math.PI * 2;
        }

        this.move(this.directionAngle, width, height);
    }

    reproduce(mate: Predator, width: number, height: number): Predator | null {
        if (Math.random() > Predator.getReproductionProbability()) return null;

        const reproductionEnergyCost = Predator.calculateReproductionEnergyCost(this.maxEnergy);
        this.energy -= reproductionEnergyCost;

        const offspring = new Predator(
            uuidv4(), // Unique ID for the offspring
            Math.random() * width, // x position
            Math.random() * height, // y position
            (this.visionStat + mate.visionStat) / 2, // Average base vision stat
            (this.sizeStat + mate.sizeStat) / 2, // Average base size stat
            (this.speedStat + mate.speedStat) / 2, // Average base speed stat
            [this.id, mate.id] ,// Parent IDs
            true,
        );
        return offspring;
    }
}

export default Predator;
