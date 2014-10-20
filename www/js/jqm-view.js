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

    function view(  ) {
        //this.init();
        this.loadFormArray = [];
        this.savedFormArray = [];
        this.newFormArray = [];
        this.$checkboxList = [];
        this.checkboxArray = [];
    };

    view.prototype.init = function ( options ) {
        //console.log("jqm-view init");
        
        this.$loadFormList = $("#form-list-data");
        this.$savedFormList = $("#form-saved-list");
        this.$newFormList = $("#form-items");
        this.formList = this.$loadFormList[0];
        this.confirm = new confirmDialog();

        // Set events
        $("#reset-dialog input[value='ok']").on("click",this.onResetOK.bind(this));
        $("#reset-dialog input[value='cancel']").on("click",this.onResetCancel.bind(this));
        
        // Intitialize controls
        $('#serverURL').val(app.state.settings.serverInfo.get("url"));
        $('#username').val(app.state.settings.serverInfo.get("username"));
        $('#password').val(app.state.settings.serverInfo.get("password"));
        $("#serverURL").change(this.onServerURLChange.bind(this));
        $("#username").change(this.onUsernameChange.bind(this));
        $("#password").change(this.onPasswordChange.bind(this));
        
        // Initialize jqm
        $("div.page").each(function(index){
            $(this).page();
            });
        $("div.popup").each(function(index){
            $(this).popup(); 
            });
        this.$loadFormList.enhanceWithin();
        this.$newFormList.listview();
        this.$savedFormList.listview();
    };
    
    view.prototype.newSavedFormItem = function ( options ) {
        //console.log("jqm-view newSavedFormItem");

        var item =  new savedFormItem(options);
        item.index = this.savedFormArray.length;
        item.render();
        this.$savedFormList.append(item.$el);
        this.savedFormArray.unshift(item);
        this.$savedFormList.listview("refresh");
        return true;
    };
    
    view.prototype.removeSavedFormItem = function ( options ) {
        //console.log("jqm-view newSavedFormItem");
        var model = options["model"];
        var item = null;
        for (var i = 0; i < this.savedFormArray.length; i++) {
            if (model === this.savedFormArray[i].model) {
                item = this.savedFormArray[i];
            }
        }
        if (!item) {
            return false;
        }
        
        item.remove();
        this.$savedFormList.listview("refresh");
        var index = this.savedFormArray.indexOf(item);
        this.savedFormArray.splice(index,1);
        return true;
    };
    
    view.prototype.newFormListItem = function ( options ) {
        //console.log("jqm-view newFormListItem");

        var item =  new loadFormListItem(options);
        item.render();
        this.$loadFormList.append(item.$el);
        this.loadFormArray.unshift(item);
        return true;
    };
    
    view.prototype.getFormList = function () {
        return this.$loadFormList;
    };
    
    view.prototype.getFormArray = function () {
        return this.loadFormArray;
    };
        
    view.prototype.insertForms = function ( formList ) {
        for (var i = 0; i < formList.length; i++) {
            this.newFormListItem({model:formList.at(i)});
        }
        this.$loadFormList.enhanceWithin();
    };
    
    getStringRef = function ( $form, element ) {
        var str = "";
        var ref = $(element).attr("ref");
        if (!ref) {
          return element.textContent;
        }
        if (ref.indexOf("itext") >= 0) {
          var fields = ref.split("'");
          var srchStr = fields[1];
          //var formData = $form.form;
          var text = $form["strings"];
          var srchStr = srchStr.replace(/\//g,"\\$&").replace(/:/g,"\\$&");
          var ll =  $(text).find("#" + srchStr)[0]; 
          var value = $(ll).find("value")[0];
          str = value.textContent;
        }
        else {
          console.log('not found');
          alert("string not found");
        }
        return str;
    };
    
    view.prototype.parseSelect1 = function (options,reference,field,labelString) {
        var model = options["model"];
        var element = new formSelect1(options);
        var choiceNumber = 0;
        var referenceItems = reference.split("/");
        var fieldName = model.get("name") + "-" + referenceItems[2];
        var children = field.children;
        element.reference = reference;
        
        for (var j = 0; j < children.length; j++) {
            var selectField = children[j];
            switch(selectField.nodeName) {
              case "label":
                element.label = labelString;
                break; 
              case "item":
                var choice = model.get("name") + "-choice-" + choiceNumber;
                choiceNumber++;
                element.addItem(selectField,fieldName,choice);
                break;
              case "hint":
                break;
              default:
                console.log("parseSelect1 selectField not found " + selectField.nodeName);
            }
        }
        return element;
    };
    
    view.prototype.parseUpload = function (options,reference,field,labelString) {
        var element = new formUpload(options);
        // Check to see if it is an image type
        //var m = field.attributes.mediatype;
        var mediatype = field.getAttribute("mediatype");
        //var tu = field.getAttribute("error");
        if ("image\/*" === mediatype) {
            element.imageType = true;
        }
        element.reference = reference;
        element.label = labelString;
        return element;
    };
    
    view.prototype.createForm = function (options) {
        //console.log("view createForm ");
        
        // Add item into new form list
        var model = options["model"];
        var item =  new newFormListItem({model:model});
        item.index = options["index"]; //this.newFormArray.length;
        item.render();
        this.$newFormList.append(item.$el);
        this.newFormArray.unshift(item);
        
        // create page
        var page = new formPage(options);
        page.index = item.index;
        page.render();
        $("body").append(page.$el);
        var $container = $(page.$el.find("#page-form-content"));

        // Add page content
        var $form = model.get("form");
        var $xml = $form["$xml"];
        var $fields = $xml[0].body.children;
        for (var i = 0; i < $fields.length; i++) {
            var field = $fields[i];
            var element = null;
            var elementString = "";
            var reference = $(field).attr("ref");
            var label = $(field).find("label")[0];
            var labelString =  getStringRef($form,label);
            switch (field.nodeName) {
            case "select1":
                var element = this.parseSelect1(options,reference,field,labelString);
                break;
            case "upload":
                var element = this.parseUpload(options,reference,field,labelString);
              break;
            case "input":
                var element = new formInput(options);
                element.reference = reference;
                element.label = labelString;
              break;
            default:
              console.log("<div>Unimplemented element" + field.nodeName + "</div>");
            }

            // Render new element and add to the page
            if (element) {
                element.render();
                $container.append(element.$el);
                $container.append("<hr>");
            }
        }
        page.$el.page();
    };
    
    view.prototype.getSelectedForms = function(forms) {
        var $list = app.view.getFormList();
        this.$checkboxList = $list.find("input");
        this.checkboxArray = app.view.getFormArray();
        
        // get list of forms to load
        loadList = [];
        for (var i = 0; i < forms.length; i++) {
          var $form = forms.at(i);
          if (this.$checkboxList[i].checked && !$form.loaded) {
            var name = this.$checkboxList[i].attributes["name"].value;
            loadList.unshift(name);
          }
        }
        return loadList;
    };

    view.prototype.setFormListItem = function(options) {
        if (!("name" in options) ||
            !("checked" in options) ||
            !("disabled" in options)) {
            return;
        }
        var name = options["name"];
        var checked = options["checked"];
        var disabled = options["disabled"];
        var searchStr = "input[name='"+name+"']";
        var $element = $(searchStr);
        $element.prop('checked', checked).checkboxradio( "option", "disabled", disabled );
        $element.checkboxradio('refresh');
    };
    
    view.prototype.getModelData = function(page) {
        var form = page.model;
        var formData = form.get("form");
        var model = form.get("current");
        for (var key in form.get("data")) {
            var item = formData[key];
            var name = item.nodeset;
            //var value = model.get(key);
            var searchString = "[name*='" + name + "']";
            var element = page.$el.find(searchString);
            var type = $(element).attr("id");
            switch (type) {
                case "select1":
                    var subItems = $(element).find("input");
                    for (var subIndex = 0; subIndex < subItems.length; subIndex++) {
                      //var idSelector = "choice-" + i;
                      var $subItem = $(subItems[subIndex]);
                      
                      if ($subItem[0].checked) {
                        model.set(key,$subItem.attr("value"));
                      }
                    }
                    break;
                case "upload":
                    var value = $(element).find("input")[0].value;
                    model.set(key,value);
                    break;
                case "input":
                    var value = $(element).find("input")[0].value;
                    model.set(key,value);
                    break;
                default:
                // other fields
                break;
            }
        }
    };

    view.prototype.showForm = function($form,model,$page) {
      // Loop through keys finding page elements
      var formData = $form.get("form");
      for (var key in $form.get("data")) {
        var item = formData[key];
        var name = item.nodeset;
        var value = model.get(key);
        var searchString = "[name*='" + name + "']";
        var element = $page.find(searchString);
        var type = $(element).attr("id");
        switch (type) {
          case "select1":
            element.listview();
            element.enhanceWithin();
            var subItems = $(element).find("input");
            for (var subIndex = 0; subIndex < subItems.length; subIndex++) {
              var subItem = subItems[subIndex];
              var i = $(subItem).attr("id").split("-")[2];
              var elementValue = subItem.value;
              
              if (value === elementValue) {
                $(subItem).attr("checked",true).checkboxradio("refresh");
              }
              else {
                $(subItem).attr("checked",false).checkboxradio("refresh");
              }
            }
            element.listview("refresh");
            element.enhanceWithin();
            break;
          case "upload":
            // This does not work.  It is a security risk 
            // to change the value of a input type='file'
            // TODO: handle it the file browser programmatically
            //$(element).find("input")[0].value = value;
            break;
          case "input":
            $(element).find("input")[0].value = value;
            break;
          default:
            // other fields
            break;
        }
      }
      $.mobile.changePage($page,{transition:"slide"});
    };
    
    view.prototype.showNewForm = function (index,model) {
        var $form = app.xformHandler.getForm(index);
        var $page = $( "#page-form-"+index );
        $form.set("current",model);
        this.showForm($form,model,$page);
        //$.mobile.changePage($page);
    };
    
    view.prototype.resetDialog = function (event) {
        var dialog = $("#reset-dialog-popup");
        $("#reset-dialog").popup("open").popup({transition:"none"});
    };
    
    view.prototype.onResetOK = function (event) {
        //console.log("onResetOK");
        $("#reset-dialog").popup("close");
        //app.uiController.onReset();
        app.reset();
    };
    
    view.prototype.onResetCancel = function (event) {
        //console.log("onResetCancel");
        $("#reset-dialog").popup("close");
    };
    
    view.prototype.reset = function() {
        // Delete new form list
        while (this.newFormArray.length) {
            var element = this.newFormArray.pop();
            element.remove();
        }
        
        // Delete saved form list
        while (this.savedFormArray.length) {
            var element = this.savedFormArray.pop();
            element.remove();
        }
        
        // Delete load forms list
        while (this.loadFormArray.length) {
            var element = this.loadFormArray.pop();
            element.remove();
        }
         
        // reset UI lists
        this.$loadFormList.enhanceWithin();
        this.$loadFormList.controlgroup("refresh");
        this.$newFormList.listview("refresh");
        this.$savedFormList.listview("refresh");       
    };
    
    view.prototype.serverURL = function(url) {
    };
    
    view.prototype.username = function(name) {
        var $input = $('#username');
        if (typeof name != 'undefined') {
            $input.val(name);
        }
        else {
            name = $input.val();
        }
        return name;
    };
    
    view.prototype.password = function(pwd) {
    };
    
    view.prototype.onServerURLChange = function(evt) {
        console.log("input serverURL " + evt.target.value);
        app.state.settings.serverInfo.set("url",evt.target.value);
        //app.state.settings.serverInfo.sync("create");
        
    };
    
    view.prototype.onUsernameChange = function(evt) {
        console.log("input username " + evt.target.value);
        app.state.settings.serverInfo.set("username",evt.target.value);
        //app.state.settings.serverInfo.sync("create");
    };
    
    view.prototype.onPasswordChange = function(evt) {
        console.log("input password " + evt.target.value);
        app.state.settings.serverInfo.set("password",evt.target.value);
        //app.state.settings.serverInfo.sync("create");
        
    };
    
    // bind the plugin to jQuery
    var localView = new view();
    
    //$.jqmView = localView;
    app.view = localView;

})( jQuery, window, document );
