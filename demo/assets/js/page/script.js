/********************************************************************************
 * File Name:   script
 * Description: Scripts for isDirtyForm
 * Notes:       2014-09-01: Created by SB
 *******************************************************************************/

/*global $, Date, document*/

$(function () {
    "use strict";

    // Example 1 - ... in one line of code
    // $("#example-1-form").isDirtyForm();
    $("#example-1-form").isDirtyForm({
        // debug: true
    });

    // if ($("#example-1-form").hasClass("dirty")) {
    //     alert("Dirty exists!");
    // } else {
    //     alert("Dirty does not exist!");
    // }

    // $("#example-1-form").find("input[type='submit']").attr("disabled", "disabled");

    // $("#example-1-form").on("dirty", function() {
    //     $(this).find("input[type='submit']").removeAttr("disabled");
    //     // alert("Form is dirty!");
    // });
    // $("#example-1-form").on("clean", function() {
    //     $(this).find("input[type='submit']").attr("disabled", "disabled");
    //     // alert("Form is clean!");
    // });
    // $("#example-1-form").on("change", function() {
    //     alert("Form has changed!");
    // });

    // Example 2 - ignore a dynamic field
    $("#example-2-form").isDirtyForm({
        // debug: true
    });

    var defaultPickup15min = new Date((new Date()).getTime() + 15 * 60000),
        hours = defaultPickup15min.getHours(),
        mins = defaultPickup15min.getMinutes(),
        mid = "am";

    if (hours === 0) {
        hours = 12;
    }
    if (hours > 12) {
        hours = hours % 12;
        mid = "pm";
    }
    if (mins < 10) {
        mins = "0" + mins;
    }
    $("#pickup").val(hours + ":" + mins + " " + mid);


    // Example 3 - custom message and hooking the dirty change events
    $("#example-3-form").isDirtyForm({
        // debug: true,
        message: "Did you forget to save your standard coffee order?"
    });
    // Enable save button only if the form is dirty - using events.
    $("#example-3-form").on("dirty.isDirtyFor", function () {
        $(this).find("input[type='submit']").removeAttr("disabled");
    });
    $("#example-3-form").on("clean.isDirtyFor", function () {
        $(this).find("input[type='submit']").attr("disabled", "disabled");
    });


    // Example 4 - dynamically change and add form fields.
    $("#example-4-form").isDirtyForm({
        // debug: true,
        message: "Did you forget to submit your coffee order?"
    });

    $("#example-4-lastorder").click(function () {
        // ... set our saved coffee type.
        $("#example-4-coffee").val("espresso");
        // Because we've made a change from our own JavaScript, we need to fire
        // off manual 'form check'.
        $("#example-4-form").trigger("checkForm");
    });

    // If it's warm enough, offer an iced coffee special.
    $.getJSON("http://api.openweathermap.org/data/2.5/weather?q=Los Angeles,US&mode=json&units=imperial&callback=?", function (data) {
        var temp = data.main.temp;
        if (temp > 80) {
            $("#example-4-special").append("<p>It\'s currently " + temp + "F in Los Angeles. Ice it up!</p>");
            $("#example-4-special").append("<input type='checkbox' name='make-it-iced' id='make-it-iced' class='make-it-iced' value='true' />" + " Make it an iced coffee<br />");

            // Trigger rescan event on the form so we start tracking the new field.
            $("#example-4-form").trigger("rescan.isDirtyFor");
        }
    });

    // Example 5
    // - extra shots button to enable/disable shots options
    // - like/unlike button (changing hidden form field value)
    // - hook dirty change event to enable/disable submit (using method),
    //   to more easily demonstrate when the form is dirty
    $("#example-5-form").find("input[type='submit']").attr("disabled", "disabled");
    $("#example-5-extra-shots").click(function () {
        // we trigger a change event on the fields so that the isDirtyForm event handler is called
        $("#example-5-form input[name=shots]").removeAttr("disabled").change();
        $("#example-5-extra-shots").hide();
        $("#example-5-shots-options").show();
        return false;
    });
    $("#example-5-like-button").click(function () {
        var currentLike = $("#example-5-like").val() === "true",
            newLike = !currentLike;
        // we trigger a change event on the fields so that the isDirtyForm event handler is called
        $("#example-5-like").val(newLike).change();
        $("#example-5-like-button").text(newLike ? "Unlike" : "Like");
        return false;
    });

    $("#example-5-form").isDirtyForm({
        // debug: true,
        change: function () {
            // Enable save button only if the form is dirty.
            if ($(this).hasClass("dirty")) {
                $(this).find("input[type='submit']").removeAttr("disabled");
            } else {
                $(this).find("input[type='submit']").attr("disabled", "disabled");
            }
        }
    });

    // Example 6 - HTML5 input types
    $("#example-6-form").isDirtyForm({
        // debug: true
    });

    // Example 7 - ... in one line of code for the form and some more optional to toggle disabled state of the save button
    $("#example-7-form").isDirtyForm({
        // debug: true
    });
    $("#example-7-save-button").on("click", function () {
        $("#example-7-form").trigger("reinitialize.isDirtyFor");
    });
    // code below is optional to handle disabled state of the save button
    $("#example-7-form").on("dirty.isDirtyFor", function () {
        // Enable save button only as the form is dirty.
        $("#example-7-save-button").attr({"disabled": false});
    });
    $("#example-7-form").on("clean.isDirtyFor", function () {
        // Form is clean so nothing to save - disable the save button.
        $("#example-7-save-button").attr({"disabled": true});
    });

    // Example 8 - Tabs
    $("#tabs").tabs();

    if ($(".tab-set") && document.location.hash) {
        $.scrollTo(".tab-set");
    }

    $(".tab-set ul").localScroll({
        target: ".tab-set",
        duration: 0,
        hash: true
    });

    $("#example-8a-form, #example-8b-form, #example-8c-form").isDirtyForm({
        "message": "Your changes will be lost without saving. Are you sure you want to leave",
        // "debug": true,
        "tabs": true
    });
});
