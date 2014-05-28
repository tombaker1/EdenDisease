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
    };

    view.prototype.init = function ( options ) {
        console.log("jqm-view init");
        
        this.$loadFormList = $("#form-list-data");
        this.$savedFormList = $("#form-saved-list");
        this.$newFormList = $("#form-items");
        this.formList = this.$loadFormList[0];

        // Set events
        $("#reset-dialog input[value='ok']").on("click",this.onResetOK.bind(this));
        $("#reset-dialog input[value='cancel']").on("click",this.onResetCancel.bind(this));
        
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
        console.log("jqm-view newSavedFormItem");

        var item =  new savedFormItem(options);
        item.index = this.savedFormArray.length;
        item.render();
        this.$savedFormList.append(item.$el);
        this.savedFormArray.unshift(item);
        this.$savedFormList.listview("refresh");
        return true;
    };
    
    view.prototype.removeSavedFormItem = function ( options ) {
        console.log("jqm-view newSavedFormItem");
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
        console.log("jqm-view newFormListItem");

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
    
    view.prototype.createForm = function (options) {
        console.log("view createForm ");
        
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
            var elementString = "";
            var reference = $(field).attr("ref");
            var label = $(field).find("label")[0];
            var labelString =  getStringRef($form,label);
            switch (field.nodeName) {
            case "select1":
              //elementString += parseSelect1(field,$form.name);

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
                        //elementString += "<legend>" + parseLabel(selectField) + "</legend>";
                        element.label = labelString;
                        break; 
                      case "item":
                        var choice = model.get("name") + "-choice-" + choiceNumber;
                        choiceNumber++;
                        //elementString += parseItem(selectField,fieldName,choice);
                        element.addItem(selectField,fieldName,choice);
                        break;
                      case "hint":
                        //elementString += parseHint(selectField);
                        //element.addHint(selectField);
                        break;
                      default:
                        console.log("parseSelect1 selectField not found " + selectField.nodeName);
                    }
                }

                element.render();
            
                //page.$el.append(element.$el);
                $container.append(element.$el);
              
                break;
            case "upload":
                var element = new formUpload(options);
                element.reference = reference;
                element.label = labelString;
                element.render();
              
                $container.append(element.$el);
              break;
            case "input":
                var element = new formInput(options);
                element.reference = reference;
                element.label = labelString;
                element.render();
              
                $container.append(element.$el);
              break;
            default:
              console.log("<div>Unimplemented element" + field.nodeName + "</div>");
            }

            //elementString += "<hr>";
            $container.append("<hr>");
        }
        page.$el.page();
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
        console.log("onResetOK");
        $("#reset-dialog").popup("close");
        app.uiController.onReset();
    };
    
    view.prototype.onResetCancel = function (event) {
        console.log("onResetCancel");
        $("#reset-dialog").popup("close");
    };
    
    // bind the plugin to jQuery
    var localView = new view();
    
    $.jqmView = localView; 

})( jQuery, window, document );
