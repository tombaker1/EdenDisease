var config = {
    developerMode: true,
    debug: true,
    debugNoCommTimeout: false,
    defaults: {
        //url: "http://demo.eden.sahanafoundation.org/eden",
        url: "http://ebola.sahanafoundation.org/eden",
        caseFormPath: "/disease/case/create.s3json?options=true&references=true",
        personFormPath: "/pr/person/create.s3json?options=true",
        caseListPath: "/disease/case.s3json?show_ids=true",
        personListPath: "/pr/person.s3json",
        caseSubmitPath: "/disease/case.s3json",
        personSubmitPath: "/pr/person.s3json",
        monitoringPath: "/disease/case/case_monitoring.s3json",
        newMontitoringPath: "/disease/case/case_monitoring/create.s3json",
        loginPath: "/default/user/login"
    },
    mainMenu: [
        {
            name:"Cases",
            page:"page-cases",
            plugin:"disease"
        },
        {
            name:"Settings",
            page:"page-settings",
            plugin:"settings"
        }
    ],
    plugins: {
        settings: {
            name:"settings",
            //path:"settings",
            config:"config.js"
        }/*,
        disease: {
            name:"disease",
            config:"config.js"
        }*/
        /*
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
                style: "/disease/cases.css",
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
        },
        monitoring: {
            name: "monitoring",
            config: {
                type: "page",
                template: "/disease/monitoring.htm",
                script: "/disease/monitoring.js",
                //style: "/disease/cases.css",
                classname: "monitoringPage",
                backButton: true
            }
        },        newUpdate: {
            name: "new-update",
            config: {
                type: "page",
                template: "/disease/new-update.htm",
                script: "/disease/newUpdate.js",
                classname: "newUpdatePage",
                backButton: false
            }
        }
        */
    },
    version: "0.2.3"
};