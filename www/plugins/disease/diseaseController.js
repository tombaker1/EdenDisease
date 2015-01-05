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


;
(function ($, window, document, undefined) {

    var mCaseData = mFormData.extend({
        initialize: function (options) {
            mFormData.prototype.initialize.call(this, arguments);

            this._type = "case";
            this._person = null;
        },

        person: function (_person) {
            if (_person) {
                this._person = _person;
            }
            return this._person;
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

            //var controller = app.pluginManager.getController("disease");
            var form = app.controller.getFormByName("disease_case");
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
                f["$k_person_id"] = {
                    "@resource": "pr_person",
                    "@tuid": tuid
                };
                obj = _.extend(obj, personObject);
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
            this._parent = null;
        },

        sendData: function () {

            var obj = {
                $_disease_case: []
            };

            var c = obj["$_disease_case"];
            c[0] = {};
            var f = c[0];

            // Put in the monitoring record
            if (this._parent) {
                f["@uuid"] = this._parent.get("uuid");
            }
            f["$_disease_case_monitoring"] = {};
            var m = f["$_disease_case_monitoring"];

            var changed = this.changed;

            var form = app.controller.getFormByName("disease_case_monitoring");
            var defaultForm = form.get("form");

            var data = form.get("obj")["$_disease_case"][0]["$_disease_case_monitoring"][0]["field"];
            for (var key in data) {
                var item = data[key];
                var name = item["@name"];
                var type = item["@type"];
                var value = this.get(name);
                if (type.indexOf("reference") === 0) {
                    if (changed[name]) {
                        if (item["select"]) {
                            m[name] = value;
                        }
                    }
                } else {
                    if (changed[name]) {
                        m[name] = value;
                    }

                }
            }

            return JSON.stringify(obj);
        }
    });

    // The actual plugin constructor
    function controller() {
        console.log("settings controller");
        this._pages = {};
        this._diseaseCaseForm = null;
        this._diseasePersonForm = null;
        this._caseList = {};
        this._newPersonList = [];
        this._submitPerson = null;
    };

    controller.prototype.init = function (options) {
        console.log("settings controller init");

        // Register models for this controller
        app.controller.setControllerByModel("case-form", this);
        app.controller.setControllerByModel("person-form", this);
        app.controller.setControllerByModel("case", this);
        app.controller.setControllerByModel("person", this);
        app.controller.setControllerByModel("monitor", this);

        //this._page = app.view.getPage("page-settings");
        //var pageElement = this._page.$el;
        //this._page.controller(this);
        // Load the saved data or initialize data
        var rawData = app.storage.read("case-form");
        if (rawData) {
            this._diseaseCaseForm = JSON.parse(rawData);
            this.parseCaseForm();
        }

        // Load person form
        rawData = app.storage.read("person-form");
        if (rawData) {
            this._diseasePersonForm = JSON.parse(rawData);
            this.parsePersonForm();
        } else {
            app.controller.updateData("person-form");
        }

        // Read stored case models
        var page = app.view.getPage("page-cases");
        var fileNames = app.storage.list();
        for (var i = 0; i < fileNames.length; i++) {
            var key = fileNames[i];
            if (key.indexOf("data-case-") >= 0) {
                var dataString = app.storage.read(key);
                var data = JSON.parse(dataString);
                var model = new mCaseData(data);
                var timestamp = Date.parse(data["rawData"]["@modified_on"]);
                model.timestamp(timestamp);
                this._caseList[model.get("uuid")] = model;
                page.setCase(model);
            }
        }

        // update all data from server if connected
        this.updateAll();
    };

    controller.prototype.updateRequest = function (name) {
        console.log("settings controller onLoad");
        var path = app.controller.getHostURL();
        switch (name) {
        case "case-form":
            {
                //this.loadCaseForm();
                //return;
                path += config.defaults.caseFormPath;
            }
            break;
        case "person-form":
            {
                //this.loadPersonForm();
                //return;
                path += config.defaults.personFormPath;
            }
            break;
        case "case":
            {
                path += config.defaults.caseListPath; //"/disease/case.json";
            }
            break;
        case "person":
            {
                path += config.defaults.personListPath; //"/pr/person.json";
            }
            break;
        default:
            {
                alert("nope");
            }
        }

        app.commHandler.requestData(path);
    };

    controller.prototype.updateResponse = function (name, data, rawData) {
        console.log("settings controller updateResponse");
        
        var data = JSON.parse(rawData);

        switch (name) {
        case "case-form":
            {
                this._diseaseCaseForm = data;
                var model = this.parseCaseForm();
                localStorage.setItem(name, rawData);
            }
            break;
        case "person-form":
            {
                this._diseasePersonForm = data;
                var model = this.parsePersonForm();
                localStorage.setItem(name, rawData);
            }
            break;

        case "case":
            {
                this.updateCaseList();
                var visiblePage = app.view.getVisiblePage();
                if (visiblePage.name === "page-monitoring") {
                    visiblePage.showCase();
                }
            }
            break;
        }
    };

    controller.prototype.submitPath = function (type) {
        var path = "";
        switch (type) {
        case "case":
            {
                path += config.defaults.caseSubmitPath;
            }
            break;
        case "person":
            {
                path += config.defaults.personSubmitPath;
            }
            break;
        case "monitor":
            {
                path += config.defaults.caseSubmitPath;
            }
            break;
        default:
            {
                alert("Trying to submit an unknow type");
                active = false;
                return;
            }
        }
        return path;
    };

    controller.prototype.submitResponse = function (status, model, rawData) {

        var type = model.type();
        var response = JSON.parse(rawData);

        if (response["status"] === "success") {


            switch (type) {
            case "case":
                {
                    app.controller.updateData("case");
                    app.view.changePage("page-back");
                }
                break;
            case "person":
                {
                    this.cbFormSendComplete(status, model);
                }
                break;
                    case "monitor": 
                    {
                        var page = app.view.getVisiblePage();
                        page.$el.find("#monitor-new-update").removeClass("active");
                    }
                    break;
            }
        } else {

            // Parse for error message
            console.log("diseaseController error");
            var message = response["message"];
            var page = app.view.getVisiblePage();
            if (page.clearErrorText) {
                page.clearErrorText();
            }

            for (var i in response["tree"]) {
                var record = response["tree"][i];
                if (Array.isArray(record)) {
                    for (var j = 0; j < record.length; j++) {
                        var recordItem = record[j];
                        
                        // Check to see if there is a message in the error field
                        if (recordItem["@error"]) {
                            message = recordItem["@error"];
                            if (page.addErrorText) {
                                page.addErrorText(message,{"status":"alarm"});
                            }
                        }
                        
                        // Check to see if the sub records have an error message
                        for (var k in recordItem) {
                            var item = recordItem[k];
                            if (item["@error"]) {
                                message = item["@error"];
                                if (page.addErrorText) {
                                    page.addErrorText(message,{"status":"alarm"});
                                }
                            }
                        }
                    }
                }
            }

        }
    };

    //-------------------------------------------------------------------------

    controller.prototype.updateCaseList = function () {
        var page = app.view.getPage("page-cases");
        var caseStruct = app.controller.getData("case");
        var serverCases = caseStruct["$_disease_case"];

        // Initialize list server state to detect deleted items
        for (var key in this._caseList) {
            var model = this._caseList[key];
            model._serverState = 0;
        }

        // create or update all of the case items
        for (var i = 0; i < serverCases.length; i++) {
            var caseItem = serverCases[i];
            var caseNumber = caseItem["case_number"];
            var personName = caseItem["$k_person_id"]["$"];
            var uuid = caseItem["@uuid"];
            //var caseTime = new Date(caseItem["@modified_on"]);
            var timestamp = Date.parse(caseItem["@modified_on"]);
            var model = this._caseList[uuid];
            //var newModel = false;
            if (!model) {
                model = new mCaseData();
                //newModel = true;
            }
            model._serverState = 1;

            if (model._timestamp < timestamp) {
                // Get data from case to put in the model
                var formOptions = {};
                formOptions["rawData"] = caseItem;
                formOptions["uuid"] = uuid,
                formOptions["name"] = caseItem["$k_person_id"]["$"];
                formOptions["disease"] = caseItem["$k_disease_id"]["$"];
                for (var key in caseItem) {
                    var item = caseItem[key];
                    //var referenceIndex = 
                    if (key.indexOf("$k_") >= 0) {
                        var subkey = key.slice(3);
                        formOptions[subkey] = item["@id"];
                    } else if (key.indexOf("@") >= 0) {
                        // Do nothing, this is meta-data
                        continue;
                    } else if (typeof item === 'object') {
                        formOptions[key] = item["@value"];
                    } else {
                        formOptions[key] = item;
                    }
                }


                // Put the data into the model
                model.set(formOptions);
                this._caseList[uuid] = model;
                model.timestamp(timestamp);
                var path = model.getKey();
                app.storage.write(path, JSON.stringify(model));
                page.setCase(model);
            }
        }

        // Delete records that don't exist on the server anymore
        for (var key in this._caseList) {
            var model = this._caseList[key];
            if (model._serverState === 0) {
                console.log("delete this model");
                page.removeCase(model);
                app.storage.delete(model.getKey());
                delete this._caseList[key];
            }
        }

    };


    controller.prototype.loadCaseForm = function (event) {
        console.log("loadCaseForm");
        var url = app.controller.getHostURL() + config.defaults.caseFormPath;
        app.view.notifyMessage("Loading...", "Loading forms.");
        app.commHandler.requestForm(url, this.cbCaseFormLoadComplete.bind(this));
    };

    controller.prototype.loadPersonForm = function (event) {
        console.log("loadPersonForm");
        var url = app.controller.getHostURL() + config.defaults.personFormPath;
        app.view.notifyMessage("Loading...", "Loading forms.");
        app.commHandler.requestForm(url, this.cbPersonFormLoadComplete.bind(this));

    };

    controller.prototype.parseCaseRecord = function (record) {
        var references = {};
        for (var recordName in record) {
            var child = record[recordName];
            var childRecords = null;
            //var subName = "";
            if (recordName.indexOf("$_") === 0) {
                childRecords = [];
                for (var i = 0; i < child.length; i++) {
                    var item = this.parseCaseRecord(child[i]);
                    childRecords.push(item);
                }

            } else if (recordName === "field") {
                //field = parseCaseRecord(child);
                childRecords = {};
                for (var i = 0; i < child.length; i++) {
                    var item = child[i];
                    var name = item["@name"];
                    var value = null;
                    var type = item["@type"];
                    if (type.indexOf("reference") === 0) {
                        // If there is a selection then the default value will be an integer
                        if (item["select"]) {
                            value = "";
                        }

                    } else {
                        // show the type so we can find the initial value
                        switch (type) {
                        case "string":
                            {
                                value = "";
                                break;
                            }
                        case "date":
                            {
                                value = "";
                                break;
                            }
                        case "datetime":
                            {
                                value = "";
                                break;
                            }
                        case "text":
                            {
                                value = "";
                                break;
                            }
                        case "integer":
                            {
                                value = 0;
                                break;
                            }
                        default:
                            {
                                value = "unknown";
                                break;
                            }
                        }
                    }
                    childRecords[name] = value;
                }
            } else {
                childRecords = child;
            }
            references[recordName] = childRecords;
        }

        return references;
    };

    controller.prototype.parsePersonRecord = function (record) {
        // Notes the person record is much more complicated than the case form
        // The person information does not have to be displayed in this application

        var references = {};

        return references;
    };

    controller.prototype.parseCaseForm = function () {
        console.log("\tparseCaseForm");
        var obj = this._diseaseCaseForm;

        // Parse the object into the components
        var caseData = this.parseCaseRecord(obj);
        var modelData = caseData["$_disease_case"][0]["field"];


        // create model
        var model = new formType({
            "name": "disease_case",
            "form": modelData,
            "data": caseData,
            "obj": obj
        });
        app.controller.addForm(model);

        // create monitoring model
        var monitoringData = caseData["$_disease_case"][0];
        var monitoringModelData = monitoringData["$_disease_case_monitoring"][0]["field"];
        var monitoringModel = new formType({
            "name": "disease_case_monitoring",
            "form": monitoringModelData,
            "data": monitoringData,
            "obj": obj
        });
        app.controller.addForm(monitoringModel);

        // Update view
        var page = app.view.getPage("page-new-case");
        page.updateCase(obj);

        // Monitoring page
        page = app.view.getPage("page-monitoring");
        page.update(obj);

        return model;
    };

    controller.prototype.parsePersonForm = function () {
        console.log("\tparsePersonForm");
        var obj = this._diseasePersonForm;

        // Parse the object into the components
        var results = this.parsePersonRecord(obj);
        var modelData = {
            "full_name": "",
            "sex": 0,
            "date_of_birth": "",
            "mobile_phone": "",
            "email": ""
        };

        // create model
        var model = new formType({
            "name": "disease_person",
            "form": modelData,
            "data": results,
            "obj": obj
        });
        app.controller.addForm(model);

        // Update view
        var page = app.view.getPage("page-new-case");
        page.updatePerson(obj);

        return model;

    };

    controller.prototype.onFormSubmit = function (page) {
        //console.log("onFormSubmit");
        var form = app.controller.getFormByName("disease_case");
        var model = form.get("current");
        if (!model) {
            model = form.get("current");
        }
        page.getCaseData(model);

        // Check for new person model
        var personModel = null;
        if (page.addNewPerson) {
            personModel = new mPersonData();
            page.getPersonData(personModel);
            model.person(personModel);
        }
        app.controller.submitData(model);
    };

    controller.prototype.onUpdateSubmit = function (page) {
        //console.log("onFormSubmit");
        //var page = $("#page-new-form");
        var form = app.controller.getFormByName("disease_case_monitoring");
        var model = form.get("current");
        if (!model) {
            model = new mMonitoringData(form.get("form"));
            model._parent = page.model;
        }
        page.getData(model);
        //model.submit();

        app.controller.submitData(model);
    };

    controller.prototype.updateAll = function () {
        app.controller.updateData(["case-form","case","person"]);
    };

    /*
    controller.prototype.cbFormSendComplete = function (status, model) {
        if (status) {
            //console.log("cbFormSendComplete success");
            //model.needsUpdate(false);
            this.updateData("cases");
            app.view.notifyModal("Submit", "Submit complete");
        } else {
            //console.log("cbFormSendComplete failure");
            app.view.notifyModal("Submit", "Submit failure.");

        }
    };
*/
    controller.prototype.newCase = function () {
        var form = app.controller.getFormByName("disease_case");
        var model = new mCaseData(form.get("form"));
        model.timestamp(Date.now());
        form.set("current", model);
        var page = app.view.getPage("page-new-case");
        page.showForm(form, model);

    }

    controller.prototype.newPerson = function () {
        var form = null; //this.getFormByName("disease_person");
        var model = null; //new mFormData(form.get("form"));
        //model.timestamp(Date.now());
        //form.set("current", model);
        var page = app.view.getPage("page-new-person");
        page.showForm(form, model);

    }

    controller.prototype.newMonitor = function () {
        var form = app.controllergetFormByName("disease_case_monitoring");
        var model = new mCaseData(form.get("form"));
        model.timestamp(Date.now());
        form.set("current", model);
        var page = app.view.getPage("page-new-monitoring");
        page.showForm(form, model);

    }

    controller.prototype.editCase = function (model) {
        var form = app.controller.getFormByName("disease_case");
        var page = app.view.getPage("page-new-case");
        form.set("current", model);
        page.showForm(form, model);
        app.view.changePage("page-new-case");
    };

    controller.prototype.caseMonitoring = function (model) {
        //var form = this.getFormByName("disease_case");
        var page = app.view.getPage("page-monitoring");
        //form.set("current", model);
        //page.showForm(form, model);
        page.showCase(model);
        app.view.changePage("page-monitoring");
    };

    controller.prototype.onLoad = function (evt) {
        console.log("settings controller onLoad");
    };

    controller.prototype.onReset = function (evt) {
        //app.onReset();
    };

    controller.prototype.onDebug = function (evt) {
        //app.onDebug();
    };

    app.pluginManager.addObject(controller);

})(jQuery, window, document);