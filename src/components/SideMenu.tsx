import React, { useState } from "react";
import styles from './SideMenu.module.scss';
import Prey from "@/classes/prey/prey";
import Food from "@/classes/food/food";
import {Circle} from "@/components/KonvaWrapper";

interface SideMenuProps {
    isCollapsed: boolean;
    preys: Prey[];
    foods: Food[];
}



const SideMenu: React.FC<SideMenuProps> = (props) => {
    const { isCollapsed, foods,preys } = props;

    const avgPreySize = preys.reduce((acc, prey) => acc + prey.sizeStat, 0) / preys.length;
    const avgPreySpeed = preys.reduce((acc, prey) => acc + prey.speedStat, 0) / preys.length;
    const avgPreyVision = preys.reduce((acc, prey) => acc + prey.visionStat, 0) / preys.length;


    const preyCount = preys.length;
    const foodCount = foods.length;



    return (
        <div className={`${styles['control-side-menu']} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.content}>
                <h1>Stats</h1>
                <div>
                    <h2>Preys</h2>
                    <p>Count: {preyCount}</p>
                    <p>Avg Size: {avgPreySize.toFixed(2)}</p>
                    <p>Avg Speed: {avgPreySpeed.toFixed(2)}</p>
                    <p>Avg Vision: {avgPreyVision.toFixed(2)}</p>
                    <Circle radius={avgPreySize}  fill={'red'} />
                    <Circle radius={avgPreyVision} stroke='black' strokeWidth={2}/>
                </div>
                <div>
                    <h2>Foods</h2>
                    <p>Count: {foodCount}</p>
                </div>
            </div>

        </div>
    );
};

export default SideMenu;
