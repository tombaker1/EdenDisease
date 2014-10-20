//  Copyright (c) 2014 Thomas Baker
//  
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//  
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//  
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.


;(function ( $, window, document, undefined ) {
    
    // Create the defaults once
    var pluginName = 'jqmController';
    var defaults = {
        };
 
    // The actual plugin constructor
    function controller(  ) {
        
        this._defaults = defaults;
        this._name = pluginName;
       
        //view.bind("form-cancel",this.onFormCancel.bind(this));
        $(this).bind("form-cancel",this.onFormCancel.bind(this));
        $(this).bind("form-save",this.onFormSave.bind(this));
        $(this).bind("form-submit",this.onFormSubmit.bind(this));
        $(this).bind("reset-all",this.onReset.bind(this));

        //this.init(options);
        $(document).bind( "pagebeforechange", pageChange );
    };
    
    controller.prototype.init = function ( options ) {
        //reqState = options["xform"]; //new XMLHttpRequest();
        this.options = $.extend( {}, defaults, options) ;
        if (options["state"]) {
            this.state = options["state"];
        }
        else {
            this.state = app.state;
        }
        this.getLocation();
        
        $("#load-form-button").click(this.onLoadFormList.bind(this));
        $("#debug-button").click(this.onDebug.bind(this));
        
        // Load the saved data or initialize data
        var formListXml = app.storage.read("form-list");
        if (formListXml) {
            app.xformHandler.parseFormList(formListXml);
            // put the list of forms into the page
            app.view.insertForms(app.xformHandler.getAllForms());
            
            // Parse all keys
            var savedData = [];
            var storageList = app.storage.list();
            for (var i = 0; i < storageList.length; i++) {
                var key = storageList[i];
                if (key.indexOf("form-xml") >= 0) {
                    var xml = app.storage.read(key);
                    //console.log("loading form " + key + " length " + xml.length);
                    var formName = key.split('-')[2];
                    var index = app.xformHandler.parseForm(xml,formName);
                    var form = app.xformHandler.getFormByName(formName);
                    app.view.createForm({model:form,index:index});

                    // Uncheck and disable checkbox
                    app.view.setFormListItem({name:formName,
                                             checked:false,
                                             disabled:true});
                }
                else if (key.indexOf("data-") >= 0) {
                    savedData.unshift(key);
                }
            }
            
            //read the list into the collection 
            activeForms.restore(savedData);
            
            // update view lists
            app.view.getFormList().enhanceWithin();
            app.view.$newFormList.listview('refresh');
        }
      
        
    };
    
    controller.prototype.resetAll = function (  ) {
        app.view.resetDialog();
    };
    
    controller.prototype.onReset = function (  ) {
        //TODO: Move this into the model or the collection
        var list = app.storage.list();
        for (var i = 0; i < list.length; i++) {
            var path = list[i];
            app.storage.delete(path);
        }
        //window.requestAnimationFrame(function() {app.view.confirm.show()});
    };
    
    controller.prototype.onFormCancel = function (  ) {
        //console.log("onFormCancel");
    };
    
    controller.prototype.onFormSave = function ( evt,model) {
        //console.log("onFormSave");
        //app.view.getModelData(pageView);
        //var a = _.contains(activeForms,model);
        if (!activeForms.contains(model)) {
            activeForms.add(model);
            app.view.newSavedFormItem({model:model});
            model.sync('create',model,{local:true});
        }
        else {
            model.sync('update',model,{local:true});

        }
    };
    
    controller.prototype.onFormSubmit = function ( evt,model ) {
        //console.log("onFormSubmit");
        model.submit();
        
    };
    
    controller.prototype.getHostURL = function (  ) {
        var url = "";
        var serverUrl = app.state.settings.serverInfo.get("url");
        if (this.state.settings.source === 1) {
            url = serverUrl + config.defaults.formList;
        }
        else {
            url = serverUrl + "/xforms/" + config.defaults.formList;
        }
        return url;

    };
    
    controller.prototype.loadFormList = function (  ) {
        // Load the form list
        var url = this.getHostURL();
        app.xformHandler.requestFormList(url,cbFormListComplete);
    };
    
    controller.prototype.onDebug = function ( event ) {
        console.log("onDebug");

    };

    controller.prototype.onLoadFormList = function ( event ) {
        //console.log("onLoadFormList");
        var forms = app.xformHandler.getAllForms();
        this.loadList = app.view.getSelectedForms(forms);
        if (this.loadList.length) {
            var name = this.loadList.pop();
            app.xformHandler.requestForm(name,this.cbFormLoadComplete.bind(this));
        }
    };

    controller.prototype.cbFormLoadComplete = function(status,name) {
        //console.log("cbFormLoadComplete");
        
        // only do this if the form loaded successfully
        if (status) {
            // Create page
            var form = app.xformHandler.getFormByName(name);
            app.view.createForm({model:form,name:name});
            
            // Save xml to local storage
            var formName = "form-xml-"+form.get("name");
            localStorage.setItem(formName,form.get("form")["xml"]);
            
        }
        
        // success or failure you want to disable the item in the list
        // Uncheck and disable checkbox
        app.view.setFormListItem({name:name,checked:false,disabled:true});
        
        // get next page
        if (this.loadList.length) {
            var nextName = this.loadList.pop();
            app.xformHandler.requestForm(nextName,
                                     this.cbFormLoadComplete.bind(this));
        } 
        else {
        //TODO: Move this into the view
            app.view.getFormList().enhanceWithin();
            app.view.$newFormList.listview('refresh');
            app.view.confirm.setText("Load","Load Complete");
            app.view.confirm.show();
        }
    };
    
    var cbFormListComplete = function(success, xmlFile) {
      
      if (!success) {
        return;
      }
      // Save the form to local memory
      var filename = "form-list";
      //localStorage.setItem(filename,xmlFile);
      app.storage.write(filename,xmlFile);
      
      // put the list of forms into the page
      app.view.insertForms(app.xformHandler.getAllForms());
        app.view.confirm.setText("Load","Load Complete");
        app.view.confirm.show();
    }
    
    controller.prototype.cbFormSendComplete = function(status,model) {
        if (status) {
            //console.log("cbFormSendComplete success");
            activeForms.remove(model);
            app.view.removeSavedFormItem({model:model});
            model.sync("delete",model,{local:true});
            //model.
        }
        else {
            //console.log("cbFormSendComplete failure");
            //this.onFormSave(null,model);
            if (!activeForms.contains(model)) {
                activeForms.add(model);
                app.view.newSavedFormItem({model:model});
            }
        }
    };
    
    controller.prototype.newForm = function(form) {
        var $page = $("#page-form-" + form.get("name"));
        var model = new mFormData(form.get("data"));
        model.name(form.get("name"));
        model.timestamp(Date.now());
        model.urlRoot = form.get("url");
        model._formId = form.get("formId");
        form.set("current",model);
        //var pageID = pageURL.hash.replace( /#/, "" );
        app.view.showForm(form,model,$page);
    }
     
    controller.prototype.editForm = function(model) {
        var form = app.xformHandler.getFormByName(model.name());
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
         //console.log("changePage " + data.toPage)
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
            //console.log("loading form #" + index);
            requestForm(index);
            break;
          default:
            return;
        }
          
        event.preventDefault();
      }
    
    };
    
    var postLocation = function(latitude,longitude) {
        var msg = $("#content-messages").html();
        msg += "latitude: " + latitude + "<br>";
        msg += "longitude: " + longitude + "<br>";
        $("#content-messages").html(msg);
    };
    
    controller.prototype.getLocation = function() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                /*this.*/postLocation(position.coords.latitude, position.coords.longitude);
            },function() { alert("location failed");});
        } else {
            /* geolocation IS NOT available */
        }
    }
    
    var localController = new controller();
    
    // bind the plugin to jQuery     
    app.uiController = localController; 

})( jQuery, window, document );
