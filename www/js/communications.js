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

    // create the query state
    var xhr = null,
        reqTimer = null,
        REQ_WAIT_TIME = 4000;

    var reqState = {
        type: "",
        data: null,
        callback: null,
        controller: null
    };

    // The actual plugin constructor
    function communicator() {

        this.init();
    };

    communicator.prototype.init = function () {
        xhr = new XMLHttpRequest();
    };

    communicator.prototype.cbReadForm = function (reply) {
        clearTimeout(reqTimer);
        if (xhr.readyState != 4) {
            alert("Error loading form");
            reqState.callback(false, reqState.data);
            return;
        }
        if (xhr.status != 200) {
            alert("Server error for form " + reqState.data);
            reqState.callback(false, reqState.data);
            return;
        }

        var rawXML = reply.target.responseText;

        reqState.callback(true, rawXML);
    };

    var cbReqTimeout = function () {
        if (!config.debugNoCommTimeout) {
            xhr.abort();
            //alert("URL could not be found");
            reqState.callback(false, reqState.data);
        } else {
            console.log("Debug enabled, xmlHttpRequest timeout ignored");
        }

    };

    communicator.prototype.requestData = function (url) {
        //var formListURL = url;  // don't need to do anything here
        reqState.type = "data";
        reqState.callback = app.uiController.cbUpdateData.bind(app.uiController);
        reqState.controller = controller;
        xhr.onload = this.cbRequestData.bind(this);
        xhr.open("get", url, true);
        try {
            xhr.send();
            reqTimer = setTimeout(cbReqTimeout, REQ_WAIT_TIME);
        }
        catch (err) {
            //alert("send error");
            clearTimeout(reqTimer);
            reqState.callback(false,"");
        }
    };

    communicator.prototype.cbRequestData = function (reply) {
        clearTimeout(reqTimer);
        if (xhr.status != 200) {
            //alert("Error loading page");
            reqState.callback(false, "Server error");
            return;
        }

        var rawData = reply.target.responseText;

        // return and show the form
        reqState.callback(true, rawData);

    };

    communicator.prototype.requestForm = function (url, cb) {
        reqState.type = "request-form";
        reqState.callback = cb;
        reqState.data = "load-form";

        // send
        var username = app.state.settings.serverInfo.get("username");
        var password = app.state.settings.serverInfo.get("password");
        var authentication = 'Basic ' + window.btoa(username + ':' + password);

        try {
            xhr.onload = this.cbReadForm.bind(this);
            xhr.open("get", url, true);
            xhr.setRequestHeader('Authorization', authentication);
            xhr.send();
            reqTimer = setTimeout(cbReqTimeout, REQ_WAIT_TIME);
        } catch (err) {
            //alert("Error loading form");
            clearTimeout(reqTimer);
            reqState.callback(false, reqState.data);
        }
    };

    communicator.prototype.cbSendModel = function (reply) {
        clearTimeout(reqTimer);
        //console.log("cbReadFormList done");
        if (xhr.readyState != 4) {
            //alert("Error loading form");
            app.view.notifyModal("Submit", "Submit complete");
            reqState.callback(false, reqState.data);
            return;
        }
        if ((xhr.status != 200) && (xhr.status != 201)) {
            //alert("Server error for form " + reqState.data);
            reqState.callback(false, reqState.data);
            return;
        }

        var rawText = reply.target.responseText;

        // notify the controller that the load is complete
        reqState.callback(true, reqState.data);
    };

    communicator.prototype.sendModel = function (model, cb, options) {
        reqState.type = "send-form";
        reqState.callback = cb;
        reqState.data = model;

        // Get the JSON data to send
        var jsonDocument = model.sendData(); //this.createJSONData(model);

        // create url to send to
        var serverUrl = app.uiController.getHostURL();
        var urlSubmit = serverUrl + "/disease/case.s3json";

        // create authentication
        var username = app.state.settings.serverInfo.get("username");
        var password = app.state.settings.serverInfo.get("password");
        var authentication = 'Basic ' + window.btoa(username + ':' + password);

        // Set headers
        xhr.onload = this.cbSendModel.bind(this);
        xhr.open('PUT', urlSubmit, true);
        xhr.setRequestHeader('Authorization', authentication);
        try {
            xhr.send(jsonDocument);
            reqTimer = setTimeout(cbReqTimeout, REQ_WAIT_TIME);
        } catch (err) {
            alert("send error");
            reqState.callback(false, reqState.data);
        }
    };


    communicator.prototype.submitData = function (url, cb,  data) {
        reqState.type = "send-form";
        reqState.callback = cb;
        reqState.data = data;

        // Get the JSON data to send
        //var jsonDocument = model.sendData(); //this.createJSONData(model);

        // create url to send to
        //var serverUrl = app.uiController.getHostURL();
        //var urlSubmit = serverUrl + "/disease/case.s3json";

        // create authentication
        var username = app.state.settings.serverInfo.get("username");
        var password = app.state.settings.serverInfo.get("password");
        var authentication = 'Basic ' + window.btoa(username + ':' + password);

        // Set headers
        xhr.onload = this.cbSendModel.bind(this);
        xhr.open('PUT', url, true);
        xhr.setRequestHeader('Authorization', authentication);
        try {
            xhr.send(data);
            reqTimer = setTimeout(cbReqTimeout, REQ_WAIT_TIME);
        } catch (err) {
            alert("send error");
            reqState.callback(false, reqState.data);
        }
    };
    
    communicator.prototype.requestLogin = function (url, params, cb) {
        //var formListURL = url;  // don't need to do anything here
        reqState.type = "login";
        reqState.callback = cb;
        xhr.onload = this.cbRequestLogin.bind(this);
        var boundary = '----WebKitFormBoundaryB94vneooSYjS9yn6';
        var sendText = '--' + boundary + '\r\n' + 
                        'Content-Disposition: form-data; name="email"\r\n' + 
                        '\r\n' +                         
                        'tombaker1@gmail.com\r\n' + 
                        '--' + boundary + '\r\n' +
                        'Content-Disposition: form-data; name="password"\r\n' + 
                        '\r\n' + 
                        'eden\r\n' + /* + 
                        '------WebKitFormBoundaryB94vneooSYjS9yn6\r\n' + 
                        'Content-Disposition: form-data; name="_next"\r\n' + 
                        '\r\n' +
                         '/eden/default/index\r\n' + 
                        '------WebKitFormBoundaryB94vneooSYjS9yn6\r\n' + 
                        'Content-Disposition: form-data; name="_formkey"\r\n' + 
                        '\r\n' + 
                        '7edc3829-8e35-4ad0-aeb5-d8f6f90f8d07\r\n' + 
                        '------WebKitFormBoundaryB94vneooSYjS9yn6\r\n' + 
                        'Content-Disposition: form-data; name="_formname"\r\n' + 
                        '\r\n' + 
                        'login\r\n' + 
                        '------WebKitFormBoundaryB94vneooSYjS9yn6\r\n' + 
                        'Content-Disposition: form-data; name="_utc_offset"\r\n' + 
                        '\r\n' + 
                        '480\r\n' + */
                        '--' + boundary + '--\r\n';
        var newURL = url; // + "?_next=%2Feden%2Fdefault%2Findex";
        xhr.open("POST", newURL, true);
        xhr.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + boundary);
        xhr.send(sendText);
        reqTimer = setTimeout(cbReqTimeout, REQ_WAIT_TIME);

    };

    communicator.prototype.cbRequestLogin = function (reply) {
        clearTimeout(reqTimer);
        if (xhr.readyState != 4) {
            alert("What?");
            return;
        }
        if (xhr.status != 200) {
            alert("Error loading page");
            return;
        }

        // Check to see if the login succeeded
        var status = false;
        var message = "Login failed";
        var rawData = reply.target.responseText;
        var allResponses = xhr.getAllResponseHeaders();
        var index = rawData.indexOf('class="alert');
        var success = rawData.slice(index,index+8);
        
        if (success.indexOf("alert-success")) {
            message = "Login succeeded";
            }
        //var responseText = xhr.getResponseHeader("SetCookie");
        //var allResponses = xhr.getAllResponseHeaders();
        //
        /*
        if (responseText) {
        var responses = responseText.split('=');
        var responseItem = responses[0].split('=');
            if ((responseItem[0] === "registered") &&
                (responseItem[1] === "yes")) {
                status = true;
            }
        }
        */

        // return and show the form
        rawData = null;
        reqState.callback(status, message);

    };
    
    app.commHandler = new communicator();

})(jQuery, window, document);
