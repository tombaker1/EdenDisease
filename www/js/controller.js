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
        this._dataTable = {};
        this._modelMap = {};
        this._modelList = {};
        this._online = true;
        this._offlineList = [];
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

    };

    controller.prototype.init = function (options) {
        if (options["state"]) {
            this.state = options["state"];
        } else {
            this.state = app.state;
        }
        this.getLocation();

    };

    controller.prototype.getControllerByModel = function (name) {
        var pluginController = this._modelMap[name];
        return pluginController;
    };

    controller.prototype.setControllerByModel = function (name, controller) {
        this._modelMap[name] = controller;
    };

    controller.prototype.addModel = function (modelList) {
        this._modelList = _.extend(this._modelList, modelList);
    }

    controller.prototype.getModel = function (modelName) {
        return this._modelList[modelName];
    }

    controller.prototype.getData = function (tableName) {
        var table = this._dataTable[tableName];
        return table;
    };

    controller.prototype.setData = function (tableName, tableData) {
        this._dataTable[tableName] = tableData;
    };
    
    controller.prototype.online = function(_online) {
        if (_online !== undefined) {
            this._online = _online;
        }
        return this._online;
    }


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


        //var item =  this._updateState.list[0];
        var name = this._updateState.list[0]; //item["name"];
        var pluginController = this.getControllerByModel(name); //item["controller"];
        if (pluginController) {
            this._updateState.active = true;
            app.view.notifyMessage("Loading...", "Loading forms.");
            var path = pluginController.updatePath(name);
            var status = app.commHandler.requestData(path);
            if (!status) {
                this.online(false);
                this._updateState.active = false;
                this._updateState.list = [];
            }
        }

    };

    controller.prototype.cbUpdateData = function (status, rawData) {
        //TODO update data
        app.view.hideNotifyMessage("Loading forms.");
        //var item = this._updateState.list.shift();
        var name = this._updateState.list.shift(); //item["name"];
        var pluginController = this.getControllerByModel(name); //item["controller"];
        this._updateState.active = false;
        if (status) {
            this.online(true);
            var data = JSON.parse(rawData);
            this.setData(name, data);
            if (pluginController.updateResponse) {
                pluginController.updateResponse(name, data, rawData);
            }
            this.nextUpdate();
        } else {
            //alert("Communication failure " + name); //TODO: do the right thing
            this.online(false);
            //this._updateState.active = false;
            this._updateState.list = [];
            app.view.notifyModal("Update data", "Failure in reading data from server");
            
        }
    };

    controller.prototype.updateAll = function () {
        var controllers = app.pluginManager.controllers;
        for (var key in controllers) {
            var pluginController = controllers[key];
            if (pluginController.updateAll) {
                pluginController.updateAll();
            }
        }
    };

    //-------------------------------------------------------------------------
    //
    //  Data submission queue
    //

    controller.prototype.submitData = function (modelList) {
        if (this.online()) {
            this._submitState.list = this._submitState.list.concat(modelList);
            this.nextSubmit();
        }
        else {
            this.storeOffline(modelList);
        }
    };

    controller.prototype.nextSubmit = function () {
        if (this._submitState.active || 
            this._updateState.active || 
            !this.online()) {
            return;
        }
        if (this._submitState.list.length === 0) {
            this.updateAll();
            return;
        }

        this._submitState.active = true;
        var model = this._submitState.list[0];
        var type = model._type;
        var path = this.getHostURL();
        var data = model.sendData();
        var pluginController = this.getControllerByModel(type);
        path += pluginController.submitPath(type);
        app.commHandler.submitData(path, this.cbSubmitData.bind(this), data);
    };

    controller.prototype.cbSubmitData = function (status, rawText) {
        //TODO update data
        var model = this._submitState.list.shift();
        var type = model._type;
        this._submitState.active = false;
        if (status) {
            //var data = JSON.parse(dataTable);
            //this.setData(name, data);
            model.needsUpdate(false);
            var type = model.type();
            var pluginController = this.getControllerByModel(type);
            pluginController.submitResponse(status, model, rawText);

            this.nextSubmit();
        } else {
            //alert("Communication failure " + name); //TODO: do the right thing
            //this._submitState.list = [];
            this.online(false);
            //this.storeOffline(model);
            var pluginController = this.getControllerByModel(type);
            pluginController.submitResponse(status, model, rawText);
            app.view.notifyModal("Submit", "Submit failure.");
            this.nextUpdate();
        }
    };
    
    controller.prototype.storeOffline = function(modelList) {
        var modelArray = Array.isArray(modelList) ? modelList : [modelList];
        for (var i = 0; i < modelArray.length; i++) {
            var model = modelArray[i];
            // save the model
            var type = model.type();
            var pluginController = this.getControllerByModel(type);
            pluginController.storeOffline(model);
        }
        this._offlineList = this._offlineList.concat(modelList);
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
    };


    controller.prototype.getHostURL = function () {
        // TODO: this doesn't apply anymore
        var url = "";
        var serverUrl = app.state.settings.serverInfo.get("url");
        if (this.state.settings.source === 1) {
            url = serverUrl;
        } else {
            url = serverUrl;
        }
        return url;

    };

    controller.prototype.onDebug = function (event) {
        console.log("onDebug");

    };

    controller.prototype.onOnline = function (event) {
        console.log("onOnline");
        this.online(true);

    };

    controller.prototype.onOffline = function (event) {
        console.log("onOffline");
        this.online(false);
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

    controller.prototype.addForm = function (model) {
        this._formList.add(model);
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
                postLocation(position.coords.latitude, position.coords.longitude);
            }, function () {
                //alert("location failed");
                console.log("location failed");
            });
        } else {
            /* geolocation IS NOT available */
        }
    };

    var localController = new controller();

    // bind the plugin to jQuery     
    app.controller = localController;

})(jQuery, window, document);