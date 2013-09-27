( function ( root ) {
  root.ajax = function ( uri, data, listeners, options ) { var xhr = new XMLHttpRequest; xhr.open( ( options || ( options = {} ) ).method || ( data ? 'POST' : 'GET' ), uri, !! listeners ); if ( listeners ) for ( var i in listeners ) xhr.addEventListener( i, listeners[i] ); if ( options.prepare ) data = options.prepare.call( xhr, data ); xhr.send( data ); return xhr; };
return root;
} ) ( exports || this || window );
