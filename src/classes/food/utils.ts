import Food from "@/classes/food/food";


export const addFoods = (numOfFoods: number, width: number, height: number): Food[] => {
    return Array.from({length: numOfFoods}).map(() =>
        new Food(
            Math.random() * width,
            Math.random() * height,
            40,
            'green'
        )
    );
};
