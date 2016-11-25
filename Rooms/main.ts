/// <reference path="lib/phaser.d.ts"/>
/// <reference path="lib/socket.io-client.d.ts"/>

var game: Phaser.Game;
var cursors: Phaser.CursorKeys;
var list: Array<Entity>;
var socket: SocketIOClient.Socket;
var player: Entity;
var group: Phaser.Group;
var shadowtex: Phaser.RenderTexture;
var shadowsprite: Phaser.Sprite;
var roomtext: Phaser.Text;
var chatbox : ChatBox;

class Main {
    constructor() {
        game = new Phaser.Game(307, 307, Phaser.CANVAS, 'content', {
        create: this.create, update: this.update,
        render: this.render, preload: this.preload,
        preRender: this.preRender});
    }
        
    preload = () => {
        this.loadAll(["char", "layer1", "layer2", "blank" , "white"]);

        //game.load.bitmapFont('font', 'assets/fonts/font.png', 'assets/fonts/font.xml');

        //load shadows
        for(let i = 12; i < 28; i++){
            let w = Math.ceil((i * 1 / 1.3 + Math.pow(i, 1.5)/200.0)/2.0)*2.0;
            game.load.image("shadow"+i, "assets/shadows/shadow" + w + ".png");
        }
    }
    
    public load(name: string){
    	game.load.image(name, "assets/" + name + ".png");
    }

    public loadAll(names: Array<string>){
        for (let name of names)
    	game.load.image(name, "assets/" + name + ".png");
    }

    create() {
        game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;  
		game.scale.setUserScale(2, 2);
        
        
        game.renderer.renderSession.roundPixels = true;  
		Phaser.Canvas.setImageRenderingCrisp(game.canvas)
       
       game.stage.backgroundColor = "#ffffff";

        shadowtex = game.add.renderTexture(307, 307, 'shadow');
        shadowsprite = game.add.sprite(0, 0, shadowtex)
        shadowsprite.alpha = 0.2

        roomtext = game.add.text(game.width/2, 32, 'Connecting...', { font: "12px Arial", fill: "#ff0044", align: "center" });

        chatbox = new ChatBox()

        game.input.keyboard.addKey(Phaser.KeyCode.TAB).onDown.add(()=>{
            socket.emit('switch room', {type: "next"})
        })

        game.input.keyboard.addKey(Phaser.KeyCode.CONTROL).onDown.add(()=>{
            socket.emit('switch room', {type: "last"})
        })

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.time.advancedTiming = true;

        group = game.add.group();

        cursors = game.input.keyboard.createCursorKeys();
		
		list = new Array<Entity>();

        player = new Player();
        player.sprite.x = game.width/2;
        player.sprite.y = game.height/2;
		list.push(player);

        socket = io.connect('http://2605:a000:110f:37:8994:91ae:3744:f08f:7576');

        console.log("Connecting to server...")

        socket.on('connect', Main.onSocketConnected)
        socket.on('disconnect', Main.onSocketDisconnect)
        socket.on('new player', Main.onNewPlayer)
        socket.on('move player', Main.onMovePlayer)
        socket.on('remove player', Main.onRemovePlayer)
        socket.on('room data', Main.onRoomData)
        socket.on('chat message', Main.onChatMessage)
    }

    update() {
        shadowtex.clear()

        game.input.update();
        group.sort('y', Phaser.Group.SORT_ASCENDING);
            
        for (let entity of list) {
        	entity.update();	
        }

        for(let entity of list){
            if(entity instanceof Player) continue
            game.physics.arcade.collide(player.sprite, entity.sprite, null, null, this);
        }

        socket.emit('move player', { x: player.sprite.x, y: player.sprite.y})
    }

    preRender() {
        for(let entity of list){
            entity.render();
        }
    }

    render() {
        
    }

    static onChatMessage(data){
        chatbox.addMessage(data)
    }

    static onRoomData(data){
        Main.resetWorld();
        roomtext.text = data.name;
    }

    static resetWorld(){
        list.forEach(function (other : Entity) {
            if(other == player) return
            other.removed()
            other.sprite.kill()
        })
        list = [player, new MapLayer("layer1"), new MapLayer("layer2")]
        shadowsprite.sendToBack();
        list[1].sprite.sendToBack();
        chatbox.reset()

        for(let entity of list){
            entity.added()
        }

        list.push(new Collider(0,0,7,307), new Collider(game.width - 7,0,7,307), new Collider(0,game.height - 7,307,7))
    }

    static onSocketConnected = () => {
        
        console.log('Connected to socket server')

        socket.emit('new player', {name: 'player' + Math.floor(Math.random()*99)})
    }

    static onSocketDisconnect() {
        console.log('Disconnected from socket server')
    }

    static onNewPlayer(data) {
        console.log('New player connected:', data.id)

        // Avoid possible duplicate players
        let duplicate = getPlayer(data.id)
        if (duplicate) {
            console.log('Duplicate player!')
            return
        }

        // Add new player to the remote players array
        list.push(new Player(data.id, data.x, data.y))
    }

    static onMovePlayer(data) {
        let movePlayer = getPlayer(data.id)
        
        // Player not found
        if (movePlayer == null || movePlayer == player) {
            console.log('Player not found: ', data.id)
            return
        }

        // Update player position
        movePlayer.sprite.x = data.x
        movePlayer.sprite.y = data.y
    }

    static onRemovePlayer(data) {
        let removePlayer = getPlayer(data.id)

        // Player not found
        if (!removePlayer) {
            console.log('Player not found: ', data.id)
            return
        }

        removePlayer.remove()
    }
}

function getPlayer (id) : Player{
    for (let i = 0; i < list.length; i++) {
        if (list[i] instanceof Player && (list[i]as Player).id == id) {
            return list[i] as Player
        }
    }

    return null;
}

