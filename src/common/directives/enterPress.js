(function () {
    'use strict';
    angular.module('directives').directive('enterPress', enterPressDirective);

    function enterPressDirective() {
        var ENTER_KEY_CODE = 13;

        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                elm.bind('keydown', function (event) {
                    /* jshint -W117 */
                    /* KeyboardEvent is system event type */
                    if (event instanceof KeyboardEvent && event.keyCode === ENTER_KEY_CODE) {
                        scope.$apply(attrs.enterPress);
                    }
                });
            }
        };
    }
}());
