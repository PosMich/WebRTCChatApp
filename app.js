var MongoStore, app, assets, auth, authenticatedOrNot, coffee, 
    config, db, debug, device, express, flash, 
    http, i18n, passport, path, routes, server, 
    signaller, userExist;

config = require("./config");
debug  = require("./modules/debug");

path = require("path");
http = require("http");

express = require("express");
assets  = require("connect-assets");

//MongoStore = require("connect-mongo")(express);
//db         = require("modules/db");
routes     = require("./modules/routes");
signaler   = require("./modules/signaling");

var rooms = [];

/*
    Declare & Configure the Server
*/
app = express();

app.configure( function() {
    app.set( "port", process.env.PORT || config.port );
    app.set( "views", __dirname + "/views" );
    app.set( "view engine", "jade" );
    app.set( "view options", {
        layout: false
    });
    //app.use( express.favicon("public/images/favicon.ico") );
    app.use( express.logger("dev") );
    app.use( express.bodyParser() );
    app.use( express.methodOverride());
    app.use( express.cookieParser(config.cookieSecret) );
    app.use( express.session({
        secret: config.secret,
        maxAge: new Date(Date.now() + 3600000),
        originalMaxAge: new Date(Date.now() + 3600000),
        expires: new Date(Date.now() + 3600000),
    }));
    app.use( assets() );
    app.use( express["static"](path.join(__dirname, "public")) );
    app.use( app.router );
    app.use( express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

/*
    Error routes
*/

app.use(function(req, res, next) {
    res.status(404);
    if ( req.accepts("html") ) {
        debug.error( "File not found, render '404'" );
        res.render( "404", { url: req.url } );
    } else if ( req.accepts("json") ) {
        debug.error( "File not found, render '404 json'" );
        res.send( { error: "Not found" } );
    } else {
        res.type("txt").send("Not found");
    }
});

app.use(function(err, req, res, next) {
    res.status( err.status || 500 );
    debug.error( "Internal Server Error, render '500'" );
    res.render("500", { error: err } );
});

/*
there's a particular need for random links in random files, here's our random link
    http://www.jmanzano.es/blog/?p=603
*/


/*
    Routes
*/


app.get("/", routes.home);

app.get("/room/:room", routes.room);

app.get("*", routes.Default);

/*
    Startup and log.
*/


server = http.createServer(app).listen(app.get("port"), function() {
  debug.info( "Express server is listening on port " + app.get("port") );
});

signaler.signaling(server);
