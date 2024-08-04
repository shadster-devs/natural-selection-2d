import React, { useEffect, useRef, useState } from 'react';
import Simulation from '../simulation/Simulation';
import CanvasRenderer from '../components/CanvasRenderer';
import Controls from '../components/Controls';
import StatsDisplay from '../components/StatsDisplay';
import useHandleUpdate from '../hooks/useHandleUpdate';
import useCanvasZoom from '../hooks/useCanvasZoom';
import SideMenu from '../components/SideMenu';
import styles from '../styles/Home.module.scss';
import {getFromLocalStorage, LocalStorageKeys} from "@/utils/localStorageUtil";
import {getConfig} from "@/utils/utils";

interface NaturalSelectionSimulatorProps {
    width: number;
    height: number;
}

const NaturalSelectionSimulator: React.FC<NaturalSelectionSimulatorProps> = (props) => {

    const { width, height } = props;

    const simulationRef = useRef<Simulation | null>(null!);

    const [isInitialized, setIsInitialized] = useState(false);
    const [isMenuCollapsed, setIsMenuCollapsed] = useState(true);
    const [speedMultiplier, setSpeedMultiplier] = useState(99);

    const initialConfig = getConfig(null);

    const [config, setConfig] = useState(initialConfig);


    useEffect(() => {
        const localConfig = getFromLocalStorage(LocalStorageKeys.CONFIG);
        if (localConfig) {
            setConfig(getConfig(localConfig));
        }

    }, []);


    React.useEffect(() => {
        simulationRef.current = new Simulation(width, height);
        simulationRef.current?.initialize();
    }, [width,height]);


    const { start, stop, reset, preys, foods, predators, status } = useHandleUpdate(simulationRef.current!, speedMultiplier);
    const { zoomLevel, canvasPosition, handleReset } = useCanvasZoom(simulationRef.current?.width || width, simulationRef.current?.height || height);

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
            {config &&<SideMenu isCollapsed={isMenuCollapsed} initialConfig={config} />}
            {simulationRef.current && (
                <CanvasRenderer
                    preys={preys || []}
                    foods={foods || []}
                    predators={predators || []}
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

export default NaturalSelectionSimulator;
