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

        "click #new-case": "onNewCase"
    },
    initialize: function (options) {
        //pageView.prototype.initialize.apply(this,[options]);
        console.log("page initialize ");

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
    
    update: function() {
        var tableBody = this.$el.find("tbody");
        var caseList = app.uiController.getData("cases");
        var db = app.uiController._diseaseCase;
        var n0 = db["$_disease_case"]
        var n1 = n0[0];
        var n2 = n1["field"][1];
        var n3 = n2["select"];
        var n4 = n3[0];
        var nameList = n4["option"];
        
        
        // create all of the case items
        var htmlString = "";
        for (var i = 0; i < caseList.length; i++) {
            var caseItem = caseList[i];
            htmlString += "<tr role='row' id='case-" + caseItem["id"] + "'>";
            htmlString += "<td class='actions'>";
            htmlString += "<input class='action-button' value='Edit' type='button'>";
            htmlString += "</td>";
            htmlString += "<td>" + caseItem["case_number"] + "</td>";
            var id = caseItem["person_id"];
            var nameString = "<td>Unknown</td>";
            for (var j = 0; j < nameList.length; j++) {
                if (nameList[j]["@value"] && (nameList[j]["@value"] === id)) {
                    nameString = "<td>" + nameList[j]["$"] + "</td>";
                }
                    
            }
            htmlString += nameString;
            htmlString += "</tr>";
        }
       tableBody.html(htmlString);
        this.$el.find("tbody > tr").on("click touchend",this.expandCase.bind(this));
    },
    
    onEditCase: function(event) {
        console.log("edit");
    },
    
    expandCase: function(event) {
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
        app.uiController.newForm();
        this.trigger("navigate","page-new-case");
    }

});