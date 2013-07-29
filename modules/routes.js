var config, crypto, db, debug, hash, sha, sty, tinyUrl;

sty = require("sty");

debug = require("./debug");

config = require("../config");

rooms = require("./rooms");


/*
    Routes
*/


exports.home = function(req, res) {
    debug.info( ".get " + sty.magenta("/") );
    res.render("layout", { room: null } );
};

exports.room = function(req, res) {
    debug.info( ".get " + sty.magenta("/room/") + " " + req.params.room );
    if ( !rooms.get(req.params.room) )
        res.redirect("/");
    res.render("layout", { room: req.params.room } );
};


exports.Default = function(req, res) {
    debug.info( ".get " + sty.magenta("*") );
    res.render("layout", { room: null } );
};
