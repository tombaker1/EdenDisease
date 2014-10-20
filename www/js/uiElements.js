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


var savedFormItem = Backbone.View.extend({
    tagName: "li",
    template: _.template("<a id='new-item' data-transition='slide' href='#page-form-<%= name %>'><span>Type: <%= name %> <div style='color:red'><%= submitted %></div></span><br>Created: <%= date %></a>"),
    defaults: {
        //model: null,
        index: 0,
        name: ""
    },
    events: {
        "click": "onClick"
    },
   
    initialize: function(options) {
        //console.log("new savedFormItem ");
        this.index = -1;
        
     },
    render: function() {
        var created = new Date(this.model.timestamp());
        var submittedText = "";
        if (this.model.submitted()) {
            submittedText = "Submitted";
        }
        return this.$el.html(this.template({index:this.index,
                                           name:this.model.name(),
                                           timestamp:this.model.timestamp(),
                                           date:created,
                                           submitted:submittedText}));
    },
    
    onClick: function() {
        //console.log("savedFormListItem onClick");
        app.uiController.editForm(this.model);
        event.preventDefault();
    }
});

var loadFormListItem = Backbone.View.extend({
    tagName: "label",
    template: _.template("<input type='checkbox' id='formlist-<%= name %>' name='<%= name %>'/><%= name %>"),
    defaults: {
        index: 0,
        name: ""
    },
   
    initialize: function(options) {
        //console.log("new loadFormListItem ");
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
            //console.log("enable item");
        }
    }
});

var newFormListItem = Backbone.View.extend({
    tagName: "li",
    template: _.template("<a id='new-item' data-transition='slide' href='#page-form-<%= name %>'><%= name %></a>"),
    defaults: {
        index: 0,
        name: ""
    },
    events: {
        "click": "onClick"
    },
   
   
    initialize: function(options) {
        //console.log("new newFormListItem ");
        this.index = -1;
        
     },
    render: function() {
        return this.$el.html(this.template({name:this.model.get("name")}));
    },
    
    onClick: function() {
        //console.log("newFormListItem onClick");
        app.uiController.newForm(this.model);
        event.preventDefault();
    }
});

var formPage = Backbone.View.extend({
    tagName: "div",
    template: _.template("<div data-role='header' data-add-back-btn='false' data-position='fixed'>" +
                            "<h1><%= name %></h1>" +
                        "</div>" +
                        "<form enctype='multipart/form-data' method='post' name='xml_submission_file'>" +
                         "<div id='page-form-content' data-role='content'></div>" +
                         "</form>" +
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
        //console.log("new formPage ");
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
        //console.log("cancel button");
        app.view.getModelData(this);
        parent.history.back();
        $(app.uiController).trigger("form-cancel",this.model.get("current"));
    },
    onSave: function() {
        //console.log("save button");
        app.view.getModelData(this);
        $(app.uiController).trigger("form-save",this.model.get("current"));
    },
    onSubmit: function() {
        //console.log("submit button");
        app.view.getModelData(this);
        parent.history.back();
        $(app.uiController).trigger("form-submit",this.model.get("current"));
    }
});

