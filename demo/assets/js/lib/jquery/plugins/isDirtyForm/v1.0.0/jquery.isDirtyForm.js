/*!
 * jQuery Plugin: isDirtyForm (Dirty Form Detection)
 * https://github.com/sbeauvais/jquery.isDirtyForm/
 *
 * Copyright (c) 2014
 * Created: September 1, 2014
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Author:  Steve Beauvais
 * Version: 1.0.0
 * Date:    October 24, 2014
 */

/*eslint no-alert:0, no-console:0*/
/*global jQuery, CKEDITOR, console, window*/

/**
 * Document Ready
 * @param  {String} $ jQuery object
 * @return {Boolean}   isDirty
 */
(function ($) {
    "use strict";
    $.fn.isDirtyForm = function (options) {
        var $dirtyFormField,
            $fields,
            $form,
            origCount,
            getName,
            getDefaultValue,
            getNewValue,
            storeOrigValue,
            setDirtyStatus,
            checkForm,
            initForm,
            rescan,
            reset,
            reinitialize,
            settings = $.extend({
                "message": "You have unsaved changes!",
                "dirtyClass": "dirty",
                "change": null,
                "silent": false,
                "addRemoveFieldsMarksDirty": false,
                "fieldEvents": "change keyup propertychange input",
                "fieldSelector": ":input:not(input[type=submit]):not(input[type=button])",
                "debug": false,
                "tabs": false
            }, options);

        /**
         * Get the field ID and name for debugging purposes
         * @param  {String} $field Field
         * @return {String}        Field ID and name
         */
        getName = function ($field) {
            var fieldName = $field.attr("name"),
                fieldID = $field.attr("id"),
                fieldClass =  $field.attr("class"),
                fieldType,
                val;
            if ($field.hasClass("idf-ignore") || $field.hasClass("idfIgnore") || $field.attr("data-idf-ignore") || $field.attr("name") === undefined) {
                return null;
            }
            if ($field.is(":disabled")) {
                return "idf-disabled";
            }
            fieldType = $field.attr("type");
            if ($field.is("select")) {
                fieldType = "select";
            }
            if ($field.hasClass("textarea-wysiwyg") || $field.hasClass("text-area")) {
                fieldType = "textarea";
            }
            val = "ID = " + fieldID + " - Class = " + fieldClass + " - Name = " + fieldName + " - Type = " + fieldType;
            return val;
        };

        /**
         * getDefaultValue - Get the intiial (default) values of each field in the form
         * @param  {String} $field Field
         * @return {Number}        Field value
         */
        getDefaultValue = function ($field) {
            if ($field.hasClass("idf-ignore") || $field.hasClass("idfIgnore") || $field.attr("data-idf-ignore") || $field.attr("name") === undefined) {
                return null;
            }
            if ($field.is(":disabled")) {
                return "idf-disabled";
            }
            var val,
                type = $field.attr("type");
            if ($field.is("select")) {
                type = "select";
            }
            if ($field.hasClass("textarea-wysiwyg") || $field.hasClass("text-area")) {
                type = "textarea";
            }
            switch (type) {
            case "checkbox":
            case "radio":
                val = $field.is(":checked");
                break;
            case "select":
                val = "";
                $field.find("option").each(function (o) {
                    var $option = $(this);
                    if (o !== undefined) {
                        if ($option.is(":selected")) {
                            val += $option.val();
                        }
                    }
                });
                break;
            default:
                val = $field.prop("defaultValue");
            }
            return val;
        };

        /**
         * getNewValue - Get the new values of each field in the form
         * @param  {String} $field Field
         * @return {Number}        Field value
         */
        getNewValue = function ($field) {
            if ($field.hasClass("idf-ignore") || $field.hasClass("idfIgnore") || $field.attr("data-idf-ignore") || $field.attr("name") === undefined) {
                return null;
            }
            if ($field.is(":disabled")) {
                return "idf-disabled";
            }
            var val,
                type = $field.attr("type");
            if ($field.is("select")) {
                type = "select";
            }
            if ($field.hasClass("textarea-wysiwyg") || $field.hasClass("text-area")) {
                type = "textarea";
            }
            switch (type) {
            case "checkbox":
            case "radio":
                val = $field.is(":checked");
                break;
            case "select":
                val = "";
                $field.find("option").each(function (o) {
                    var $option = $(this);
                    if (o !== undefined) {
                        if ($option.is(":selected")) {
                            val += $option.val();
                        }
                    }
                });
                break;
            default:
                val = $field.val();
            }
            return val;
        };

        /**
         * storeOrigValue - Store the initial (default) fields and values
         * @param  {String} $field Field
         * @return {String}        isDirty
         */
        storeOrigValue = function ($field) {
            $field.data("idf-orig", getDefaultValue($field));
            if (settings.debug) {
                console.log("storeOrigValue: \n" + getName($field) + ":\nOld value = " + getDefaultValue($field) + "\nNew value = " + getNewValue($field));
            }
        };

        /**
         * setDirtyStatus - Set the dirty form status
         * @param {String}  $form   Form
         * @param {Boolean} isDirty Dirty Form status
         * @return {String} Set the form as Dirty or Clean
         */
        setDirtyStatus = function ($form, isDirty) {
            var changed = false;
            if (isDirty !== $form.hasClass(settings.dirtyClass)) {
                changed = true;
            }
            if (settings.debug) {
                console.log("Start SetDirtyStatus: " + $form.attr("id"));
                console.log("setDirtyStatus:\nisDirty = " + isDirty + "\nChanged = " + changed);
            }
            // Fire change event if required
            if (changed) {
                if (settings.change) {
                    settings.change.call($form, $form);
                }
                if (isDirty) {
                    $form.addClass(settings.dirtyClass);
                    $form.trigger("dirty.isDirtyForm", [$form]);
                }
                if (!isDirty) {
                    $form.removeClass(settings.dirtyClass);
                    $form.trigger("clean.isDirtyForm", [$form]);
                }
                $form.trigger("change.isDirtyForm", [$form]);
            }
            if (settings.debug) {
                console.log("End SetDirtyStatus: " + $form.attr("id"));
            }
        };

        /**
         * checkForm on initialization, change, rescan and return
         * @param  {String} event Event
         * @return {String}       setDirtyStatus
         */
        checkForm = function (event) {
            if (settings.debug) {
                console.log("Start CheckForm: " + $(this).attr("id"));
            }
            var isDirty = false,
                isFieldDirty = function ($field) {
                    var origValue = $field.data("idf-orig");
                    if (origValue === undefined) {
                        return false;
                    }
                    if (settings.debug) {
                        console.log("CheckForm: \n" + getName($field) + "\noldValue = " + origValue + "\nnewValue = " + getNewValue($field));
                    }
                    return getNewValue($field) !== origValue;
                };
            $form = $(this).is("form") ? $(this) : $(this).parents("form");
            // Test on the target first as it's the most likely to be dirty
            if (isFieldDirty($(event.target))) {
                setDirtyStatus($form, true);
                if (settings.debug) {
                    console.log("End isFieldDirty: " + $(this).attr("id"));
                }
                return;
            }
            $fields = $form.find(settings.fieldSelector);
            if (settings.addRemoveFieldsMarksDirty) {
                // Check if field count has changed
                origCount = $form.data("idf-orig-field-count");
                if (origCount !== $fields.length) {
                    setDirtyStatus($form, true);
                    if (settings.debug) {
                        console.log("End addRemoveFieldsMarksDirty: " + $(this).attr("id"));
                    }
                    return;
                }
            }
            setDirtyStatus($form, isDirty);
            if (settings.debug) {
                console.log("End CheckForm: " + $(this).attr("id"));
            }
        };

        /**
         * Initialize the Dirty Form status
         * @param  {String} $form Form
         * @return {String}       Dirty Form status
         */
        initForm = function ($form) {
            var fields = $form.find(settings.fieldSelector);
            if (settings.debug) {
                console.log("Start InitForm: " + $form.attr("id"));
            }
            $(fields).each(function () {
                storeOrigValue($(this));
            });
            $(fields).off(settings.fieldEvents, checkForm);
            $(fields).on(settings.fieldEvents, checkForm);
            $form.data("idf-orig-field-count", $(fields).length);
            setDirtyStatus($form, false);
            if (settings.debug) {
                console.log("End InitForm: " + $form.attr("id"));
            }
        };

        /**
         * If you're dynamically adding new fields/inputs, and would like to track
         * their state, trigger isDirtForm to rescan the form like this:
         * $("#my-form").trigger("rescan.isDirtyForm");
         * @return {String} Check the form
         */
        rescan = function () {
            var fields = $form.find(settings.fieldSelector);
            if (settings.debug) {
                console.log("Start Rescan: " + $(this).attr("id"));
            }
            $(fields).each(function () {
                var $field = $(this);
                if (!$field.data("idf-orig")) {
                    storeOrigValue($field);
                    $field.on(settings.fieldEvents, checkForm);
                }
                if (settings.debug) {
                    console.log("Rescan: \n" + getName($field) + "\nValue = " + getNewValue($field));
                }
            });
            // Check for changes while we're here
            $form.trigger("checkForm.isDirtyForm");
            if (settings.debug) {
                console.log("End Rescan: " + $(this).attr("id"));
            }
        };

        /**
         * Reset the current form
         * @return {String} Reset the original text area value
         */
        reset = function () {
            if (settings.debug) {
                console.log("Start Reset: " + $(this).attr("id"));
            }
            if (settings.tabs) {
                var editor,
                    formID = $form.attr("id"),
                    origValue;
                $("#" + formID + " textarea").each(function () {
                    var $field = $(this);
                    editor = $(this).attr("id");
                    origValue = $field.data("idf-orig");
                    if (CKEDITOR.instances[editor]) {
                        CKEDITOR.instances[editor].setData(origValue);
                    }
                });
            }
            setDirtyStatus($form, false);
            if (settings.debug) {
                console.log("End Reset: " + $(this).attr("id"));
            }
        };

        /**
         * If you'd like to reset/reinitialize the form's state as clean and
         * start tracking again from this new point onwards, trigger the
         * reinitalize as follows. This is handy if say you've managing your
         * own form save/submit via asyc AJAX.
         * $("#my-form").trigger("reinitialize.isDirtyForm");
         * @return {String} initForm()
         */
        reinitialize = function () {
            if (settings.debug) {
                console.log("Start Reinitialize: " + $(this).attr("id"));
            }
            initForm($(this));
            if (settings.debug) {
                console.log("End Reinitialize: " + $(this).attr("id"));
            }
        };

        /**
         * If the silent setting is off then set the dirty form class
         * If form is dirty, then ask for confirmation to change navigation
         */
        if (!settings.silent && !window.idfUnloadSet) {
            if (settings.tabs) {
                // $(".tab-links span span, a").on("click", function (event) {
                $(".tab-links span span").on("click", function (event) {
                    var message, leave;
                    event.preventDefault();
                    if ($(this).hasClass("idf-ignore") || $(this).hasClass("idfIgnore") || $(this).attr("data-idf-ignore")) {
                        return null;
                    }
                    if (settings.debug) {
                        console.log("Tab or Anchor Link Clicked");
                    }
                    $dirtyFormField = $("form").filter("." + settings.dirtyClass);
                    if ($dirtyFormField === undefined || $dirtyFormField.length === 0) {
                        return null;
                    }
                    if ($form.attr("data-title")) {
                        message = settings.message + " the " + $form.data("title") + " Section?";
                    } else {
                        message = settings.message + "?";
                    }
                    leave =  window.confirm(message);
                    if (leave) {
                        $form.trigger("reset.isDirtyForm");
                        return true;
                    }
                    if ($form.hasClass("dirty")) {
                        setDirtyStatus($form, "true");
                    }
                    return false;
                });
            } else {
                window.idfUnloadSet = true;
                $(window).on("beforeunload", function () {
                    var $dirtyForms = $("form").filter("." + settings.dirtyClass);
                    if ($dirtyForms.length > 0) {
                        return settings.message;
                    }
                });
            }
        }

        /**
         * Return the check for dirty form
         * @param  {String} elem Element to check
         * @return {String}      Initialize the dirty form
         */
        return this.each(function (elem) {
            if (!$(this).is("form") && elem === undefined) {
                return;
            }
            $form = $(this);
            $form.submit(function () {
                $form.removeClass(settings.dirtyClass);
            });
            $(".btnSubmit").on("click", function () {
                $form.removeClass(settings.dirtyClass);
            });
            $(".btnReset").on("click", function () {
                $form.removeClass(settings.dirtyClass);
            });
            // Add custom events
            $form.on("rescan.isDirtyForm", rescan);
            $form.on("reset.isDirtyForm", reset);
            $form.on("reinitialize.isDirtyForm", reinitialize);
            $form.on("checkForm.isDirtyForm", checkForm);
            initForm($form);
        });
    };
}(jQuery));
