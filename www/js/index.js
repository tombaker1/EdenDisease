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

var app = {
    commHandler: null,
    controller: null,
    view: null,
    storage: null,
    state: {
        settings: {
            source: 1,
            serverInfo: null
            },
        offline: false
    },
    
    initialize: function() {
        if (window.cordova === undefined) {
            console.log("running in browser");
            $("#content-messages").html("browser<br>");
            window.cordova = window.cordova_webapp;
            this.state.offline = false;
            this.state.settings.source = 2;
        }
        else {
            //console.log("running mobile");
            $("#content-messages").html("mobile<br>");
            
            // if mobile then make it remote
            this.state.settings.source = 2;
            this.state.offline = false;
        }
        //this.testmodule.init();
        //this.testmodule.doSomething();
        this.bind();

        this.storage.init();
        this.state.settings.serverInfo = new userInfo();
        this.getState();
        this.view.init();
        this.loginDialog = new loginDialog();
        //this.controller.init({state: this.state});
        this.pluginManager.init();
        this.pluginManager.on("plugin-create-complete",this.onDynamicUIComplete.bind(this));
        $(document).foundation();
        //this.loginDialog.show();
        
    },
    
    getState: function() {
        // ToDo - read from local storage
        var serverInfo = this.state.settings.serverInfo;
        serverInfo.fetch();
        if (!serverInfo.get("url")) {
            serverInfo.set("url",config.defaults.url);
        }
    },
    
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
        window.addEventListener('online',this.onOnline.bind(this));
        window.addEventListener('offline',this.onOffline.bind(this));
        
        $("#reset-button").on("click",this.onReset.bind(this));
        $("#load-form-list-button").on("click",this.onLoad.bind(this));
        $("#debug-button").on("click",this.onDebug.bind(this));
        
    },
    
    onDynamicUIComplete: function() {
        this.controller.init({state: this.state});
        this.pluginManager.initPlugins();
        
    },
    

    onLoad: function() {
        this.controller.loadForm();
    },
    
    onDebug: function() {
        var serverURL = this.state.settings.serverInfo.get("url");
        this.commHandler.sendForm(serverURL);  
    },
    
    onReset: function() {
        this.controller.resetAll();
    },
    
    onOnline: function() {
        if (this.controller) {
            this.controller.onOnline();
        }
    },
    
    onOffline: function() {
        if (this.controller) {
            this.controller.onOffline();
        }
    },
    
    isOnline: function() {
        return navigator.onLine;
    },
    
    reset: function() {
        this.controller.onReset();
        this.view.reset();
        this.view.confirm.setText("Reset All","Reset Complete");
        setTimeout(this.view.confirm.show.bind(this.view.confirm),20);
        
        // clear settings
        var serverInfo = this.state.settings.serverInfo;
    },
    
    deviceready: function() {
        // note that this is an event handler so the scope is that of the event
        // so we need to call app.report(), and not this.report()
        //app.report('deviceready');
        console.log("deviceready");
    }
};
/*
app.testmodule = (function() {
    var localVariable = 42;
    var my = {};
    my.init = function() {
        console.log("testmodule init ");
    };
    my.doSomething = function() {
        console.log("The answer is " + localVariable);
    };
    return my;
}());
*/
