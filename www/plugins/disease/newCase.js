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


var newCasePage = Backbone.View.extend({ //pageView.extend({
    tagName: "div",
    className: "se-page",
    name: "",
    template: _.template(
        "<div class='fixed'>" +
        "<div class='row'>" +
        "<nav class='top-bar' data-topbar=' '>" +
        "<ul class='itle-area'>" +
        "<li class='name'>" +
        "<h1><a >New Case</a></h1>" +
        "</li>" +
        "</li>" +
        "</ul>" +
        "</nav>" +
        "</div>" +
        "</div>" +
        "<div id='content'></div>"
    ),
    content_template: null,
    events: {
        "click #link-button": "navigate",
        "click #new-person-button": "onNewPerson",
        "click #cancel": "onCancel",
        "click #submit": "onSubmit"
    },
    initialize: function (options) {
        console.log("page initialize ");

        var content = options["content"];
        if (content) {
            this.setContent(content);
        }
        var name = options["name"];
        if (name) {
            this.name = name;
        }
        this.addNewPerson = false;
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

    updateCase: function (obj) {
        // Loop through elements filling in data
        var field = obj["$_disease_case"][0]["field"];
        for (var i = 0; i < field.length; i++) {
            // Get fields
            var item = field[i];
            var name = item["@name"];
            var label = item["@label"];

            // Put name in label   
            // TODO: add required asterisks
            var id = "#case-" + name;
            var container = this.$el.find(id);
            var r = container.attr("required");
            if (item["@type"] === "date") {
                label += " (YYYY-MM-DD)";
            }
            if (container.attr("required")) {
                label += '<bold style="color:red">*</bold>';
            }
            container.find("label").first().html(label);

            // Fill in select entrys
            var select = item["select"];
            if (select) {
                var selectOptions = "";
                var options = select[0]["option"];
                for (var j = 0; j < options.length; j++) {
                    var opt = options[j];
                    var value = opt["@value"];
                    var optionLabel = opt["$"] || "";
                    selectOptions += '<option value = "' + value + '">' + optionLabel + '</option>';
                }
                container.find("select").first().html(selectOptions);
            }
        }
    },

    updatePerson: function (obj) {
        // Loop through elements filling in data
        var field = obj["$_pr_person"][0]["field"];
        for (var i = 0; i < field.length; i++) {
            // Get fields
            var item = field[i];
            var name = item["@name"];
            var label = item["@label"];

            // Put name in label   
            // TODO: add required asterisks
            var id = "#case-" + name;
            var container = this.$el.find(id);
            if (container.length) {
                var r = container.attr("required");
                if (item["@type"] === "date") {
                    label += " (YYYY-MM-DD)";
                }
                if (container.attr("required")) {
                    label += '<bold style="color:red">*</bold>';
                }
                container.find("label").first().html(label);
                
                // Fill in select entrys
                var select = item["select"];
                if (select) {
                    var selectOptions = "";
                    var options = select[0]["option"];
                    for (var j = 0; j < options.length; j++) {
                        var opt = options[j];
                        var value = opt["@value"];
                        var optionLabel = opt["$"] || "";
                        selectOptions += '<option value = "' + value + '">' + optionLabel + '</option>';
                    }
                    container.find("select").first().html(selectOptions);
                }
            }
        }
        
        // Do the ad-hoc parts
        var container = this.$el.find("#case-person_name");
        container.find("label").first().html("Name: <bold style='color:red'>*</bold>");
    },
    
    showForm: function (form, model) {
        // Loop through keys finding page elements
        var formName = form.get("name");
        var formData = form.get("form");
        var data = form.get("obj")["$_" + formName][0]["field"];
        for (var key in data) {
            var item = data[key];
            var name = item["@name"];
            var searchString = "#case-" + name;
            var element = this.$el.find(searchString).first();
            var type = item["@type"];
            var value = model.get(name);

            if (element.length === 0) {
                continue;
            }

            if (type.indexOf("reference") === 0) {
                if (item["select"]) {
                    //value = "";
                    //var options = item["select"][0]["option"];
                    //for (var i = 0; i < options.length; i++) {
                        //if (options[i]["@value"] === value) {
                            var select = element.find("select");
                            select.val(value);
                        //}
                    //}
                }
            } else {
                if (item["select"]) {
                    //value = "";
                    //var options = item["select"][0]["option"];
                    //for (var i = 0; i < options.length; i++) {
                        //if (options[i]["@value"] === value) {
                            var select = element.find("select");
                            select.val(value);
                        //}
                    //}
                } else {
                    switch (type) {
                    case "string":
                        //element.html(value);
                        element.find("input").first().val(value);
                        break;
                    case "date":
                        element.find("input").first().val(value);
                        break;
                    case "datetime":
                        element.find("input").first().val(value);
                        break;
                    case "text":
                        element.find("input").first().val(value);
                        break;
                    default:
                        break;
                    }
                }
            }
        }
    },

    getModelData: function (model) {
        var form = app.uiController.getFormByName("disease_case");
        var formName = form.get("name");
        var formData = form.get("form");
        var data = form.get("obj")["$_" + formName][0]["field"];
        var newData = {};
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var name = item["@name"];
            var searchString = "#case-" + name;
            var element = this.$el.find(searchString).first();
            var type = item["@type"];
            var value = null;

            if (element.length === 0) {
                continue;
            }

            if (type.indexOf("reference") === 0) {
                if (item["select"]) {
                    //value = "";
                    //var options = item["select"][0]["option"];
                    //for (var i = 0; i < options.length; i++) {
                    var select = element.find("select").first();
                    //var selectIndex = select[0].selectedIndex;
                    value = select[0]["value"];
                    newData[name] = parseInt(value); //model.set(name, value);
                    /*
                    if (options[i]["@value"] === value) {
                        var select = element.find("select").first();
                        select[0].selectedIndex = i;
                        select.selectmenu("refresh");
                    }
                    */
                    //}
                }
            } else {
                if (item["select"]) {
                    var select = element.find("select").first();
                    //var selectIndex = select[0].selectedIndex;
                    value = select[0]["value"];
                    newData[name] = value; //model.set(name, value);
                } else {
                    switch (type) {
                    case "string":
                        //TODO: if there is a select then get the string from the select value
                        value = (element.find("input").first().val()) || "";
                        newData[name] = value; //model.set(name, value);
                        break;
                    case "date":
                        value = (element.find("input").first().val()) || "";
                        newData[name] = value; //model.set(name, value);
                        break;
                    case "datetime":
                        value = (element.find("input").first().val()) || "";
                        newData[name] = value; //model.set(name, value);
                        break;
                    case "text":
                        value = (element.find("input").first().val()) || "";
                        newData[name] = value; //model.set(name, value);
                        break;
                    default:
                        break;
                    }
                }
            }
        }
        model.set(newData);
    },

    navigate: function (event) {
        var target = event.currentTarget;
        var path = $(target).attr("link");
        this.trigger("navigate", path);
        //console.log("navigate " + path);
    },

    onNewPerson: function (event) {
        console.log("onNewPerson ");
        //app.uiController.newPerson();
        //this.trigger("navigate", "page-new-person");
        this.addNewPerson = !this.addNewPerson;
        if (this.addNewPerson) {
            this.$el.find("#case-new-person").addClass("active");
            this.$el.find("#select-person_id").prop("disabled",true);
        }
        else {
            this.$el.find("#case-new-person").removeClass("active");
            this.$el.find("#select-person_id").prop("disabled",false);
        }
    },

    onCancel: function (event) {
        console.log("onCancel ");
        this.$el.find("legend").scrollTop(0);
        app.view.changePage("page-back");
    },

    onSave: function (event) {
        console.log("onSave ");
        app.uiController.onFormSave(this);
        app.view.changePage("page-back");
    },

    onSubmit: function (event) {
        console.log("onSubmit ");
        app.uiController.onFormSubmit(this);
        app.view.changePage("page-back");
    },
    
    setEvents: function() {
        this.delegateEvents();
    }

});