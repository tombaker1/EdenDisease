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

;(function ( $, window, document, undefined ) {
    

Backbone.sync = function(method, model, options) {
  options || (options = {});

  switch (method) {
    case 'create':
        console.log("create");
        var path = "data-" + model.getKey();
        if (app.uiController.state.offline || options["local"]) {
            //var vv = JSON.stringify(model);
            localStorage.setItem(path,JSON.stringify(model));
            app.uiController.cbFormSendComplete(false,model);
        }
        else {
            var controller = app.uiController;
            app.xformHandler.sendModel(model,controller.cbFormSendComplete.bind(controller), options);
        }
        //localStorage.setItem(path,JSON.stringify(model));
    break;

    case 'update':
        console.log('update');
        var path = "data-" + model.getKey();
        localStorage.setItem(path,JSON.stringify(model));
    break;

    case 'delete':
        console.log('delete');
        if (options["local"]) {
            var path = "data-" + model.getKey();
            localStorage.removeItem(path);
        }
    break;

    case 'read':
        console.log('read');
        var path = "data-" + model.getKey();
        var data = localStorage.getItem(path);
        if (data) {
            model = JSON.parse(localStorage.getItem(data));
        }
        
    break;
  }
};

    function storage(  ) {
    };



app.localSync = function(method, model, options) {
    options || (options = {});
    var path = model.getKey();
    
    // use app.storage 
    switch (method) {
    case 'create':
        app.storage.write(path,JSON.stringify(model));
    break;

    case 'update':
        console.log('update');
        app.storage.write(path,JSON.stringify(model));
    break;

    case 'delete':
        console.log('delete');
        if (options["local"]) {
            app.storage.delete(path);
        }
    break;

    case 'read':
        console.log('read');
        var data = app.storage.read(path); 
        if (data) {
            model.set(JSON.parse(data));
        }
        
    break;
  }
};

})( jQuery, window, document );

