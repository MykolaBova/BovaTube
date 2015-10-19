(function () {
    'use strict';

    angular
        .module('common.services')
        .factory('SearchResource', ['$resource', SearchResource]);

    function SearchResource($resource) {
        var MAX_RESULTS = 50;
        var YOUTUBE_SEARCH_REST_URL = 'https://www.googleapis.com/youtube/v3/search';

        return $resource(
            YOUTUBE_SEARCH_REST_URL, null, {
                'query': {
                    method: 'GET',
                    params: {
                        part: 'snippet',
                        maxResults: MAX_RESULTS,
                        q: '@q'
                    }
                }
            }
        );
    }
}());
