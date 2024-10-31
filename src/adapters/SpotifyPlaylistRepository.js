const PlaylistRepository = require('../ports/PlaylistRepository');
const Playlist = require('../domain/Playlist');

class SpotifyPlaylistRepository extends PlaylistRepository {
    constructor(apiClient) {
        super();
        this.apiClient = apiClient;
    }

    async getAllPlaylists() {
        const response = await this.spotifyApi.getUserPlaylists();
        return response.data.items.map(item => new Playlist(item.id, item.name, item.description, item.images));
    }
}

module.exports = SpotifyPlaylistRepository;