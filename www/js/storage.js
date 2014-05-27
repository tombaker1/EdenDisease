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

    function storage(  ) {
    };

    storage.prototype.init = function ( options ) {
    };
    
    storage.prototype.write = function ( path, value ) {
        localStorage.setItem(path,value);
    };
    
    storage.prototype.read = function ( path ) {
        return localStorage.getItem(path);
    };
    
    storage.prototype.list = function (  ) {
        var keys = Object.keys(localStorage); //[];
        return keys;
    };
    
    storage.prototype.delete = function ( path ) {
        if (localStorage.getItem(path)) {
            localStorage.removeItem(path);
        }
    };
    
    // Warning: don't call this 'localStorage' or you will
    // override the W3C feature 'localStorage'
    var localStore = new storage();

    // bind the plugin to jQuery     
    app.storage = localStore; 
})( jQuery, window, document );
