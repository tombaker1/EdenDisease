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
    var plugin = [
        {
            type: "page",
            name: "cases",
            template: "cases.htm",
            script: "cases.js",
            style: "cases.css",
            classname: "casesPage",
            backButton: true
        },

        {
            type: "page",
            name: "new-case",
            template: "new-case.htm",
            script: "newCase.js",
            classname: "newCasePage",
            backButton: false
        },

        {
            type: "page",
            name: "monitoring",
            template: "monitoring.htm",
            script: "monitoring.js",
            //style: "cases.css",
            classname: "monitoringPage",
            backButton: true
        },
        {
            type: "model",
            name: "mCaseData",
            script: "mCaseData.js",
            classname: "mCaseData"
        },
        {
            type: "model",
            name: "mPersonData",
            script: "mPersonData.js",
            classname: "mPersonData"
        },
        {
            type: "model",
            name: "mMonitoringData",
            script: "mMonitoringData.js",
            classname: "mMonitoringData"
        },
        {
            type: "controller",
            name: "diseaseController",
            script: "diseaseController.js",
            classname: "diseaseController"
        }
    ];
    app.pluginManager.addPlugin(plugin);
})(jQuery, window, document);