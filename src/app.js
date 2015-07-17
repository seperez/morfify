'use strict'

;(function (win) {

    // Check if app its launched
    if (win.MorfifyApp) { return; }

    // Create app
    var MorfifyApp = new Backbone.Marionette.Application();

    MorfifyApp.addRegions({
        'mainRegion': '#app-container'
    });

    // Subscribe to "start" application event
    MorfifyApp.on('start', function() {
        Backbone.history.start();
    });

    // Export Application
    win.MorfifyApp = MorfifyApp;

    // Start the MorfifyApp app
    $(function() {
        // This fire "start" application event
        MorfifyApp.start();
    });
}(window));