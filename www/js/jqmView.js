// TODO:
//  1. add copyright


;(function ( $, window, document, undefined ) {
    
    var formListItem = Backbone.View.extend({
        /*
        defaults: {
            url: "",
            name: "",
            loaded: false,
            form: null,
            data: null
        },*/
        initialize: function() {
            console.log("new formListItem name:" + this.get("name"));
        }
    });
    
    function view( options ) {
    };

    view.prototype.init = function ( options ) {
    };
    
    // bind the plugin to jQuery     
    $.jqmView = function(options) {
        return new view( options );
    }

})( jQuery, window, document );
