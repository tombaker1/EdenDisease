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

        "click #cancel": "onCancel",
        "click #save": "onSave",
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

    update: function (obj) {
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
            var container = $(id);
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
                    var options = item["select"][0]["option"];
                    for (var i = 0; i < options.length; i++) {
                        if (options[i]["@value"] === value) {
                            var select = element.find("select");
                            select.val(i);
                         }
                    }
                }
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
    },

    getModelData: function (model) {
        var form = app.uiController.getFormByName("disease_case");
      var formName = form.get("name");
      var formData = form.get("form");
      var data = form.get("obj")["$_" + formName][0]["field"];
      for (var key in data) {
        var item = data[key];
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
                    model.set(name,value);
                    /*
                    if (options[i]["@value"] === value) {
                        var select = element.find("select").first();
                        select[0].selectedIndex = i;
                        select.selectmenu("refresh");
                    }
                    */
                //}
            }
        }
        else {
            if (item["select"]) {
                var select = element.find("select").first();
                //var selectIndex = select[0].selectedIndex;
                value = select[0]["value"];
                model.set(name,value);
            }
            else {
            switch (type) {
                    case "string":
                        //TODO: if there is a select then get the string from the select value
                        value = (element.find("input").first().val()) || "";
                        model.set(name,value);
                        break;
                    case "date":
                        value = (element.find("input").first().val()) || "";
                        model.set(name,value);
                        break;
                    case "datetime":
                        value = (element.find("input").first().val()) || "";
                        model.set(name,value);
                        break;
                    case "text":
                        value = (element.find("input").first().val()) || "";
                        model.set(name,value);
                        break;
                    default:
                        break;
                }
            }
        }
      }
    },

    navigate: function (event) {
        var target = event.currentTarget;
        var path = $(target).attr("link");
        this.trigger("navigate", path);
        //console.log("navigate " + path);
    },

    onCancel: function (event) {
        console.log("onCancel ");
        //this.getModelData();
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
    }

});