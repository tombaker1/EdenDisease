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
        
    // create the form list item
    var formType = Backbone.Model.extend({
        defaults: {
            url: "",
            name: "",
            loaded: false,
            form: null,
            data: null
        },
        initialize: function() {
            //console.log("new formType name:" + this.get("name"));
        }
    });
    var formList = new Backbone.Collection;
    var diseaseCase = null;
    
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
    
    xformer.prototype.getForm = function (i) {
        return formList.at(i); 
    }
    
    xformer.prototype.getAllForms = function () {
        return formList; 
    }
    
    xformer.prototype.numForms = function () {
        return formList.length;
    }
    
    xformer.prototype.getFormByName = function (name) {
        for (var i = 0; i < formList.length; i++) {
            if (name === formList.at(i).get("name")) {
                return formList.at(i);
            }
        }
        return null;
    };

    xformer.prototype.getDoc = function (i) {
        return formList.at(i); 
    }
    
    xformer.prototype.cbReadFormList = function (reply) {
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
        //var objData = JSON.parse(rawData);
        
        //this.parseFormList(rawXml);
        
        // return and show the form
        reqState.callback(true, rawData);
        
    };
    
    xformer.prototype.parseFormList = function (rawData) {
        var obj = JSON.parse(rawData);
        diseaseCase = obj;
        for (var key in diseaseCase) {
            console.log(key);
            var item = obj[key];
            for (i = 0; i < item.length; i++) {
                var sub = item[i];
                for (var key2 in sub) {
                    console.log('\t'+ key2);
                }
            }
        }
        /*
        var xmlDoc = $.parseXML(rawXml);
        var $xml = $( xmlDoc );
        forms = $xml.find( "form" );
        for (var i = 0; i < forms.length; i++) {
            var $item = $(forms[i]);
            var name = $item[0].textContent; //.html();
            var url = $item.attr("url");
            formList.add(new formType({"name":name, "url":url}));
        }
        */
    };
    
    xformer.prototype.parseForm = function (rawXML,formName) {
        var xmlDoc = $.parseXML(rawXML);
        var $xml = $( xmlDoc );
        
        // Parse the model
        var $model = $xml.find("model");
        var instance = $model.find("instance");
        var elementName = "";
        var fields = {};
        var modelPrototype = {};
        for (var i = 0; i < instance.length; i++) {
            var element = $(instance[i]).children()[0];
            elementName = element.nodeName;
            //console.log("element name " + elementName);
            var fieldItems = $(element).children();
            
            // 
            var requiredList = [];
            for (var j = 0; j < fieldItems.length; j++) {
                // get model element
                var key = fieldItems[j].nodeName;
                var value = fieldItems[j].textContent;
                if (value === undefined) {
                    value = "";
                }
                var field = {};
                var item = {};
                field["value"] = value;
                modelPrototype[key] = value;
                
                // find binding
                var nodeset = '/' + elementName + '/' + key;
                var searchString = "bind[nodeset*='" + nodeset + "']";
                var bindElement = $model.find(searchString)[0];
                var attributes = bindElement.attributes;
                //console.log("attr " + attributes.length);
               
                // add attributes of bind
                var attributeList = {};
                for (var k = 0; k < attributes.length; k++) {
                    var name = attributes[k].nodeName;
                    var value = attributes[k].value;
                    field[name] = value;
                    
                    // Check for requirements
                    if ((name==="required") && (value ==="true()")) {
                        requiredList.push(key);
                    }
                }
                                
                // add to array
                fields[key] = field;
                //console.log(key + ' ' + value);
            }
            
        }
        // Just get English for now and stuff it in the map
        var itext = $model.find("itext")[0];
        var strings = $(itext).find("translation[lang*='eng']")[0];
        fields["strings"] = strings;
                
        // parse the body
        fields['xml'] = rawXML;
        fields['$xml'] = $xml;
        fields['formId'] = elementName;

        this.getFormByName(formName).set({"data":modelPrototype,
                                  "loaded":true,
                                  "form":fields,
                                  "required":requiredList,
                                  "formId":elementName});
        return reqState.data;
    };
    
    xformer.prototype.cbReadForm = function (reply) {
        clearTimeout(reqTimer);
        //console.log("cbReadFormList done");
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
        //this.parseForm(rawXML,reqState.data);

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

    xformer.prototype.requestFormList = function (url, cb) {
        var formListURL = url;  // don't need to do anything here
        reqState.type = "request-form-list";
        reqState.callback = cb;
        reqState.data = formListURL;
        xhr.onload = this.cbReadFormList.bind(this);
        xhr.open("get", formListURL, true);
        xhr.send();
        reqTimer = setTimeout(cbReqTimeout,REQ_WAIT_TIME);
        
    };

    xformer.prototype.requestForm = function (url, cb) {
        reqState.type = "request-form";
        reqState.callback = cb;
        reqState.data = "load-form";

        try {
            xhr.onload = this.cbReadForm.bind(this);
            xhr.open("get", url, true);
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
            alert("Error loading form");
            reqState.callback(false,reqState.data);
            return;
        }
        if ((xhr.status != 200) && (xhr.status != 201)){
            alert("Server error for form " + reqState.data);
            reqState.callback(false,reqState.data);
            return;
        }
        
        var rawText = reply.target.responseText;

        // notify the controller that the load is complete
        reqState.callback(true,reqState.data);
    }; 
    
    xformer.prototype.makedata = function(model, xmlfile) {
        var boundary = '---------------------------';
        boundary += Math.floor(Math.random()*32768);
        boundary += Math.floor(Math.random()*32768);
        boundary += Math.floor(Math.random()*32768);
        xhr.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + boundary);
        var body = '';
        body += '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="xml_submission_file";';

        var modelTime = new Date();
        modelTime.setTime(model.timestamp());
        var filename = "model_"+model.get("_name")+"_"+
                        modelTime.getFullYear()+"-"+
                        modelTime.getMonth()+"-"+
                        modelTime.getDay()+
                        "_"+
                        modelTime.getHours()+"-"+
                        modelTime.getMinutes()+"-"+
                        modelTime.getSeconds()+".xml";
        
        body += 'filename="' + filename + '"' + '\r\n'; 
        body += 'Content-Type: text/xml' + '\r\n'; 
        body += 'Content-Transfer-Encoding: UTF-8' + '\r\n'; 
        body += '\r\n'
        body += xmlfile;
        body += '\r\n'
        body += '--' + boundary + '--';
        return body;
    };
    
    xformer.prototype.sendModel = function (model, cb, options) {
        reqState.type = "send-form";
        reqState.callback = cb;
        reqState.data = model;
        var pairs = [];
        
        // Fill field
        var xmlDocument = '<?xml version="1.0"  encoding="UTF-8"?>\r\n';
        xmlDocument += '<' + model._formId + '>\r\n';
        for (var key in model.attributes) {
            // Don't send any meta data that begins with '_'
            if (key[0] != '_') {
                var value = encodeURIComponent(model.get(key));
                xmlDocument += "<" + key + ">" + value + "</" + key + ">\r\n";
                pairs.push(encodeURIComponent(key) + "=" + value);
            }
        }
        xmlDocument += '</' + model._formId + '>\r\n';
        
        // create url to send to
        var serverUrl = app.state.settings.serverInfo.get("url");
        var urlSubmit = serverUrl + "/xforms/submission/" + model._formId;

        // send
        var username = app.state.settings.serverInfo.get("username");
        var password = app.state.settings.serverInfo.get("password");
        var authentication = 'Basic ' + window.btoa(username + ':' + password);
        
        // Set headers
        xhr.onload = this.cbSendModel.bind(this);
        //xhr.onreadystatechange=this.cbSendModel.bind(this);
        xhr.open('POST', urlSubmit, true);
        xhr.setRequestHeader('Authorization', authentication);
        var dataToSend = this.makedata(model,xmlDocument);
        try {
            xhr.send(dataToSend);
            reqTimer = setTimeout(cbReqTimeout,REQ_WAIT_TIME);
        }
        catch (err) {
            alert("send error");
            reqState.callback(false,reqState.data);
        }
       
    };

    var jsonData = '{' +
                    '"$_disease_case": [' +
                    '{"case_number":"42",' +
                    '"$k_disease_id":{"@resource":"disease_disease","@tuid":"DISEASE"},' +
                    '"monitoring_level":"QUARANTINE",' +
                    '"illness_state":"SYMPTOMATIC",' +
                    '"diagnosis_status":"CONFIRMED-POS",' +
                    '"$k_person_id":{"resource":"pr_person","@tuid":"PERSON"}' +
                    '}' +
                    '],' +
                    '"$_pr_person":' +
                    '[' +
                    '{"@tuid":"PERSON",' +
                    '"first_name":"John",' +
                    '"last_name":"Johnson",' +
                    '"email":"jj@gmail.com"' +
                    '}' +
                    '],' +
                    '"$_disease_disease":' +
                    '[' +
                    '{"@tuid":"DISEASE","name":"Ebola Virus Disease"}' +
                    ']' +
                    '}';
    
    
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
            //reqState.type = "send-form";
            //reqState.callback = this.cbSendForm.bind(this);
            //reqState.data = model;
        
            console.log("doSend");
            var username = app.state.settings.serverInfo.get("username");
            var password = app.state.settings.serverInfo.get("password");
            var authentication = 'Basic ' + window.btoa(username + ':' + password);
            var boundary = "--------12345678";
            //var xmlData = '<?xml version="1.0"?><pr_image><profile>1</profile><image>image</image><url>url</url><type>1</type><description>ddd</description></pr_image>';
            var data = jsonData;
            ///data += '';
            var body = '';
            body += '--' + boundary + '\r\n'
            body += 'Content-Disposition: form-data; name="json_submission_file";filename="xml_file.js";\r\n';
            body += 'Content-Type: text/javascript' + '\r\n'; 
            body += 'Content-Transfer-Encoding: UTF-8' + '\r\n'; 
            body += '\r\n'
            body += data;
            body += '\r\n'
            body += '--' + boundary + '--';
        
            var url = hostURL + "/disease/case.s3json";
            //var url = "http://tom-xps:8000/eden/disease/case.s3json";
            //http://ebola.sahanafoundation.org/eden/disease/disease.s3json
            //http://ebola.sahanafoundation.org/eden/disease/case.s3json
            xhr.open('PUT', url, true) //, username, password); // urlencoded-post
            xhr.onload = this.cbSendForm.bind(this);
            xhr.setRequestHeader('Authorization', authentication);
            //xhr.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + boundary);
            //xhr.send(body);
            xhr.send(jsonData);
