// TODO:
//  1. add copyright


;(function ( $, window, document, undefined ) {
    
    // Create the defaults once
    var pluginName = 'jqmController';
    var defaults = {
        };
    //var reqState = null;
    var state;
    var formListItems = [];
    var formData = [];
    
    // create the form list item
    var formData = Backbone.Model.extend({
        defaults: {
         },
        initialize: function(options) {
            this._name = "";
            this._timestamp = 0;
            this._submit = false;
        },
        
        submit: function() {
            console.log("sending model " + this._name);
        },
        
        getKey: function() {
            return this._name + this._timestamp;
        }
    });
    var activeForms = new Backbone.Collection;

    Backbone.sync = function(method, model, options) {
      options || (options = {});
    
      switch (method) {
        case 'create':
            console.log("create");
            var path = "data-" + model.getKey();
            localStorage.setItem(path,JSON.stringify(model));
        break;
    
        case 'update':
            console.log('update');
            var path = "data-" + model.getKey();
            localStorage.setItem(path,JSON.stringify(model));
        break;
    
        case 'delete':
            console.log('delete');
            var path = "data-" + model.getKey();
            localStorage.removeItem(path);
        break;
    
        case 'read':
            console.log('read');
            var path = "data-" + model.getKey();
            model = JSON.parse(localStorage.getItem(path));
        break;
      }
    };

    // The actual plugin constructor
    function controller( options ) {
        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
       
        this.init(options);
        $(document).bind( "pagebeforechange", pageChange );
    };
    
    controller.prototype.init = function ( options ) {
        //reqState = options["xform"]; //new XMLHttpRequest();
        state = options["state"];
        this.loadList = [];
        this.$checkboxList = [];
        this.checkboxArray = [];
        // Set events

        $("#load-form-button").click(this.onLoadFormList.bind(this));
        $("#debug-button").click(this.onDebug.bind(this));
        //view.bind("form-cancel",this.onFormCancel.bind(this));
        $(this).bind("form-cancel",this.onFormCancel.bind(this));
        $(this).bind("form-save",this.onFormSave.bind(this));
        $(this).bind("form-submit",this.onFormSubmit.bind(this));
        
        // Load the saved data or initialize data
        var formData = localStorage.getItem("form-list");
        if (formData) {
            app.xformHandler.parseFormList(formData);
            // put the list of forms into the page
            app.view.insertForms(app.xformHandler.getAllForms());
        }
      
        
    };
    
    controller.prototype.resetAll = function (  ) {
        console.log("resetAll");
    };
    
    controller.prototype.onFormCancel = function (  ) {
        console.log("onFormCancel");
    };
    controller.prototype.onFormSave = function ( evt,model) {
        console.log("onFormSave");
        //app.view.getModelData(pageView);
        var a = _.contains(activeForms,model);
        if (!activeForms.contains(model)) {
            activeForms.add(model);
            app.view.newSavedFormItem({model:model});
            model.sync('create',model);
        }
        else {
            model.sync('update',model);

        }
    };
    
    controller.prototype.onFormSubmit = function ( evt,model ) {
        console.log("onFormSubmit");
        model.submit();
        model.sync('create',model);
        
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
        app.xformHandler.requestFormList(url,cbFormListComplete);
    };
    
    controller.prototype.onDebug = function ( event ) {
        console.log("onDebug");
        this.loadFormList();
    };
    
    controller.prototype.onLoadFormList = function ( event ) {
        console.log("onLoadFormList");
        var $list = app.view.getFormList();
        this.$checkboxList = $list.find("input");
        this.checkboxArray = app.view.getFormArray();
        
        // get list of forms to load
        this.loadList = [];
        for (var i = 0; i < app.xformHandler.numForms(); i++) {
          var $form = app.xformHandler.getForm(i);
          if (this.$checkboxList[i].checked && !$form.loaded) {
            this.loadList.unshift(i);
          }
        }
        if (this.loadList.length) {
            var index = this.loadList.pop();
            app.xformHandler.requestForm(index,this.cbFormLoadComplete.bind(this));
        }
    };

    controller.prototype.cbFormLoadComplete = function(status,index) {
        console.log("cbFormLoadComplete");
        
        // only do this if the form loaded successfully
        if (status) {
            // Create page
            app.view.createForm({model:app.xformHandler.getForm(index),index:index});
            
        }
        
        // success or failure you want to disable the item in the list
        // Uncheck and disable checkbox
        // Todo this should be in the view 
        var searchStr = "input[name='formlist-"+index+"']";
        var $element = $(searchStr);
        $element.prop('checked', false).checkboxradio( "option", "disabled", true );
        $element.checkboxradio('refresh');
        
        // get next page
        if (this.loadList.length) {
            app.xformHandler.requestForm(this.loadList.pop(),
                                     this.cbFormLoadComplete.bind(this));
        }
        else {
            app.view.getFormList().enhanceWithin();
            app.view.$newFormList.listview('refresh');
        }
    };
    
    var cbFormListComplete = function(xmlFile) {
      
      // Save the form to local memory
      var filename = "form-list";
      localStorage.setItem(filename,xmlFile);
      
      // put the list of forms into the page
      app.view.insertForms(app.xformHandler.getAllForms());
    }
    
    controller.prototype.newForm = function(form) {
        var $page = $("#page-form-" + form.get("name"));
        var model = new formData(form.get("data"));
        model._name = form.get("name");
        model._timestamp = Date.now();
        form.set("current",model);
        //var pageID = pageURL.hash.replace( /#/, "" );
        app.view.showForm(form,model,$page);
    }
     
    controller.prototype.editForm = function(model) {
        var form = app.xformHandler.getFormByName(model._name);
        var $page = $("#page-form-" + form.get("name"));
        //var model = new formData(form.get("data"));
        //model._name = form.get("name");
        //model._timestamp = Date.now();
        form.set("current",model);
        //var pageID = pageURL.hash.replace( /#/, "" );
        app.view.showForm(form,model,$page);
    }
   
    // handle the jqm page change to make sure dynamic content is handled
    var pageChange = function( event, data) {
        // console.log("changePage " + data.toPage)
      if ( typeof data.toPage === "string" ) {
    
        var pageURL = $.mobile.path.parseUrl( data.toPage );
        var pageselector = pageURL.hash.replace( /\?.*$/, "" );

        if (pageselector.indexOf("#nav-") >= 0) {
            event.preventDefault();
            return;            
        }
        
        switch (pageselector) {
          case "#page-formlist":
            requestFormList(defaultURL);
            break;
          case "#load-form":
            var index = pageURL.hash.replace( /.*index=/, "" );
            console.log("loading form #" + index);
            requestForm(index);
            break;
          default:
            return;
        }
          
        event.preventDefault();
      }
    
    }
    
    // bind the plugin to jQuery     
    $.jqmController = function(options) {
        return new controller( options );
    }

})( jQuery, window, document );
