import Entity from "./Entity";
import Prey from "./Prey";
import QLearning from "../reinforcement/QLearning";
import { v4 as uuidv4 } from 'uuid';
import Food from "@/entities/Food"; // Using uuid for unique ID generation

class Predator extends Entity {
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

    static readonly REPRODUCTION_TYPE: 'self' | 'cross' = 'cross';

    static readonly MUTATION_RATE = 4;
    static readonly DEFAULT_VISION_STAT = 12;
    static readonly DEFAULT_SIZE_STAT = 7;
    static readonly DEFAULT_SPEED_STAT = 12;
    static readonly DEFAULT_SELF_REPRODUCTION_PROBABILITY = 0.05;
    static readonly DEFAULT_CROSS_REPRODUCTION_PROBABILITY= 0.5;

    static readonly MIN_MUTATED_VALUE = 1;
    static readonly MAX_MUTATED_VALUE = 50;

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
        return effectiveSize * 0.4 + effectiveSpeed * 0.5 + effectiveVision * 0.1;
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

    static calculateReward(action: string, energy: number, maxEnergy: number) {
        let reward = 0;
        switch (action) {
            case 'moveTowardsPrey':
                reward = energy < maxEnergy ? 20 : 4;
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
        this.visionStat = Predator.mutateAttribute(visionStat);
        this.sizeStat = Predator.mutateAttribute(sizeStat);
        this.speedStat = Predator.mutateAttribute(speedStat);
        this.energy = isChild ? Predator.calculateNewBornEnergy(this.sizeStat) : Predator.calculateInitialEnergy(this.sizeStat);
        this.maxEnergy = Predator.calculateMaxEnergy(this.sizeStat);
        this.age = 0;

        this.entityConsumed = 0;
        this.qLearning = new QLearning(0.1, 0.9, 0.1);
        this.parents = parents;

        this.effectiveVision = Predator.calculateEffectiveVision(this.visionStat, this.sizeStat);
        this.effectiveSize = Predator.calculateEffectiveSize(this.sizeStat);
        this.effectiveSpeed = Predator.calculateEffectiveSpeed(this.speedStat, this.sizeStat);
    }

    detectEntities(entities: Entity[]) {
        return entities.filter(entity => {
            const distance = Predator.calculateDistance(this.x, this.y, entity.x, entity.y);
            return entity instanceof Prey && distance <= this.effectiveVision;
        });
    }

    move(targetX: number, targetY: number, width: number, height: number) {
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        this.x += Math.cos(angle) * this.effectiveSpeed;
        this.y += Math.sin(angle) * this.effectiveSpeed;

        // Ensure the predator stays within the simulation bounds
        this.x = Math.max(0, Math.min(this.x, width));
        this.y = Math.max(0, Math.min(this.y, height));

        this.energy -= Predator.calculateMovementEnergyCost(this.sizeStat, this.speedStat, this.visionStat);
    }

    eat(prey: Prey) {
        this.entityConsumed += 1;
        this.energy = Math.min(this.maxEnergy, this.energy + Predator.calculateEnergyGain(prey));
        prey.energy = 0;
    }

    scoreActions(state: any) {
        const actions = ['moveTowardsPrey', 'moveTowardsMate', 'randomMove'];
        const scores = actions.map(action => this.qLearning.getQValue(state, action) + Predator.calculateReward(action, this.energy, this.maxEnergy));
        return scores;
    }

    selectAction(scores: number[]) {
        const maxScore = Math.max(...scores);
        return scores.indexOf(maxScore);
    }

    update(entities: Entity[], width: number, height: number): Predator | null {
        this.age += 1;

        const preys = entities.filter(entity => entity instanceof Prey) as Prey[];
        const mates = entities.filter(entity => entity instanceof Predator && entity !== this) as Predator[];

        if (this.energy <= 0) return null;

        const state = this.evaluateState(preys, mates);
        const scores = this.scoreActions(state);
        const actionIndex = this.selectAction(scores);
        const action = ['moveTowardsPrey', 'moveTowardsMate', 'randomMove'][actionIndex];

        switch (action) {
            case 'moveTowardsPrey':
                const prey = preys.find(p => Predator.calculateDistance(this.x, this.y, p.x, p.y) === state.distanceToPrey);
                if (!prey) {
                    this.directedRandomMove(width, height);
                    break;
                }
                this.moveToEntity(prey, width, height);
                break;
            case 'moveTowardsMate':
                const mate = mates.find(m => Predator.calculateDistance(this.x, this.y, m.x, m.y) === state.distanceToMate);
                if (!mate) {
                    this.directedRandomMove(width, height);
                    break;
                }
                this.moveToEntity(mate, width, height);
                break;
            case 'randomMove':
                this.directedRandomMove(width, height);
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

        this.qLearning.updateQValue(state, action, Predator.calculateReward(action, this.energy, this.maxEnergy), this.evaluateState(preys, mates));

        return offspring;
    }

    evaluateState(preys: Prey[], mates: Predator[]) {
        const nearbyPrey = this.detectEntities(preys);
        const nearbyMates = this.detectEntities(mates);

        return {
            energy: this.energy,
            distanceToPrey: nearbyPrey.length > 0 ? Predator.calculateDistance(this.x, this.y, nearbyPrey[0].x, nearbyPrey[0].y) : Infinity,
            distanceToMate: nearbyMates.length > 0 ? Predator.calculateDistance(this.x, this.y, nearbyMates[0].x, nearbyMates[0].y) : Infinity,
        };
    }

    moveToEntity(entity: any, width: number, height: number) {
        this.move(entity.x, entity.y, width, height);
    }

    moveAwayFromEntity(entity: any, width: number, height: number) {
        const angle = Math.atan2(this.y - entity.y, this.x - entity.x);
        const targetX = this.x + Math.cos(angle) * this.effectiveSpeed;
        const targetY = this.y + Math.sin(angle) * this.effectiveSpeed;
        this.move(targetX, targetY, width, height);
    }

    directedRandomMove(width: number, height: number) {
        const movementAngle = Math.random() * Math.PI * 2;
        const targetX = this.x + Math.cos(movementAngle) * this.effectiveSpeed;
        const targetY = this.y + Math.sin(movementAngle) * this.effectiveSpeed;
        this.move(targetX, targetY, width, height);
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
