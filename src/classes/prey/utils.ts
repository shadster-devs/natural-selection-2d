// src/components/prey/utils.ts
import Prey, { preyMutationRate } from '@/classes/prey/prey';

export const getPreyRandomMutation = (base: number): number => {
    const mutatedValue = base + (Math.random() < 0.5 ? -1 : 1) * Math.random() * preyMutationRate;
    return mutatedValue < 0 ? 2 : mutatedValue;
};

export const addPreys = (numOfPreys: number, width: number, height: number): Prey[] => {
    return Array.from({ length: numOfPreys }).map(() =>
        new Prey(
            Math.random() * width,
            Math.random() * height,
            getPreyRandomMutation(50),
            getPreyRandomMutation(100),
            getPreyRandomMutation(50),
            'blue'
        )
    );
};
