**EdenDisease**
===========

Application prototype for Sahana Eden Disease template

The following instructions describe how to install the application for evaluation.  
There are two options for running.  It can be run completely in the browser, or an app can be built.  

**Running in the browser**
======================
There is a restriction for browsers that the application must be run from the same server as 
Eden is running in.  The application should be in the Eden source tree.

1. Go to the 'static' subdirectory of the Eden source.

```cd path-to-server-source/web2py/applications/eden/static```

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