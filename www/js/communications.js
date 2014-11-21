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

;(function ( $, window, document, undefined ) {
        
    // create the query state
    var xhr = null,
        reqTimer = null,
        REQ_WAIT_TIME = 4000;
        
    var reqState = {
        type: "",
        data: null,
        callback: null
    };

    // The actual plugin constructor
    function xformer(  ) {
       
        this.init();
    };
    
    xformer.prototype.init = function () {
        xhr = new XMLHttpRequest();
    };

    xformer.prototype.cbReadForm = function (reply) {
        clearTimeout(reqTimer);
        if (xhr.readyState != 4) {
            alert("Error loading form");
            reqState.callback(false,reqState.data);
            return;
        }
        if (xhr.status != 200) {
            alert("Server error for form " + reqState.data);
            reqState.callback(false,reqState.data);
            return;
        }
        
        var rawXML = reply.target.responseText;

        reqState.callback(true,rawXML);
    }; 
    
    var cbReqTimeout = function() {
        if (!config.debug){
            xhr.abort();
            alert("URL could not be found");
            reqState.callback(false,reqState.data);
        }
        else {
            console.log("Debug enabled, xmlHttpRequest timeout ignored");
        }   

    };

    xformer.prototype.requestData = function (url, cb) {
        //var formListURL = url;  // don't need to do anything here
        reqState.type = "data";
        reqState.callback = cb;
        xhr.onload = this.cbRequestData.bind(this);
        xhr.open("get", url, true);
        xhr.send();
        reqTimer = setTimeout(cbReqTimeout,REQ_WAIT_TIME);
        
    };

   xformer.prototype.cbRequestData = function (reply) {
        clearTimeout(reqTimer);
        if (xhr.readyState != 4) {
            alert("What?");
            return;
        }
        if (xhr.status != 200) {
            alert("Error loading page");
            return;
        }
        
        var rawData = reply.target.responseText;
        
        // return and show the form
        reqState.callback(true, rawData);
        
    };

    xformer.prototype.requestForm = function (url, cb) {
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
            reqTimer = setTimeout(cbReqTimeout,REQ_WAIT_TIME);
        }
        catch(err) {
            alert("Error loading form");
            reqState.callback(false,reqState.data);            
        }
    };
    
    xformer.prototype.cbSendModel = function (reply) {
        clearTimeout(reqTimer);
        //console.log("cbReadFormList done");
        if (xhr.readyState != 4) {
            //alert("Error loading form");
            app.view.notifyModal("Submit","Submit complete");
            reqState.callback(false,reqState.data);
            return;
        }
        if ((xhr.status != 200) && (xhr.status != 201)){
            //alert("Server error for form " + reqState.data);
            reqState.callback(false,reqState.data);
            return;
        }
        
        var rawText = reply.target.responseText;

        // notify the controller that the load is complete
        reqState.callback(true,reqState.data);
    }; 
    /*
    xformer.prototype.makedata = function(model, jsonFile) {
        var boundary = '---------------------------';
        boundary += Math.floor(Math.random()*32768);
        boundary += Math.floor(Math.random()*32768);
        boundary += Math.floor(Math.random()*32768);
        xhr.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + boundary);
        var body = '';
        //body += '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="xml_submission_file";';

        var modelTime = new Date();
        modelTime.setTime(model.timestamp());
        var filename = "model_"+model.get("_name")+"_"+
                        modelTime.getFullYear()+"-"+
                        modelTime.getMonth()+"-"+
                        modelTime.getDay()+
                        "_"+
                        modelTime.getHours()+"-"+
                        modelTime.getMinutes()+"-"+
                        modelTime.getSeconds()+".js";
        
            body += '--' + boundary + '\r\n'
            body += 'Content-Disposition: form-data; name="json_submission_file";filename="' + filename +'";\r\n';
            body += 'Content-Type: text/javascript' + '\r\n'; 
            body += 'Content-Transfer-Encoding: UTF-8' + '\r\n'; 
            body += '\r\n'
            body += jsonFile;
            body += '\r\n'
            body += '--' + boundary + '--';
        return body;
    };
    */
    
    xformer.prototype.createJSONData = function (model) {
        var obj = {$_disease_case: []};
        var c = obj["$_disease_case"];
        c[0] = {};
        var f = c[0];
        
       var form = app.uiController.getFormByName("disease_case");
       var defaultForm = form.get("form");
        
      var data = form.get("obj")["$_disease_case"][0]["field"];
      for (var key in data) {
        var item = data[key];
        var name = item["@name"];
        var type = item["@type"];
        var value = model.get(name);
        if (type.indexOf("reference") === 0) {
            if (value != defaultForm[name]) {
                if (item["select"]) {
                    var resource = type.split(' ')[1];
                    var resourceId = "$k_" + name;
                    var reference = {"@resource":resource,"@uuid":value};
                    f[name] = value;
                }
            }
        }
        else {
            if (value != defaultForm[name]) {
                f[name] = value;
            }
            
        }
      }
      return JSON.stringify(obj);
    };
    
    xformer.prototype.sendModel = function (model, cb, options) {
        reqState.type = "send-form";
        reqState.callback = cb;
        reqState.data = model;

        // Get the JSON data to send
        var jsonDocument = this.createJSONData(model);
        
        
        // create url to send to
        var serverUrl = app.uiController.getHostURL();
        var urlSubmit = serverUrl + "/disease/case.s3json";

        // send
        var username = app.state.settings.serverInfo.get("username");
        var password = app.state.settings.serverInfo.get("password");
        var authentication = 'Basic ' + window.btoa(username + ':' + password);
        
        // Set headers
        xhr.onload = this.cbSendModel.bind(this);
        //xhr.onreadystatechange=this.cbSendModel.bind(this);
        xhr.open('PUT', urlSubmit, true);
        xhr.setRequestHeader('Authorization', authentication);
        //var dataToSend = this.makedata(model,jsonDocument);
        try {
            xhr.send(jsonDocument);
            reqTimer = setTimeout(cbReqTimeout,REQ_WAIT_TIME);
        }
        catch (err) {
            alert("send error");
            reqState.callback(false,reqState.data);
        }
       
    };

    var jsonData = '--------12345678\r\n' +
                    'Content-Disposition: form-data; name="email"\r\n' +
                    '\r\n' +
                    'tombaker1@gmail.com\r\n' +
                    '--------12345678\r\n' +
                    'Content-Disposition: form-data; name="password"\r\n' +
                    '\r\n' +
                    'eden\r\n';

    xformer.prototype.cbSendForm = function (reply) {
        //console.log("cbReadFormList done");
        if (xhr.readyState != 4) {
            console.log("Error loading form");
            //reqState.callback(false,reqState.data);
            return;
        }
        if ((xhr.status != 200) && (xhr.status != 201)){
            console.log("Server error for form " + reqState.data);
            //reqState.callback(false,reqState.data);
            return;
        }
        
        var rawText = reply.target.responseText;
        console.log("send received");
    };
    
        xformer.prototype.sendForm = function (hostURL) {
        
            console.log("doSend");
            var username = app.state.settings.serverInfo.get("username");
            var password = app.state.settings.serverInfo.get("password");
            var authentication = 'Basic ' + window.btoa(username + ':' + password);
            var boundary = "--------12345678";
            var data = jsonData;
        
            var url = hostURL + "/default/user/login";
            xhr.open('POST', url, true) //, username, password); // urlencoded-post
            xhr.onload = this.cbSendForm.bind(this);
            xhr.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + boundary);
            xhr.send(jsonData);
    };
    app.commHandler = new xformer();

})( jQuery, window, document );
