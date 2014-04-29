// TODO:
//  1. add copyright


;(function ( $, window, document, undefined ) {
    
    var formListItem = Backbone.View.extend({
        tagName: "label",
        template: _.template("<input type='checkbox' name='checkbox-<%= index %>'><%= name %>"),
        defaults: {
            model: null,
            index: 0,
            name: ""
        },
       
        initialize: function(options) {
            console.log("new formListItem ");
            
            // add options into model
            $.extend(this,options);
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
    };
    
    view.prototype.newFormListItem = function ( options ) {
        console.log("jqm-view newFormListItem");
        return new formListItem(options);
    };
    
    // bind the plugin to jQuery     
    $.jqmView = function(options) {
        return new view( options );
    }

})( jQuery, window, document );
