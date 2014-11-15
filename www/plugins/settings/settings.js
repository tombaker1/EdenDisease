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


var settingsPage = Backbone.View.extend({ //pageView.extend({
    tagName: "div",
    className: "se-page",
    name: "",
    template: _.template("<div class='row'>" +
        "<nav class='top-bar' data-topbar role='navigation'>" +
        "<section class='top-bar-section'>" +
        "<!-- Right Nav Section -->" +
        "<ul class='left'>" +
        "<li class='active'>" +
        "<a type='button' id='link-button' link='page-back' class='button'>" +
        "Back" +
        "</a>" +
        "</li>" +
        " </ul>" +
        "</section>" +
        "</nav>" +
        "</div>" +
        "<div id='content'></div>"
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
        console.log("page initialize " + this.position);

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
    render: function () {
        this.$el.html(this.template({}));
        this.$el.attr({
            "id": this.name
        });
        if (this.content_template) {
            this.$el.find("#content").append(this.content_template({}));
        }
        return this; //.html(this.template({index:this.index,name:this.model.get("name")}));
    },

    serverURL: function(url) {
        var $input = $('#serverURL');
        if (typeof url != 'undefined') {
            $input.val(url);
        }
        else {
            url = $input.val();
        }
        return url;
    },
    
    username: function(name) {
        var $input = $('#username');
        if (typeof name != 'undefined') {
            $input.val(name);
        }
        else {
            name = $input.val();
        }
        return name;
    },
    
    password: function(pwd) {
        var $input = $('#password');
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
        app.onLoad();
    },

    onReset: function (event) {
        console.log("onReset ");
        app.onReset();
    },

    onDebug: function (event) {
        console.log("onDebug ");
        app.onDebug();
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

});