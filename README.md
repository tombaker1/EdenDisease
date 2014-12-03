**EdenDisease**
===========

Application prototype for Sahana Eden Disease template

The following instructions describe how to install the application for evaluation.  
There are two options for running.  It can be run completely in the browser, or an app can be built.  

**Running in the browser**
======================
There is a restriction for browsers that the application must be run from the same server as 
Eden is running in.  It is easiest to run the application within the Eden source tree.

1. Go to the 'static' subdirectory of the Eden source.
```
cd path-to-server-source/web2py/applications/eden/static
```

2. Check out the application source code.
```git clone https://github.com/tombaker1/EdenDisease.git```
If you are planning to also build the cordova app then you may want to put it 
under another directory name such as:
```git clone https://github.com/tombaker1/EdenDisease.git EdenDisease-source```

3. From your browser bring up the main page 
http://*web2py-server-path*/eden/static/EdenDisease/www/index.html.
If you changed the directory name from the default then replace EdenDisease with the name that you used.

4.  You will probably get an error message from the server because the application 
is trying to access a different server.  To fix this set the server name in the application.
Select the 'Settings' page, and enter the server path in the URL field.  Now click the 'Load' button.
While you are there enter your user name, and password. That isn't required for viewing entries, but you need to use the user name and password that you have
for the server to modify any entries.  

5. That is it.  Go back to the main page and view other content 
such as 'Cases'.

**Creating the application**
======================
The app is built using the Cordova/Phonegap web runtime.  Phonegap is a distribution 
of Cordova.  Either one should work.  I use Cordova 
CLI (Command Line Interface) on a Linux Mint system so it has not been tested with Phonegap.

1. First you need to install Cordova, and all of its dependencies including Node.js.  The 
instructions are 
here: http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface.  It 
is best if you read that whole page to become familiar with Cordova.  You only need to do  the 
section **Installing the Cordova CLI**.  I will give instructions for the rest.

2. You must have downloaded the EdenDisease source code.  If you have not 
done so already do steps 1 and 2 in the previous section. Do the second option 
of cloning it to a different directory name.  If you already downloaded the source 
code to the default directory name then rename it.

3.  Create the Cordova application.  
The trick here is to use the --copy-from option to load the source from the alternate directory.  The 
directory that you are creating cannot exist before you run the create command.  Run the 
following command from the .../eden/static directory.  
```cordova create EdenDisease "org.sahanafoundation.EdenDisease" "EdenDisease" --copy-from ./EdenDisease-source```

4.  The cordova command copies everything except the .git folder.  You need this.  Copy it now.
``` cp -r EdenDisease-source/.git EdenDisease ```

5.  Create the platforms that you want to build.  I test on Android.
``` cd EdenDisease
cordova platform add android ```

6.  Build the application. 
``` cordova build android ```

7. To run the application on an Android device you need to install the Android SDK.  Make 
sure that the tools are in the PATH environment variable.
http://developer.android.com/sdk/installing/index.html?pkg=adt

8.  Connect a device and make sure that it recognized as an android test device.
``` adb devices```

9.  Install and run the devices.  Cordova will rebuild the package by default.
``` cordova run android```

10.  The default server is ebola.sahanafoundation.org.  It should download the data from 
there.  Use step 3 in the previous
section to change to a different server.
