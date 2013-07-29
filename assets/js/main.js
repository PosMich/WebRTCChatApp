$( document ).ready( function() {

    debug = true;

    log = function( text ) {
        if (debug)
            console.log( text );
    }


    chatChannelIsOpen = false;

    sendFunction = function( text ) {  };

    $(".speechbubble").fadeOut(0);

    $callerBubble = $(".caller .speechbubble");
    $calleeBubble = $(".callee .speechbubble");



    $log = $(".log");

    setOffset = function () {
        callerOffset = $(".caller .name").offset();
        calleeOffset = $(".callee .name").offset();

        callerOffset.left+=145;
        callerOffset.top-=80;

        calleeOffset.left+=25;
        calleeOffset.top-=80;

        $callerBubble.offset( callerOffset );
        $calleeBubble.offset( calleeOffset );
    }
    setOffset();

    showCallerBubble = function ( text ) {
        var self = this;
        $callerBubble.queue(function(){
            $(this).html( text );
            $(this).fadeIn(300).delay(1500).fadeOut(300)
            $(this).dequeue();
        });
        $log.html( "you: " + text + "<br>" + $log.html() );
        sendFunction( text );
        setOffset();
    }

    showCalleeBubble = function ( type, text ) {
        $calleeBubble.queue(function(){
            $(this).html( text );
            $(this).fadeIn(300).delay(1500).fadeOut(300)
            $(this).dequeue();
        });
        $log.html( type + ": "+ text + "<br>" + $log.html() );
        setOffset();
    }

    function showBubble() {

    }

    window.a = showCallerBubble;
    window.b = showCalleeBubble;

    $(window).resize( function() {
        setOffset();
    });


    if ( !chatChannelIsOpen )
        $(".send").attr( "disabled", "disabled" );
    $(".send").val( "waiting for partner ..." );

    $("button").click( function() {
        input = $(".send").val();

        if ( input == "" || !chatChannelIsOpen) {
            return;
        }

        showCallerBubble( input );
        $log.scrollTop( 0 );
    })
});

