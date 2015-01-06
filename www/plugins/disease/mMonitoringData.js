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

    var mMonitoringData = mFormData.extend({
        initialize: function (options) {
            mFormData.prototype.initialize.call(this, arguments);

            this._type = "monitor";
            this._parent = null;
        },

        sendData: function () {

            var obj = {
                $_disease_case: []
            };

            var c = obj["$_disease_case"];
            c[0] = {};
            var f = c[0];

            // Put in the monitoring record
            if (this._parent) {
                f["@uuid"] = this._parent.get("uuid");
            }
            f["$_disease_case_monitoring"] = {};
            var m = f["$_disease_case_monitoring"];

            var changed = this.changed;

            var form = app.controller.getFormByName("disease_case_monitoring");
            var defaultForm = form.get("form");

            var data = form.get("obj")["$_disease_case"][0]["$_disease_case_monitoring"][0]["field"];
            for (var key in data) {
                var item = data[key];
                var name = item["@name"];
                var type = item["@type"];
                var value = this.get(name);
                if (type.indexOf("reference") === 0) {
                    if (changed[name]) {
                        if (item["select"]) {
                            m[name] = value;
                        }
                    }
                } else {
                    if (changed[name]) {
                        m[name] = value;
                    }

                }
            }

            return JSON.stringify(obj);
        }
    });
    
    app.pluginManager.addObject(mMonitoringData);

})(jQuery, window, document);