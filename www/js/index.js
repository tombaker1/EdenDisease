var app = {
    xformHandler: null,
    uiController: null,
    state: {
        settings: {
                source: 1
            }  
    },
    
    initialize: function() {
        if (window.cordova === undefined) {
            console.log("running in browser");
            $("#content-messages").html("browser<br>");
            window.cordova = window.cordova_webapp;
        }
        else {
            console.log("running mobile");
            $("#content-messages").html("mobile<br>")
        }
        this.bind();
        //$(".page").each(function(){$(this).pageControl();});
        this.getState();
        this.xformHandler = $.xformer();
        this.uiController = $.jqmController({state: this.state, xform:this.xformHandler});
    },
    
    getState: function() {
        // ToDo - read from local storage
    },
    
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    
    deviceready: function() {
        // note that this is an event handler so the scope is that of the event
        // so we need to call app.report(), and not this.report()
        //app.report('deviceready');
        console.log("deviceready");
    }/*,
    
    report: function(id) { 
        console.log("report:" + id);
        // hide the .pending <p> and show the .complete <p>
        document.querySelector('#' + id + ' .pending').className += ' hide';
        var completeElem = document.querySelector('#' + id + ' .complete');
        completeElem.className = completeElem.className.split('hide').join('');
    }*/
};
