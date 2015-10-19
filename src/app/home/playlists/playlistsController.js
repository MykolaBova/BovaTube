(function () {
    'use strict';

    angular
        .module('ytApp')
        .controller('PlaylistsController', ['$window', '$state',
            'playlistService', PlaylistsController]);

    function PlaylistsController($window, $state, playlistService) {
        var vm = this;

        vm.searchText = '';
        vm.newPlaylistTitle = '';
        vm.newPlaylistDescription = '';
        vm.status = '';

        vm.playlistService = playlistService;
        vm.getSearchResult = getSearchResult;
        vm.removeFromPlaylist = removeFromPlaylist;
        vm.setCurrentPlaylist = setCurrentPlaylist;
        vm.setCurrentPlaylistItem = setCurrentPlaylistItem;
        vm.currentView = currentView;
        vm.isEditMode = isEditMode;
        vm.editPlaylist = editPlaylist;
        vm.editMode = false;
        vm.playlistsChangesAccept = playlistsChangesAccept;
        vm.playlistsChangesReject = playlistsChangesReject;
        vm.toggleAddPlaylist = toggleAddPlaylist;

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

        function editPlaylist(playlist) {
            if (playlist.id !== '') {
                $state.go('home.videos', {
                    listId: playlist.id
                });
            }
        }

        function isEditMode() {
            return vm.currentView() === 'home.edit';
        }

        function playlistsChangesAccept () {
            var playlist = {};
            playlist.snippet = {};

            playlist.snippet.title = vm.newPlaylistTitle;
            playlist.snippet.description = vm.newPlaylistDescription;
            playlistService.addPlaylist(playlist);
            vm.editMode = false;
        }

        function playlistsChangesReject () {
            vm.editMode = false;
        }

        function toggleAddPlaylist() {
            if(!vm.editMode) {
                vm.editMode = true;
            } else {
                vm.editMode = false;
            }
        }
    }
}());
