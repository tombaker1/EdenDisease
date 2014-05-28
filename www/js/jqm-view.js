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
    //var formListItems = [];
/*
    var savedFormItem = Backbone.View.extend({
        tagName: "li",
        //template: _.template("<input type='checkbox' id='savedform-<%= index %>' name='formlist-<%= index %>'>Type: <%= name %> <br>Created: <%= timestamp %>"),
        //template: _.template("<a id='new-item' data-transition='slide' href='#page-form-<%= name %>?<%= timestamp %>'>Type: <%= name %> <br>Created: <%= date %></a>"),
        template: _.template("<a id='new-item' data-transition='slide' href='#page-form-<%= name %>'>Type: <%= name %> <br>Created: <%= date %></a>"),
        defaults: {
            //model: null,
            index: 0,
            name: ""
        },
        events: {
            "click": "onClick"
        },
       
        initialize: function(options) {
            console.log("new savedFormItem ");
            this.index = -1;
            //this.on("click",this.onClick,this);
            
         },
        render: function() {
            //var str = this.template({index:this.index,name:this.model.get("name")});
            var created = new Date(this.model._timestamp);
            //this.$el.attr("for","savedform-"+this.index);
            //this.on("click",this.onClick,this);
            return this.$el.html(this.template({index:this.index,name:this.model._name,timestamp:this.model._timestamp,date:created}));
        },
        
        onClick: function() {
            console.log("savedFormListItem onClick");
            app.uiController.editForm(this.model);
            event.preventDefault();
        }
    });

    var loadFormListItem = Backbone.View.extend({
        tagName: "label",
        template: _.template("<input type='checkbox' id='formlist-<%= name %>' name='<%= name %>'><%= name %>"),
        defaults: {
            //model: null,
            index: 0,
            name: ""
        },
       
        initialize: function(options) {
            console.log("new loadFormListItem ");
            this.index = -1;
            
         },
        render: function() {
            //var str = this.template({index:this.index,name:this.model.get("name")});
            var name = this.model.get("name");
            this.$el.attr("for",name);
            return this.$el.html(this.template({name:name}));
        },
        enable: function(options) {
            if (options) {
                //this.$el
                console.log("enable item");
            }
        }
    });

    var newFormListItem = Backbone.View.extend({
        tagName: "li",
        template: _.template("<a id='new-item' data-transition='slide' href='#page-form-<%= name %>'><%= name %></a>"),
        defaults: {
            //model: null,
            index: 0,
            name: ""
        },
        events: {
            "click": "onClick"
        },
       
       
        initialize: function(options) {
            console.log("new newFormListItem ");
            this.index = -1;
            
         },
        render: function() {
            //var str = this.template({index:this.index,name:this.model.get("name")});
            //this.$el.attr("for","formList-"+this.index);
            return this.$el.html(this.template({name:this.model.get("name")}));
        },
        
        onClick: function() {
            console.log("newFormListItem onClick");
            app.uiController.newForm(this.model);
            event.preventDefault();
        }
    });
    
    var formPage = Backbone.View.extend({
        tagName: "div",
        template: _.template("<div data-role='header' data-add-back-btn='false' data-position='fixed'>" +
                                "<h1><%= name %></h1>" +
                            "</div>" +
                             "<div id='page-form-content' data-role='content'></div>" +
                             "<div class='page-form-footer' data-role='footer' data-position='fixed' style='text-align:center'>" + 
                                "<a class='footer-button' id='cancel' data-role='button' data-inline='true' href='#nav-cancel' style='display:inline-table'>Cancel</a>" +
                                "<a class='footer-button' id='save'   data-role='button' data-inline='true'    style='display:inline-table'>Save</a>" +
                                "<a class='footer-button' id='submit' data-role='button' data-inline='true' href='#nav-submit' style='display:inline-table'>Submit</a>" +
                             "</div>"
                            ),
        events: {
            "click #cancel": "onCancel",
            "click #save":    "onSave",
            "click #submit":  "onSubmit"
        },
        
        initialize: function(options) {
            console.log("new formPage ");
            this.index = -1;
            
         },
        render: function() {
            //var str = this.template({index:this.index,name:this.model.get("name")});
            var name = this.model.get("name");
            this.$el.attr({"id":"page-form-" + name,
                          "name":name,
                          "data-role":"page"});
            return this.$el.html(this.template({index:this.index,name:this.model.get("name")}));
        },
        onCancel: function() {
            console.log("cancel button");
            app.view.getModelData(this);
            //$.mobile.changePage("#page-new-form",
            //                    {transition:"slide",
            //                    reverse:"true"});
            parent.history.back();
            $(app.uiController).trigger("form-cancel",this.model.get("current"));
        },
        onSave: function() {
            console.log("save button");
            app.view.getModelData(this);
            $(app.uiController).trigger("form-save",this.model.get("current"));
        },
        onSubmit: function() {
            console.log("submit button");
            app.view.getModelData(this);
            parent.history.back();
            $(app.uiController).trigger("form-submit",this.model.get("current"));
        }
    });

    var formSelect1 = Backbone.View.extend({
        //<fieldset id='select1' name='" + reference + "' data-role='controlgroup' data-mini='true'>
        tagName: "fieldset",
        labelTemplate: _.template("<legend><%= label %></legend>"),
        itemTemplate: _.template("<label for='<%= id %>'>" +
                                 "<input type='radio' name='<%= name %>' id='<%= id %>' value='<%= value %>'>" +
                                "</input>" +
                                "<%= label %></label>"),
        //itemValueTemplate: _.template("<a id='new-item' href='#page-form-<%= index %>'><%= name %></a>"),
        defaults: {
            //model: null,
            index: 0,
            name: ""
        },
       
        initialize: function(options) {
            console.log("new newFormListItem ");
            this.index = -1;
            this.label = "";
            this.itemList = [];
            
         },
        render: function() {
            //var str = this.template({index:this.index,name:this.model.get("name")});
            this.$el.attr({"id":"select1",
                          "name":this.reference,
                          "data-role":"controlgroup",
                          "data-mini":"true"});
            this.$el.html(this.labelTemplate({label:this.label}));
            
            for (var i = 0; i < this.itemList.length; i++) {
                var item = this.itemList[i];
                this.$el.append(this.itemTemplate(item));
            }
            return this.$el; //.html(this.template({index:this.index,name:this.model.get("name")}));
        },
        
        addItem: function(element,name,id) {
            var children = element.children;
            //var elementString =  "<input type='radio' name='" + name + "' id='" + id + "'";
            var label = "";
            var value = "";
            for (var i = 0; i < children.length; i++) {
              var field = children[i];
              switch(field.nodeName) {
                case "label":
                  label = getStringRef(this.model.get("form"),field);
                  break;
                case "value":
                  //elementString += " value='" + field.innerHTML + "'";
                  value = field.textContent;
                  break;
                case "hint":
                  console.log("hint not implemented");
                  break;
                default:
                  console.log("parseSelect1 field not found " + field.nodeName);
              }
            }
            this.itemList.push({name:name,id:id,label:label,value:value})
        },
        addHint: function(field) {
            console.log("hint not implemented");
        }
    });

    var formUpload = Backbone.View.extend({
        //<fieldset id='select1' name='" + reference + "' data-role='controlgroup' data-mini='true'>
        tagName: "fieldset",
        template: _.template("<%= label %><input id='upload' type='file' name='<%= reference %>'>"),
        defaults: {
            //model: null,
            index: 0,
            name: ""
        },
       
        initialize: function(options) {
            console.log("new newFormListItem ");
            //this.index = -1;
            this.reference = "";
            
         },
        render: function() {
            //var str = this.template({index:this.index,name:this.model.get("name")});
            this.$el.attr({"id":"upload",
                          "name":this.reference,
                          "data-role":"fieldcontain"});
            return this.$el.html(this.template({label:this.label,reference:this.reference}));
        }
    });
    
    var formInput= Backbone.View.extend({
        //<fieldset id='select1' name='" + reference + "' data-role='controlgroup' data-mini='true'>
        tagName: "fieldset",
        template: _.template("<%= label %><input id='input' type='text' name='<%= reference %>'>"),
        defaults: {
            //model: null,
            index: 0,
            name: ""
        },
       
        initialize: function(options) {
            console.log("new newFormListItem ");
            this.reference = "";
            this.label = "";
            
         },
        render: function() {
            //var str = this.template({index:this.index,name:this.model.get("name")});
            this.$el.attr({"id":"input",
                          "name":this.reference,
                          "data-role":"fieldcontain"});
            return this.$el.html(this.template({label:this.label,reference:this.reference}));
        }
    });
*/
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
            $(this).popup(); //.dialog("close");
            //$(this).attr("width",320)
            //        .attr("height",240)
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
        //item.$el.checkboxradio();
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
        //this.savedFormArray.remove(item);
        var index = this.savedFormArray.indexOf(item);
        this.savedFormArray.splice(index,1);
        return true;
    };
    
    view.prototype.newFormListItem = function ( options ) {
        console.log("jqm-view newFormListItem");

        var item =  new loadFormListItem(options);
        //item.index = this.loadFormArray.length;
        item.render();
        this.$loadFormList.append(item.$el);
        //item.$el.checkboxradio();
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
        //this.$loadFormList.listview("refresh"); //enhanceWithin();
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
          //console.log('ref:' + srchStr);
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
        //if ($form.value === undefined) {
        //    $form.value = "";
        //}
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
                      //var $subItem 
                      //var i = $subItem.attr("id").split("-")[2];
                      
                      //if ($subItem.attr("checked")) {
                      if ($subItem[0].checked) {
                        model.set(key,$subItem.attr("value"));
                        //subItem.checked = true;
                        //$(subItem).attr("checked",true).checkboxradio("refresh");
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
        //var value = item.value;
        element.listview();
        element.enhanceWithin();
        var subItems = $(element).find("input");
        for (var subIndex = 0; subIndex < subItems.length; subIndex++) {
          //var idSelector = "choice-" + i;
          var subItem = subItems[subIndex];
          var i = $(subItem).attr("id").split("-")[2];
          var elementValue = subItem.value;
          
          if (value === elementValue) {
            //subItem.checked = true;
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
        //var value = item.value;
        $(element).find("input")[0].value = value;
        break;
      default:
        // other fields
        break;
    }
  }
  $.mobile.changePage($page,{transition:"slide"});
  //$.mobile.changePage($page);
};
    
    view.prototype.showNewForm = function (index,model) {
        //var index = url.replace( /#page-form-/, "" );
        //var menuItem = this.newFormArray[index];
        //var oldModel = menuItem.model;
        //var newModel = $.extend({name:oldModel.get("name"),timestamp:Date.now()},oldModel.model);
        //this.fillForm(oldModel,newModel);
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
