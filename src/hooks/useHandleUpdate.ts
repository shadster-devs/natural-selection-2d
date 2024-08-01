// src/components/prey/useHandleUpdate.ts
import { useEffect, useState, useCallback } from 'react';
import Prey from "@/classes/prey/prey";
import { addPreys } from "@/classes/prey/utils";
import Food from "@/classes/food/food";
import {addFoods} from "@/classes/food/utils";

const useHandleUpdate = (numOfPreys: number, maxNumOfPreys: number, width: number, height: number, numOfFoods : number, maxNumOfFoods: number) => {


    const [foods, setFoods] = useState<Food[]>([]);

    const [preys, setPreys] = useState<Prey[]>([]);

    const initializePreys = useCallback(() => {
        const initialPreys = addPreys(numOfPreys, width, height);
        setPreys(initialPreys);
    }, [numOfPreys, width, height]);

    const initializeFoods = useCallback(() => {
        const initialFoods = addFoods(numOfFoods, width, height);
        setFoods(initialFoods);
    }, [numOfFoods, width, height]);

    useEffect(() => {
        initializePreys();
    }, [initializePreys]);

    useEffect(() => {
        initializeFoods();
    }, [initializeFoods]);

    const updatePreys = useCallback(() => {
        setPreys((prevPreys) => {

            const newPreys = prevPreys.filter((prey) => prey.isAlive())
                .map((prey) => {
                    prey.hasMoved = false;
                    return prey;
                });

            for (let i = 0; i < newPreys.length; i++) {
                // for (let j = i + 1; j < newPreys.length; j++) {
                //     if (newPreys[i].isCollidingWithPrey(newPreys[j])) {
                //         const newPrey = newPreys[i].reproduceWith(newPreys[j], width, height);
                //         if (newPrey) {
                //             newPreys.push(newPrey);
                //             if (newPreys.length > maxNumOfPreys) {
                //                 newPreys.splice(Math.floor(Math.random() * 2) ? i : j, 1);
                //             }
                //         }
                //     }
                // }
                for (let j = 0; j < foods.length; j++) {
                    let minDistance = 1000000;
                    let closestFood = null;
                    if (newPreys[i].isFoodVisible(foods[j])) {
                        const distance = newPreys[i].getDistanceToFood(foods[j]);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestFood = foods[j];
                        }
                        newPreys[i].moveTowardsFood(closestFood);

                    }
                }
            }

            for (let i = 0; i < newPreys.length; i++) {
                if (!newPreys[i].hasMoved) {
                    newPreys[i].move(width, height);
                }
                const newPrey = newPreys[i].reproduceAlone(width, height);
                if (newPrey) {
                    newPreys.push(newPrey);
                    if (newPreys.length > maxNumOfPreys) {
                        newPreys.splice(i, 1);
                    }
                }
            }

            return newPreys;
        });
    }, [width, height]);

    const updateFoods = useCallback(() => {
        setFoods((prevFoods) => {
            const newFoods = prevFoods
                .map((food) => {
                    if (food.isAlive()) {
                        return food;
                    }
                    return null;
                })
                .filter((food) => food !== null) as Food[];

            for (let i = 0; i < newFoods.length; i++) {
                for (let j = 0; j < preys.length; j++) {
                    if (preys[j].isCollidingWithFood(newFoods[i])) {
                        preys[j].eat();
                        newFoods.splice(i, 1);
                        break;
                    }
                }
            }

            for (let i = 0; i < newFoods.length; i++) {

                    if (newFoods.length < maxNumOfFoods) {
                        const newFood = newFoods[i].grow(width,height);
                        if (newFood) {
                            newFoods.push(newFood);
                        }
                    }

            }

            return newFoods;
        })
        }, [width, height, preys, foods]);


    return { preys, updatePreys, initializePreys , foods, updateFoods, initializeFoods};
};

export default useHandleUpdate;