class ChatBox{
    chatopen: boolean = false;
    chatmessage: string = "";
    sprite: Phaser.Sprite;
    text: Phaser.Text;
    texts: Array<Phaser.Text> = [];
    bheld: number;
    offset = 8;

    constructor(){
        game.input.keyboard.addKey(Phaser.KeyCode.ENTER).onDown.add(()=>{
            if(this.chatmessage != "" && this.chatopen){
                socket.emit('chat message', {message: this.chatmessage})
            }
            
            this.chatopen = !this.chatopen;
            this.sprite.alpha = this.chatopen ? 0.5 : 0;
            this.text.alpha = this.chatopen ? 1 : 0;
            this.chatmessage = "";
            this.updatem()
        })

        game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE).onUp.add(()=>{
            this.bheld = 0;
        })

        game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE).onHoldCallback = (()=>{
            if(this.bheld % Phaser.Math.clamp((20 - this.bheld/3), 4, 20) != 0){
                this.bheld ++
                return;
            }
            this.chatmessage = this.chatmessage.substr(0, this.chatmessage.length - 1)
            this.updatem()
            this.bheld ++
        })

        game.input.keyboard.onPressCallback = () =>{
            if(this.chatopen){
                this.chatmessage += game.input.keyboard.lastChar
                if(this.chatmessage.length > 62) this.chatmessage = this.chatmessage.substring(0, 62)
                this.updatem()
            }
        }

        let height = 70;

        this.sprite = game.add.sprite(0, game.height - height, 'white')
        this.sprite.width = game.width;
        this.sprite.height = height;
        this.sprite.alpha = 0;
        this.sprite.tint = 0x000000;
        this.text = game.add.text(this.offset, game.height - 15, '', { font: "10px Arial", fill: "#ffffff"});
        this.text.alpha = 0;
    }
    
    addMessage(data){
        let text = game.add.text(this.offset, game.height - 27, data.sender + ": " + data.message, { font: "10px Arial", fill: "#ffffff"});
        text.addColor('#ffffff', data.sender.length+1)
        text.addColor("#" + data.color, 0)
        this.texts.push(text)
        
        if(this.texts.length > 4){
            this.texts[0].kill()
            this.texts = this.texts.splice(1, this.texts.length);
        }

        for(let i = 0; i < this.texts.length; i ++){
            let item = this.texts[i]
            item.y = game.height- 15 -(this.texts.length - i)*13;
        }
    }

    updatem(){
        this.text.text = (this.chatopen ? "> " : "") + this.chatmessage
        this.text.addColor('#ffff00', 2)
    }

    reset(){
        game.world.bringToTop(this.sprite)
        game.world.bringToTop(this.text)

        for(let text of this.texts)
            game.world.bringToTop(text)
    }
}

abstract class Entity{
	sprite: Phaser.Sprite;
	image: HTMLImageElement;
    shadow: Entity;
	
	constructor(name: string, draw=true, isgroup=true) {
        if(!draw) return
		this.image = game.cache.getImage(name);

        if(isgroup)
            this.sprite = group.create(-this.image.width / 2 + game.width/2, -this.image.height / 2 + game.height/2, name);
        else
		    this.sprite = game.add.sprite(-this.image.width / 2 + game.width/2, -this.image.height / 2 + game.height/2, name);
	}

    addShadow(){
        this.shadow = new Shadow("shadow" + this.image.width, this);
        list.push(this.shadow)
    }

    render(){}
	update (){}
    added(){}
    removed(){
        if(this.shadow != null) this.shadow.remove();
    }

    remove(){
        this.removed();
        this.sprite.kill();
        list.splice(list.indexOf(this), 1)
    }
}

class Shadow extends Entity{
    follow: Entity;

    constructor(name: string, follow : Entity){
        super(name, false, false)

        this.image = game.cache.getImage(name);
        this.sprite = game.make.sprite(0,0,name)
        
        this.follow = follow;
        this.sprite.sendToBack()
        this.sprite.moveUp().moveUp()
    }

    render(){
        shadowtex.renderXY(this.sprite, this.follow.sprite.x + this.follow.image.width/2 - this.image.width/2, this.follow.sprite.y + this.follow.image.height - this.image.height/2-1)
    }
}

class Collider extends Entity{
    constructor(x : number, y : number, width: number, height: number) {
        super("blank");
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.body.immovable = true;
        this.sprite.body.setSize(width, height, 0, 0);
    }
}

class MapLayer extends Entity{
	constructor(name: string) { 
        super(name, true, false); 
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.immovable = true;
        this.sprite.body.setSize(307, 60, 0, 0);
    }
}

class Player extends Entity{
    id: string

	constructor(id = null, x = 10, y = 10) { 
        super("char"); 
        this.id = id; 
        this.sprite.x = x; 
        this.sprite.y = y;

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        let w = 16;
        let h = 8;
        this.sprite.body.setSize(w, h, this.image.width/2-w/2, this.image.height - h);
	    this.sprite.body.collideWorldBounds = true;

        this.addShadow();
    }
		
	update (){

        if(this.id != null) return

		let speed = 10 * game.time.elapsed;
		if (cursors.down.isDown)
            this.sprite.body.velocity.y = speed;
        else if (cursors.up.isDown)
            this.sprite.body.velocity.y = -speed;
        else
            this.sprite.body.velocity.y = 0;

        if (cursors.left.isDown) 
            this.sprite.body.velocity.x = -speed;
        else if (cursors.right.isDown) 
            this.sprite.body.velocity.x = speed;
        else
            this.sprite.body.velocity.x = 0;
	}

    added(){
        this.addShadow()
    }
}

window.onload = () => {
    var game = new Main();
};