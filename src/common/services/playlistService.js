(function () {
    angular
        .module('ytApp')
        .service('playlistService', playlistService);

    playlistService.$inject = ['PlaylistResource', 'PlaylistItemsResource', 'pubSub'];

    function playlistService(PlaylistResource, PlaylistItemsResource, pubSub) {
        var svc = this;
        var selectedPlaylistitem = null;
        var selectedPlaylist = null;

        svc.playlists = [];
        svc.playlistsPromise = getPlaylistsPromise();

        svc.selectPlaylist = selectPlaylist;
        svc.selectPlaylistitem = selectPlaylistitem;
        svc.selectedPlaylistitem = getSelectedPlaylistitem;
        svc.selectedPlaylist = getSelectedPlaylist;

        svc.addPlaylist = addPlaylist;
        svc.removePlaylist = removePlaylist;
        svc.updatePlaylist = updatePlaylist;
        svc.fillPlaylist = fillPlaylist;

        svc.addItemToPlaylist = addItemToPlaylist;
        svc.removeItemFromPlaylist = removeItemFromPlaylist;
        svc.isItemInPlayList = isItemInPlayList;

        function selectPlaylist(playlist) {
            if (playlist === null) {
                svc.selectPlaylistitem(null);
            } else if (!playlist.items.length) {
                fillPlaylistAndSelectFirstItem(playlist);
            }

            selectedPlaylist = playlist;
            pubSub.publish('playlist.selected', playlist);
        }

        function selectPlaylistitem(video) {
            if (video !== null && !video.src) {
                video.src = 'https://www.youtube.com/embed/' +
                    video.snippet.resourceId.videoId +
                    '?list=' + video.snippet.playlistId;
            }

            selectedPlaylistitem = video;
            pubSub.publish('playlistitem.selected');
        }

        function getPlaylistsPromise() {
            return PlaylistResource.query(function playlistsLoadedCallback(data) {
                svc.playlists = data.items;
                for (var i = 0; i < svc.playlists.length; i++) {
                    svc.playlists[i].items = [];
                }
                if (svc.playlists.length) {
                    svc.selectPlaylist(svc.playlists[0]);
                }
                pubSub.publish('playlists.loaded', svc.playlists);
            }).$promise;
        }

        function addPlaylist(playlist) {
            var newitem = new PlaylistResource({
                snippet: playlist.snippet
            });
            return PlaylistResource.save(newitem).$promise
                .then(function playlistAdded(data) {
                    data.items = [];
                    svc.playlists.splice(0, 0, data);
                    pubSub.publish('playlist.added', data);
                }, function playlistNotAdded(data) {
                    humane.log('Error adding playlist');
                    console.log(data);
                });
        }

        function removePlaylist(playlist) {
            if (!confirm('Are you sure you want to remove playlist?')) {
                return;
            }

            var deletingItem = new PlaylistResource({
                id: playlist.id
            });

            return PlaylistResource.delete(deletingItem).$promise
                .then(function playlistRemoved() {
                    var indx = _.indexOf(svc.playlists, playlist);
                    if (indx !== -1) {
                        svc.playlists.splice(indx, 1);
                    }
                    if (playlist === selectedPlaylist) {
                        selectAnotherPlaylist(indx);
                    }
                    pubSub.publish('playlist.removed', playlist);
                }, function playlistNotRemoved(data) {
                    humane.log('Error deleting playlist');
                    console.log(data);
                });
        }

        function updatePlaylist(playlist) {
            var updatingItem = new PlaylistResource({
                id: playlist.id,
                snippet: playlist.snippet
            });

            return PlaylistResource.update(updatingItem, function (data) {
                pubSub.publish('playlist.updated', data);
            }, function (data) {
                humane.log('Error updating playlist');
                console.log(data);
            }).$promise;
        }

        function addItemToPlaylist(playlist, videoId) {
            var newitem = new PlaylistItemsResource({
                snippet: {
                    playlistId: playlist.id,
                    resourceId: {
                        kind: 'youtube#video',
                        videoId: videoId
                    }
                }
            });

            return PlaylistItemsResource.save(newitem, function itemAddedToPlaylist(data) {
                var indx = _.indexOf(svc.playlists, playlist);
                if (indx !== -1) {
                    svc.playlists[indx].items.splice(0, 0, data);
                }
                pubSub.publish('playlistitem.added', data);
            }, function itemNotAddedToPlaylist(data) {
                humane.log('Error adding item to playlist');
                console.log(data);
            }).$promise;
        }

        function removeItemFromPlaylist(playlist, item) {
            var deleteItem = new PlaylistItemsResource({
                id: item.id
            });

            return PlaylistItemsResource.delete(deleteItem, function itemRemovedFromPlaylist() {
                var playlistIndx = _.indexOf(svc.playlists, playlist);
                if (playlistIndx !== -1) {
                    var itemIndx = _.findIndex(svc.playlists[playlistIndx].items,
                        function (playlistItem) {
                            return playlistItem.id === deleteItem.id;
                        });
                    if (itemIndx !== -1) {
                        svc.playlists[playlistIndx].items.splice(itemIndx, 1);
                    }
                }
                pubSub.publish('playlistitem.removed', {
                    playlist: playlist,
                    item: item
                });
            }, function itemNotRemovedFromPlaylist(data) {
                humane.log('Error removing item from playlist');
                console.log(data);
            }).$promise;
        }

        function fillPlaylist(playlist) {
            return PlaylistItemsResource.query({
                playlistId: playlist.id
            }, function (data) {
                var indx = getPlaylistIndex(playlist);
                svc.playlists[indx].items = data.items;
                pubSub.publish('playlist.filled', playlist);
            }, function (data) {
                humane.log('Error filling the playlist');
                console.log(data);
            }).$promise;
        }

        function isItemInPlayList(playlist, videoId) {
            if (!playlist) {
                return false;
            }

            return _.any(playlist.items, function (item) {
                return item.snippet.resourceId.videoId === videoId;
            });
        }

        function getSelectedPlaylistitem() {
            return selectedPlaylistitem;
        }

        function getSelectedPlaylist() {
            return selectedPlaylist;
        }

        function fillPlaylistAndSelectFirstItem(playlist) {
            svc.fillPlaylist(playlist)
                .then(function () {
                    if (playlist.items.length) {
                        svc.selectPlaylistitem(playlist.items[0]);
                    }
                });
        }

        function selectAnotherPlaylist(indx) {
            while (!svc.playlists[indx] && indx >= 0) {
                indx--;
            }

            svc.selectPlaylist(indx >= 0 ? svc.playlists[indx] : null);
        }

        function getPlaylistIndex(searchItem) {
            return _.findIndex(svc.playlists, function (playlist) {
                return playlist.id === searchItem.id;
            });
        }
    }
}());
