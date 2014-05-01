// TODO:
//  1. add copyright


;(function ( $, window, document, undefined ) {
    //var formListItems = [];

    var formListItem = Backbone.View.extend({
        tagName: "label",
        //template: _.template("<input type='checkbox' id='formlist-<%= index %>' name='formlist-<%= index %>'><label for='formlist-<%= index %>'><%= name %></formList>"),
        template: _.template("<input type='checkbox' id='formlist-<%= index %>' name='formlist-<%= index %>'><%= name %>"),
        //<label for='formlist-<%= index %>'>
        defaults: {
            //model: null,
            index: 0,
            name: ""
        },
       
        initialize: function(options) {
            console.log("new formListItem ");
            this.index = -1;
            
            // add options into model
            //$.extend(this,options);
        },
        render: function() {
            /*
            var html, $oldel=this.$el, $newel;
            html =
            $newel=this.$el.html(this.template({index:this.index,name:this.model.get("name")}));
            $newel.insertAfter($oldel);
            return this;
            */
            var str = this.template({index:this.index,name:this.model.get("name")});
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

    function view( options ) {
        this.init();
    };

    view.prototype.init = function ( options ) {
        console.log("jqm-view init");
        this.formArray = [];
        this.$formList = $("#form-list-data");
        this.formList = this.$formList[0];
    };
    
    view.prototype.newFormListItem = function ( options ) {
        console.log("jqm-view newFormListItem");

        var item =  new formListItem(options);
        item.index = this.formArray.length;
        item.render();
        this.$formList.append(item.$el);
        //item.$el.checkboxradio();
        this.formArray.unshift(item);
        return true;
    };
    
    view.prototype.getFormList = function () {
        return this.$formList;
    };
    
    view.prototype.getFormArray = function () {
        return this.formArray;
    };
    
    view.prototype.insertForms = function ( formList ) {
        for (var i = 0; i < formList.length; i++) {
            this.newFormListItem({model:formList.at(i)});
        }
        this.$formList.enhanceWithin();
    };
    
    view.prototype.createForm = function (form) {
        console.log("view createForm " + form.get("name"));
    };
    
    // bind the plugin to jQuery     
    $.jqmView = function(options) {
        return new view( options );
    }

})( jQuery, window, document );
