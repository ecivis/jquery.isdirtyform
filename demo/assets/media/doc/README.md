isDirtyForm - A "dirty forms" jQuery Plugin
======
**Version:** 1.0

*isDirtyForm* (```jquery.isDirtyForm.js```) is a "dirty 
form" jQuery Plugin for modern browsers.  It helps prevent users from losing 
unsaved form changes by promoting the user to save/submit.

It's simple to use.  Just add the following line to your page's JavaScript ready 
function:

```JavaScript
$("form").isDirtyForm();
```

There are plenty of "dirty forms" implementations out there. However none of them
can be used with jQuery-UI Tabs. *isDirtyForm* was based off of  [jquery.Are-You-Sure.js](https://github.com/codedance/jquery.AreYouSure)
 with quite a few changes to pass ESLint, JSLint and JSHint validation, addition of jQuery-UI Tab validation, added debugging capabilities and updated to use jQuery v1.11.2 and v2.1.1.

*isDirtyForm* is simple:

 * 100% JS with no external CSS.
 * Uses `onBeforeUnload` to detect all page/browser exit events for non-tab forms.
 * Uses jQuery click event detection for jQuery-UI Tab forms when the *tabs* setting is set to true.
 * Displays console log details for debugging when the *debug* setting is set to true.
 * Works on forms of any size.
 * Correct state management - if a user edits then restores a value, the form 
   is not considered dirty.
 * Graceful degradation on legacy browsers (i.e. if you're running an old 
   browser... remember to save :-)

###Basic Usage

```JavaScript

$(function() {

    // Enable on all forms
    $("form").isDirtyForm();

    // Enable on selected forms
    $("form.dirty-check").isDirtyForm();

    // With a custom message
    $("form").isDirtyForm({"message": "Your changes will be lost without saving. Are you sure you want to leave?"});
	
	// With debugging enabled, using jQuery-UI tabs and a custom message
    $("form").isDirtyForm({
		"debug": true,
		"tabs": true,
		"message": "Your changes will be lost without saving. Are you sure you want to leave?"
	});

}
```
To ignore selected fields from the dirtyness check: 

```html
  <form id="myForm" name="myform" action="/post" method="post">

    Field 1: (checked)  <input type="text" name="field1"> <br />
    Field 2: (ignored): <input type="text" name="field2" data-idf-ignore="true"> <br />
    Field 3: (ignored): <input type="text" name="field3" class="idf-ignore"> <br />

    <input type="submit" value="Submit">

  </form>
```

###Advanced Usage

```JavaScript

$(function() {

    /*
    *  Make isDirtyForm "silent" by disabling the warning message 
    *  (tracking/monitoring only mode). This option is useful when you wish to 
    *  use the dirty/save events and/or use the dirtyness tracking in your own 
    *  beforeunload handler.
    */
    $("form").isDirtyForm( {"silent":true} );
	
    /*
    *  Dirtyness Change Events
    *  isDirtyForm fires off "dirty" and "clean" events when the form's state
    *  changes. You can bind() or on(), these events to implement your own form
    *  state logic.  A good example is enabling/disabling a Save button.
    *
    *  "this" refers to the form that fired the event.
    */
    $("form").on("dirty.isDirtyForm", function() {
      // Enable save button only as the form is dirty.
      $(this).find("input[type='submit']").removeAttr("disabled");
    });
    $("form").on("clean.isDirtyForm", function() {
      // Form is clean so nothing to save - disable the save button.
      $(this).find("input[type='submit']").attr("disabled", "disabled");
    });

    /*
    *  It's easy to test if a form is dirty in your own code - just check
    *  to see if it has a "dirty" CSS class.
    */
    if ($("#my-form").hasClass("dirty")) {
        // Do something
    }

    /*
    *  If you're dynamically adding new fields/inputs, and would like to track 
    *  their state, trigger isDirtyForm to rescan the form like this:
    */
    $("#my-form").trigger("rescan.isDirtyForm");

    /*
    *  If you'd like to reset/reinitialize the form's state as clean and 
    *  start tracking again from this new point onwards, trigger the
    *  reinitialize as follows. This is handy if say you've managing your
    *  own form save/submit via AJAX.
    */
    $("#my-form").trigger("reinitialize.isDirtyForm");

    /*
    *  In some situations it may be desirable to look for other form
    *  changes such as adding/removing fields. This is useful for forms that
    *  can change their field count, such as address/phone contact forms.
    *  Form example, you might remove a phone number from a contact form
    *  but update nothing else. This should mark the form as dirty.
    */
    $("form").isDirtyForm( {"addRemoveFieldsMarksDirty":true} );
    
    /*
    *  Sometimes you may have advanced forms that change their state via
    *  custom JavaScript or 3rd-party component JavaScript. isDirtyForm may 
    *  not automatically detect these state changes. Examples include:
    *     - Updating a hidden input field via background JS.
    *     - Using a rich WYSIWYG edit control.
    *  One solution is to manually trigger a form check as follows:
    */
    $("#my-form").trigger("checkForm.isDirtyForm");
	
    /*
    *  As an alternative to using events, you can pass in a custom change 
    *  function.
    */
    $("#my-adv-form").isDirtyForm({
        change: function() {
              // Enable save button only if the form is dirty. i.e. something to save.
              if ($(this).hasClass("dirty")) {
                $(this).find("input[type='submit']").removeAttr("disabled");
              } else {
                $(this).find("input[type='submit']").attr("disabled", "disabled");
              }
            }
    });

    /*
    *  Mixing in your own logic into the warning.
    */
    $("#my-form").isDirtyForm( {"silent":true} );
    $(window).on("beforeunload", function() {
        isSunday = (0 == (new Date()).getDay());
        if ($("#my-form").hasClass("dirty") && isSunday) {
            return "Because it's Sunday, I'll be nice and let you know you forgot to save!";
        }
    }
    
}
```
The [demo page](http://127.0.0.1:8500/jquery-isDirtyForm/demo/)
shows the advanced usage options in more detail.


###Install
isDirtyForm is a light-weight jQuery plugin - it's a single standalone 
JavaScript file. You can download the 
[jquery.isDirtyForm.js](http://127.0.0.1:8500/jquery-isDirtyForm/demo/assets/scripts/jquery.isDirtyForm.js)
file and include it in your page. Because it's so simple it seems a shame 
to add an extra browser round trip. It's recommended that you consider
concatenating it with other common JS lib files, and/or even cut-n-pasting 
the code (and license header) into one of your existing JS files.


###Demo
This [demo page](http://127.0.0.1:8500/jquery-isDirtyForm/demo/)
hosts a number of example forms including a jQuery-UI tab example.

###Supported Browsers
*isDirtyForm* has been tested on and fully supports the following browsers:

* IE 9 through 11
* Google Chrome (versions since 2012)
* Firefox (versions since 2012)
* Safari (versions since 2012)


###Known Issues & Limitations

####Mobile Safari and Opera
The ```windows.beforeunload``` event is not supported on iOS (iPhone, iPad, and iPod).

####Firefox
The custom message option may not work on Firefox ([Firefox bug 588292](https://bugzilla.mozilla.org/show_bug.cgi?id=588292)).

###Development
The aim is to keep *isDirtyForm* simple and light. If you think you have 
a good idea which is aligned with this objective, please voice your thoughts 
in the issues list.


###Release History

**2014-09-01** - Initial public release.


###Prerequisites
jQuery version 1.4.2 or higher. 1.10+ or 2.0+ recommended.


###License
The same as JQuery.
