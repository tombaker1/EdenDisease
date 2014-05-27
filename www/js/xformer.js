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
    
    // Create the defaults once
    var pluginName = 'xformer',
        defaults = {
        };
    
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
    
    // create the query state
    var xhr = null,
        reqTimer = null,
        //reqIndex = 0,
        //reqName = "",
        //reqCompleteCB = null,
        REQ_WAIT_TIME = 4000;
        
    var reqState = {
        type: "",
        data: null,
        callback: null
    };

    // The actual plugin constructor
    function xformer( options ) {
        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
       
        this.init();
    };
    
    xformer.prototype.init = function () {
        xhr = new XMLHttpRequest();
    };
    
    xformer.prototype.getForm = function (i) {
        return formList.at(i); //[i];
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
        return formList.at(i); //[i];
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
        
        var rawXml = reply.target.responseText;
        this.parseFormList(rawXml);
        
        // return and show the form
        reqState.callback(true, rawXml);
        
    };
    
    xformer.prototype.parseFormList = function (rawXml) {
        var xmlDoc = $.parseXML(rawXml);
        var $xml = $( xmlDoc );
        forms = $xml.find( "form" );
        for (var i = 0; i < forms.length; i++) {
            var $item = $(forms[i]);
            var name = $item[0].textContent; //.html();
            var url = $item.attr("url");
            //formList.push(new formItem(name,url));
            //var model = new formType({"name":name, "url":url});
            formList.add(new formType({"name":name, "url":url}));
        }
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
            var elementName = element.nodeName;
            //console.log("element name " + elementName);
            var fieldItems = $(element).children();
            
            // 
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
                    var value = attributes[k].nodeValue;
                    field[name] = value;
                    //console.log('\t' + name + ':' + value);
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
        //formList[reqIndex].model = modelPrototype;
        //formList[reqIndex].loaded = true;
        //formList[reqIndex].form = fields;
        //var model = formList.at(reqIndex);
        this.getFormByName(formName).set({"data":modelPrototype,
                                  "loaded":true,
                                  "form":fields});
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
        this.parseForm(rawXML,reqState.data);

        //model.set("loaded",true);
        //model.set("form",fields);
        // notify the controller that the load is complete
        reqState.callback(true,reqState.data);
    }; 
    
    xformer.prototype.cbSendResponse = function (reply) {
        //console.log("cbReadFormList done");
        console.log("cbSendResponse " + xhr.readyState +
                    " type " + xhr.responseType +
                    " length " + xhr.responseText.length);
        if (xhr.readyState != 4) {
            return;
        }
        clearTimeout(reqTimer);
        if (xhr.status != 200) {
            alert("Server error for send ");
            reqState.callback(false);
            return;
        }
        //localStorage.setItem("test",xhr.responseText);
        reqState.callback(true,reqState.data);
    }
    var cbReqTimeout = function() {
        xhr.abort();
        alert("URL could not be found");
        reqState.callback(false,reqState.data);            

    };

    xformer.prototype.requestFormList = function (url, cb) {
        reqState.type = "request-form-list";
        reqState.callback = cb;
        reqState.data = url;
        xhr.onload = this.cbReadFormList.bind(this);
        xhr.open("get", url, true);
        xhr.send();
        reqTimer = setTimeout(cbReqTimeout,REQ_WAIT_TIME);
    };

    xformer.prototype.requestForm = function (name, cb) {
        reqState.type = "request-form";
        reqState.callback = cb;
        reqState.data = name;
        //var item = this.getForm(index);
        var url = this.getFormByName(name).get("url");
        reqState.data = name;
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

    xformer.prototype.sendModel = function (model, cb, options) {
        reqState.type = "send-form";
        reqState.callback = cb;
        reqState.data = model;
        xhr.onload = null;
        var urlData = "";
        var pairs = [];
        
        // Fill field
        for (var key in model.attributes) {
            var value = encodeURIComponent(model.get(key));
            pairs.push(encodeURIComponent(key) + "=" + value);
            
        }
        urlData = pairs.join('&').replace(/%20/g, '+');        
        // We setup our request
        xhr.onreadystatechange=this.cbSendResponse.bind(this);
        //xhr.open('POST', model.urlRoot);
        xhr.open('urlencoded-post', model.urlRoot);
      
        // We add the required HTTP header to handle a form data POST request
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        //xhr.setRequestHeader('Content-Length', urlData.length);
      
        // And finally, We send our data.
        try {
            xhr.send(urlData);
            reqTimer = setTimeout(cbReqTimeout,REQ_WAIT_TIME);
        }
        catch (err) {
            alert("send error");
            reqState.callback(false,reqState.data);
        }
    };
    
    // bind the plugin to jQuery     
    $.xformer = function(options) {
        return new xformer( this, options );
    }

})( jQuery, window, document );
