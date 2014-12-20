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
    template: _.template("<td class='actions se-column-all'>" +
                         "<input id='edit' class='edit-button' value='Edit' type='button'>" +
                         "<input id='monitor' class='edit-button' value='Monitor' type='button'>" +
                         "</td>" +
        "<td class='se-column-all'><%= case_number %></td> " +
        "<td class='se-column-all'><%= name %></td>" + 
        "<td class='se-column-medium'><%= disease %></td>" + 
        "<td class='se-column-medium'><%= location %></td>" + 
        "<td class='se-column-medium'><%= illness_status %></td>" + 
        "<td class='se-column-large'><%= symptom_debut %></td>" + 
        "<td class='se-column-large'><%= diagnosis_status %></td>" + 
        "<td class='se-column-large'><%= diagnosis_date %></td>" + 
        "<td class='se-column-medium'><%= monitoring_level %></td>"

    ),
    events: {
        //"click #link-button": "navigate",

        "click input#edit": "onEdit",
        "click input#monitor": "onMonitor"
        
    },
    initialize: function (options) {
        //pageView.prototype.initialize.apply(this,[options]);
        console.log("case item initialize ");
        this._caseData = options["item"];
        
        // Set up model change event
        var model = this.model;
        model.on("change",this.update.bind(this));

    },
    render: function () {
        var caseData = this.model.get("rawData");
        var templateData = {
            "name":                     this.model.get("name"),
            "case_number":              this.model.get("case_number"),
            "disease":                  this.model.get("disease"),
            "location":                 "-",
            //"illness_status":            caseData["illness_status"]["$"],
            "symptom_debut":            this.model.get("symptom_debut") || ""//,
            //"diagnosis_status":         caseData["diagnosis_status"]["$"],
            //"diagnosis_date":           caseData["diagnosis_date"]["$"],
            //"monitoring_level":         caseData["monitoring_level"]["$"]
        };
        var fieldList = ["illness_status","diagnosis_status","diagnosis_date","monitoring_level"];
        for (var i = 0; i < fieldList.length; i++) {
            var fieldName = fieldList[i];
            if (caseData[fieldName]) {
                templateData[fieldName] = caseData[fieldName]["$"];
            }
            else {
                templateData[fieldName] = "";
            }
        }
        this.$el.html(this.template(templateData));
        
        return this;
    },

    update: function (evt) {
        console.log("updating case list item ");
        this.render();
    },
    
    onEdit: function() {
        console.log("casesItemElement onEdit");
        app.uiController.editCase(this.model);
    },
    
    
    onMonitor: function() {
        console.log("casesItemElement onEdit");
        app.uiController.caseMonitoring(this.model);
    }
});

var casesPage = Backbone.View.extend({ //pageView.extend({
    tagName: "div",
    className: "se-page",
    name: "",
    template: _.template(
        "<div class='fixed'>" +
        "<div class='row'>" +
        "<nav class='top-bar' data-topbar=' '>" +
        "<ul class='title-area'>" +
        "<li class='name'>" +
        "<h1><a id='link-button' link='page-back'>< Back</a></h1>" +
        "</li>" +
        "</li>" +
        "</ul>" +
        //"</section>" +
        "</nav>" +
        "</div>" +
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
            caseElement.render();
        }
    },
    
    removeCase: function(model) {
        // first check to see if the case element already exists
        var caseElement = null;
        for (var i = 0; i < this.caseList.length; i++) {
            if (this.caseList[i].model === model) {
                caseElement = this.caseList[i];
                caseElement.remove();
                this.caseList.splice(i,1);
                break;
            }
        }
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
        //this.$el.foundation();
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
    },
    
    setEvents: function() {
        this.delegateEvents();
        for (var i = 0; i < this.caseList.length; i++) {
            this.caseList[i].delegateEvents();
        }
    }

});