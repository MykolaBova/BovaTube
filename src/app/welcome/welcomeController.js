(function () {
    'use strict';

    angular
        .module('ytApp')
        .controller('WelcomeController', ['authorizationService', WelcomeController]);

    function WelcomeController(authorizationService) {
        var vm = this;
        vm.isLoggedIn = authorizationService.isLoggedIn();
    }
}());
