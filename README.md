# README #

This README is for testers to set up the un-packaged chrome extension.

### Reflex Chrome Extension ###

* Quick summary: this extension is to allow users to identify/pinpoint dom elements to aid in QA automation
* Version: 1

### Set Up ###

1. Check out the latest code from the bitbucket repo into a location of your choice.
2. Open Google Chrome web browser
3. Visit *chrome://extensions* in your browser
4. Ensure that the *Developer mode* checkbox in the top right-hand corner is checked.
5. Click *Load unpacked extension…* to pop up a file-selection dialog.
6. Navigate to the directory in which your extension files live, and select it.

### Testing ###

1. Now that you have installed the Reflex Chrome Extension (steps above), you will see the Reflex symbol (blue X) on the top right on the browser, next to your other extensions.
2. If you just installed the extension, you will need to refresh the page you wish to test on.
3. When ready to test, click the extension to activate reflex.  You will see a tooltip indicating the type of dom element you're hovering over.
4. Click the element you wish to inspect.  An overlay will appear, presenting information on the element you have selected.

### Dependencies ###
*as of now, the tool operates independently.  Soon we will add the Reflex rest endpoints to talk to Reflex.

* Database configuration - tba
* Deployment instructions - tba

### Known Issues ###
1. Reflex overlay will inherit certain css attributes from the current tab - throwing a few styles/positioning out of wack.  I am working on fixing this, but if anyone has any ideas, feel free to tinker or send me an email.

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Joshua Biggs
