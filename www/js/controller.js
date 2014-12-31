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
        this._formList = new Backbone.Collection;
        this._activeForms = new mActiveFormList([]);
        /*
        this._diseaseCaseForm = null;
        this._diseasePersonForm = null;
        */
        this._dataTable = {};
        this._modelMap = {};
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
        //this._caseList = {};
        //this._newPersonList = [];
        //this._submitPerson = null;


    };

    controller.prototype.init = function (options) {
        if (options["state"]) {
            this.state = options["state"];
        } else {
            this.state = app.state;
        }
        this.getLocation();
/*
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
        */
    };

    controller.prototype.getControllerByModel = function (name) {
        var controller = this._modelMap[name];
        return controller;
    };

    controller.prototype.setControllerByModel = function (name, controller) {
        this._modelMap[tableName] = controller;
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
        var item =  this._updateState.list[0];
        var name = item["name"];
        var controller = item["controller"];
        if (controller) {
            controller.updateRequest(name);
        }
        /*
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
        */
    };

    controller.prototype.cbUpdateData = function (status, dataTable) {
        //TODO update data
        var item = this._updateState.list.shift();
        var name = item["name"];
        var controller = item["controller"];
        this._updateState.active = false;
        if (status) {
            var data = JSON.parse(dataTable);
            this.setData(name, data);
            if (controller.updateData) {
                controller.updateData(name);
            }
            /*
            var data = JSON.parse(dataTable);
            this.setData(name, data);
            if (name === "cases") {

                this.updateCaseList();
                var visiblePage = app.view.getVisiblePage();
                if (visiblePage.name === "page-monitoring") {
                    visiblePage.showCase();
                }
            }
            */
            this.nextUpdate();
        } else {
            //alert("Communication failure " + name); //TODO: do the right thing
            this._updateState.list = [];
            app.view.notifyModal("Update data", "Failure in reading data from server");
        }
    };

    controller.prototype.updateAll = function () {
        alert("controller::updateAll not defined, should request update from all controllers, or modesl???");
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
            //this.updateData("case-form");
            //this.updateData("cases");
            //this.nextUpdate();
            this.updateAll();
            return;
        }

        this._submitState.active = true;
        var model = this._submitState.list[0];
        var type = model._type;
        var path = this.getHostURL();
        var data = model.sendData();
        var controller = this.getControllerByModel(type);
        path += controller.submitPath(type);
        /*
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
        */
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
            var type = model.type();
            var controller = this.getControllerByModel(type);
            controller.submitResponse(status,model);
           
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
        for (var i = 0; i < this._formList.length; i++) {
            if (name === this._formList.at(i).get("name")) {
                return this._formList.at(i);
            }
        }
        return null;
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
                //alert("location failed");
                console.log("location failed");
            });
        } else {
            /* geolocation IS NOT available */
        }
    }

    var localController = new controller();

    // bind the plugin to jQuery     
    app.uiController = localController;

})(jQuery, window, document);