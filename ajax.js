(function(root) {
    'use strict';

    var _listenerNames = ['readystatechange', 'loadstart', 'progress', 'abort', 'error', 'load', 'timeout', 'loadend'],
        _extractListeners = function(options) {
            var listeners = { };
            _listenerNames.forEach(function(name) {
                if (options[name])
                    listeners[name] = options[name];
            });
            return listeners;
        },
        _prepareFormData = function ( source ) {
            var element = source instanceof HTMLFormElement ? source : typeof source === 'string' ? document.forms[source] || document.querySelector( source ) : null,
                data;
            if ( element ) {
                if ( element instanceof HTMLFormElement ) {
                    data = new FormData( element );
                    data.uri = element.action;
                } else {
                    data = _getFormDataFromElement( element );
                }
            } else if ( data instanceof Object )
                data = _getFormDataFromObject( data );
            else
                throw "Invalid data";
            return data;
        },
        _encodeUri = function ( uri, data ) {
            
        },
        _encodeData = function ( data ) {
            
        },
        AJAX = function(uri, data, listeners) {
            // regular function call
            var xhr = new XMLHttpRequest;
            xhr.open(data ? 'POST' : 'GET', uri, !!listeners);
            if (listeners) {
                for (var i in listeners)
                    xhr.addEventListener(i, listeners[i]);
            }
            xhr.send(data);
            return xhr;
        };
    
    AJAX.raw    = 0;
    AJAX.form   = 1;
    AJAX.binary = 2;
    AJAX.upload = 3;
    
    AJAX.configure = function ( options ) {
        if ( options ) { // uri is options if constructor
            var _listeners = _extractListeners(options),
                _async = options.async || Object.keys( _listeners ).length ? 'true' : 'false',
                _method = options.method && options.method.toUpperCase( ),
                _prepare = options.prepare,
                _process = options.process,
                _onload = options.load,
                code = [],
                headers = options.headers,
                encodeUri,
                encodeData,
                key, val;

            if (_onload && _process)
                _listeners.load = function( ) {
                    onload(_process.apply(this, arguments));
                };

            code.push( 'var xhr = new XMLHttpRequest;' );

            switch (options.mode || AJAX.raw) {
                case AJAX.raw:
                case 'raw':
                    if ( _method === 'GET' ) {
                        encodeUri = _encodeUri
                    }
                    break;

                case AJAX.form:
                case 'form':
                    if ( _method === 'GET' ) {
                        encodeUri = _encodeUri
                        options.contentType = 'text\/plain';
                    } else if ( _method === 'POST' ) {
                        encodeData = _prepareFormData;
                        options.contentType = 'multipart\/form-data';
                    }
                    break;

                default:
                    throw 'invalid AJAX mode: ' + mode;
            }

            switch ( _method ) {
                case 'POST':
                    code.push( 'xhr.open( \'POST\', uri, ' + _async + ' );' );
                    break;

                case 'GET':
                    code.push( 'xhr.open( \'GET\', this.encodeUri( uri, data ), ' + _async + ' );' );
                    break;

                case null:
                case undefined:
                    code.push( 'data ? xhr.open( \'POST\', uri, ' + _async + ' ) : xhr.open( \'GET\', ' + ( encodeUri ? 'this.encodeUri( uri, data )' : 'uri' ) + ', ' + _async + ' );' );
                    break;

                default:
                    code.push( 'xhr.open( \''+ _method + '\', uri, data ), ' + _async + ' );' );
            }
            if ( ( val = options.timeout ) )
                code.push( 'xhr.timeout = ' + val + ' );' );
            if ( ( val = options.responseType ) )
                code.push( 'xhr.responseType = \'' + val + '\' );' );
            if ( ( val = options.contentType ) )
                code.push( 'xhr.setRequestHeader( \'content-type\', \'' + val + '\' );' );
            if ( headers )
                for ( key in headers )
                    if ( ( val = headers[key] ) )
                        code.push( 'xhr.setRequestHeader( \'' + key + '\', \'' + val + '\' );' );
            if ( _listeners )
                for (var key in _listeners)
                    code.push( 'xhr.addEventListener( \'' + key + '\', this.' + key + ' );' );
            if ( _prepare ) {
                _listeners.prepare = _prepare;
                code.push( 'data = this.prepare.call( xhr, data );' );
            }
            if ( encodeUri )
                _listeners.encodeUri = encodeUri;
            if ( encodeData ) {
                _listeners.encodeData = _encodeData;
                code.push( 'xhr.send( this.encodeData( data ) );' );
            } else
                code.push( 'xhr.send( data );' );
            code.push( 'return xhr;' );

            return new Function( 'uri', 'data', code.join( "\n" ) ).bind( _listeners );
        }

        return function(uri, data) {
            var xhr = new XMLHttpRequest;
            xhr.open(_method || (data ? 'POST' : 'GET'), uri, false);
            xhr.send(data);
            return xhr;
        };
    };

    Object.freeze(root.AJAX = AJAX);
    return root;
})(typeof exports === 'undefined' ? this || window : exports);

