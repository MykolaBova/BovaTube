(function () {
    'use strict';

    angular
        .module('ytApp')
        .factory('pubSub', ['$rootScope', pubSub]);

    function pubSub($rootScope) {
        function subscribe(topic, func) {
            var cleanUpFunc = $rootScope.$on(topic, function (e, args) {
                func(args);
            });

            return cleanUpFunc;
        }

        function publish(topic, args) {
            $rootScope.$emit(topic, args);
        }

        return {
            subscribe: subscribe,
            publish: publish
        };
    }
}());
