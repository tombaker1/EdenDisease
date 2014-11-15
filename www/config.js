var config = {
    developerMode: true,
    debug: true,
    defaults: {
        //url: "http://demo.eden.sahanafoundation.org/eden",
        url: "http://ebola.sahanafoundation.org/eden",
        casePath: "/disease/case/create.s3json?options=true&references=true"
        //formPath: "res/xml/",
        //formList: "formList.xml"
    },
    plugins: {
        settings: {
            name: "settings",
            config: {
                type: "page",
                template: "/settings/settings.htm",
                script: "/settings/settings.js",
                classname: "settingsPage",
                backButton: true
            }
        },
        cases: {
            name: "cases",
            config: {
                type: "page",
                template: "/disease/cases.htm",
                script: "/disease/cases.js",
                classname: "casesPage",
                backButton: true
            }
        },
        newCase: {
            name: "new-case",
            config: {
                type: "page",
                template: "/disease/new-case.htm",
                script: "/disease/newCase.js",
                classname: "newCasePage",
                backButton: false
            }
        }
    },
    version: "0.2.0"
};