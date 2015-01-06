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

    var mPersonData = mFormData.extend({

        defaults: {
            person_name: "",
            gender: 1,
            date_of_birth: "",
            SMS: "",
            EMAIL: ""
        },
        
        initialize: function (options) {
            mFormData.prototype.initialize.call(this, arguments);

            this._type = "person";
        },

        sendObject: function () {

            var obj = {
                $_pr_person: [{

            }]
            };
            var p = obj["$_pr_person"][0];

            //  Split full name into first, middle, and last
            var fullName = this.get("person_name");
            p["@tuid"] = fullName;

            var names = fullName.split(" ");
            switch (names.length) {
            case 0:
                {
                    return "";
                }
            case 1:
                {
                    p["first_name"] = names[0];
                }
                break;
            case 2:
                {
                    p["first_name"] = names[0];
                    p["last_name"] = names[1];
                }
                break;

                // This includes names.length >= 3
            default:
                {
                    p["first_name"] = names.shift();
                    p["middle_name"] = names.shift();
                    p["last_name"] = names.join(" ");
                }
            }




            // gender
            p["gender"] = this.get("gender");

            // date of birth
            var dob = this.get("date_of_birth");
            if (dob.length) {
                p["date_of_birth"] = dob;
            }

            // contacts
            var email = this.get("EMAIL");
            var phone = this.get("SMS");
            if (email.length || phone.length) {
                p["$_pr_contact"] = [];
                var c = p["$_pr_contact"];
                if (phone.length) {
                    c.push({
                        "contact_method": "SMS",
                        "value": phone
                    });
                }
                if (email.length) {
                    c.push({
                        "contact_method": "EMAIL",
                        "value": email
                    });
                }
            }

            return obj;

        }
    });
    
    app.pluginManager.addObject(mPersonData);

})(jQuery, window, document);
