// TODO:
//  1. add copyright


;(function ( $, window, document, undefined ) {
    
    // Create the defaults once
    var pluginName = 'jqmController';
    var defaults = {
        };
    var reqState = null;
    var xformHandler = null;


    // The actual plugin constructor
    function controller( options ) {
        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
        xformHandler = options.xform;
       
        this.init(options);
        $(document).bind( "pagebeforechange", pageChange );
    };
    
    controller.prototype.init = function ( options ) {
        reqState = new XMLHttpRequest();
        var state = options["state"];
        var url = "";
        if (state.settings.source === 1) {
            url = config.defaults.formPath + config.defaults.formList;
        }
        else {
            url = config.defaults.url + config.defaults.formList;
        }
        options.xform.requestFormList(url,cbFormListComplete);
        
    };
    
    var cbFormListComplete = function() {
      
      // put the list of forms into the page
      var $page = $( "#page-load-form" );
      var $list = $("#form-list-data");
      var listItems = "";

      //$list.html("");
      for (var i = 0; i < xformHandler.numForms(); i++) {
        var $form = xformHandler.getForm(i);
        var item = "<li><a id='new-item' href='#load-form?index=" + i + "'>" + $form.name + "</a></li>";
        //$list.append(item);
        listItems += item;
      }
      $list.html(listItems);
    
      // Enhance the listview we just injected.
      //$list.listview();
      //$page.page();
      $page.enhanceWithin();
      
      
      //$.mobile.changePage( $page );

      console.log("reqCompleteCB");
    }
    
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
        return new controller( options );
    }

})( jQuery, window, document );
