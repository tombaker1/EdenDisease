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



;
(function ($, window, document, undefined) {
    
    var settingsPage = Backbone.View.extend({ //pageView.extend({
    tagName: "div",
    className: "se-page",
    name: "",
    template: _.template(
        "<div class='fixed'>" +
        "<div class='row'>" +
        "<nav class='top-bar' data-topbar=' '>" +
        "<ul class='itle-area'>" +
        "<li class='name'>" +
        "<h1><a id='link-button' link='page-back'>< Back</a></h1>" +
        "</li>" +
        "</li>" +
        "</ul>" +
        "</nav>" +
        "</div>" +
        "</div>" + 
        "<div id='content'>" + 
        "</div>"
    ),
    content_template: null,
    events: {
        "click #link-button": "navigate",
        
        "click #load-form-list-button": "onLoad",
        "click #reset-button": "onReset",
        "click #debug-button": "onDebug",
        
        "change #serverURL": "onURL",
        "change #username": "onUsername",
        "change #password": "onPassword"
    },
    initialize: function (options) {
        //pageView.prototype.initialize.apply(this,[options]);
        //console.log("page initialize " + this.position);

        this._controller = null;
        var content = options["content"];
        if (content) {
            this.setContent(content);
        }
        var name = options["name"];
        if (name) {
            this.name = name;
        }
    },
        
    setContent: function (content) {
        if (content) {
            this.content_template = _.template(content);
        }
    },
        
    controller: function(obj) {
        if (obj) {
            this._controller = obj;
        }
        return this._controller;
    }, 
        
    render: function () {
        this.$el.html(this.template({}));
        this.$el.attr({
            "id": this.name
        });
        if (this.content_template) {
            this.$el.find("#content").append(this.content_template({}));
        }
        
        // Initialize values
        this.undelegateEvents();
        this.$("#version").html("Version: " + config.version);
        this.serverURL(app.state.settings.serverInfo.get("url"));
        this.username(app.state.settings.serverInfo.get("username"));
        this.password(app.state.settings.serverInfo.get("password"));
        this.delegateEvents();
        //this.on("change #serverURL", this.onURL.bind(this));
        //this.on("change #username", this.onUsername.bind(this));
        //this.on("change #password", this.onPassword.bind(this));
        return this; 
    },

    serverURL: function(url) {
        var $input = this.$('#serverURL');
        if (typeof url != 'undefined') {
            $input.val(url);
        }
        else {
            url = $input.val();
        }
        return url;
    },
    
    username: function(name) {
        var $input = this.$('#username');
        if (typeof name != 'undefined') {
            $input.val(name);
        }
        else {
            name = $input.val();
        }
        return name;
    },
    
    password: function(pwd) {
        var $input = this.$('#password');
        if (typeof pwd != 'undefined') {
            $input.val(pwd);
        }
        else {
            pwd = $input.val();
        }
        return pwd;
    },

    navigate: function (event) {
        var target = event.currentTarget;
        var path = $(target).attr("link");
        this.trigger("navigate", path);
        //console.log("navigate " + path);
    },

    onLoad: function (event) {
        console.log("onLoad ");
        if (this._controller) {
            this._controller.onLoad();
        }
    },

    onReset: function (event) {
        console.log("onReset ");
        if (this._controller) {
            this._controller.onReset();
        }
    },

    onDebug: function (event) {
        console.log("onDebug ");
        if (this._controller) {
            this._controller.onDebug();
        }
    },

    onURL: function (event) {
        console.log("onURL ");
        app.state.settings.serverInfo.set("url",event.target.value);
    },

    onUsername: function (event) {
        console.log("onUsername ");
        app.state.settings.serverInfo.set("username",event.target.value);
    },

    onPassword: function (event) {
        console.log("onPassword ");
        app.state.settings.serverInfo.set("password",event.target.value);
    },
    
    setEvents: function() {
        this.delegateEvents();
    }
});
    
    
    app.pluginManager.addObject(settingsPage);
    
})(jQuery, window, document);
