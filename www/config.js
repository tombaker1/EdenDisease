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
                backButton: true
            }
        },
        newCase: {
            name: "new-case",
            config: {
                type: "page",
                template: "/disease/new-case.htm",
                backButton: false
            }
        }
    },
    version: "0.2.0"
};