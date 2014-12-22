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
var formList = new Backbone.Collection;

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

    person: function (_person) {
        if (_person) {
            this._person = _person;
        }
        return this._person;
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

var mCaseData = mFormData.extend({
    initialize: function (options) {
        mFormData.prototype.initialize.call(this, arguments);

        this._type = "case";
    },

    sendData: function () {
        var obj = {
            $_disease_case: []
        };
        var c = obj["$_disease_case"];
        c[0] = {};
        var f = c[0];

        // If the model came from the server then it has a uuid
        if (this.get("uuid")) {
            f["@uuid"] = this.get("uuid");
        } else {
            var dateString = (new Date(this.timestamp())).toISOString();
            f["@created_on"] = dateString;
        }
        var changed = this.changed;

        var form = app.uiController.getFormByName("disease_case");
        var defaultForm = form.get("form");

        var data = form.get("obj")["$_disease_case"][0]["field"];
        for (var key in data) {
            var item = data[key];
            var name = item["@name"];
            var type = item["@type"];
            var value = this.get(name);
            if (type.indexOf("reference") === 0) {
                if (changed[name]) {
                    if (item["select"]) {
                        f[name] = value;
                    }
                }
            } else {
                if (changed[name]) {
                    f[name] = value;
                }

            }
        }
        
        // Add person data if necessary
        var person = this.person();
        if (person) {
            var personObject = person.sendObject();
            var tuid = personObject["$_pr_person"][0]["@tuid"];
            f["$k_person_id"] = {"@resource":"pr_person","@tuid":tuid};
            obj = _.extend(obj,personObject);
        }
                
        return JSON.stringify(obj);
    }
});


var mPersonData = mFormData.extend({

    defaults: {
        person_name: "",
        gender: 1,
        date_of_birth: "",
        SMS: "",
        EMAIL: ""
    },
    initialize: function (options) {
        mFormData.prototype.initialize.call(this, arguments);

        this._type = "person";
    },

    sendObject: function () {

        var obj = {
            $_pr_person: [{

            }]
        };
        var p = obj["$_pr_person"][0];

        //  Split full name into first, middle, and last
        var fullName = this.get("person_name");
        p["@tuid"] = fullName;
            
        var names = fullName.split(" ");
        switch (names.length) {
        case 0:
            {
                return "";
            }
        case 1:
            {
                p["first_name"] = names[0];
            }
            break;
        case 2:
            {
                p["first_name"] = names[0];
                p["last_name"] = names[1];
            }
            break;

            // This includes names.length >= 3
        default:
            {
                p["first_name"] = names.shift();
                p["middle_name"] = names.shift();
                p["last_name"] = names.join(" ");
            }
        }




        // gender
        p["gender"] = this.get("gender");

        // date of birth
        var dob = this.get("date_of_birth");
        if (dob.length) {
            p["date_of_birth"] = dob;
        }

        // contacts
        var email = this.get("EMAIL");
        var phone = this.get("SMS");
        if (email.length || phone.length) {
            p["$_pr_contact"] = [];
            var c = p["$_pr_contact"];
            if (phone.length) {
                c.push({
                    "contact_method": "SMS",
                    "value": phone
                });
            }
            if (email.length) {
                c.push({
                    "contact_method": "EMAIL",
                    "value": email
                });
            }
        }

        return obj;

    }
});


var mMonitoringData = mFormData.extend({
    initialize: function (options) {
        mFormData.prototype.initialize.call(this, arguments);

        this._type = "monitor";
    },

    sendData: function () {
        
        var obj = {
            $_disease_case: []
        };
        /*
        var c = obj["$_disease_case"];
        c[0] = {};
        var f = c[0];

        // If the model came from the server then it has a uuid
        if (this.get("uuid")) {
            f["@uuid"] = this.get("uuid");
        } else {
            var dateString = (new Date(this.timestamp())).toISOString();
            f["@created_on"] = dateString;
        }
        var changed = this.changed;

        var form = app.uiController.getFormByName("disease_case_monitoring");
        var defaultForm = form.get("form");

        var data = form.get("obj")["$_disease_case"][0]["field"];
        for (var key in data) {
            var item = data[key];
            var name = item["@name"];
            var type = item["@type"];
            var value = this.get(name);
            if (type.indexOf("reference") === 0) {
                if (changed[name]) {
                    if (item["select"]) {
                        f[name] = value;
                    }
                }
            } else {
                if (changed[name]) {
                    f[name] = value;
                }

            }
        }
        
        // Add person data if necessary
        var person = this.person();
        if (person) {
            var personObject = person.sendObject();
            var tuid = personObject["$_pr_person"][0]["@tuid"];
            f["$k_person_id"] = {"@resource":"pr_person","@tuid":tuid};
            obj = _.extend(obj,personObject);
        }
              */  
        return JSON.stringify(obj);
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

var activeForms = new mActiveFormList([]);