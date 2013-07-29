var WebSocketServer, db, debug;

debug = require("./debug");

rooms = require("./rooms");

WebSocketServer = require("ws").Server;

/*
    WebSocket stuff

    type of messages:
        --> "login": from driver/car to server
            --> if msg.user is car
                --> check Cars for id, validate password
                    --> password correct: add to driver, enable signaling
            --> if msg.user is driver
        --> "offer": from driver to car
            --> if signaling enabled
                --> sent offer to car
            --> else
                --> kill connection
        --> "answer": from car to driver
            --> if signaling enabled
                --> send answer to driver
            --> else
                --> kill connection
        --> "candidate": from car to driver vice versa
            --> if signaling enabled
                --> exchange canditates
            --> else
                --> kill connection
        --> "bye": from car to driver vice versa
            --> don't know
*/


exports.signaling = function(server) {
    var wss;
    wss = new WebSocketServer({
        server: server
    });
    return wss.on("connection", function(ws) {
        debug.info("new ws connection");
        ws.on("message", function(msg) {
            debug.info('ws received: ');
            console.log(msg);
            try {
                msg = JSON.parse(msg);

                switch (msg.type) {
                    case "createRoom":
                        roomName = rooms.create( ws );
                        ws.type  = "caller";
                        ws.other = "";
                        ws.room  = roomName;
                        debug.info( "created room: " + roomName );
                        ws.send( JSON.stringify( { type: "success", msg: roomName } ) );
                        break;
                    case "joinRoom":

                        debug.info( "try to join" + msg.room);
                        debug.info( "got: ");

                        room = rooms.get( msg.room );
                        console.log( "room name: ");
                        console.log( room.name );
                        if ( room.isFull() ) {
                            debug.info( "room is full" );
                            ws.send( JSON.stringify( {type: "error", msg:"Room is full!" } ) );
                            ws.close();
                        } else {
                            debug.info( "let's go!" );
                            ws.type  = "callee"
                            ws.other = room.getCaller();
                            console.log( ws.other );
                            ws.room = msg.room;
                            ws.other.other = ws;
                            room.setCallee( ws );
                        }
                        break;
                    case "sdp":
                        if (ws.other != null && ws.other != "") {
                            ws.other.send(JSON.stringify(msg));
                            debug.info("sdp sent from "+ws.type);
                        }
                        break;
                    case "ice":
                        if (ws.other != null && ws.other != "") {
                            ws.other.send(JSON.stringify( msg ));
                            debug.info("ice sent from "+ws.type);
                        }
                        break;
                    case "bye":
                        debug.info( "got bye from"+ws.type);
                        ws.close();
                        break;
                    default:
                        throw "wrong msg type: " + msg.type;
                        break;
                }
            } catch (e) {
                debug.error(e);
                ws.close();
            }
        });
        ws.on("close", function() {
            debug.info("ws connection closed: " + ws.type + " " + ws.room );
            
            if ( ws.type !== "caller" && ws.type !== "callee" ) {
                 debug.info("unknown guest" );
            } else {
                var room = rooms.get( ws.room );
                console.log( room );
                if ( ws.type == "caller" ) {
                    if ( room.callee != null)
                        room.callee.send( JSON.stringify({ type: "info", msg: "Host has left the room!" }) );
                    console.log( rooms.remove( room.name ) );
                } else {
                    if ( room == null )
                        return;
                    room.caller.send( JSON.stringify({ type: "info", msg: "Guest has left the room!" }) );
                    room.callee = null;
                }
            }

        });
    });
};
