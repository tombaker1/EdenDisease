// TODO:
//  1. add copyright


;(function ( $, window, document, undefined ) {
    //var formListItems = [];

    var loadFormListItem = Backbone.View.extend({
        tagName: "label",
        template: _.template("<input type='checkbox' id='formlist-<%= index %>' name='formlist-<%= index %>'><%= name %>"),
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
            this.$el.attr("for","formList-"+this.index);
            return this.$el.html(this.template({index:this.index,name:this.model.get("name")}));
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
        template: _.template("<a id='new-item' href='#page-form-<%= index %>'><%= name %></a>"),
        defaults: {
            //model: null,
            index: 0,
            name: ""
        },
       
        initialize: function(options) {
            console.log("new newFormListItem ");
            this.index = -1;
            
         },
        render: function() {
            //var str = this.template({index:this.index,name:this.model.get("name")});
            this.$el.attr("for","formList-"+this.index);
            return this.$el.html(this.template({index:this.index,name:this.model.get("name")}));
        }
    });
    
    var formPage = Backbone.View.extend({
        tagName: "div",
        template: _.template("<div data-role='header' data-add-back-btn='true' data-position='fixed'>" +
                                "<h1><%= name %></h1>" +
                            "</div>" +
                             "<div data-role='content'></div>" +
                             "<div data-role='footer' data-position='fixed'><h4>Cancel/Save/Submit</h4></div>"
                            ),
       
        initialize: function(options) {
            console.log("new formPage ");
            this.index = -1;
            
         },
        render: function() {
            //var str = this.template({index:this.index,name:this.model.get("name")});
            this.$el.attr({"id":"page-form-" + this.index,
                          "name":this.model.get("name"),
                          "data-role":"page"});
            return this.$el.html(this.template({index:this.index,name:this.model.get("name")}));
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
            this.itemList.unshift({name:name,id:id,label:label,value:value})
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

    function view( options ) {
        this.init();
    };

    view.prototype.init = function ( options ) {
        console.log("jqm-view init");
        this.loadFormArray = [];
        this.newFormArray = [];
        this.$loadFormList = $("#form-list-data");
        this.$newFormList = $("#form-items");
        this.formList = this.$loadFormList[0];
        
        // Initialize jqm
        $("div.page").each(function(index){
            $(this).page();
            });
        this.$loadFormList.enhanceWithin();
        this.$newFormList.listview();
    };
    
    view.prototype.newFormListItem = function ( options ) {
        console.log("jqm-view newFormListItem");

        var item =  new loadFormListItem(options);
        item.index = this.loadFormArray.length;
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

        // Add page content
        var $form = model.get("form");
        var $xml = $form.xml;
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
            
                page.$el.append(element.$el);
              
                break;
            case "upload":
              //elementString += parseUpload(field);
              //elementString += "<div>upload</div>";
                var element = new formUpload(options);
                //var reference = $(field).attr("ref");
                element.reference = reference;
                //var label = $(field).find("label")[0];
                //var labelString = getStringRef($form,label); //label.textContent;
                element.label = labelString;
                element.render();
              
              page.$el.append(element.$el);
              break;
            case "input":
              //elementString += parseInput(field);
              //elementString += "<div>input</div>";
              var element = new formInput(options);
                element.reference = reference;
                element.label = labelString;
                element.render();
              
              page.$el.append(element.$el);
              break;
            default:
              console.log("<div>Unimplemented element" + field.nodeName + "</div>");
            }

            //elementString += "<hr>";
             page.$el.append("<hr>");
        }
        page.$el.page();
    };

view.prototype.showForm = function($form,model,$page) {
  // Loop through keys finding page elements
  var formData = $form.get("form");
  for (var key in $form.get("data")) {
    var item = formData[key];
    var name = item.nodeset;
    var searchString = "[name*='" + name + "']";
    var element = $page.find(searchString);
    var type = $(element).attr("id");
    switch (type) {
      case "select1":
        var value = item.value;
        element.listview();
        element.enhanceWithin();
        var subItems = $(element).find("input");
        for (var subIndex = 0; subIndex < subItems.length; subIndex++) {
          //var idSelector = "choice-" + i;
          var subItem = subItems[subIndex];
          var i = $(subItem).attr("id").split("-")[2];
          
          if (value === i) {
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
        // I don't know if this will work.  It is a security risk 
        // to change the value of a input type='file'
        var value = item.value;
        $(element).find("input")[0].value = value;
        break;
      case "input":
        var value = item.value;
        $(element).find("input")[0].value = value;
        break;
      default:
        // other fields
        break;
    }
    console.log("found element")
  }
  $.mobile.changePage($page);
};
    
    view.prototype.showNewForm = function ($form,model,index) {
        //var index = url.replace( /#page-form-/, "" );
        //var menuItem = this.newFormArray[index];
        //var oldModel = menuItem.model;
        //var newModel = $.extend({name:oldModel.get("name"),timestamp:Date.now()},oldModel.model);
        //this.fillForm(oldModel,newModel);
        var $page = $( "#page-form-"+index );
        this.showForm($form,model,$page);
        $.mobile.changePage($page);
    };
    
    // bind the plugin to jQuery     
    $.jqmView = function(options) {
        return new view( options );
    };

})( jQuery, window, document );
