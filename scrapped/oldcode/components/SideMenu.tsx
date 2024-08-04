import React, { useEffect, useState } from 'react';
import styles from './SideMenu.module.scss';

interface Config {
    [key: string]: number;
}

interface SideMenuProps {
    isCollapsed: boolean;
    initialConfig: Config;
    onUpdate: (config: Config) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isCollapsed, initialConfig, onUpdate }) => {
    const [config, setConfig] = useState<Config>(initialConfig);

    useEffect(() => {
        onUpdate(config);
    }, [config]);

    const handleChange = (field: string, value: number) => {
        setConfig(prevConfig => ({
            ...prevConfig,
            [field]: value
        }));
    };

    return (
        <div className={`${styles['control-side-menu']} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.content}>
                {Object.keys(initialConfig).map((key) => (
                    <label key={key}>
                        {key}:
                        <input
                            type="number"
                            value={config[key]}
                            onChange={(e) => handleChange(key, Number(e.target.value))}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
};

export default SideMenu;
