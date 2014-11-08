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

    function view() {
        //this.init();
        this.pageSet = {};          // Collection of all active pages
        this.pageStack = [];        // Page navigation stack
        this.loadFormArray = [];
        this.savedFormArray = [];
        this.newFormArray = [];
        this.$checkboxList = [];
        this.checkboxArray = [];
    };

    view.prototype.init = function ( options ) {
        //console.log("jqm-view init");
        
        //this.$loadFormList = $("#form-list-data");
        //this.$savedFormList = $("#form-saved-list");
        //this.$newFormList = $("#form-items");
        //this.formList = this.$loadFormList[0];
        //this.confirm = new confirmDialog();

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
        
        _.extend(this, Backbone.Events);
        this.on("navigate", this.changePage.bind(this));
        
        // Initialize jqm
        //$("div.page").each(function(index){
        //    $(this).page();
        //    });
        //$("div.popup").each(function(index){
        //    $(this).popup(); 
       //     });
        
        var pages = $("div[id^='page-']");
        for (i = 0; i < pages.length; i++) {
            var el = pages[i];
            var name = $( pages[i] ).attr("id");
            this.addPage(name, new pageView({"name":name}));
        }
        //this.showPage("page-home");
        //this.homePage = new pageView({"name":"page-home"}));
        //this.addPage("page-settings",new new pageView({"name":name}));
        this.pageStack.push(this.pageSet["page-home"]);
        //this.$loadFormList.enhanceWithin();
        //this.$newFormList.listview();
        //this.$savedFormList.listview();
    };
    
    view.prototype.addPage = function ( name, page ) {
        if (page) {
            this.pageSet[name] = page;
        }
    };
    
    view.prototype.changePage = function ( pageName ) {
        console.log("view changePage to " + pageName);
        if (pageName === "page-back") {
            this.popPage();
        }
        else {
            this.showPage(pageName);
        }
    };
    
    view.prototype.showPage = function ( pageName ) {
        var element = this.pageSet[pageName];
        if (element) {
            var currentVisiblePage = this.pageStack[this.pageStack.length-1];
            this.pageStack.push(element);
            element.$el.addClass("se-page-visible");
            if (currentVisiblePage) {
                currentVisiblePage.$el.removeClass("se-page-visible");            
                currentVisiblePage.$el.addClass("se-page-left");
            }
           
        }
    };
    
    view.prototype.popPage = function (  ) {
        if (this.pageStack.length >= 1) {
            var element = this.pageStack.pop();
            var newActive = this.pageStack[this.pageStack.length-1];
            element.$el.removeClass("se-page-visible");
            newActive.$el.removeClass("se-page-left");
            newActive.$el.addClass("se-page-visible");            
        }
        
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
    
    view.prototype.updateCaseForm = function (obj) {
        // Loop through elements filling in data
        var field = obj["$_disease_case"][0]["field"];
        for (var i = 0; i < field.length; i++) {
            // Get fields
            var item = field[i];
            var name = item["@name"];
            var label = item["@label"];
            
            // Put name in label
            // TODO: add required asterisks
            var id = "#case-" + name;
            var container = $(id);
            var r = container.attr("required");
            if (item["@type"] === "date") {
                label += " (YYYY-MM-DD)";
            }
            if (container.attr("required")) {
                label += '<bold style="color:red">*</bold>';
            }
            container.find("label").first().html(label);
             
             // Fill in select entrys
             var select = item["select"];
             if (select) {
                var selectOptions = "";
                var options = select[0]["option"];
                for (var j = 0; j < options.length; j++) {
                    var opt = options[j];
                    var value = opt["@value"];
                    var optionLabel = opt["$"] || "";
                    selectOptions += '<option value = "' + value + '">' + optionLabel + '</option>';
                }
                container.find("select").first().html(selectOptions);
             }
        }
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
    
    view.prototype.getModelData = function(page,model) {
        //var form = page.model;
        //var formData = form.get("form");
        //var model = form.get("current");
        var form = app.uiController.getFormByName("disease_case");
      var formName = form.get("name");
      var formData = form.get("form");
      var data = form.get("obj")["$_" + formName][0]["field"];
      for (var key in data) {
        var item = data[key];
        var name = item["@name"];
        var searchString = "#case-" + name;
        var element = page.find(searchString).first();
        var type = item["@type"];
        var value = null;
        
        if (element.length === 0) {
            continue;
        }
        
        if (type.indexOf("reference") === 0) {
            if (item["select"]) {
                //value = "";
                //var options = item["select"][0]["option"];
                //for (var i = 0; i < options.length; i++) {
                    var select = element.find("select").first();
                    //var selectIndex = select[0].selectedIndex;
                    value = select[0]["value"];
                    model.set(name,value);
                    /*
                    if (options[i]["@value"] === value) {
                        var select = element.find("select").first();
                        select[0].selectedIndex = i;
                        select.selectmenu("refresh");
                    }
                    */
                //}
            }
        }
        else {
            if (item["select"]) {
                var select = element.find("select").first();
                var selectIndex = select[0].selectedIndex;
                value = select[0]["value"];
                model.set(name,value);
            }
            else {
            switch (type) {
                    case "string":
                        //TODO: if there is a select then get the string from the select value
                        value = (element.find("input").first().val()) || "";
                        model.set(name,value);
                        break;
                    case "date":
                        value = (element.find("input").first().val()) || "";
                        model.set(name,value);
                        break;
                    case "datetime":
                        value = (element.find("input").first().val()) || "";
                        model.set(name,value);
                        break;
                    case "text":
                        value = (element.find("input").first().val()) || "";
                        model.set(name,value);
                        break;
                    default:
                        break;
                }
            }
        }
      }
    };

    view.prototype.showForm = function(form,model,$page) {
      // Loop through keys finding page elements
      var formName = form.get("name");
      var formData = form.get("form");
      var data = form.get("obj")["$_" + formName][0]["field"];
      for (var key in data) {
        var item = data[key];
        var name = item["@name"];
        var searchString = "#case-" + name;
        var element = $page.find(searchString).first();
        var type = item["@type"];
        var value = model.get(name);
        
        if (element.length === 0) {
            continue;
        }
        
        if (type.indexOf("reference") === 0) {
            if (item["select"]) {
                //value = "";
                var options = item["select"][0]["option"];
                for (var i = 0; i < options.length; i++) {
                    if (options[i]["@value"] === value) {
                        var select = element.find("select").first();
                        select[0].selectedIndex = i;
                        select.selectmenu("refresh");
                    }
                }
            }
        }
        else {
            switch (type) {
                case "string":
                    //element.html(value);
                    element.find("input").first().val(value);
                    break;
                case "date":
                    element.find("input").first().val(value);
                    break;
                case "datetime":
                    element.find("input").first().val(value);
                    break;
                case "text":
                    element.find("input").first().val(value);
                    break;
                default:
                    break;
            }
        }
        
        /*
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
        */
      }
      //$.mobile.changePage($page,{transition:"slide"});
    };
    
    view.prototype.showNewForm = function (index,model) {
        var $form = app.commHandler.getForm(index);
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
