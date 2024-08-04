import Prey from "../entities/Prey";
import Food from "../entities/Food";
import Predator from "../entities/Predator";
import { v4 as uuidv4 } from 'uuid';

class Simulation {
    preys: Prey[];
    foods: Food[];
    predators: Predator[];
    width: number;
    height: number;

    static  MAX_PREYS = 30;
    static  MAX_FOODS = 300;
    static  MAX_PREDATORS = 15;

    static  INITIAL_PREYS = 20;
    static  INITIAL_FOODS = 200; 
    static  INITIAL_PREDATORS = 10;

    static  MINIMUM_FOOD_COUNT = 10;

    fittestPreys: Prey[];
    fittestPredators: Predator[];

    static  MAX_FITTEST_PREYS_FROM_LAST_GENERATION = 10;
    static  MAX_FITTEST_PREDATORS_FROM_LAST_GENERATION = 5;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.preys = [];
        this.foods = [];
        this.predators = [];
        this.fittestPreys = [];
        this.fittestPredators = [];
    }

    initialize() {
        this.preys = [];
        this.foods = [];
        this.predators = [];
        this.fittestPreys = [];
        this.fittestPredators = [];

        for (let i = 0; i < Simulation.INITIAL_PREYS; i++) {
            this.addPrey(new Prey(uuidv4(), Math.random() * this.width, Math.random() * this.height, Prey.DEFAULT_VISION_STAT, Prey.DEFAULT_SIZE_STAT, Prey.DEFAULT_SPEED_STAT));
        }
        for (let i = 0; i < Simulation.INITIAL_FOODS; i++) {
            this.addFood(new Food(uuidv4(), Math.random() * this.width, Math.random() * this.height, Food.DEFAULT_SIZE));
        }
        for (let i = 0; i < Simulation.INITIAL_PREDATORS; i++) {
            this.addPredator(new Predator(uuidv4(), Math.random() * this.width, Math.random() * this.height, Predator.DEFAULT_VISION_STAT, Predator.DEFAULT_SIZE_STAT, Predator.DEFAULT_SPEED_STAT));
        }
    }

    addPrey(prey: Prey) {
        if (this.preys.length >= Simulation.MAX_PREYS) {
            this.removeParent(prey.parents, this.preys);
        }
        this.preys.push(prey);
    }

    addFood(food: Food) {
        if (this.foods.length >= Simulation.MAX_FOODS) {
            this.removeParent(food.parents, this.foods);
            return;
        }
        this.foods.push(food);
    }

    addPredator(predator: Predator) {
        if (this.predators.length >= Simulation.MAX_PREDATORS) {
            this.removeParent(predator.parents, this.predators);
        }
        this.predators.push(predator);
    }

    update() {
        // Update preys and collect offspring
        this.preys.forEach(prey => {
            prey.age++; // Increment age
            const offspring = prey.update([...this.foods, ...this.predators, ...this.preys], this.width, this.height);
            if (offspring && offspring instanceof Prey) {
                this.addPrey(offspring);
            }
        });

        // Update predators and collect offspring
        this.predators.forEach(predator => {
            predator.age++; // Increment age
            const offspring = predator.update([...this.preys], this.width, this.height);
            if (offspring && offspring instanceof Predator) {
                this.addPredator(offspring);
            }
        });

        // Update foods and collect new food
        this.foods.forEach(food => {
            const newFood = food.update([], this.width, this.height);
            if (newFood && newFood instanceof Food) {
                this.addFood(newFood);
            }
        });

        // Remove entities that are no longer alive and update the fittest lists
        this.preys = this.preys.filter(prey => {
            if (prey.energy <= 0) {
                this.updateFittestEntities(prey, this.fittestPreys, Simulation.MAX_FITTEST_PREYS_FROM_LAST_GENERATION);
                return false;
            }
            return true;
        });

        this.predators = this.predators.filter(predator => {
            if (predator.energy <= 0) {
                this.updateFittestEntities(predator, this.fittestPredators, Simulation.MAX_FITTEST_PREDATORS_FROM_LAST_GENERATION);
                return false;
            }
            return true;
        });

        this.foods = this.foods.filter(food => !food.isEaten);

        // Check if all entities are dead and reinitialize if necessary
        if (this.preys.length < 1 || this.predators.length < 1) {
            this.reinitialize();
        }

        // Ensure minimum food level
        if (this.foods.length < Simulation.MINIMUM_FOOD_COUNT) {
            for (let i = 0; i < Simulation.INITIAL_FOODS; i++) {
                this.addFood(new Food(uuidv4(), Math.random() * this.width, Math.random() * this.height, Food.DEFAULT_SIZE));
            }
        }
    }

    removeParent(parentIds: [string, string], entities: (Prey | Predator | Food)[]) {
        parentIds.forEach(parentId => {
            const index = entities.findIndex(entity => entity.id === parentId);
            if (index !== -1) {
                entities.splice(index, 1);
            }
        });
    }

    reinitialize() {
        const fittestPreys = this.fittestPreys;
        const fittestPredators = this.fittestPredators;

        // Reset the fittest lists to keep track for the next generation
        this.fittestPreys = [];
        this.fittestPredators = [];

        // Reinitialize preys and predators from the fittest ones
        for (let i = 0; i < fittestPreys.length; i++) {
            fittestPreys[i].energy = Prey.calculateInitialEnergy(fittestPreys[i].sizeStat);
            fittestPreys[i].age = 0;
            fittestPreys[i].entityConsumed = 0;
            fittestPreys[i].x = Math.random() * this.width;
            fittestPreys[i].y = Math.random() * this.height;
            this.addPrey(fittestPreys[i]);
            this.addPrey(new Prey(uuidv4(), Math.random() * this.width, Math.random() * this.height, fittestPreys[i].visionStat, fittestPreys[i].sizeStat, fittestPreys[i].speedStat));
        }

        for (let i = 0; i < fittestPredators.length; i++) {
            fittestPredators[i].energy = Prey.calculateInitialEnergy(fittestPredators[i].sizeStat);
            fittestPredators[i].age = 0;
            fittestPredators[i].entityConsumed = 0;
            fittestPredators[i].x = Math.random() * this.width;
            fittestPredators[i].y = Math.random() * this.height;
            this.addPredator(fittestPredators[i]);
            this.addPredator(new Predator(uuidv4(), Math.random() * this.width, Math.random() * this.height, fittestPredators[i].visionStat, fittestPredators[i].sizeStat, fittestPredators[i].speedStat));
        }

        // Reinitialize foods
        this.foods = Array.from({ length: Simulation.INITIAL_FOODS }, () => new Food(uuidv4(), Math.random() * this.width, Math.random() * this.height, Food.DEFAULT_SIZE));
    }

    updateFittestEntities<T extends { age: number , entityConsumed : number}>(entity: T, fittestEntities: T[], maxFittest: number) {
        fittestEntities.push(entity);

        fittestEntities.sort((a, b) => {
            if (b.entityConsumed !== a.entityConsumed) {
                return b.entityConsumed - a.entityConsumed;
            }
            return b.age - a.age;
        });

        if (fittestEntities.length > maxFittest) {
            fittestEntities.pop();
        }
    }
}

export default Simulation;
