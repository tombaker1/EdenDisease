// TODO:
//  1. add copyright


;(function ( $, window, document, undefined ) {
    
    // Create the defaults once
    var pluginName = 'jqmController';
    var defaults = {
        };
    var reqState = null;
    var xformHandler = null;
    var state;
    var view = null;
    var formListItems = [];
    


    // The actual plugin constructor
    function controller( options ) {
        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
        xformHandler = options.xform;
        view = $.jqmView();
       
        this.init(options);
        $(document).bind( "pagebeforechange", pageChange );
    };
    
    controller.prototype.init = function ( options ) {
        reqState = new XMLHttpRequest();
        state = options["state"];
        this.loadList = [];
        
        // Set events

        $("#load-form-list").click(this.onLoadFormList.bind(this));
        $("#debug-button").click(this.onDebug.bind(this));
        
        // Load the saved data or initialize data
        this.loadFormList();
        
    };
    
    controller.prototype.loadFormList = function (  ) {
        // Load the form list
        var url = "";
        if (state.settings.source === 1) {
            url = config.defaults.formPath + config.defaults.formList;
        }
        else {
            url = config.defaults.url + config.defaults.formList;
            console.log("init: request " + url)
        }
        xformHandler.requestFormList(url,cbFormListComplete);
    };
    
    controller.prototype.onDebug = function ( event ) {
        console.log("onDebug");
        this.loadFormList();
    };
    
    controller.prototype.onLoadFormList = function ( event ) {
        console.log("onLoadFormList");
        var $list = view.getFormList();
        var $checkboxList = $list.find("input");
        
        // get list of forms to load
        this.loadList = [];
        for (var i = 0; i < xformHandler.numForms(); i++) {
          var $form = xformHandler.getForm(i);
          if ($checkboxList[i].checked && !$form.loaded) {
            this.loadList.push(i);
          }
        }
        if (this.loadList.length) {
            var index = this.loadList.pop();
            xformHandler.requestForm(index,this.cbFormLoadComplete.bind(this));
        }
    };

    controller.prototype.cbFormLoadComplete = function(index) {
        console.log("cbFormLoadComplete");
        
        // Create page here
        
        // get next page
        if (this.loadList.length) {
            xformHandler.requestForm(this.loadList.pop(),
                                     this.cbFormLoadComplete.bind(this));
        }
    };
    
    var cbFormListComplete = function() {
      
      // put the list of forms into the page
      view.insertForms(xformHandler.getAllForms());
      /*
      var $page = $( "#page-load-form" );
      var $list = $("#form-list-data");
      var listItems = "";

      for (var i = 0; i < xformHandler.numForms(); i++) {
        var $form = xformHandler.getForm(i);
        var item = view.newFormListItem({model:$form});
        //item.render();
        //$list.append(item.$el);
        //formListItems[i] = item;
       }
    
      $list.enhanceWithin();
      //console.log("cbFormListComplete");
      */
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
