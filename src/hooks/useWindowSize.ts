import {useEffect, useState} from "react";


const useWindowSize = () => {
    const [size, setSize] = useState({
        width: 1728,
        height: 1040,
    });

    useEffect(() => {
        setSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }, []);

    return { width: size.width, height: size.height };
}

export default useWindowSize;