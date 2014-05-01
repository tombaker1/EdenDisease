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
        template: _.template("<div data-role='header' data-add-back-btn='true'><h1><%= name %></h1></div>" +
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
    };
    
    view.prototype.createForm = function (options) {
        console.log("view createForm ");
        
        // Add item into new form list
        var item =  new newFormListItem(options);
        item.index = this.newFormArray.length;
        item.render();
        this.$newFormList.append(item.$el);
        this.newFormArray.unshift(item);
        
        // create page
        var page = new formPage(options);
        page.index = item.index;
        page.render();
        $("body").append(page.$el);
    };
    
    view.prototype.fillForm = function ($form,model) {
        console.log("fillForm" + $form.get("name"));
    };
    
    view.prototype.showNewForm = function (url) {
        var index = url.replace( /#page-form-/, "" );
        var menuItem = this.newFormArray[index];
        var oldModel = menuItem.model;
        var newModel = $.extend({name:oldModel.get("name"),timestamp:Date.now()},oldModel.model);
        this.fillForm(oldModel,newModel);
        var $page = $( "#page-form-"+index );
        $.mobile.changePage($page);
    };
    
    // bind the plugin to jQuery     
    $.jqmView = function(options) {
        return new view( options );
    };

})( jQuery, window, document );
