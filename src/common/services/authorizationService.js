(function () {
    'use strict';
    angular
        .module('common.services')
        .factory('authorizationService', ['$http', 'GAuth', 'GData', authorizationService]);

    function authorizationService($http, GAuth, GData) {
        var CLIENT_ID = '636991133013-seeuepn4bcch5fjugipnka07pie3ncsi.apps.googleusercontent.com';
        var AUTH_SCOPE = 'https://www.googleapis.com/auth/youtube';
        var revokeTokenUrl = 'https://accounts.google.com/o/oauth2/revoke?token={token}';

        GAuth.setClient(CLIENT_ID);
        GAuth.setScope(AUTH_SCOPE);

        function login() {
            return GAuth.login().then(setAuthToken);
        }

        function getUser() {
            return GData.getUser();
        }

        function isLoggedIn() {
            return GData.isLogin();
        }

        function checkAuth() {
            return GAuth.checkAuth();
        }

        function logOut() {
            /* jshint -W106 */
            var token = GAuth.getToken().$$state.value.access_token;
            GData.isLogin(false);

            return $http.jsonp(
                revokeTokenUrl.replace('{token}', token), {
                    headers: {
                        'content-type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
        }

        function setAuthToken() {
            /* jshint -W106 */
            var token = GAuth.getToken().$$state.value.access_token;
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        }

        return {
            login: login,
            getUser: getUser,
            isLoggedIn: isLoggedIn,
            checkAuth: checkAuth,
            logOut: logOut,
            setAuthToken: setAuthToken
        };
    }
}());
