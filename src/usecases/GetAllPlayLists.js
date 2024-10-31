class GetAllPlaylists {
    constructor(playlistRepository) {
        this.playlistRepository = playlistRepository;
    }

    async execute() {
        return await this.playlistRepository.getAllPlaylists();
    }
}

module.exports = GetAllPlaylists;