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
            config:"config.js"
        },
        disease: {
            name:"disease",
            config:"config.js"
        }
    },
    version: "0.2.6"
};