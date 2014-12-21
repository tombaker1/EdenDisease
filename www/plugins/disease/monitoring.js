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


var monitoringItemElement = Backbone.View.extend({ //pageView.extend({
    tagName: "tr",
    //className: "accordian",
    name: "",
    template: _.template("<td class='actions se-column-all'>" +
                         "<input id='edit' class='edit-button' value='Edit' type='button'>" +
                         "</td>" +
        "<td class='se-column-all'><%= date %></td> " +
        "<td class='se-column-all'><%= illness_status %></td>" + 
        "<td class='se-column-medium'><%= symptoms %></td>" + 
        "<td class='se-column-medium'><%= comments %></td>"

    ),
    events: {
        //"click #link-button": "navigate",

        "click input#edit": "onEdit"
        
    },
    initialize: function (options) {
        //pageView.prototype.initialize.apply(this,[options]);
        console.log("monitoring item initialize ");
        this._caseData = options["item"];
        
        // Set up model change event
        var model = this.model;
        model.on("change",this.update.bind(this));

    },
    render: function () {

        var caseData = this._caseData;
        var fieldList = ["date","illness_status","symptoms","comments"];
        var templateData = {};
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
        console.log("monitoringItemElement onEdit");
        //app.uiController.editCase(this.model);
    }
    
    
});

var monitoringPage = Backbone.View.extend({ //pageView.extend({
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
        "click #link-button":   "navigate",
        "click #new-monitor":   "onNewMonitor",
        "click #cancel":        "onCancel",
        "click #save":          "onSave"
    },
    initialize: function (options) {
        //pageView.prototype.initialize.apply(this,[options]);
        console.log("page initialize ");
        this.itemList = [];
        this._case = null;
        this.addNewUpdate = false;

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

    update: function () {
        // TODO: this is obsolete, it will be needed when the cases are refreshed from the server
        return;
        
        var tableBody = this.$el.find("tbody");
        var caseStruct = app.uiController.getData("cases");
        var itemList = caseStruct["$_disease_case"];

        // create all of the case items
        for (var i = 0; i < itemList.length; i++) {
            var caseItem = itemList[i];
            var caseElement = new monitoringItemElement({
                item: caseItem
            });
            this.itemList.push(caseElement);
            caseElement.render();
            tableBody.append(caseElement.$el);
        }
        tableBody.foundation();
        this.$el.find("tbody > tr").on("click touchend", this.expandCase.bind(this));
        //this.$el.foundation();
    },
    
    showCase: function(model) {
        this._case = model;
        this.$el.find("#person_name").html(model.get("name"));
        
        // Clean out table
        while (this.itemList.length) {
            var item = this.itemList.pop();
            item.remove();
        }
        
        // Parse monitoring records
        var table = this.$el.find("tbody");
        var rawData = model.get("rawData");
        var monitoringData = rawData["$_disease_case_monitoring"];
        if (monitoringData) {
            for (var i = 0; i < monitoringData.length; i++) {
                var data = monitoringData[i];
                var item = new monitoringItemElement({model:model,"item":data});
                item.render();
                table.append(item.$el);
                this.itemList.push(item);
            }
        }
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

    onNewMonitor: function (event) {
        console.log("onNewMonitor ");
        this.addNewUpdate = !this.addNewUpdate;
        if (this.addNewUpdate) {
            this.$el.find("#monitor-new-update").addClass("active");
            //this.$el.find("#new-monitor-button").prop("disabled", true);
        } else {
            this.$el.find("#monitor-new-update").removeClass("active");
            //this.$el.find("#new-monitor-button").prop("disabled", false);
        }
    },

    onCancel: function (event) {
        console.log("onCancel ");
        this.addNewUpdate = false;
        this.$el.find("#monitor-new-update").removeClass("active");
        //this.$el.find("legend").scrollTop(0);
        //app.view.changePage("page-back");
    },

    onSave: function (event) {
        console.log("onSave ");
        this.addNewUpdate = false;
        this.$el.find("#monitor-new-update").removeClass("active");
       //app.uiController.onFormSave(this);
        //app.view.changePage("page-back");
    },

    setEvents: function() {
        this.delegateEvents();
        for (var i = 0; i < this.itemList.length; i++) {
            this.itemList[i].delegateEvents();
        }
    }

});
