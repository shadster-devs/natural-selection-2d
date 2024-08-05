import Simulation from "@/simulation/Simulation";
import Prey from "@/entities/Prey";
import Predator from "@/entities/Predator";
import Food from "@/entities/Food";

export const getConfig = (configData: any | null) => {
    const config = {
        //simulation
        'Simulation.INITIAL_FOODS': configData?.['Simulation.INITIAL_FOODS'] ?? Simulation.INITIAL_FOODS,
        'Simulation.MAX_FOODS': configData?.['Simulation.MAX_FOODS'] ?? Simulation.MAX_FOODS,
        'Simulation.MINIMUM_FOOD_COUNT': configData?.['Simulation.MINIMUM_FOOD_COUNT'] ?? Simulation.MINIMUM_FOOD_COUNT,
        'Simulation.INITIAL_PREYS': configData?.['Simulation.INITIAL_PREYS'] ?? Simulation.INITIAL_PREYS,
        'Simulation.MAX_PREYS': configData?.['Simulation.MAX_PREYS'] ?? Simulation.MAX_PREYS,
        'Simulation.INITIAL_PREDATORS': configData?.['Simulation.INITIAL_PREDATORS'] ?? Simulation.INITIAL_PREDATORS,
        'Simulation.MAX_PREDATORS': configData?.['Simulation.MAX_PREDATORS'] ?? Simulation.MAX_PREDATORS,
        'Simulation.MAX_FITTEST_PREYS_FROM_LAST_GENERATION': configData?.['Simulation.MAX_FITTEST_PREYS_FROM_LAST_GENERATION'] ?? Simulation.MAX_FITTEST_PREYS_FROM_LAST_GENERATION,
        'Simulation.MAX_FITTEST_PREDATORS_FROM_LAST_GENERATION': configData?.['Simulation.MAX_FITTEST_PREDATORS_FROM_LAST_GENERATION'] ?? Simulation.MAX_FITTEST_PREDATORS_FROM_LAST_GENERATION,

        //prey
        'Prey.MUTATION_RATE': configData?.['Prey.MUTATION_RATE'] ?? Prey.MUTATION_RATE,
        'Prey.DEFAULT_VISION_STAT': configData?.['Prey.DEFAULT_VISION_STAT'] ?? Prey.DEFAULT_VISION_STAT,
        'Prey.DEFAULT_SIZE_STAT': configData?.['Prey.DEFAULT_SIZE_STAT'] ?? Prey.DEFAULT_SIZE_STAT,
        'Prey.DEFAULT_SPEED_STAT': configData?.['Prey.DEFAULT_SPEED_STAT'] ?? Prey.DEFAULT_SPEED_STAT,
        'Prey.MAX_MUTATED_VALUE': configData?.['Prey.MAX_MUTATED_VALUE'] ?? Prey.MAX_MUTATED_VALUE,
        'Prey.MIN_MUTATED_VALUE': configData?.['Prey.MIN_MUTATED_VALUE'] ?? Prey.MIN_MUTATED_VALUE,
        'Prey.DEFAULT_SELF_REPRODUCTION_PROBABILITY': configData?.['Prey.DEFAULT_SELF_REPRODUCTION_PROBABILITY'] ?? Prey.DEFAULT_SELF_REPRODUCTION_PROBABILITY,
        'Prey.DEFAULT_CROSS_REPRODUCTION_PROBABILITY': configData?.['Prey.DEFAULT_CROSS_REPRODUCTION_PROBABILITY'] ?? Prey.DEFAULT_CROSS_REPRODUCTION_PROBABILITY,
        'Prey.REPRODUCTION_TYPE': configData?.['Prey.REPRODUCTION_TYPE'] ?? Prey.REPRODUCTION_TYPE,
        'Prey.CHANGE_DIRECTION_PROBABILITY': configData?.['Prey.CHANGE_DIRECTION_PROBABILITY'] ?? Prey.CHANGE_DIRECTION_PROBABILITY,

        //predator
        'Predator.MUTATION_RATE': configData?.['Predator.MUTATION_RATE'] ?? Predator.MUTATION_RATE,
        'Predator.DEFAULT_VISION_STAT': configData?.['Predator.DEFAULT_VISION_STAT'] ?? Predator.DEFAULT_VISION_STAT,
        'Predator.DEFAULT_SIZE_STAT': configData?.['Predator.DEFAULT_SIZE_STAT'] ?? Predator.DEFAULT_SIZE_STAT,
        'Predator.DEFAULT_SPEED_STAT': configData?.['Predator.DEFAULT_SPEED_STAT'] ?? Predator.DEFAULT_SPEED_STAT,
        'Predator.MAX_MUTATED_VALUE': configData?.['Predator.MAX_MUTATED_VALUE'] ?? Predator.MAX_MUTATED_VALUE,
        'Predator.MIN_MUTATED_VALUE': configData?.['Predator.MIN_MUTATED_VALUE'] ?? Predator.MIN_MUTATED_VALUE,
        'Predator.DEFAULT_SELF_REPRODUCTION_PROBABILITY': configData?.['Predator.DEFAULT_SELF_REPRODUCTION_PROBABILITY'] ?? Predator.DEFAULT_SELF_REPRODUCTION_PROBABILITY,
        'Predator.DEFAULT_CROSS_REPRODUCTION_PROBABILITY': configData?.['Predator.DEFAULT_CROSS_REPRODUCTION_PROBABILITY'] ?? Predator.DEFAULT_CROSS_REPRODUCTION_PROBABILITY,
        'Predator.REPRODUCTION_TYPE': configData?.['Predator.REPRODUCTION_TYPE'] ?? Predator.REPRODUCTION_TYPE,
        'Predator.CHANGE_DIRECTION_PROBABILITY': configData?.['Predator.CHANGE_DIRECTION_PROBABILITY'] ?? Predator.CHANGE_DIRECTION_PROBABILITY,

        //food
        'Food.DEFAULT_SIZE': configData?.['Food.DEFAULT_SIZE'] ?? Food.DEFAULT_SIZE,
        'Food.REPRODUCTION_PROBABILITY': configData?.['Food.REPRODUCTION_PROBABILITY'] ?? Food.REPRODUCTION_PROBABILITY,
        'Food.DECAY_RATE': configData?.['Food.DECAY_RATE'] ?? Food.DECAY_RATE,
    };

    return config;
}