var formSelect1 = Backbone.View.extend({
    tagName: "fieldset",
    labelTemplate: _.template("<legend><%= label %></legend>"),
    itemTemplate: _.template("<label for='<%= id %>'>" +
                             "<input type='radio' name='<%= name %>' id='<%= id %>' value='<%= value %>'>" +
                            "</input>" +
                            "<%= label %></label>"),
    defaults: {
        index: 0,
        name: ""
    },
   
    initialize: function(options) {
        //console.log("new newFormListItem ");
        this.index = -1;
        this.label = "";
        this.itemList = [];
        
     },
    render: function() {
        this.$el.attr({"id":"select1",
                      "name":this.reference,
                      "data-role":"controlgroup",
                      "data-mini":"true"});
        this.$el.html(this.labelTemplate({label:this.label}));
        
        for (var i = 0; i < this.itemList.length; i++) {
            var item = this.itemList[i];
            this.$el.append(this.itemTemplate(item));
        }
        return this.$el; 
    },
    
    addItem: function(element,name,id) {
        var children = element.children;
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
              //console.log("hint not implemented");
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
    tagName: "fieldset",
    //template: _.template("<%= label %><input id='upload' type='file' name='<%= reference %>'>"),
    basicTemplate: _.template("<%= label %><input id='upload' name='<%= reference %>' type='button' value='Load'>"),
    imageTemplate: _.template("<img style='display:none;width:auto;height:60px;' id='smallImage' src='' />" +
                         "<div id='title'></div>"),
    //display:none;
    defaults: {
        //model: null,
        index: 0,
        name: "",
        imageType: false,
        path: ""
    },
    events: {
        "click": "onClick"
    },
   
    initialize: function(options) {
        //console.log("new newFormListItem ");
        this.reference = "";
        //this.imageType = false;
        
     },
    render: function() {
        this.$el.attr({"id":"upload",
                      "name":this.reference,
                      "data-role":"fieldcontain"});
        //return this.$el.html(this.template({label:this.label,reference:this.reference}));
        var elementString = this.basicTemplate({label:this.label,reference:this.reference});
        if (this.imageType) {
            elementString += this.imageTemplate({label:this.label,reference:this.reference});
        }
        return this.$el.html(elementString);
    },
    onClick: function() {
        if (this.imageType) {
            navigator.camera.getPicture( this.onImageSelectSuccess.bind(this),
                                        this.onImageSelectError.bind(this),
                                        { sourceType : Camera.PictureSourceType.SAVEDPHOTOALBUM,
                                        destinationType: Camera.DestinationType.NATIVE_URI
                                         } );
        }
        else {
            //TODO: select generic fileh
            console.log("upload file not implemented");
        }
    },
    onImageSelectSuccess: function(imageURL) {
        console.log("success " + imageURL);
        this.$el.find("#title").html(imageURL);
        var $image = this.$el.find("#smallImage");
        $image.attr("src",imageURL);
        $image.show();
    },
    onImageSelectError: function(message) {
        console.log("error");
        alert("Could not select image because " + message);
        var $image = this.$el.find("#smallImage");
        $image.hide();
    }
});

var formInput= Backbone.View.extend({
    tagName: "fieldset",
    template: _.template("<%= label %><input id='input' type='text' name='<%= reference %>'>"),
    defaults: {
        //model: null,
        index: 0,
        name: ""
    },
   
    initialize: function(options) {
        //console.log("new newFormListItem ");
        this.reference = "";
        this.label = "";
        
     },
    render: function() {
        this.$el.attr({"id":"input",
                      "name":this.reference,
                      "data-role":"fieldcontain"});
        return this.$el.html(this.template({label:this.label,reference:this.reference}));
    }
});

var confirmDialog= Backbone.View.extend({
    //tagName: "fieldset",
    //template: _.template("<%= label %><input id='input' type='text' name='<%= reference %>'>"),
    defaults: {
        headerText: "",
        messageText: ""
    },
    events: {
        "click #ok": "onOK"
    },
   
    initialize: function(options) {
        //console.log("new newFormListItem ");
        //this.reference = "";
        //this.label = "";
        var element = document.getElementById('confirm-dialog');
        this.setElement(element);
        //this.$el.hide();
        
        
     },
     
    render: function() {
        return this.$el;
    },
    
    setText: function(header,message) {
        this.$('#header h3').html(header);
        this.$('#content h3').html(message);
    },
    
    show: function() {
        //this.render(); //.show();
        //this.$el.popup("open").popup({transition:"none"});
        $("#confirm-dialog").popup("open").popup({transition:"none"});
    },
    
    onOK: function(evt) {
        this.$el.popup("close"); //hide();
    }
});
