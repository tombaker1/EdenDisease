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

    // The actual plugin constructor
    function controller() {

        this._defaults = {};
        this._diseaseCaseForm = null;
        this._diseasePersonForm = null;
        this._dataTable = {};
        this._updateState = {
            active: false,
            list: [],
            name: ""
        };
        this._submitState = {
            active: false,
            list: [],
            name: ""
        };
        this._caseList = {};
        this._newPersonList = [];
        this._submitPerson = null;


    };

    controller.prototype.init = function (options) {
        if (options["state"]) {
            this.state = options["state"];
        } else {
            this.state = app.state;
        }
        this.getLocation();

        // Load the saved data or initialize data
        var rawData = app.storage.read("case-form");
        if (rawData) {
            this._diseaseCaseForm = JSON.parse(rawData);
            this.parseCaseForm();
        } 
        // always update in case the server db changed
        this.updateData("case-form");

        // Load person form
        rawData = app.storage.read("person-form");
        if (rawData) {
            this._diseasePersonForm = JSON.parse(rawData);
            this.parsePersonForm();
        } else {
            this.updateData("person-form");
        }

        // Read stored models
        var page = app.view.getPage("page-cases");
        var fileNames = app.storage.list();
        for (var i = 0; i < fileNames.length; i++) {
            var key = fileNames[i];
            if (key.indexOf("data-") >= 0) {
                var dataString = app.storage.read(key);
                var data = JSON.parse(dataString);
                var model = new mCaseData(data);
                var timestamp = Date.parse(data["rawData"]["@modified_on"]);
                model.timestamp(timestamp);
                this._caseList[model.get("uuid")] = model;
                page.setCase(model);
            }
        }

        // Update the data tables
        this.updateData(["cases", "persons"]);

    };

    controller.prototype.getData = function (tableName) {
        var table = this._dataTable[tableName];
        return table;
    };

    controller.prototype.setData = function (tableName, tableData) {
        this._dataTable[tableName] = tableData;
    };

    //-------------------------------------------------------------------------
    //
    //  Data submission queue
    //

    controller.prototype.updateData = function (dataList) {
        this._updateState.list = this._updateState.list.concat(dataList);
        this.nextUpdate();
    };

    controller.prototype.nextUpdate = function () {
        if (this._updateState.active || this._submitState.active || 
            (this._updateState.list.length === 0) ||
            (this._submitState.list.length)) {
            if (this._submitState.list.length) {
                this.nextSubmit();
            }
            return;
        }

        this._updateState.active = true;
        var name = this._updateState.list[0];
        var path = this.getHostURL();
        switch (name) {
        case "case-form":
            {
                this.loadCaseForm();
                return;
            }
            break;
        case "person-form":
            {
                this.loadPersonForm();
                return;
            }
            break;
        case "cases":
            {
                path += config.defaults.caseListPath; //"/disease/case.json";
            }
            break;
        case "persons":
            {
                path += config.defaults.personListPath; //"/pr/person.json";
            }
            break;
        default:
            {
                alert("nope");
            }
        }
        app.commHandler.requestData(path, this.cbUpdateData.bind(this));
    };

    controller.prototype.cbUpdateData = function (status, dataTable) {
        //TODO update data
        var name = this._updateState.list.shift();
        this._updateState.active = false;
        if (status) {
            var data = JSON.parse(dataTable);
            this.setData(name, data);
            if (name === "cases") {
                //app.view.getPage("page-cases").update();
                this.updateCaseList();
            }
            this.nextUpdate();
        } else {
            //alert("Communication failure " + name); //TODO: do the right thing
            this._updateState.list = [];
            app.view.notifyModal("Update data", "Failure in reading data from server");
        }
    };

    //-------------------------------------------------------------------------
    //
    //  Data submission queue
    //

    controller.prototype.submitData = function (modelList) {
        this._submitState.list = this._submitState.list.concat(modelList);
        this.nextSubmit();
    };

    controller.prototype.nextSubmit = function () {
        if (this._submitState.active || this._updateState.active) {
            return;
        }
        if (this._submitState.list.length === 0) {
            this.updateData("case-form");
            this.updateData("cases");
            //this.nextUpdate();
            return;
        }

        this._submitState.active = true;
        var model = this._submitState.list[0];
        var type = model._type;
        var path = this.getHostURL();
        var data = model.sendData();;
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
        default:
            {
                alert("Trying to submit an unknow type");
                active = false;
                return;
            }
        }
        app.commHandler.submitData(path, this.cbSubmitData.bind(this), data);
    };

    controller.prototype.cbSubmitData = function (status, dataTable) {
        //TODO update data
        var model = this._submitState.list.shift();
        var type = model._type;
        this._submitState.active = false;
        if (status) {
            //var data = JSON.parse(dataTable);
            //this.setData(name, data);
            model.needsUpdate(false);
            /*
            switch (type) {
            case "case":
                {
                    this.cbFormSendComplete(status, model);
                }
                break;
            case "person":
                {
                    this.cbFormSendComplete(status, model);
                }
                break;
            }
            */
            this.nextSubmit();
        } else {
            //alert("Communication failure " + name); //TODO: do the right thing
            this._submitState.list = [];
            app.view.notifyModal("Submit", "Submit failure.");
            this.nextUpdate();
        }
    };

    //-------------------------------------------------------------------------

    controller.prototype.updateCaseList = function () {
        var page = app.view.getPage("page-cases");
        var caseStruct = app.uiController.getData("cases");
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

    controller.prototype.resetAll = function () {
        app.view.resetDialog();
    };

    controller.prototype.onReset = function () {
        //TODO: Move this into the model or the collection
        var list = app.storage.list();
        for (var i = 0; i < list.length; i++) {
            var path = list[i];
            app.storage.delete(path);
        }
        //window.requestAnimationFrame(function() {app.view.confirm.show()});
    };

    controller.prototype.onFormSave = function (page) {
        //console.log("onFormSave");
        var form = this.getFormByName("disease_case");
        var model = form.get("current");
        if (!model) {
            model = form.get("current");
        }
        page.getModelData(model);

        if (!activeForms.contains(model)) {
            activeForms.add(model);
            model.sync('create', model, {
                local: true
            });
            app.view.newSavedFormItem({
                model: model
            });
        } else {
            model.sync('update', model, {
                local: true
            });

        }

    };

    controller.prototype.updatePersonList = function (model) {
        this._newPersonList.push(model.get("person_name"));
    };

    controller.prototype.onFormSubmit = function (page) {
        //console.log("onFormSubmit");
        //var page = $("#page-new-form");
        var form = this.getFormByName("disease_case");
        var model = form.get("current");
        if (!model) {
            model = form.get("current");
        }
        page.getCaseData(model);
        //model.submit();

        // Check for new person model
        var personModel = null;
        if (page.addNewPerson) {
            personModel = new mPersonData();
            page.getPersonData(personModel);
            model.person(personModel);
            //this.updatePersonList(personModel);
            //this.submitData(personModel);
           
            //this._submitPerson = personModel;
            //personModel.submit();
            //activeForms.add(personModel);
        }
        this.submitData(model);
    };

    controller.prototype.onUpdateSubmit = function (page) {
        //console.log("onFormSubmit");
        //var page = $("#page-new-form");
        var form = this.getFormByName("disease_case_monitoring");
        var model = form.get("current");
        if (!model) {
            model = new mMonitoringData(form.get("form"));
        }
        page.getData(model);
        //model.submit();

        this.submitData(model);
    };

    controller.prototype.getHostURL = function () {
        // TODO: this doesn't apply anymore
        var url = "";
        var serverUrl = app.state.settings.serverInfo.get("url");
        if (this.state.settings.source === 1) {
            url = serverUrl; // + config.defaults.formList;
        } else {
            url = serverUrl; // + "/xforms/" + config.defaults.formList;
        }
        return url;

    };

    controller.prototype.onDebug = function (event) {
        console.log("onDebug");

    };

    controller.prototype.loadCaseForm = function (event) {
        console.log("loadCaseForm");
        var url = app.uiController.getHostURL() + config.defaults.caseFormPath;
        app.view.notifyMessage("Loading...", "Loading forms.");
        app.commHandler.requestForm(url, this.cbCaseFormLoadComplete.bind(this));

    };

    controller.prototype.loadPersonForm = function (event) {
        console.log("loadPersonForm");
        var url = app.uiController.getHostURL() + config.defaults.personFormPath;
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
        formList.add(model);
        
        // create monitoring model
        var monitoringData = caseData["$_disease_case"][0];
        var monitoringModelData = monitoringData["$_disease_case_monitoring"][0]["field"];
        var monitoringModel = new formType({
            "name": "disease_case_monitoring",
            "form": monitoringModelData,
            "data": monitoringData,
            "obj": obj
        });
        formList.add(monitoringModel);

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
        formList.add(model);

        // Update view
        var page = app.view.getPage("page-new-case");
        page.updatePerson(obj);

        return model;

    };

    controller.prototype.cbCaseFormLoadComplete = function (status, rawData) {
        console.log("cbCaseFormLoadComplete");

        app.view.hideNotifyMessage("Loading forms.");
        // only do this if the form loaded successfully
        if (status) {

            // Set model
            this._diseaseCaseForm = JSON.parse(rawData);
            var model = this.parseCaseForm();

            // Save data to local storage
            var formName = "case-form"; //+form.get("name");
            localStorage.setItem(formName, rawData);
            //app.view.notifyModal("Load", "Load Complete.");

        } else {
            app.view.notifyModal("Load", "Load failure, check server settings.");
        }
        this._updateState.list.shift();
        this._updateState.active = false;
        this.nextUpdate();

    };

    controller.prototype.cbPersonFormLoadComplete = function (status, rawData) {
        console.log("cbCaseFormLoadComplete");

        app.view.hideNotifyMessage("Loading forms.");
        // only do this if the form loaded successfully
        if (status) {

            // Set model
            this._diseasePersonForm = JSON.parse(rawData);
            var model = this.parsePersonForm();

            // Save data to local storage
            var formName = "person-form"; //+form.get("name");
            localStorage.setItem(formName, rawData);
            //app.view.notifyModal("Load", "Load Complete.");

        } else {
            app.view.notifyModal("Load", "Load failure, check server settings.");
        }
        this._updateState.list.shift();
        this._updateState.active = false;
        this.nextUpdate();

    };

    var cbDiseaseCase = function (success, rawData) {

        if (!success) {
            // TODO: print an error message here
            return;
        }
        // Save the form to local memory
        var filename = "disease-case";
        //localStorage.setItem(filename,xmlFile);
        app.storage.write(filename, rawData);
        var objData = JSON.parse(rawData);

        // put the list of forms into the page
        // TODO: parse the forms here
        //app.view.insertForms(app.commHandler.getAllForms());
        app.view.confirm.setText("Load", "Load Complete");
        app.view.confirm.show();
    }

    controller.prototype.cbFormSendComplete = function (status, model) {
        if (status) {
            //console.log("cbFormSendComplete success");
            model.needsUpdate(false);
            this.updateData("cases");
            app.view.notifyModal("Submit", "Submit complete");
        } else {
            //console.log("cbFormSendComplete failure");
            app.view.notifyModal("Submit", "Submit failure.");

        }
    };


    controller.prototype.login = function (params) {
        console.log("controller login");
        var url = params["url"] + config.defaults.loginPath;
        //app.view.notifyMessage("Loading...","Loading forms.");
        app.commHandler.requestLogin(url, params, this.cbLogin.bind(this));

    };

    controller.prototype.cbLogin = function (status, message) {
        console.log("login callback");
        if (status) {
            app.loginDialog.getText();
            app.loginDialog.hide();
        } else {
            app.loginDialog.onError(message);
        }
    };

    controller.prototype.getFormByName = function (name) {
        for (var i = 0; i < formList.length; i++) {
            if (name === formList.at(i).get("name")) {
                return formList.at(i);
            }
        }
        return null;
    };

    controller.prototype.newCase = function () {
        var form = this.getFormByName("disease_case");
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
        var form = this.getFormByName("disease_case_monitoring");
        var model = new mCaseData(form.get("form"));
        model.timestamp(Date.now());
        form.set("current", model);
        var page = app.view.getPage("page-new-monitoring");
        page.showForm(form, model);

    }

    controller.prototype.editCase = function (model) {
        var form = this.getFormByName("disease_case");
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
    
    var postLocation = function (latitude, longitude) {
        var msg = $("#content-messages").html();
        msg += "latitude: " + latitude + "<br>";
        msg += "longitude: " + longitude + "<br>";
        $("#content-messages").html(msg);
    };

    controller.prototype.getLocation = function () {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
                /*this.*/
                postLocation(position.coords.latitude, position.coords.longitude);
            }, function () {
                alert("location failed");
            });
        } else {
            /* geolocation IS NOT available */
        }
    }

    var localController = new controller();

    // bind the plugin to jQuery     
    app.uiController = localController;

})(jQuery, window, document);