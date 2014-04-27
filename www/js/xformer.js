
;(function ( $, window, document, undefined ) {
    
    // Create the defaults once
    var pluginName = 'xformer',
        defaults = {
        };
    
    // create the form list item  
    function formItem(name,url) {
        this.url = url,
        this.name = name,
        this.loaded = false;
        this.form = null;
        this.model = null;
    }
    var formList = [];
    
    // create the query state
    var reqState = null,
        reqTimer = null,
        reqIndex = 0,
        reqCompleteCB = null,
        REQ_WAIT_TIME = 4000;

    // The actual plugin constructor
    function xformer( options ) {
        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
       
        this.init();
    };
    
    xformer.prototype.init = function () {
        reqState = new XMLHttpRequest();
    };
    
    xformer.prototype.getForm = function (i) {
        return formList[i];
    }
    
    xformer.prototype.numForms = function (i) {
        return formList.length;
    }
    
    xformer.prototype.getDoc = function () {
        return formList[i];
    }
    
    xformer.prototype.cbReadFormList = function (reply) {
      //var $msg = $("#content-messages");
      //var message = $msg.html();
      //message += "cbReadFormList"; $msg.html(message);
      

        clearTimeout(reqTimer);
        if (reqState.readyState != 4) {
            alert("What?");
            return;
        }
        if (reqState.status != 200) {
            alert("Error loading page");
            return;
        }
        
        var xmlDoc = $.parseXML(reply.target.responseText);
        var $xml = $( xmlDoc );
        forms = $xml.find( "form" );
        for (var i = 0; i < forms.length; i++) {
            var $item = $(forms[i]);
            var name = $item[0].textContent; //.html();
            var url = $item.attr("url");
            formList.push(new formItem(name,url));
        console.log("name: " + name);
        console.log("url:" + url);
        //console.log($item);
      //message += "<br>  " + i + "   name: " + name; $msg.html(message);
            
            //console.log(formList[i].name);
            //$("#formList").append(name + "<br>");
        }
        
        // return and show the form
        reqCompleteCB();
        //console.log("cbReadFormList done");
     // message += "<br>cbReadFormList done"; $msg.html(message);
        
    };
    
    xformer.prototype.cbReadForm = function (reply) {
        clearTimeout(reqTimer);
        //console.log("cbReadFormList done");
        if (reqState.readyState != 4) {
            alert("What?");
            return;
        }
        if (reqState.status != 200) {
            alert("Error loading page");
            return;
        }
        
        var xmlDoc = $.parseXML(reply.target.responseText);
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
                var value = fieldItems[j].innerHTML;
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
        //var body = $("h:body"); xmlDoc
        fields['xml'] = $xml;
        //formList[reqIndex].rawText = true;
        //formList[reqIndex].loaded = true;
        formList[reqIndex].model = modelPrototype;
        formList[reqIndex].loaded = true;
        formList[reqIndex].form = fields;
        
        // notify the controller that the load is complete
        reqCompleteCB(reqIndex);
    }; 
    
    var cbReqTimeout = function() {
        reqState.abort();
        alert("URL could not be found");
    };

    xformer.prototype.requestFormList = function (url, cb) {
        reqCompleteCB = cb;
        reqState.onload = this.cbReadFormList.bind(this);
        reqState.open("get", url, true);
        reqState.send();
        reqTimer = setTimeout(cbReqTimeout,REQ_WAIT_TIME);
    };

    xformer.prototype.requestForm = function (index, cb) {
        reqCompleteCB = cb;
        var item = this.getForm(index);
        reqIndex = index;
        reqState.onload = this.cbReadForm.bind(this);
        reqState.open("get", item.url, true);
        reqState.send();
        reqTimer = setTimeout(cbReqTimeout,REQ_WAIT_TIME);
    };

    // bind the plugin to jQuery     
    $.xformer = function(options) {
        return new xformer( this, options );
    }

})( jQuery, window, document );
