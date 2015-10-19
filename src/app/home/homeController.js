(function () {
    'use strict';

    angular
        .module('ytApp')
        .controller('HomeController', ['$window', '$state',
                                       'playlistService', HomeController]);

    function HomeController($window, $state, playlistService) {
        var vm = this;
        vm.searchText = '';

        vm.playlistService = playlistService;
        vm.getSearchResult = getSearchResult;
        vm.removeFromPlaylist = removeFromPlaylist;
        vm.setCurrentPlaylist = setCurrentPlaylist;
        vm.setCurrentPlaylistItem = setCurrentPlaylistItem;
        vm.currentView = currentView;
        vm.toggleEdit = toggleEdit;
        vm.isEditMode = isEditMode;

        function getSearchResult() {
            if (vm.searchText !== '') {
                $state.go('home.search', {
                    searchText: vm.searchText
                });
            }
        }

        playlistService.playlistsPromise.then(function () {
            if (vm.playlistService.playlists.length) {
                vm.setCurrentPlaylist(playlistService.playlists[0]);
            } else {
                humane.log('For a start - add at least one playlist');
            }
        }, function (data) {
            if (isNoChannelError(data.data.error)) {
                humane.log('You don\'t have a YouTube channel! Click here to create.', {
                    timeout: 0,
                    clickToClose: true,
                    addnCls: 'humane-flatty-error'
                }, function () {
                    $window.open('https://www.youtube.com/create_channel');
                });
            }
        });

        function isNoChannelError(error) {
            return error.code === 404 && _.any(error.errors, function (err) {
                return err.location === 'channelId' && err.reason === 'channelNotFound';
            });
        }

        function removeFromPlaylist(item) {
            playlistService.removeItemFromPlaylist(playlistService.selectedPlaylist(), {
                id: item.id
            });
        }

        function setCurrentPlaylist(playlist) {
            playlistService.selectPlaylist(playlist);
        }

        function setCurrentPlaylistItem(playlistItem) {
            playlistService.selectPlaylistitem(playlistItem);
        }

        function currentView() {
            return $state.current.name;
        }

        var prevView = null;

        function toggleEdit() {
            if (vm.isEditMode()) {
                $state.go(!prevView || prevView === 'home.edit' ? 'home.player' : prevView);
            } else {
                prevView = vm.currentView();
                $state.go('home.edit');
            }
        }

        function isEditMode() {
            return vm.currentView() === 'home.edit';
        }
    }
}());
