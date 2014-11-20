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
    var pluginName = 'jqmController';
    var defaults = {
        };
 
    // The actual plugin constructor
    function controller(  ) {
        
        this._defaults = defaults;
        this._name = pluginName;
        this._diseaseCase = null;
        this._dataTable = {};
        this._updateState = {
            active: false,
            list: [],
            name: ""
        };
       
        $(this).bind("reset-all",this.onReset.bind(this));
        //$(this).bind("download-complete",this.onDownloadComplete.bind(this));
                     
        //$("#cancel").click(this.onFormCancel.bind(this));
        //$("#save").click(this.onFormSave.bind(this));
        //$("#submit").click(this.onFormSubmit.bind(this));

        //this.init(options);
        //$(document).bind( "pagebeforechange", pageChange );
    };
    
    controller.prototype.init = function ( options ) {
        //reqState = options["xform"]; //new XMLHttpRequest();
        this.options = $.extend( {}, defaults, options) ;
        if (options["state"]) {
            this.state = options["state"];
        }
        else {
            this.state = app.state;
        }
        this.getLocation();
        
        //$("#load-form-button").click(this.onLoadFormList.bind(this));
        //$("#debug-button").click(this.onDebug.bind(this));
        
        // Load the saved data or initialize data
        var rawData = app.storage.read("form-raw");
        if (rawData) {
            this._diseaseCase = JSON.parse(rawData);
            this.parseForm();
            //app.commHandler.parseFormList(formListXml);
            // put the list of forms into the page
            /*
            app.view.insertForms(app.commHandler.getAllForms());
            
            // Parse all keys
            var savedData = [];
            var storageList = app.storage.list();
            for (var i = 0; i < storageList.length; i++) {
                var key = storageList[i];
                if (key.indexOf("form-xml") >= 0) {
                    var xml = app.storage.read(key);
                    //console.log("loading form " + key + " length " + xml.length);
                    var formName = key.split('-')[2];
                    var index = app.commHandler.parseForm(xml,formName);
                    var form = app.commHandler.getFormByName(formName);
                    app.view.createForm({model:form,index:index});

                    // Uncheck and disable checkbox
                    app.view.setFormListItem({name:formName,
                                             checked:false,
                                             disabled:true});
                }
                else if (key.indexOf("data-") >= 0) {
                    savedData.unshift(key);
                }
                
            }
            
            //read the list into the collection 
            activeForms.restore(savedData);
            
            // update view lists
            app.view.getFormList().enhanceWithin();
            app.view.$newFormList.listview('refresh');
            */
        }
      
        // Update the data tables
        this.updateData(["cases","persons"]);
        //this.updateData("persons");
        
    };
    
    controller.prototype.getData = function(tableName) {
        var table = this._dataTable[tableName];
        return table;
    };
    
     controller.prototype.setData = function(tableName,tableData) {
        this._dataTable[tableName] = tableData;
    };
    
    controller.prototype.updateData = function(dataList) {
        this._updateState.list = this._updateState.list.concat(dataList);
        this.nextUpdate();
    };
    
    controller.prototype.nextUpdate = function() {
        if (this._updateState.active || (this._updateState.list.length === 0)) {
            return;
        }
        
        var name = this._updateState.list[0];
        var path = this.getHostURL();
        switch (name) {
                case "cases": {
                    path += config.defaults.caseListPath; //"/disease/case.json";
                } break;
                case "persons": {
                    path += config.defaults.personListPath; //"/pr/person.json";
                } break;
                default: {
                    alert("nope");
                }
        }
        this._updateState.active = true;
        app.commHandler.requestData(path, this.cbUpdateData.bind(this));
    };
    
    controller.prototype.cbUpdateData = function (status, dataTable) {
        //TODO update data
        var name = this._updateState.list.shift();
            this._updateState.active = false;
        if (status) {
            var data = JSON.parse(dataTable);
            this.setData(name,data);
            if (name === "cases") {
                //app.view.getPage("page-cases").update();
            }
            this.nextUpdate();
        }
        else {
            alert("Communication failure " + name); //TODO: do the right thing
        }
    };
    
   controller.prototype.resetAll = function (  ) {
        app.view.resetDialog();
    };
    
    controller.prototype.onReset = function (  ) {
        //TODO: Move this into the model or the collection
        var list = app.storage.list();
        for (var i = 0; i < list.length; i++) {
            var path = list[i];
            app.storage.delete(path);
        }
        //window.requestAnimationFrame(function() {app.view.confirm.show()});
    };
    
    //controller.prototype.onFormCancel = function (  ) {
    //    console.log("onFormCancel");
    //};
    
    controller.prototype.onFormSave = function ( page ) {
        //console.log("onFormSave");
        //var a = _.contains(activeForms,model);
        //var page = $("#page-new-form");
        var form = this.getFormByName("disease_case");
        var model = form.get("current");
            if (!model) {
                model = form.get("current");
            }
        page.getModelData(model);

        if (!activeForms.contains(model)) {
            activeForms.add(model);
            model.sync('create',model,{local:true});
            app.view.newSavedFormItem({model:model});
        }
        else {
            model.sync('update',model,{local:true});

        }

    };
    
    controller.prototype.onFormSubmit = function ( page ) {
        //console.log("onFormSubmit");
        //var page = $("#page-new-form");
        var form = this.getFormByName("disease_case");
        var model = form.get("current");
            if (!model) {
                model = form.get("current");
            }
        page.getModelData(model);
        model.submit();
        
    };
    
    controller.prototype.getHostURL = function (  ) {
        // TODO: this doesn't apply anymore
        var url = "";
        var serverUrl = app.state.settings.serverInfo.get("url");
        if (this.state.settings.source === 1) {
            url = serverUrl; // + config.defaults.formList;
        }
        else {
            url = serverUrl; // + "/xforms/" + config.defaults.formList;
        }
        return url;

    };
    
    controller.prototype.loadFormList = function (  ) {
        // Load the form list
        var url = this.getHostURL() + config.defaults.caseCreatePath;
        app.commHandler.requestFormList(url,cbDiseaseCase);
    };
    
    controller.prototype.onDebug = function ( event ) {
        console.log("onDebug");

    };

    controller.prototype.loadForm = function ( event ) {
        console.log("loadForm");
        var url = app.uiController.getHostURL() + config.defaults.caseCreatePath;
        app.commHandler.requestForm(url,this.cbFormLoadComplete.bind(this));
        /*
        var forms = app.commHandler.getAllForms();
        this.loadList = app.view.getSelectedForms(forms);
        if (this.loadList.length) {
            var name = this.loadList.pop();
            app.commHandler.requestForm(name,this.cbFormLoadComplete.bind(this));
        }
        */
    };
    
    controller.prototype.parseRecord = function(record) {
        //var field = {};
        var references = {};
        for (var recordName in record) {
            var child = record[recordName];
            var childRecords = null;
            //var subName = "";
            if (recordName.indexOf("$_") === 0) {
                childRecords = [];
                for (var i = 0; i < child.length; i++) {
                    var item = this.parseRecord(child[i]);
                    childRecords.push(item);
                }
                    
            }
            else if (recordName === "field") {
                //field = parseRecord(child);
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
                        
                    }
                    else {
                        // show the type so we can find the initial value
                        switch (type) {
                            case "string": {
                                value = "";
                                break;
                            }
                            case "date": {
                                value = "";
                                break;
                            }
                            case "datetime": {
                                value = "";
                                break;
                            }
                            case "text": {
                                value = "";
                                break;
                            }
                            case "integer": {
                                value = 0;
                                break;
                            }
                            default: {
                                value = "unknown";
                                break;
                            }
                        }
                    }
                    childRecords[name] = value;
                }
            }
            else {
                childRecords = child;
            }
            references[recordName] = childRecords;
        }
        
        return references;
    };

    controller.prototype.parseForm = function() {
        console.log("\tparseForm");
        var obj = this._diseaseCase;
        
        // Parse the object into the components
        var results = this.parseRecord(obj);
        var modelData = results["$_disease_case"][0]["field"];
        
        // create model
        var model = new formType({"name":"disease_case","form":modelData,"data":results,"obj":obj});
        formList.add(model);
        
        // Update view
        //app.view.updateCaseForm(obj);
        var page = app.view.getPage("page-new-case");
        page.update(obj);
        
        return model;
    };
    
    controller.prototype.cbFormLoadComplete = function(status,rawData) {
        console.log("cbFormLoadComplete");
        

        // only do this if the form loaded successfully
        if (status) {
            
            // Set model
            this._diseaseCase = JSON.parse(rawData);
            var model = this.parseForm();
            //var form = app.commHandler.getFormByName(name);
            //app.view.createForm({model:form,name:name});
            
            // Save data to local storage
            var formName = "form-raw"; //+form.get("name");
            localStorage.setItem(formName,rawData);
            app.view.notifyModal("Load","Load Complete.");
            
        }
        else {
            app.view.notifyModal("Load","Load failure.");
        }
        
        /*
         *        // success or failure you want to disable the item in the list
        // Uncheck and disable checkbox
        app.view.setFormListItem({name:name,checked:false,disabled:true});
        
        // get next page
        if (this.loadList.length) {
            var nextName = this.loadList.pop();
            app.commHandler.requestForm(nextName,
                                     this.cbFormLoadComplete.bind(this));
        } 
        else {
        //TODO: Move this into the view
            app.view.getFormList().enhanceWithin();
            app.view.$newFormList.listview('refresh');
            app.view.confirm.setText("Load","Load Complete");
            app.view.confirm.show();
        }
        */
    };
    
    var cbDiseaseCase = function(success, rawData) {
      
        if (!success) {
            // TODO: print an error message here
            return;
        }
        // Save the form to local memory
        var filename = "disease-case";
        //localStorage.setItem(filename,xmlFile);
        app.storage.write(filename,rawData);
        var objData = JSON.parse(rawData);
      
        // put the list of forms into the page
        // TODO: parse the forms here
        //app.view.insertForms(app.commHandler.getAllForms());
        app.view.confirm.setText("Load","Load Complete");
        app.view.confirm.show();
    }
    
    controller.prototype.cbFormSendComplete = function(status,model) {
        if (status) {
            //console.log("cbFormSendComplete success");
            activeForms.remove(model);
            app.view.removeSavedFormItem({model:model});
            model.sync("delete",model,{local:true});
            app.view.notifyModal("Submit","Submit complete");
        }
        else {
            //console.log("cbFormSendComplete failure");
            //this.onFormSave(null,model);
            app.view.notifyModal("Submit","Submit failure. Form saved.");
            if (!activeForms.contains(model)) {
                activeForms.add(model);
                app.view.newSavedFormItem({model:model});
            }
        }
    };
     
    controller.prototype.getFormByName = function(name) {
        for (var i = 0; i < formList.length; i++) {
            if (name === formList.at(i).get("name")) {
                return formList.at(i);
            }
        }
        return null;
    };
    
    controller.prototype.newForm = function() {
        var form = this.getFormByName("disease_case");
        //var $page = $("#page-new-form");
        var model = new mFormData(form.get("form"));
        //model.name(form.get("name"));
        model.timestamp(Date.now());
        //model.urlRoot = form.get("url");
        //model._formId = form.get("formId");
        form.set("current",model);
        //var pageID = pageURL.hash.replace( /#/, "" );
        var page = app.view.getPage("page-new-case");
        page.showForm(form,model);

    }
    
    controller.prototype.editForm = function(model) {
        var form = app.commHandler.getFormByName(model.name());
        var $page = $("#page-form-" + form.get("name"));
        //var model = new formData(form.get("data"));
        //model._name = form.get("name");
        //model._timestamp = Date.now();
        form.set("current",model);
        //var pageID = pageURL.hash.replace( /#/, "" );
        app.view.showForm(form,model,$page);
    }
   
    var postLocation = function(latitude,longitude) {
        var msg = $("#content-messages").html();
        msg += "latitude: " + latitude + "<br>";
        msg += "longitude: " + longitude + "<br>";
        $("#content-messages").html(msg);
    };
    
    controller.prototype.getLocation = function() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                /*this.*/postLocation(position.coords.latitude, position.coords.longitude);
            },function() { alert("location failed");});
        } else {
            /* geolocation IS NOT available */
        }
    }
    
    var localController = new controller();
    
    // bind the plugin to jQuery     
    app.uiController = localController; 

})( jQuery, window, document );
