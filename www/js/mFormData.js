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

var formType = Backbone.Model.extend({
    defaults: {
        url: "",
        name: "",
        loaded: false,
        form: null,
        data: null
    },
    initialize: function () {
        //console.log("new formType name:" + this.get("name"));
    }
});

// create the form list item
var mFormData = Backbone.Model.extend({
    defaults: {},
    initialize: function (options) {
        this._name = "";
        this._timestamp = 0;
        this._needsUpdate = false;
        this._formId = "";
        this._serverState = 0; // 0 = not on server, 1 = server valid
        this._type = "";
        this._person = null;
    },

    submit: function () {
        console.log("sending model " + this.get("_name"));
        this.needsUpdate(true);

        // Check to see if it is a create or update
        if (this.get("uuid")) {
            this.sync('update', this, {
                local: false
            });
        } else {
            this.sync('create', this, {
                local: false
            });
        }
    },

    getKey: function () {
        var value = 0;
        if (this.get("uuid")) {
            value = this.get("uuid");
        } else {
            value = "timestamp:" + this.timestamp();
        }
        return "data-" + value;
    },

    name: function (_name) {
        if (_name) {
            this.set("_name", _name);
        }
        return this.get("_name");
    },
    /*
    person: function (_person) {
        if (_person) {
            this._person = _person;
        }
        return this._person;
    },
*/
    type: function (_type) {
        return this._type;
    },

    timestamp: function (_timestamp) {
        if (_timestamp) {
            this._timestamp = _timestamp;
        }
        return this._timestamp;
    },

    needsUpdate: function (needsUpdate) {
        if (needsUpdate != undefined) {
            this._needsUpdate = needsUpdate;
        }
        return this._needsUpdate;
    },

    sendData: function () {
        console.log("mFormData::sendData not implemented, should be overridden");
    }


});

var mActiveFormList = Backbone.Collection.extend({
    model: mFormData,
    restore: function (modelList) {
        while (modelList.length) {
            var key = modelList.pop();
            var fields = key.split('-');
            var formName = fields[1];
            var form = app.uiController.getFormByName("disease_case");
            var timestamp = fields[2];
            var storageData = app.storage.read(key);
            var data = JSON.parse(storageData);
            var model = new mFormData(data);
            model.urlRoot = form.get("url");
            this.add(model);
            app.view.newSavedFormItem({
                model: model
            });
        }
    }
});