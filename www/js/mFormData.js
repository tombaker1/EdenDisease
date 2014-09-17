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


// create the form list item
var mFormData = Backbone.Model.extend({
    defaults: {
        _name:"",
        _timestamp:0,
        _submitted:false,
        _formId: ""
     },
    initialize: function(options) {
        //this._name = "";
        //this._timestamp = 0;
        //this.submitted = false;
    },
    
    submit: function() {
        console.log("sending model " + this.get("_name"));
        //this.set("_submitted",true);
        this.submitted(true);
        this.sync('create',this,{local:false});
    },
    
    getKey: function() {
        return this.get("_name") + '-' + this.get("_timestamp");
    },
    name: function(_name) {
        if (_name) {
            this.set("_name",_name);
        }
        return this.get("_name");
    },
    timestamp: function(_timestamp) {
        if (_timestamp) {
            this.set("_timestamp",_timestamp);
        }
        return this.get("_timestamp");
    },
    submitted: function(_submitted) {
        if (_submitted) {
            this.set("_submitted",_submitted);
        }
        return this.get("_submitted");
    }

});

var mActiveFormList = Backbone.Collection.extend({
    model:mFormData,
    restore: function(modelList) {
        while (modelList.length) {
            var key = modelList.pop();
            var fields = key.split('-');
            var formName = fields[1];
            var form = app.xformHandler.getFormByName(formName);
            var timestamp = fields[2];
            var storageData = app.storage.read(key);
            var data = JSON.parse(storageData);
            var model = new mFormData(data);
            //model.name(formName);
            //model.timestamp(+timestamp);
            //model.submitted(data["_submitted"]);
            model.urlRoot = form.get("url");
            this.add(model);
            app.view.newSavedFormItem({model:model});
        }
    } 
});

var activeForms = new mActiveFormList([]);
