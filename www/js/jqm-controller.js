// TODO:
//  1. add copyright


;(function ( $, window, document, undefined ) {
    
    // Create the defaults once
    var pluginName = 'jqmController';
    var defaults = {
        };
    var reqState = null;


    // The actual plugin constructor
    function controller( options ) {
        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
       
        this.init();
        $(document).bind( "pagebeforechange", pageChange );
    };
    
    controller.prototype.init = function () {
        reqState = new XMLHttpRequest();
    };
    
    
    // handle the jqm page change to make sure dynamic content is handled
    var pageChange = function( e, data) {

      if ( typeof data.toPage === "string" ) {
    
        var u = $.mobile.path.parseUrl( data.toPage );
        var re = /#page/;
        var pageselector = u.hash.replace( /\?.*$/, "" );
          
        if (pageselector.indexOf("#page-form-") >= 0) {
          var index = u.hash.replace( /#page-form-/, "" );
          showNewForm(index);
          e.preventDefault();
          return;
        }
  
        switch (pageselector) {
          case "#page-formlist":
            requestFormList(defaultURL);
            break;
          case "#load-form":
            var index = u.hash.replace( /.*index=/, "" );
            console.log("loading form #" + index);
            requestForm(index);
            break;
          default:
            return;
        }
          
        e.preventDefault();
      }
    
    }
    
// bind the plugin to jQuery     
    $.jqmController = function(options) {
        return new controller( this, options );
    }

})( jQuery, window, document );
