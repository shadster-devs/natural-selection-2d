import React, { useEffect, useState } from 'react';
import NaturalSelectionSimulator from "@/components/NaturalSelectionSimulator";


const Home: React.FC = () => {

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        setWidth(window.outerWidth);
        setHeight(window.outerHeight);
    }, []);

    return (
        <NaturalSelectionSimulator width={width} height={height} />
    );

};

export default Home;
