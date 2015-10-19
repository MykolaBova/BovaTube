(function () {
    'use strict';

    angular
        .module('common.services')
        .factory('PlaylistResource', ['$resource', PlaylistResource]);

    function PlaylistResource($resource) {
        var MAX_RESULTS = 50;
        var YOUTUBE_PLAYLISTS_REST_URL = 'https://content.googleapis.com/youtube/v3/playlists';

        return $resource(
            YOUTUBE_PLAYLISTS_REST_URL, null, {
                'get': {
                    method: 'GET',
                    params: {
                        id: '@id'
                    }
                },
                'save': {
                    method: 'POST',
                    params: {
                        part: 'snippet'
                    }
                },
                'query': {
                    method: 'GET',
                    params: {
                        part: 'snippet',
                        mine: 'true',
                        maxResults: MAX_RESULTS
                    }
                },
                'remove': {
                    method: 'DELETE'
                },
                'delete': {
                    method: 'DELETE'
                },
                'update': {
                    method: 'PUT',
                    params: {
                        part: 'snippet'
                    }
                }
            }
        );
    }
}());
