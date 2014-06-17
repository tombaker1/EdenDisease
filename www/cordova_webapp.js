
;(function() {


window.cordova_webapp = function() {
    console.log("cordova_webapp not implemented");
    };
    
navigator.camera = {
        getPicture: function(fnSuccess, fnError, options) {
            fnError("image select not implemented");
        }

};

window.cordova_camera = {
DestinationType: {
    DATA_URL : 0,      // Return image as base64-encoded string
    FILE_URI : 1,      // Return image file URI
    NATIVE_URI : 2     // Return image native URI (e.g. assets-library:// on iOS or content:// on Android)
},
PictureSourceType: {
    PHOTOLIBRARY : 0,
    CAMERA : 1,
    SAVEDPHOTOALBUM : 2
}
};
})();

var Camera = window.cordova_camera;