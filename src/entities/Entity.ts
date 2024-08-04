abstract class Entity {
    id: string;
    x: number;
    y: number;

    constructor(id: string, x: number, y: number) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    abstract update(entities: Entity[] , width : number, height : number): void;
}

export default Entity;