/*
        // Fill field
        var xmlDocument = '<?xml version="1.0"  encoding="UTF-8"?>\r\n';
        xmlDocument += '<' + model._formId + '>\r\n';
        for (var key in model.attributes) {
            // Don't send any meta data that begins with '_'
            if (key[0] != '_') {
                var value = encodeURIComponent(model.get(key));
                xmlDocument += "<" + key + ">" + value + "</" + key + ">\r\n";
                pairs.push(encodeURIComponent(key) + "=" + value);
            }
        }
        xmlDocument += '</' + model._formId + '>\r\n';
        
        // create url to send to
        var serverUrl = app.state.settings.serverInfo.get("url");
        var urlSubmit = serverUrl + "/xforms/submission/" + model._formId;

        // send
        var username = app.state.settings.serverInfo.get("username");
        var password = app.state.settings.serverInfo.get("password");
        var authentication = 'Basic ' + window.btoa(username + ':' + password);
        
        // Set headers
        xhr.onload = this.cbSendModel.bind(this);
        //xhr.onreadystatechange=this.cbSendModel.bind(this);
        xhr.open('POST', urlSubmit, true);
        xhr.setRequestHeader('Authorization', authentication);
        var dataToSend = this.makedata(model,xmlDocument);
        try {
            xhr.send(dataToSend);
            reqTimer = setTimeout(cbReqTimeout,REQ_WAIT_TIME);
        }
        catch (err) {
            alert("send error");
            reqState.callback(false,reqState.data);
        }
       */
    };
    app.commHandler = new xformer();

})( jQuery, window, document );
