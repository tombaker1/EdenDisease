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

    // The master application controller
    function controller() {
        //console.log("settings controller");
        this._pages = {};
        this._diseaseCaseForm = null;
        this._diseasePersonForm = null;
        this._caseList = {};
        this._newPersonList = [];
        this._submitPerson = null;
    };

    controller.prototype.init = function (options) {
        //console.log("settings controller init");

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
            var dataString = app.storage.read(key);
            var data = JSON.parse(dataString);
            if (key.indexOf("data-case-") >= 0) {
                if (key.indexOf("urn:uuid") >= 0) {
                    //var model = new mCaseData(data);
                    var modelObj = app.controller.getModel("mCaseData");
                    var model = new modelObj(data);
                    var timestamp = Date.parse(data["rawData"]["@modified_on"]);
                    model.timestamp(timestamp);
                    this._caseList[model.get("uuid")] = model;
                    page.setCase(model);
                } else if (key.indexOf("timestamp") >= 0) {
                    var modelObj = app.controller.getModel("mCaseData");
                    var model = new modelObj(data);

                    var timestamp = parseInt(key.split(':')[1]); //Date.parse(data["rawData"]["@modified_on"]);
                    model.timestamp(timestamp);
                    model.needsUpdate(true);
                    this._caseList[timestamp] = model;
                    page.setCase(model);
                }
            }
        }

        // update all data from server if connected
        this.updateAll();
    };

    controller.prototype.updatePath = function (name) {
        //console.log("settings controller onLoad");
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

        return path;
    };

    controller.prototype.updateResponse = function (name, data, rawData) {
        //console.log("settings controller updateResponse");

        //var data = JSON.parse(rawData);

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

                    // Update case list
                    model.set("case_id",response.created[0].toString());
                    var page = app.view.getPage("page-cases");
                    if (page) {
                        page.setCase(model);
                    }
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
                    page.setMonitor(model);
                }
                break;
            }
            
            // Store it locally so it can be use until refresh
            this.storeOffline(model);

        } else {

            if (response.hasOwnProperty("serverResponse") && (response["serverResponse"] === 0)) {
                // The app is offline store the data locally
                //this.storeOffline(model, rawData);
                app.view.changePage("page-back");
                var page = app.view.getPage("page-cases");
                if (page) {
                    page.setCase(model);
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
                                    page.addErrorText(message, {
                                        "status": "alarm"
                                    });
                                }
                            }

                            // Check to see if the sub records have an error message
                            for (var k in recordItem) {
                                var item = recordItem[k];
                                if (item["@error"]) {
                                    message = item["@error"];
                                    if (page.addErrorText) {
                                        page.addErrorText(message, {
                                            "status": "alarm"
                                        });
                                    }
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

            if (!model) {
                var modelObj = app.controller.getModel("mCaseData");
                model = new modelObj();
                model.timestamp(1); // force the new data condition to be true
            }
            model._serverState = 1;

            if (model.timestamp() < timestamp) {
                // Get data from case to put in the model
                var formOptions = {};
                formOptions["rawData"] = caseItem;
                formOptions["case_id"] = caseItem["@id"];
                formOptions["uuid"] = uuid,
                formOptions["name"] = caseItem["$k_person_id"]["$"];
                formOptions["disease"] = caseItem["$k_disease_id"]["$"];
                for (var key in caseItem) {
                    var item = caseItem[key];
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

            // models that have a uuid were created offline and should not be deleted
            // until they have been sent to the server
            if (model._serverState === 0) {
                if (model.get("uuid")) {
                    console.log("delete this model");
                    page.removeCase(model);
                    app.storage.delete(model.getKey());
                    delete this._caseList[key];
                } else {
                    // check to see if model stored offline is the same as one sent to server
                    console.log("Checking for duplicates");
                    for (var otherKey in this._caseList) {
                        if (otherKey.indexOf("uuid") >= 0) {
                            var otherModel = this._caseList[otherKey];
                            // If two items have the same case_number then the one with a
                            // uuid has come from the server
                            if (otherModel.get("case_id") === model.get("case_id")) {
                                page.removeCase(model);
                                app.storage.delete(model.getKey());
                                delete this._caseList[key];
                                break;
                            }
                        }
                    }

                }
            }
        }

    };

    controller.prototype.storeOffline = function (model, rawText) {
        var page = app.view.getPage("page-cases");
        var path = model.getKey();
        if (!rawText) {
            rawText = JSON.stringify(model.toJSON());
        }
        app.storage.write(path, rawText);
    };


    controller.prototype.loadCaseForm = function (event) {
        //console.log("loadCaseForm");
        var url = app.controller.getHostURL() + config.defaults.caseFormPath;
        app.view.notifyMessage("Loading...", "Loading forms.");
        app.commHandler.requestForm(url, this.cbCaseFormLoadComplete.bind(this));
    };

    controller.prototype.loadPersonForm = function (event) {
        //console.log("loadPersonForm");
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
        //console.log("\tparseCaseForm");
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
        //console.log("\tparsePersonForm");
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
            //personModel = new mPersonData();
            var modelObj = app.controller.getModel("mPersonData");
            personModel = new modelObj();
            page.getPersonData(personModel);
            model.person(personModel);
        }
        
        // save and submit
        this.storeOffline(model);
        this._caseList[model.timestamp()] = model;
        
        if (app.controller.online()) {
            app.controller.submitData(model);
        } else {
            app.view.changePage("page-back");
            var page = app.view.getPage("page-cases");
            if (page) {
                page.setCase(model);
            }
        }
        
    };

    controller.prototype.onUpdateSubmit = function (page) {
        //console.log("onFormSubmit");
        //var page = $("#page-new-form");
        var form = app.controller.getFormByName("disease_case_monitoring");
        var model = form.get("current");
        if (!model) {
            //model = new mMonitoringData(form.get("form"));
            var modelObj = app.controller.getModel("mMonitoringData");
            model = new modelObj(form.get("form"));
            model._parent = page.model;
        }
        page.getData(model);
        //model.submit();

        this.storeOffline(model);
        app.controller.submitData(model);
    };

    controller.prototype.updateAll = function () {
        app.controller.updateData(["case-form", "case", "person"]);
    };

    controller.prototype.newCase = function () {
        var form = app.controller.getFormByName("disease_case");
        //var model = new mCaseData(form.get("form"));
        var modelObj = app.controller.getModel("mCaseData");
        var model = new modelObj(form.get("form"));
        //model.timestamp(Date.now());
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
        //var model = new mCaseData(form.get("form"));
        var modelObj = app.controller.getModel("mCaseData");
        var model = new modelObj(form.get("form"));
        // model.timestamp(Date.now());
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
        //console.log("settings controller onLoad");
    };

    controller.prototype.onReset = function (evt) {
        //app.onReset();
    };

    controller.prototype.onDebug = function (evt) {
        //app.onDebug();
    };

    app.pluginManager.addObject(controller);

})(jQuery, window, document);