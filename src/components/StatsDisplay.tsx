import React, { useEffect, useState } from 'react';
import Simulation from '../simulation/Simulation';
import styles from './StatsDisplay.module.scss';

interface StatsDisplayProps {
    simulation: Simulation;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ simulation }) => {
    const [avgPreySize, setAvgPreySize] = useState('0.00');
    const [avgPreySpeed, setAvgPreySpeed] = useState('0.00');
    const [avgPreyVision, setAvgPreyVision] = useState('0.00');
    const [avgPreyEnergy, setAvgPreyEnergy] = useState('0.00');
    const [avgPredatorSize, setAvgPredatorSize] = useState('0.00');
    const [avgPredatorSpeed, setAvgPredatorSpeed] = useState('0.00');
    const [avgPredatorVision, setAvgPredatorVision] = useState('0.00');
    const [avgPredatorEnergy, setAvgPredatorEnergy] = useState('0.00');

    useEffect(() => {
        const calculateStats = () => {
            if (simulation.preys.length) {
                const avgPreyStats = simulation.preys.reduce((acc, prey) => {
                    acc.sizeStat += prey.sizeStat;
                    acc.speedStat += prey.speedStat;
                    acc.visionStat += prey.visionStat;
                    acc.energy += prey.energy;
                    return acc;
                }, { sizeStat: 0, speedStat: 0, visionStat: 0, energy: 0 });

                setAvgPreySize((avgPreyStats.sizeStat / simulation.preys.length).toFixed(2));
                setAvgPreySpeed((avgPreyStats.speedStat / simulation.preys.length).toFixed(2));
                setAvgPreyVision((avgPreyStats.visionStat / simulation.preys.length).toFixed(2));
                setAvgPreyEnergy((avgPreyStats.energy / simulation.preys.length).toFixed(2));
            } else {
                setAvgPreySize('0.00');
                setAvgPreySpeed('0.00');
                setAvgPreyVision('0.00');
                setAvgPreyEnergy('0.00');
            }

            if (simulation.predators.length) {
                const avgPredatorStats = simulation.predators.reduce((acc, predator) => {
                    acc.sizeStat += predator.sizeStat;
                    acc.speedStat += predator.speedStat;
                    acc.visionStat += predator.visionStat;
                    acc.energy += predator.energy;
                    return acc;
                }, { sizeStat: 0, speedStat: 0, visionStat: 0, energy: 0 });

                setAvgPredatorSize((avgPredatorStats.sizeStat / simulation.predators.length).toFixed(2));
                setAvgPredatorSpeed((avgPredatorStats.speedStat / simulation.predators.length).toFixed(2));
                setAvgPredatorVision((avgPredatorStats.visionStat / simulation.predators.length).toFixed(2));
                setAvgPredatorEnergy((avgPredatorStats.energy / simulation.predators.length).toFixed(2));
            } else {
                setAvgPredatorSize('0.00');
                setAvgPredatorSpeed('0.00');
                setAvgPredatorVision('0.00');
                setAvgPredatorEnergy('0.00');
            }
        };

        calculateStats();
    }, [simulation.preys, simulation.predators]);

    return (
        <div id="stats" className={styles.stats}>
            <p>Number of Preys: {simulation.preys.length}</p>
            <p>Number of Foods: {simulation.foods.length}</p>
            <p>Number of Predators: {simulation.predators.length}</p>
            <div style={{ display: 'flex', flexDirection: 'row', gridGap: '1rem' }}>
                <div>
                    <h2>Preys</h2>
                    <p>Avg Size: {avgPreySize}</p>
                    <p>Avg Speed: {avgPreySpeed}</p>
                    <p>Avg Vision: {avgPreyVision}</p>
                    <p>Avg Energy: {avgPreyEnergy}</p>
                </div>
                <div>
                    <h2>Predators</h2>
                    <p>Avg Size: {avgPredatorSize}</p>
                    <p>Avg Speed: {avgPredatorSpeed}</p>
                    <p>Avg Vision: {avgPredatorVision}</p>
                    <p>Avg Energy: {avgPredatorEnergy}</p>
                </div>
            </div>
        </div>
    );
};

export default StatsDisplay;
