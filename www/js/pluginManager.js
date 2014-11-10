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
    
    // Manage loading and initialization of plugins
    function pluginManager(  ) {
        this.plugins = {};
        this.pluginLoadList = [];

    };
    
    //
    pluginManager.prototype.init = function() {
        console.log("pluginManager init");
        this.loadPlugins();
    };
    
    pluginManager.prototype.loadPlugins = function() {
        console.log("pluginManager loadPlugins");
        var pluginConfig = config.plugins;
        for (key in pluginConfig) {
            var pluginSpec = pluginConfig[key];
            this.plugins[pluginSpec.name] = {config:pluginSpec.config};
        }
        // load page content
        //as you see I have used this very page's url to test and you should replace it
        //var fileUrl = "/templates/settings.htm";
        //var html = "<iframe id='new-data' onload='app.view.dynamicLoad()' src='templates/settings.htm'  style='display:none'></iframe>";
        //$("#load-here").append(html);
    };
    
    pluginManager.prototype.cbLoadComplete = function(text, status, xhr) {
        console.log("pluginManager cbLoadComplete");
    };
    
    // bind the plugin to jQuery     
    app.pluginManager = new pluginManager(); 

})( jQuery, window, document );
