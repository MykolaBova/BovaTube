(function () {
    'use strict';

    angular
        .module('common.services')
        .factory('PlaylistItemsResource', ['$resource', PlaylistItemsResource]);

    function PlaylistItemsResource($resource) {
        var MAX_RESULTS = 50;
        var YOUTUBE_PLAYLIST_ITEMS_REST_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

        return $resource(
            YOUTUBE_PLAYLIST_ITEMS_REST_URL, null, {
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
                        playlistId: '@playlistId',
                        mine: 'true',
                        maxResults: MAX_RESULTS
                    }
                },
                'remove': {
                    method: 'DELETE'
                },
                'delete': {
                    method: 'DELETE'
                }
            }
        );
    }
}());
