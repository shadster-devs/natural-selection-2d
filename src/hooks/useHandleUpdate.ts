import { useEffect, useState } from 'react';
import Simulation from '../simulation/Simulation';

const useHandleUpdate = (simulation: Simulation, speedMultiplier : number) => {
    const [isRunning, setIsRunning] = useState(false);
    const [preys, setPreys] = useState(simulation?.preys);
    const [foods, setFoods] = useState(simulation?.foods);
    const [predators, setPredators] = useState(simulation?.predators);
    const [status, setStatus] = useState("paused"); // Simulation status

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            setStatus('running');
            interval = setInterval(() => {
                simulation.update();
                setPreys([...simulation?.preys]);
                setFoods([...simulation?.foods]);
                setPredators([...simulation?.predators]);
            }, 1000/speedMultiplier);
        } else {
            setStatus('paused');
        }
        return () => clearInterval(interval);
    }, [isRunning, simulation,speedMultiplier]);

    const start = () => {
        if (status !== 'running') {
            setIsRunning(true);
            setStatus('running');
        }
    };

    const stop = () => {
        setIsRunning(false);
        setStatus('paused');
    };

    const reset = () => {
        setIsRunning(false);
        setStatus('paused');
        simulation.initialize();
        setPreys([...simulation?.preys]);
        setFoods([...simulation?.foods]);
        setPredators([...simulation?.predators]);
    };

    // Stop simulation if no more preys or predators
    useEffect(() => {
        if (preys?.length === 0 && predators?.length === 0) {
            setIsRunning(false);
            setStatus('stopped');
        }
    }, [preys, predators]);

    return { start, stop, reset, preys, foods, predators, status };
};

export default useHandleUpdate;
