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
    
    update: function(obj) {
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
    create: function(options) {
       // Add item into new form list
        var model = options["model"];
        var item =  new newFormListItem({model:model});
        item.index = options["index"]; //this.newFormArray.length;
        item.render();
        this.$newFormList.append(item.$el);
        this.newFormArray.unshift(item);
        
        // create page
        var page = new formPage(options);
        page.index = item.index;
        page.render();
        $("body").append(page.$el);
        var $container = $(page.$el.find("#page-form-content"));

        // Add page content
        var $form = model.get("form");
        var $xml = $form["$xml"];
        var $fields = $xml[0].body.children;
        for (var i = 0; i < $fields.length; i++) {
            var field = $fields[i];
            var element = null;
            var elementString = "";
            var reference = $(field).attr("ref");
            var label = $(field).find("label")[0];
            var labelString =  getStringRef($form,label);
            switch (field.nodeName) {
            case "select1":
                var element = this.parseSelect1(options,reference,field,labelString);
                break;
            case "upload":
                var element = this.parseUpload(options,reference,field,labelString);
              break;
            case "input":
                var element = new formInput(options);
                element.reference = reference;
                element.label = labelString;
              break;
            default:
              console.log("<div>Unimplemented element" + field.nodeName + "</div>");
            }

            // Render new element and add to the page
            if (element) {
                element.render();
                $container.append(element.$el);
                $container.append("<hr>");
            }
        }
        page.$el.page();    },

    navigate: function (event) {
        var target = event.currentTarget;
        var path = $(target).attr("link");
        this.trigger("navigate", path);
        //console.log("navigate " + path);
    },

    onCancel: function (event) {
        console.log("onCancel ");
    },

    onSave: function (event) {
        console.log("onSave ");
    },

    onSubmit: function (event) {
        console.log("onSubmit ");
    }

});