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


var casesItemElement = Backbone.View.extend({ //pageView.extend({
    tagName: "tr",
    //className: "accordian",
    name: "",
    template: _.template("<td class='actions'><input class='action-button' value='Edit' type='button'></td>" +
        "<td><%= number %></td> " +
        "<td><%= name %></td>"

    ),
    events: {
        //"click #link-button": "navigate",

        "click .action-button": "onEdit"
    },
    initialize: function (options) {
        //pageView.prototype.initialize.apply(this,[options]);
        console.log("case item initialize ");
        this._caseData = options["item"];

    },
    render: function () {
        var templateData = {
            name: this.model.get("name"),
            number: this.model.get("case_number")
        };
        this.$el.html(this.template(templateData));
        //this.$el.attr({
        //id": this.name,
        //    href: "#content-"+this._caseData["case_number"]
        //});
        return this;
    },

    update: function () {
        console.log("updating case list item");
    },
    
    onEdit: function() {
        console.log("casesItemElement onEdit");
        app.uiController.editCase(this.model);
    }
});

var casesPage = Backbone.View.extend({ //pageView.extend({
    tagName: "div",
    className: "se-page",
    name: "",
    template: _.template("<div class='row top-bar'>" +
        //"<nav class='top-bar' data-topbar role='navigation'>" +
        //"<section class='top-bar-section'>" +
        "<!-- Right Nav Section -->" +
        "<ul class='left'>" +
        "<li class='active'>" +
        "<a type='button' id='link-button' link='page-back' class='button'>" +
        "< Back" +
        "</a>" +
        "</li>" +
        " </ul>" +
        //"</section>" +
        //"</nav>" +
        "</div>" +
        "<div id='content'></div>"
    ),
    content_template: null,
    events: {
        "click #link-button": "navigate",
        "click #new-case": "onNewCase",
        "click #refresh-case-list": "onRefreshList"
    },
    initialize: function (options) {
        //pageView.prototype.initialize.apply(this,[options]);
        console.log("page initialize ");
        this.caseList = [];

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
        return this;
    },

    setCase: function (model) {
        // first check to see if the case element already exists
        var caseElement = null;
        for (var i = 0; i < this.caseList.length; i++) {
            if (this.caseList[i].model === model) {
                caseElement = this.caseList[i];
                break;
            }
        }
        if (!caseElement) {
            caseElement = new casesItemElement({model: model});
            this.caseList.push(caseElement);
            var tableBody = this.$el.find("tbody");
            tableBody.append(caseElement.$el);
        }
        caseElement.render();
        //this.$el.find("tbody > tr").on("click touchend", this.expandCase.bind(this));
    },

    update: function () {
        // TODO: this is obsolete, it will be needed when the cases are refreshed from the server
        return;
        
        var tableBody = this.$el.find("tbody");
        var caseStruct = app.uiController.getData("cases");
        var caseList = caseStruct["$_disease_case"];

        // create all of the case items
        for (var i = 0; i < caseList.length; i++) {
            var caseItem = caseList[i];
            var caseElement = new casesItemElement({
                item: caseItem
            });
            this.caseList.push(caseElement);
            caseElement.render();
            tableBody.append(caseElement.$el);
        }
        tableBody.foundation();
        this.$el.find("tbody > tr").on("click touchend", this.expandCase.bind(this));
    },

    onEditCase: function (event) {
        console.log("edit");
    },

    expandCase: function (event) {
        console.log("expand");
        // TODO: first make sure that you didn't push a button
        
    },

    navigate: function (event) {
        var target = event.currentTarget;
        var path = $(target).attr("link");
        this.trigger("navigate", path);
        //console.log("navigate " + path);
    },

    onNewCase: function (event) {
        console.log("onNewCase ");
        app.uiController.newCase();
        this.trigger("navigate", "page-new-case");
    },

    onRefreshList: function (event) {
        console.log("onRefreshList ");
        app.uiController.updateData("cases");
    }

});