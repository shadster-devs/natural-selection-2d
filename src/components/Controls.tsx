import React from 'react';
import {FiPause, FiPlay} from "react-icons/fi";
import {RxReload} from "react-icons/rx";
import styles from './Controls.module.scss';
import {TbZoomReset} from "react-icons/tb";
import {FaCog} from "react-icons/fa";

interface ControlsProps {
    onStart: () => void;
    onStop: () => void;
    onReset: () => void;
    status: string;
    speedMultiplier: number;
    handleSpeedChange: React.ChangeEventHandler<HTMLInputElement>;
    zoomReset: () => void;
    toggleSideMenu: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onStart, onStop, onReset, status,speedMultiplier,handleSpeedChange,zoomReset,toggleSideMenu }) => {
    return (
        <div className={styles['controls-container']}>
            <button onClick={status === 'running' ? onStop : onStart}>
                {status === 'running' ? <FiPause color={'black'} fill={'black'}/> :
                    <FiPlay color={'black'} fill={'black'}/>}
            </button>
            <button onClick={onReset}><RxReload color={'black'} fill={'black'}/></button>
            <label>
                x <input type="number" value={speedMultiplier} onChange={handleSpeedChange}/>
            </label>
            <button onClick={zoomReset}><TbZoomReset color={'black'}/></button>
            <button onClick={toggleSideMenu}><FaCog color={'black'}/></button>

        </div>
    );
};

export default Controls;