(function(root) {
    'use strict';

    function ajaxSuccess() {
        /* console.log("AJAXSubmit - Success!"); */
        alert(this.responseText);
        /* you can get the serialized data through the "submittedData" custom property: */
        /* alert(JSON.stringify(this.submittedData)); */
    }

    function submitData(oData) {
        /* the AJAX request... */
        var oAjaxReq = new XMLHttpRequest();
        oAjaxReq.submittedData = oData;
        oAjaxReq.onload = ajaxSuccess;
        if (oData.technique === 0) {
            /* method is GET */
            oAjaxReq.open("get", oData.receiver.replace(/(?:\?.*)?$/, oData.segments.length > 0 ? "?" + oData.segments.join("&") : ""), true);
            oAjaxReq.send(null);
        } else {
            /* method is POST */
            oAjaxReq.open("post", oData.receiver, true);
            if (oData.technique === 3) {
                /* enctype is multipart/form-data */
                var sBoundary = "---------------------------" + Date.now().toString(16);
                oAjaxReq.setRequestHeader("Content-Type", "multipart\/form-data; boundary=" + sBoundary);
                oAjaxReq.sendAsBinary("--" + sBoundary + "\r\n" + oData.segments.join("--" + sBoundary + "\r\n") + "--" + sBoundary + "--\r\n");
            } else {
                /* enctype is application/x-www-form-urlencoded or text/plain */
                oAjaxReq.setRequestHeader("Content-Type", oData.contentType);
                oAjaxReq.send(oData.segments.join(oData.technique === 2 ? "\r\n" : "&"));
            }
        }
    }

    function processStatus(oData) {
        if (oData.status > 0) {
            return;
        }
        /* the form is now totally serialized! do something before sending it to the server... */
        /* doSomething(oData); */
        /* console.log("AJAXSubmit - The form is now serialized. Submitting..."); */
        submitData(oData);
    }

    function pushSegment(oFREvt) {
        this.owner.segments[this.segmentIdx] += oFREvt.target.result + "\r\n";
        this.owner.status--;
        processStatus(this.owner);
    }

    function plainEscape(sText) {
        /* how should I treat a text/plain form encoding? what characters are not allowed? this is what I suppose...: */
        /* "4\3\7 - Einstein said E=mc2" ----> "4\\3\\7\ -\ Einstein\ said\ E\=mc2" */
        return sText.replace(/[\s\=\\]/g, "\\$&");
    }

    function SubmitRequest(oTarget) {
        var nFile, sFieldType, oField, oSegmReq, oFile, bIsPost = oTarget.method.toLowerCase() === "post";
        /* console.log("AJAXSubmit - Serializing form..."); */
        this.contentType = bIsPost && oTarget.enctype ? oTarget.enctype : "application\/x-www-form-urlencoded";
        this.technique = bIsPost ? this.contentType === "multipart\/form-data" ? 3 : this.contentType === "text\/plain" ? 2 : 1 : 0;
        this.receiver = oTarget.action;
        this.status = 0;
        this.segments = [];
        var fFilter = this.technique === 2 ? plainEscape : escape;
        for (var nItem = 0; nItem < oTarget.elements.length; nItem++) {
            oField = oTarget.elements[nItem];
            if (!oField.hasAttribute("name")) {
                continue;
            }
            sFieldType = oField.nodeName.toUpperCase() === "INPUT" ? oField.getAttribute("type").toUpperCase() : "TEXT";
            if (sFieldType === "FILE" && oField.files.length > 0) {
                if (this.technique === 3) {
                    /* enctype is multipart/form-data */
                    for (nFile = 0; nFile < oField.files.length; nFile++) {
                        oFile = oField.files[nFile];
                        oSegmReq = new FileReader();
                        /* (custom properties:) */
                        oSegmReq.segmentIdx = this.segments.length;
                        oSegmReq.owner = this;
                        /* (end of custom properties) */
                        oSegmReq.onload = pushSegment;
                        this.segments.push("Content-Disposition: form-data; name=\"" + oField.name + "\"; filename=\"" + oFile.name + "\"\r\nContent-Type: " + oFile.type + "\r\n\r\n");
                        this.status++;
                        oSegmReq.readAsBinaryString(oFile);
                    }
                } else {
                    /* enctype is application/x-www-form-urlencoded or text/plain or method is GET: files will not be sent! */
                    for (nFile = 0; nFile < oField.files.length; this.segments.push(fFilter(oField.name) + "=" + fFilter(oField.files[nFile++].name)))
                        ;
                }
            } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
                /* field type is not FILE or is FILE but is empty */
                this.segments.push(
                        this.technique === 3 ? /* enctype is multipart/form-data */
                        "Content-Disposition: form-data; name=\"" + oField.name + "\"\r\n\r\n" + oField.value + "\r\n"
                        : /* enctype is application/x-www-form-urlencoded or text/plain or method is GET */
                        fFilter(oField.name) + "=" + fFilter(oField.value)
                        );
            }
        }
        processStatus(this);
    }

    var AJAXSubmit = function(oFormElement) {
        if (!oFormElement.action) {
            return;
        }
        new SubmitRequest(oFormElement);
    };

    Object.freeze(root.AJAXSubmit = AJAXSubmit);
    return root;
})(typeof exports === 'undefined' ? this || window : exports);
