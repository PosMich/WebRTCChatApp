var config = require( "./config" );
var debug  = require( "./modules/debug" );

var path = require( "path" );
var http = require( "http" );

var express = require( "express" );
var assets = require( "connect-assets" );
var MongoStore = require( "connect-mongo" )(express);
var db = require( "./modules/db" );

var routes = require( "./modules/routes" );
var signaler = require( "./modules/signaling" );

var app = express();

app.configure( function() {
	app.set( "port", process.env.PORT or config.port );
	app.set( "views", __dirname + "/views" );
	app.set( "view engine", "jade" );
	app.set( "view options", { layout:false } );
	app.use( express.favicon("public/images/favicon.ico") );
	app.use( express.logger("dev") );
	app.use( express.bodyParser() );
	app.use( express.methodOverride() );
	app.use( express.cookieParser(config.cookieSecret) );
	app.use( express.session( {
		secret: config.secret,
		maxAge: new Date( Date.now()+3600000 ),
		originalMaxAge: new Date( Date.now()+3600000 ),
		expires: new Date( Date.now()+3600000 ),
		store: new MongoStore( {db: db.connection}, function(err) { 
			if (err != "")
				console.log( "error ");
			else
				console.log( "session to mongo connection established" );
		})
	} ) );
	app.use( assets() );
	app.use( express.static(path.join(__dirname, "public")));
	app.use( app.router );
	app.use( express.errorHandler({dumpExceptions: true, showStack: true}) );
} );

app.use (req, res, next) ->
    res.status 404
    if req.accepts("html")
        debug.error "File not found, render '404'"
        res.render "404",
            url: req.url
        return
    if req.accepts("json")
        debug.error "File not found, render '404 json'"
        res.send error: "Not found"
        return
    res.type("txt").send "Not found"

app.use (err, req, res, next) ->
    res.status err.status or 500
    debug.error "Internal Server Error, render '500'"
    res.render "500",
        error: err