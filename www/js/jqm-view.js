// TODO:
//  1. add copyright


;(function ( $, window, document, undefined ) {
    //var formListItems = [];

    var formListItem = Backbone.View.extend({
        tagName: "label",
        template: _.template("<input type='checkbox' name='checkbox-<%= index %>'><%= name %>"),
        defaults: {
            //model: null,
            index: 0,
            name: ""
        },
       
        initialize: function(options) {
            console.log("new formListItem ");
            
            // add options into model
            //$.extend(this,options);
        },
        render: function() {
            this.$el.html(this.template({index:this.index,name:this.model.get("name")}));
            return this;
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
        item.render();
        this.$formList.append(item.$el);
        this.formArray.unshift(item);
        return true;
    };
    
    view.prototype.getFormList = function (i) {
        return this.$formList;
    };
    
    view.prototype.insertForms = function ( formList ) {
        for (var i = 0; i < formList.length; i++) {
            this.newFormListItem({model:formList.at(i)});
        }
        this.$formList.enhanceWithin();
    };
    
    // bind the plugin to jQuery     
    $.jqmView = function(options) {
        return new view( options );
    }

})( jQuery, window, document );
