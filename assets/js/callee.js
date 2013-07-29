$( document ).ready( function() {


    $(".callee .name").html("Host");

    var serverUri       = "webrtcchat:8000";

    var serverWsUri      = "ws://"+serverUri;
    var displayStream  = false;
    var peerConnection = null;
    var dataChannel    = null;
    

    chatChannelIsOpen = false;
    roomName          = document.URL.substr( document.URL.lastIndexOf("/")+1 );


    /* server constraints */
    pcConfig = { 
        iceServers: [
            {url:"stun:stun.l.google.com:19302"}
        ]
    };

    /* connection constraints */
    connection = { 
        optional: [
            { DtlsSrtpKeyAgreement: true }, 
            { RtpDataChannels:true } 
        ] 
    };

    /* media constraints */
    mediaConstraints = {
        audio: true,
        video: true 
    };

    /* sdp constraints */
    sdpConstraints = {
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    /* try to create connection */
    try {
        peerConnection = new RTCPeerConnection( pcConfig, connection );
        peerConnection.onicecandidate = onIceCandidate;
        peerConnection.onaddstream = onRemoteStreamAdded;
        peerConnection.onremovestream = onRemoteStreamRemoved;
    } catch ( err ) {
        console.log( "failed to create RTCPeerConnection" );
        alert( "Does your browser really support WebRTC?" );
    }

    chatChannel = peerConnection.createDataChannel( "chat", { reliable: false });

    chatChannel.onopen = function() {
        chatChannelIsOpen = true;
        $(".send").removeAttr( "disabled" );
        $(".send").val("");
        console.log( "RTCDataChannel opened" );

        sendFunction = function(text) {
            chatChannel.send( JSON.stringify( {content:text} ) );
        } 
    }

    chatChannel.onclose = function() {
        chatChannelIsOpen = false;
        console.log( "RTCDataChannel closed" );
    }

    chatChannel.onmessage = handleChatMessage;


    function onIceCandidate( event ) {
        console.log( "got new candidate" );
        if ( event.candidate ) {
            sendMessage( { 
                type: "ice",
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {
            console.log( "end of candidates" );
        }
    }

    old_screen_overlay = "";

    function onRemoteStreamAdded( event ) {
        console.log( "Remote Stream added" );
        old_screen_overlay = $(".callee .screen-overlay").html();
        $(".callee .screen-overlay").html("waiting for video");
        attachMediaStream( $(".callee video")[0], event.stream );
        remoteStream = event.stream;
        waitForRemoteVideo();
    }

    function waitForRemoteVideo() {
        console.log( "wait for remote stream" );
        
        videoTracks = remoteStream.getVideoTracks();
        if (videoTracks.length == 0 || $(".callee video")[0].currentTime > 0 ) {
            if ( displayStream == false ) {
                display();
                displayStream = true;
            } else {
                setTimeout( waitForRemoteVideo, 100 );
            }
        } else {
            console.log( "got remote video" );
            $(".callee .screen-overlay").hide();
        }
    }

    function onRemoteStreamRemoved() {
        console.log( "remote stream removed" );
        $(".callee .screen-overlay").html( old_screen_overlay );
        $(".callee .screen-overlay").show();
    }


    getUserMedia( mediaConstraints, onUserMediaSuccess, onUserMediaError );

    function onUserMediaSuccess( stream ) {
        console.log( "user granted access to local media" );

        $(".callee .screen-overlay span").html("<a href='http://"+serverUri+"/room/"+roomName+"'>http://"+serverUri+"/room/"+roomName+"</a>");

        peerConnection.addStream( stream );
        attachMediaStream( $(".caller video")[0], stream );
        peerConnection.createOffer( setAndSendDescription, offerError, sdpConstraints );
    }

    function onUserMediaError( error ) {
        console.log( "user denied access to local media" );
        console.log( error );
    }

    function setAndSendDescription( description ) {
        console.log( "set and send description" );
        peerConnection.setLocalDescription( description );
        sendMessage( { type: "sdp", sdp: description } );
    }
    function offerError( error ) {
        console.log( "error creating offer"+ error );
    }

    console.log( "connect to WebSocketServer")
    ws = new WebSocket( serverWsUri );

    ws.onopen = function() {
        sendMessage( { type: "joinRoom", room: roomName } );
    }
    ws.onclose = function() {
        sendMessage( { type:"bye" } );
    }

    ws.onmessage = handleIncomingMessages;

    function handleIncomingMessages( msg ) {
        console.log( "Server -> Client: ");

        try {
            msg = JSON.parse( msg.data );
            console.log( msg )
            switch ( msg.type ) {
                case "success":
                    console.log( "success" );
                    console.log( "room: "+msg.msg );
                    roomName = msg.msg;
                    break;
                case "sdp": 
                    console.log( "got sdp");
                    peerConnection.setRemoteDescription( new RTCSessionDescription( msg.sdp ) );
                    break;
                case "ice":
                    var candidate = new RTCIceCandidate( {
                         sdpMLineIndex: msg.label,
                         candidate: msg.candidate
                     }); 
                    peerConnection.addIceCandidate( candidate );
                    break;
                case "err":
                    console.log( "error" );
                    console.log( msg.msg );
                    break;
                case "info":
                    console.log( "info" );
                    $(".callee video").attr("src", "");
                    $(".callee .screen-overlay").html("<h1>Host has left the room</h1>");
                    $(".callee .screen-overlay").show();

                    $(".send").attr( "disabled", "disabled" );
                    $(".send").val( "Host has left the room" );
                    break;
                default: 
                    throw( "Whaaat? "+msg.type);
                    break;
            }
        } catch ( err ) {
            console.log( "error: " + err);
        }
    } 

    function sendMessage( msg ) {
        console.log( "Client -> Server: ")
        console.log( msg );

        ws.send( JSON.stringify(msg) );
    }

    function handleChatMessage( msg ) {
        console.log( "got chat msg" );
        console.log( msg );
        showCalleeBubble( "host", JSON.parse(msg.data).content );
    }


} );