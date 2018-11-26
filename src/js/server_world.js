var players = [];

function Player(){

    this.playerId = players.length;
    this.x = -2;
    this.y = 2;
    this.z = 0;
    this.r_x = 0;
    this.r_y = 0;
    this.r_z = 0;
    this.sizeX = 0.01;
    this.sizeY = 0.01;
    this.sizeZ = 0.01;
    this.speed = 50;
    this.turnSpeed = 3;

}

var addPlayer = function(id){

    var player = new Player();
    player.playerId = id;
    players.push( player );

    return player;
};

var removePlayer = function(player){

    var index = players.indexOf(player);

    if (index > -1) {
        players.splice(index, 1);
    }
};

var updatePlayerData = function(data){
    var player = playerForId(data.playerId);
    player.x = data.x;
    player.y = data.y;
    player.z = data.z;
    player.r_x = data.r_x;
    player.r_y = data.r_y;
    player.r_z = data.r_z;

    return player;
};

var playerForId = function(id){

    var player;
    for (var i = 0; i < players.length; i++){
        if (players[i].playerId === id){

            player = players[i];
            break;

        }
    }

    return player;
};


module.exports.players = players;
module.exports.addPlayer = addPlayer;
module.exports.removePlayer = removePlayer;
module.exports.updatePlayerData = updatePlayerData;
module.exports.playerForId = playerForId;