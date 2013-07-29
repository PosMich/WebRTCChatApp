
debug = require("./debug");

config = require("../config");

function Room( name, caller ) {
    this.name = name;
    this.caller = caller;
    this.callee = null;
};

Room.prototype.setCallee = function( callee ) {
    this.callee = callee;
}
Room.prototype.getCallee = function() {
    return this.callee;
}
Room.prototype.getCaller = function() {
    return this.caller;
}

Room.prototype.isFull = function() {
    console.log("isFull? ");
    console.log( this.callee );
    console.log( this.caller );
    return ( this.callee != null ) ? true : false;
}


function Rooms() {
    this.rooms = [];
};

Rooms.prototype.create = function( caller ) {
    // generate rnd room 
    var rndName;
    var found;
    do {
        rndName = random( config.rooms.nameLength );
        found   = false;

        for ( var i=0; i<this.rooms.length; i++) {
            if ( this.rooms[i].name == rndName )
                found = true;
        }
    } while ( found == true );

    this.rooms.push( new Room( rndName, caller ) );

    return rndName;
};

Rooms.prototype.get = function( name ) {
    for ( var i=0; i<this.rooms.length; i++ ) {
        if ( this.rooms[i].name == name )
            return this.rooms[i];
    }
    return null;
}

Rooms.prototype.remove = function( name ) {
    var found = false;
    for ( var i=0; i<this.rooms.length; i++) {
        if ( this.rooms[i].name == name ) {
            this.rooms.splice( i, 1 );
            found = true;
        }
    }
    return found;
}

module.exports = new Rooms();


function random( length ) {
    var mChars = ["ABCDEFGHIJKLMNOPQRSTUVWXYZ",
              "abcdefghijklmnopqrstuvwxyz",
              "0123456789"];
    function rnd( pool ) {
        var a = Math.floor( Math.random() * pool.length );

        var chars = pool[a];

        a = Math.floor( Math.random() * chars.length );
        
        return chars.substr( a, 1 );
    }
    
    function generate( length ) {
        var ret = "";
        while ( ret.length < length ) {
            ret += rnd( mChars );
        }
        return ret;
    };

    return generate( length );
}