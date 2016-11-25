
export class Room{
    list: Array<Connection> = [];
    x: number;
    y: number;

    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }
}

export class Connection{
    static strings = ['a', 'b', 'c', 'd', 'e', 'f']
    x: number;
    y: number;
    id: number;
    room: Room;
    name: string;
    color: string = "";

    constructor() {
        for(let i = 0; i < 6; i ++)
            this.color += (Math.random() < 0.5 ? Connection.strings[Math.floor(Math.random()*6)] : Math.floor(Math.random()*10))
    }
}
