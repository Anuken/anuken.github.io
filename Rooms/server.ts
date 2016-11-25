
/// <reference path="lib/socket.io.d.ts"/>

var io = require('socket.io')
var util = require('util')
var http = require('http')
var path = require('path')
import { Connection, Room } from "./common";


var socket
var rooms : { [key:string]:Room; } = {};
var players: Array<Connection>;

var server = http.createServer().listen(2521, function (err) {
  if (err) {
    throw err
  }
  init()
})

function init () {
    rooms = {}

    players = []

    socket = io.listen(7576)
    
    setEventHandlers();
}

var setEventHandlers = function () {
  // Socket.IO
  socket.sockets.on('connection', onSocketConnection)
}

function onSocketConnection (client) {
  util.log('New player has connected: ' + client.id)

  client.on('disconnect', onClientDisconnect)
  client.on('new player', onNewPlayer)
  client.on('move player', onMovePlayer)
  client.on('switch room', onNextRoom)
  client.on('chat message', onChatMessage)
}

function onChatMessage(data){
  let player = playerById(this.id)
  let room = player.room
  for(let connection of room.list)
  socket.to(connection.id).emit('chat message', {sender: player.name, message: data.message, color: player.color})
}

function addToRoom(player: Connection, room: Room){
  player.room = room;
  
  socket.to(player.id).emit('room data', {name: "room: " + room.x + ", " + room.y})

  //send new player to other players in room
  for(let connection of room.list)
  socket.to(connection.id).emit('new player', {id: player.id, x: player.x, y: player.y})

  // Send existing players in room to the new player
  for(let connection of room.list)
  socket.to(player.id).emit('new player', {id: connection.id, x: connection.x, y: connection.y})

  room.list.push(player)
}

function removeFromRoom(player: Connection, room: Room){

  //remove player from room array
  player.room.list.splice(player.room.list.indexOf(player), 1)

  // Broadcast removed player to connected socket clients
  for(let connection of room.list)
  socket.to(connection.id).emit('remove player', {id: player.id})
}

function changeRooms(player: Connection, newRoom: Room){
  removeFromRoom(player, player.room)
  addToRoom(player, newRoom)
}

function onNextRoom(data){
  util.log(this.id + " is moving to the next room.")
  let player = playerById(this.id)
  let oldroom = player.room;
  let room : Room = null;
  
  if(data.type == 'last'){
    room = getRoom(oldroom.x - 1,oldroom.y)
  }else{
    room = getRoom(oldroom.x + 1,oldroom.y)
  }

  if(room == null){
    console.log("Player " + player.id + " went too far, there are no rooms left!")
    return;
  }

  changeRooms(player, room)
}

function onClientDisconnect () {
  util.log('Player has disconnected: ' + this.id)

  let removePlayer = playerById(this.id)

  if (removePlayer == null) {
    util.log('Player not found: ' + this.id)
    return
  }

  let room = removePlayer.room

  removeFromRoom(removePlayer, room)

  // Remove player from players array
  players.splice(players.indexOf(removePlayer), 1)
}

function onNewPlayer (data) {
  let newPlayer = new Connection()
  newPlayer.id = this.id
  newPlayer.name = data.name;

  let room = genRoom()
  rooms[room.x + "," + room.y] = room;

  addToRoom(newPlayer, room)

  players.push(newPlayer)
}

function genRoom() : Room {
  let maxx = -1
  for(let key in rooms){
    let room = rooms[key];
    maxx = Math.max(maxx, room.x)
  }
  return new Room(maxx+1, 0);
}

// Player has moved
function onMovePlayer (data) {
  // Find player in array
  var movePlayer = playerById(this.id)

  let room = movePlayer.room
  // Player not found
  if (!movePlayer) {
    util.log('Player not found: ' + this.id)
    return
  }

  // Update player position
  movePlayer.x = data.x
  movePlayer.y = data.y

  //sendupdated position to players in room
  for(let connection of room.list)
    if(connection != movePlayer)
      socket.to(connection.id).emit('move player', {id: movePlayer.id, x: movePlayer.x, y: movePlayer.y})
}

function getRoom(x: number, y: number){
    return rooms[x + "," + y];
}

// Find player by ID
function playerById (id) : Connection{
  for (let i = 0; i < players.length; i++) {
    if (players[i].id == id) {
      return players[i]
    }
  }

  return null;
}

console.log("Server up.");