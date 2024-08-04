import React, { useEffect, useRef, useState } from 'react';
import Simulation from '../simulation/Simulation';
import CanvasRenderer from '../components/CanvasRenderer';
import Controls from '../components/Controls';
import StatsDisplay from '../components/StatsDisplay';
import useHandleUpdate from '../hooks/useHandleUpdate';
import useCanvasZoom from '../hooks/useCanvasZoom';
import SideMenu from '../components/SideMenu';
import styles from '../styles/Home.module.scss';
import { FaCog } from 'react-icons/fa';
import Prey from "@/entities/Prey";
import Predator from "@/entities/Predator";
import Food from "@/entities/Food";
import useWindowSize from "@/hooks/useWindowSize";

const Home: React.FC = () => {
    const simulationRef = useRef<Simulation | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isMenuCollapsed, setIsMenuCollapsed] = useState(true);
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const {width, height} = useWindowSize();

    const initialConfig = {
        //simulation
        'Simulation.MAX_PREYS': Simulation.MAX_PREYS,
        'Simulation.MAX_FOODS': Simulation.MAX_FOODS,
        'Simulation.MAX_PREDATORS': Simulation.MAX_PREDATORS,
        'Simulation.INITIAL_PREYS': Simulation.INITIAL_PREYS,
        'Simulation.INITIAL_FOODS': Simulation.INITIAL_FOODS,
        'Simulation.INITIAL_PREDATORS': Simulation.INITIAL_PREDATORS,
        'Simulation.MINIMUM_FOOD_COUNT': Simulation.MINIMUM_FOOD_COUNT,
        'Simulation.MAX_FITTEST_PREYS_FROM_LAST_GENERATION': Simulation.MAX_FITTEST_PREYS_FROM_LAST_GENERATION,
        'Simulation.MAX_FITTEST_PREDATORS_FROM_LAST_GENERATION': Simulation.MAX_FITTEST_PREDATORS_FROM_LAST_GENERATION,

        //prey
        'Prey.MUTATION_RATE': Prey.MUTATION_RATE,
        'Prey.DEFAULT_VISION_STAT': Prey.DEFAULT_VISION_STAT,
        'Prey.DEFAULT_SIZE_STAT': Prey.DEFAULT_SIZE_STAT,
        'Prey.DEFAULT_SPEED_STAT': Prey.DEFAULT_SPEED_STAT,
        'Prey.DEFAULT_SELF_REPRODUCTION_PROBABILITY': Prey.DEFAULT_SELF_REPRODUCTION_PROBABILITY,
        'Prey.DEFAULT_CROSS_REPRODUCTION_PROBABILITY': Prey.DEFAULT_CROSS_REPRODUCTION_PROBABILITY,
        'Prey.MIN_MUTATED_VALUE': Prey.MIN_MUTATED_VALUE,
        'Prey.MAX_MUTATED_VALUE': Prey.MAX_MUTATED_VALUE,

        //predator
        'Predator.MUTATION_RATE': Predator.MUTATION_RATE,
        'Predator.DEFAULT_VISION_STAT': Predator.DEFAULT_VISION_STAT,
        'Predator.DEFAULT_SIZE_STAT': Predator.DEFAULT_SIZE_STAT,
        'Predator.DEFAULT_SPEED_STAT': Predator.DEFAULT_SPEED_STAT,
        'Predator.DEFAULT_SELF_REPRODUCTION_PROBABILITY': Predator.DEFAULT_SELF_REPRODUCTION_PROBABILITY,
        'Predator.DEFAULT_CROSS_REPRODUCTION_PROBABILITY': Predator.DEFAULT_CROSS_REPRODUCTION_PROBABILITY,
        'Predator.MIN_MUTATED_VALUE': Predator.MIN_MUTATED_VALUE,
        'Predator.MAX_MUTATED_VALUE': Predator.MAX_MUTATED_VALUE,

        //food
        'Food.DEFAULT_SIZE': Food.DEFAULT_SIZE,
        'Food.REPRODUCTION_PROBABILITY': Food.REPRODUCTION_PROBABILITY,
        'Food.DECAY_RATE': Food.DECAY_RATE,
    };

    if (!simulationRef.current) {
        simulationRef.current = new Simulation(width, height);
    }

    const { start, stop, reset, preys, foods, predators, status } = useHandleUpdate(simulationRef.current!, speedMultiplier);
    const { zoomLevel, canvasPosition, handleReset } = useCanvasZoom(simulationRef.current!.width, simulationRef.current!.height);

    useEffect(() => {
        if (!isInitialized && simulationRef.current) {
            simulationRef.current!.initialize();
            setIsInitialized(true);
        }
    }, [isInitialized]);

    const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSpeedMultiplier( Math.min(Math.max(Number(event.target.value), 1), 999));
    };

    return (
        <div className={styles.container}>
            <Controls onStart={start} onStop={stop} onReset={reset} status={status}  speedMultiplier={speedMultiplier} handleSpeedChange={handleSpeedChange} zoomReset={handleReset} toggleSideMenu={()=>setIsMenuCollapsed(!isMenuCollapsed)} />
            <SideMenu isCollapsed={isMenuCollapsed} initialConfig={initialConfig} />
            {simulationRef.current && (
                <CanvasRenderer
                    preys={preys}
                    foods={foods}
                    predators={predators}
                    width={simulationRef.current!.width}
                    height={simulationRef.current!.height}
                    zoomLevel={zoomLevel}
                    canvasPosition={canvasPosition}
                />
            )}
            {simulationRef.current && <StatsDisplay simulation={simulationRef.current!} />}
        </div>
    );
};

export default Home;
