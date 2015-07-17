'use strict';

MorfifyApp.module('Morfify', function (Morfify, MorfifyApp, Backbone, Marionette, $, _) {
    var controller,
        Router;

    Router = Marionette.AppRouter.extend({
        'appRoutes': {
            '': 'index'
        }
    });

    controller = {
        index: function(){
            console.log('Hello World');
        }
    };

    Morfify.onStart = function(){
        new Router({
            controller: controller
        });
    };
});


