import React, { useEffect, useState } from 'react';
import styles from './SideMenu.module.scss';
import Prey from "@/entities/Prey";
import Predator from "@/entities/Predator";
import Simulation from "@/simulation/Simulation";
import Food from "@/entities/Food";

interface Config {
    [key: string]: number | string;
}

interface SideMenuProps {
    isCollapsed: boolean;
    initialConfig: Config;
}

const formatKey = (key: string) => {
    return  key.split('_').join(' ').toWellFormed();
};

const SideMenu: React.FC<SideMenuProps> = ({ isCollapsed, initialConfig, onUpdate }) => {
    const [config, setConfig] = useState<Config>(initialConfig);

    const handleUpdate = (config: { [key: string]: number | string }) => {
        for (const key in config) {
            const [className, variableName] = key.split('.');
            switch (className) {
                case 'Prey':
                    (Prey as any)[variableName] = config[key];
                    break;
                case 'Predator':
                    (Predator as any)[variableName] = config[key];
                    break;
                case 'Simulation':
                    (Simulation as any)[variableName] = config[key];
                    break;
                case 'Food':
                    (Food as any)[variableName] = config[key];
                    break;
            }
        }
    };

    useEffect(() => {
        handleUpdate(config);
    }, [config]);

    const handleChange = (field: string, value: number | string) => {
        setConfig(prevConfig => ({
            ...prevConfig,
            [field]: value
        }));
    };

    const groupedConfig = Object.entries(config).reduce((acc: { [key: string]: Config }, [key, value]) => {
        const [className, variableName] = key.split('.');
        if (!acc[className]) acc[className] = {};
        acc[className][variableName] = value;
        return acc;
    }, {});

    return (
        <div className={`${styles['control-side-menu']} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.content}>
                {Object.keys(groupedConfig).map(className => (
                    <div key={className} className={styles.classSection}>
                        <h3>{className}</h3>
                        {Object.entries(groupedConfig[className]).map(([variableName, value]) => (
                            <label key={variableName} className={styles.label}>
                                {formatKey(variableName)}
                                <input
                                    type={typeof value === 'number' ? 'number' : 'text'}
                                    value={value}
                                    onChange={(e) => handleChange(`${className}.${variableName}`, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
                                />
                            </label>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SideMenu;
