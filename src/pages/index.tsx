import React, {useEffect, useState} from 'react';
import NaturalSelectionSimulator from "@/components/NaturalSelectionSimulator";
import Head from "next/head";


const Home: React.FC = () => {

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }, []);

    return (
        <>
            <Head>
                <title>Natural Selection</title>
                <link rel="icon" href="/naturalSelection.svg"/>
            </Head>
            <NaturalSelectionSimulator width={width} height={height}/>
        </>
    );

};

export default Home;
