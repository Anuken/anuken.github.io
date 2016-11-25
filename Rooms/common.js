var Room = (function () {
    function Room(x, y) {
        this.list = [];
        this.x = x;
        this.y = y;
    }
    return Room;
})();
exports.Room = Room;
var Connection = (function () {
    function Connection() {
        this.color = "";
        for (var i = 0; i < 6; i++)
            this.color += (Math.random() < 0.5 ? Connection.strings[Math.floor(Math.random() * 6)] : Math.floor(Math.random() * 10));
    }
    Connection.strings = ['a', 'b', 'c', 'd', 'e', 'f'];
    return Connection;
})();
exports.Connection = Connection;
