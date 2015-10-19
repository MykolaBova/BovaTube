(function () {
    'use strict';

    angular
        .module('ytApp')
        .controller('VideosController', ['$window', '$state', '$stateParams',
            'playlistService', VideosController]);

    function VideosController($window, $state, $stateParams, playlistService) {
        var vm = this;
        var channelId;

        // searchText
        vm.listId = $stateParams.listId;

        vm.searchText = '';
        vm.newPlaylistTitle = '';
        vm.newPlaylistDescription = '';
        vm.status = '';
        vm.currentPlayList = {};

        vm.playlistService = playlistService;
        vm.getSearchResult = getSearchResult;
        vm.removeFromPlaylist = removeFromPlaylist;
        vm.setCurrentPlaylist = setCurrentPlaylist;
        vm.setCurrentPlaylistItem = setCurrentPlaylistItem;
        vm.currentView = currentView;
        vm.isEditMode = isEditMode;
        vm.toggleAddPlaylist = toggleAddPlaylist;
        vm.editMode = false;
        vm.playlistsChangesAccept = playlistsChangesAccept;
        vm.playlistsChangesReject = playlistsChangesReject;

        vm.setPlaylist = setPlaylist;
        vm.loadPlaylist = loadPlaylist;
        vm.editPlaylist = editPlaylist;

        function getSearchResult() {
            if (vm.searchText !== '') {
                $state.go('home.search', {
                    searchText: vm.searchText
                });
            }
        }

        playlistService.playlistsPromise.then(function () {
            if (vm.playlistService.playlists.length) {
                loadPlaylist ();
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

        function toggleAddPlaylist() {
            if (!vm.editMode) {
                vm.editMode = true;
            } else {
                vm.editMode = false;
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

        function setPlaylist () {

        }

        function loadPlaylist () {
            var i = 0;
            vm.currentPlayList.id = vm.listId;

            for(;i< playlistService.playlists.length; i++) {
                if(playlistService.playlists[i].id === vm.listId) {
                    vm.currentPlayList = playlistService.playlists[i];
                }
            }

            playlistService.fillPlaylist(vm.currentPlayList);
            playlistService.selectPlaylist(vm.currentPlayList);
        }

        function editPlaylist () {
            $state.go('home.search', {
                searchText: ''
            });
        }
     }
}());
