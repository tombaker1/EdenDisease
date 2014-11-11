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

// Plugin config parameters
//
// name         - String used for page naming, and data structure keys
// type         - Type of plugin:
//                  page    - Backbone view page
//                  utility - Functional code
// template     - File path for View templates
// backButton   - Defines if the header has a back button [true/false], default true
// script       - Javascript code implementing the plugin
// style        - Plugin specific CSS code
//
// Order of loading files.  These are the values of loadState.
// 1. Template
// 2. Style
// 3. Script
// 4. Complete
//

;(function ( $, window, document, undefined ) {
    
    // Manage loading and initialization of plugins
    function pluginManager(  ) {
        this.plugins = {};
        this.pluginLoadList = [];

    };
    
    //
    pluginManager.prototype.init = function() {
        console.log("pluginManager init");
        
        // Connect to Backbone events
        _.extend(this, Backbone.Events);

        this.loadPlugins();
    };
    
    pluginManager.prototype.loadPlugins = function() {
        console.log("pluginManager loadPlugins");
        var pluginConfig = config.plugins;
        for (key in pluginConfig) {
            var pluginSpec = pluginConfig[key];
            var pluginData = { config:pluginSpec.config,
                                rawData: ""
                             };
            this.plugins[pluginSpec.name] = pluginData;
            this.pluginLoadList.push({name: pluginSpec.name, loadState: 0});
            
        }
        
        // Initiate the download
        this.requestData();
        
        // load page content
        //as you see I have used this very page's url to test and you should replace it
        //var fileUrl = "/templates/settings.htm";
        //var html = "<iframe id='new-data' onload='app.view.dynamicLoad()' src='templates/settings.htm'  style='display:none'></iframe>";
        //$("#load-here").append(html);
    };
    
    pluginManager.prototype.requestData = function(text, status, xhr) {
        console.log("pluginManager requestData");
        
        // First check to see if we are done
        if (this.pluginLoadList.length <= 0) {
            console.log("plugin load complete");
            return;
        }
        
        // Check state of plugin
        var pluginLoading = this.pluginLoadList[0];
        var currentPlugin = this.plugins[pluginLoading.name];
        var done = false;
        var parent = $("#dynamic-load");
        while (!done) {
            pluginLoading.loadState++;
            switch (pluginLoading.loadState) {
                case 1: {
                    var path = currentPlugin.config["template"];
                    if (path) {
                        var elementString = "<iframe id='new-data' onload='app.pluginManager.cbLoadComplete()' src='plugins" +
                                            path +
                                            "'  style='display:none'></iframe>";
                        parent.append(elementString);
                        done = true;
                    }
                } break;
                case 2: {
                    var path = currentPlugin.config["style"];
                    if (path) {
                        console.log("pluginManager: style loading not implemented!!!");
                    }
                } break;
                case 3: {
                    var path = currentPlugin.config["script"];
                    if (path) {
                        console.log("pluginManager: script loading not implemented!!!");
                    }
                } break;
                case 4: {
                    this.pluginLoadList.shift();
                    if (this.pluginLoadList.length) {
                        pluginLoading = this.pluginLoadList[0];
                        currentPlugin = this.plugins[pluginLoading.name];
                    }
                    else {
                        done = true;
                    }
                } break;
            }
        }
    };
    
    pluginManager.prototype.cbLoadComplete = function(text, status, xhr) {
        console.log("pluginManager cbLoadComplete");

        // Get the plugin loading info
        var pluginLoading = this.pluginLoadList[0];
        var currentPlugin = this.plugins[pluginLoading.name];
        switch (pluginLoading.loadState) {
            // template
            case 1: {
                var iframe = $("#new-data");
                var doc = iframe.contents();
                var container = $(doc).find("xmp");
                var data = container.html();
                currentPlugin.rawData = data;
            } break;

            // style
            case 2: {
            } break;

            // script
            case 3: {
            } break;


            case 4: {
            } break;
        };
        
        // Download the next file
        this.requestData();
    };
    
    
    pluginManager.prototype.getPlugin = function(key) {
        console.log("pluginManager cbLoadComplete");
        return this.plugins[key];
    };
    // bind the plugin to jQuery     
    app.pluginManager = new pluginManager(); 

})( jQuery, window, document );
