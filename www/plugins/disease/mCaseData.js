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

    var mCaseData = mFormData.extend({
        initialize: function (options) {
            mFormData.prototype.initialize.call(this, arguments);

            this._type = "case";
            this._person = null;
        },

        person: function (_person) {
            if (_person) {
                this._person = _person;
            }
            return this._person;
        },

        sendData: function () {
            var obj = {
                $_disease_case: []
            };
            var c = obj["$_disease_case"];
            c[0] = {};
            var f = c[0];

            // If the model came from the server then it has a uuid
            if (this.get("uuid")) {
                f["@uuid"] = this.get("uuid");
            } else {
                var dateString = (new Date(this.timestamp())).toISOString();
                f["@created_on"] = dateString;
            }
            var changed = this.changed;

            //var controller = app.pluginManager.getController("disease");
            var form = app.controller.getFormByName("disease_case");
            var defaultForm = form.get("form");

            var data = form.get("obj")["$_disease_case"][0]["field"];
            for (var key in data) {
                var item = data[key];
                var name = item["@name"];
                var type = item["@type"];
                var value = this.get(name);
                if (type.indexOf("reference") === 0) {
                    if (!this._serverState || changed[name]) {
                        if (item["select"]) {
                            f[name] = value;
                        }
                    }
                } else {
                    if (!this._serverState || changed[name]) {
                        f[name] = value;
                    }

                }
            }

            // Add person data if necessary
            var person = this.person();
            if (person) {
                var personObject = person.sendObject();
                var tuid = personObject["$_pr_person"][0]["@tuid"];
                f["$k_person_id"] = {
                    "@resource": "pr_person",
                    "@tuid": tuid
                };
                obj = _.extend(obj, personObject);
            }

            return JSON.stringify(obj);
        }
    });

    app.pluginManager.addObject(mCaseData);

})(jQuery, window, document);