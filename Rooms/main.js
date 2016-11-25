/// <reference path="lib/phaser.d.ts"/>
/// <reference path="lib/socket.io-client.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var game;
var cursors;
var list;
var socket;
var player;
var group;
var shadowtex;
var shadowsprite;
var roomtext;
var chatbox;
var Main = (function () {
    function Main() {
        var _this = this;
        this.preload = function () {
            _this.loadAll(["char", "layer1", "layer2", "blank", "white"]);
            //game.load.bitmapFont('font', 'assets/fonts/font.png', 'assets/fonts/font.xml');
            //load shadows
            for (var i = 12; i < 28; i++) {
                var w = Math.ceil((i * 1 / 1.3 + Math.pow(i, 1.5) / 200.0) / 2.0) * 2.0;
                game.load.image("shadow" + i, "assets/shadows/shadow" + w + ".png");
            }
        };
        game = new Phaser.Game(307, 307, Phaser.CANVAS, 'content', {
            create: this.create, update: this.update,
            render: this.render, preload: this.preload,
            preRender: this.preRender });
    }
    Main.prototype.load = function (name) {
        game.load.image(name, "assets/" + name + ".png");
    };
    Main.prototype.loadAll = function (names) {
        for (var _i = 0; _i < names.length; _i++) {
            var name_1 = names[_i];
            game.load.image(name_1, "assets/" + name_1 + ".png");
        }
    };
    Main.prototype.create = function () {
        game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        game.scale.setUserScale(2, 2);
        game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(game.canvas);
        game.stage.backgroundColor = "#ffffff";
        shadowtex = game.add.renderTexture(307, 307, 'shadow');
        shadowsprite = game.add.sprite(0, 0, shadowtex);
        shadowsprite.alpha = 0.2;
        roomtext = game.add.text(game.width / 2, 32, 'Connecting...', { font: "12px Arial", fill: "#ff0044", align: "center" });
        chatbox = new ChatBox();
        game.input.keyboard.addKey(Phaser.KeyCode.TAB).onDown.add(function () {
            socket.emit('switch room', { type: "next" });
        });
        game.input.keyboard.addKey(Phaser.KeyCode.CONTROL).onDown.add(function () {
            socket.emit('switch room', { type: "last" });
        });
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.time.advancedTiming = true;
        group = game.add.group();
        cursors = game.input.keyboard.createCursorKeys();
        list = new Array();
        player = new Player();
        player.sprite.x = game.width / 2;
        player.sprite.y = game.height / 2;
        list.push(player);
        socket = io.connect('https://66.249.79.122:7576');
        console.log("Connecting to server...");
        socket.on('connect', Main.onSocketConnected);
        socket.on('disconnect', Main.onSocketDisconnect);
        socket.on('new player', Main.onNewPlayer);
        socket.on('move player', Main.onMovePlayer);
        socket.on('remove player', Main.onRemovePlayer);
        socket.on('room data', Main.onRoomData);
        socket.on('chat message', Main.onChatMessage);
    };
    Main.prototype.update = function () {
        shadowtex.clear();
        game.input.update();
        group.sort('y', Phaser.Group.SORT_ASCENDING);
        for (var _i = 0; _i < list.length; _i++) {
            var entity = list[_i];
            entity.update();
        }
        for (var _a = 0; _a < list.length; _a++) {
            var entity = list[_a];
            if (entity instanceof Player)
                continue;
            game.physics.arcade.collide(player.sprite, entity.sprite, null, null, this);
        }
        socket.emit('move player', { x: player.sprite.x, y: player.sprite.y });
    };
    Main.prototype.preRender = function () {
        for (var _i = 0; _i < list.length; _i++) {
            var entity = list[_i];
            entity.render();
        }
    };
    Main.prototype.render = function () {
    };
    Main.onChatMessage = function (data) {
        chatbox.addMessage(data);
    };
    Main.onRoomData = function (data) {
        Main.resetWorld();
        roomtext.text = data.name;
    };
    Main.resetWorld = function () {
        list.forEach(function (other) {
            if (other == player)
                return;
            other.removed();
            other.sprite.kill();
        });
        list = [player, new MapLayer("layer1"), new MapLayer("layer2")];
        shadowsprite.sendToBack();
        list[1].sprite.sendToBack();
        chatbox.reset();
        for (var _i = 0; _i < list.length; _i++) {
            var entity = list[_i];
            entity.added();
        }
        list.push(new Collider(0, 0, 7, 307), new Collider(game.width - 7, 0, 7, 307), new Collider(0, game.height - 7, 307, 7));
    };
    Main.onSocketDisconnect = function () {
        console.log('Disconnected from socket server');
    };
    Main.onNewPlayer = function (data) {
        console.log('New player connected:', data.id);
        // Avoid possible duplicate players
        var duplicate = getPlayer(data.id);
        if (duplicate) {
            console.log('Duplicate player!');
            return;
        }
        // Add new player to the remote players array
        list.push(new Player(data.id, data.x, data.y));
    };
    Main.onMovePlayer = function (data) {
        var movePlayer = getPlayer(data.id);
        // Player not found
        if (movePlayer == null || movePlayer == player) {
            console.log('Player not found: ', data.id);
            return;
        }
        // Update player position
        movePlayer.sprite.x = data.x;
        movePlayer.sprite.y = data.y;
    };
    Main.onRemovePlayer = function (data) {
        var removePlayer = getPlayer(data.id);
        // Player not found
        if (!removePlayer) {
            console.log('Player not found: ', data.id);
            return;
        }
        removePlayer.remove();
    };
    Main.onSocketConnected = function () {
        console.log('Connected to socket server');
        socket.emit('new player', { name: 'player' + Math.floor(Math.random() * 99) });
    };
    return Main;
})();
function getPlayer(id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] instanceof Player && list[i].id == id) {
            return list[i];
        }
    }
    return null;
}
var ChatBox = (function () {
    function ChatBox() {
        var _this = this;
        this.chatopen = false;
        this.chatmessage = "";
        this.texts = [];
        this.offset = 8;
        game.input.keyboard.addKey(Phaser.KeyCode.ENTER).onDown.add(function () {
            if (_this.chatmessage != "" && _this.chatopen) {
                socket.emit('chat message', { message: _this.chatmessage });
            }
            _this.chatopen = !_this.chatopen;
            _this.sprite.alpha = _this.chatopen ? 0.5 : 0;
            _this.text.alpha = _this.chatopen ? 1 : 0;
            _this.chatmessage = "";
            _this.updatem();
        });
        game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE).onUp.add(function () {
            _this.bheld = 0;
        });
        game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE).onHoldCallback = (function () {
            if (_this.bheld % Phaser.Math.clamp((20 - _this.bheld / 3), 4, 20) != 0) {
                _this.bheld++;
                return;
            }
            _this.chatmessage = _this.chatmessage.substr(0, _this.chatmessage.length - 1);
            _this.updatem();
            _this.bheld++;
        });
        game.input.keyboard.onPressCallback = function () {
            if (_this.chatopen) {
                _this.chatmessage += game.input.keyboard.lastChar;
                if (_this.chatmessage.length > 62)
                    _this.chatmessage = _this.chatmessage.substring(0, 62);
                _this.updatem();
            }
        };
        var height = 70;
        this.sprite = game.add.sprite(0, game.height - height, 'white');
        this.sprite.width = game.width;
        this.sprite.height = height;
        this.sprite.alpha = 0;
        this.sprite.tint = 0x000000;
        this.text = game.add.text(this.offset, game.height - 15, '', { font: "10px Arial", fill: "#ffffff" });
        this.text.alpha = 0;
    }
    ChatBox.prototype.addMessage = function (data) {
        var text = game.add.text(this.offset, game.height - 27, data.sender + ": " + data.message, { font: "10px Arial", fill: "#ffffff" });
        text.addColor('#ffffff', data.sender.length + 1);
        text.addColor("#" + data.color, 0);
        this.texts.push(text);
        if (this.texts.length > 4) {
            this.texts[0].kill();
            this.texts = this.texts.splice(1, this.texts.length);
        }
        for (var i = 0; i < this.texts.length; i++) {
            var item = this.texts[i];
            item.y = game.height - 15 - (this.texts.length - i) * 13;
        }
    };
    ChatBox.prototype.updatem = function () {
        this.text.text = (this.chatopen ? "> " : "") + this.chatmessage;
        this.text.addColor('#ffff00', 2);
    };
    ChatBox.prototype.reset = function () {
        game.world.bringToTop(this.sprite);
        game.world.bringToTop(this.text);
        for (var _i = 0, _a = this.texts; _i < _a.length; _i++) {
            var text = _a[_i];
            game.world.bringToTop(text);
        }
    };
    return ChatBox;
})();
var Entity = (function () {
    function Entity(name, draw, isgroup) {
        if (draw === void 0) { draw = true; }
        if (isgroup === void 0) { isgroup = true; }
        if (!draw)
            return;
        this.image = game.cache.getImage(name);
        if (isgroup)
            this.sprite = group.create(-this.image.width / 2 + game.width / 2, -this.image.height / 2 + game.height / 2, name);
        else
            this.sprite = game.add.sprite(-this.image.width / 2 + game.width / 2, -this.image.height / 2 + game.height / 2, name);
    }
    Entity.prototype.addShadow = function () {
        this.shadow = new Shadow("shadow" + this.image.width, this);
        list.push(this.shadow);
    };
    Entity.prototype.render = function () { };
    Entity.prototype.update = function () { };
    Entity.prototype.added = function () { };
    Entity.prototype.removed = function () {
        if (this.shadow != null)
            this.shadow.remove();
    };
    Entity.prototype.remove = function () {
        this.removed();
        this.sprite.kill();
        list.splice(list.indexOf(this), 1);
    };
    return Entity;
})();
var Shadow = (function (_super) {
    __extends(Shadow, _super);
    function Shadow(name, follow) {
        _super.call(this, name, false, false);
        this.image = game.cache.getImage(name);
        this.sprite = game.make.sprite(0, 0, name);
        this.follow = follow;
        this.sprite.sendToBack();
        this.sprite.moveUp().moveUp();
    }
    Shadow.prototype.render = function () {
        shadowtex.renderXY(this.sprite, this.follow.sprite.x + this.follow.image.width / 2 - this.image.width / 2, this.follow.sprite.y + this.follow.image.height - this.image.height / 2 - 1);
    };
    return Shadow;
})(Entity);
var Collider = (function (_super) {
    __extends(Collider, _super);
    function Collider(x, y, width, height) {
        _super.call(this, "blank");
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.body.immovable = true;
        this.sprite.body.setSize(width, height, 0, 0);
    }
    return Collider;
})(Entity);
var MapLayer = (function (_super) {
    __extends(MapLayer, _super);
    function MapLayer(name) {
        _super.call(this, name, true, false);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.immovable = true;
        this.sprite.body.setSize(307, 60, 0, 0);
    }
    return MapLayer;
})(Entity);
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(id, x, y) {
        if (id === void 0) { id = null; }
        if (x === void 0) { x = 10; }
        if (y === void 0) { y = 10; }
        _super.call(this, "char");
        this.id = id;
        this.sprite.x = x;
        this.sprite.y = y;
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        var w = 16;
        var h = 8;
        this.sprite.body.setSize(w, h, this.image.width / 2 - w / 2, this.image.height - h);
        this.sprite.body.collideWorldBounds = true;
        this.addShadow();
    }
    Player.prototype.update = function () {
        if (this.id != null)
            return;
        var speed = 10 * game.time.elapsed;
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
    };
    Player.prototype.added = function () {
        this.addShadow();
    };
    return Player;
})(Entity);
window.onload = function () {
    var game = new Main();
};
