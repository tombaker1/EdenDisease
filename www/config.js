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
    pages: {
        settings: {
            name: "settings",
            template: "settings.htm",
            backButton: true
        },
        newCase: {
            name: "new-case",
            template: "new-cast.htm",
            backButton: false
        }
    },
    version: "0.2.0"
};