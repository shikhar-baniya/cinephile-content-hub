import { tmdbService } from './tmdbService';
import { seriesService } from './seriesService';
import { movieService } from './databaseService.api';
import { seriesPopulationService } from './seriesPopulationService';

export interface CreateSeriesRequest {
    title: string;
    tmdbId: number;
    selectedSeason: number;
    status: 'watched' | 'watching' | 'want-to-watch';
    genre: string;
    releaseYear: number;
    platform: string;
    rating: number;
    poster: string;
    notes?: string;
    watchDate?: string;
}

export const enhancedSeriesService = {
    async createSeriesWithAutoPopulation(request: CreateSeriesRequest) {
        try {


            // Step 1: Create the basic series entry
            const seriesData = {
                title: request.title,
                genre: request.genre,
                category: 'Series' as const,
                releaseYear: request.releaseYear,
                platform: request.platform,
                rating: request.rating,
                status: request.status,
                poster: request.poster,
                notes: request.notes,
                season: `Season ${request.selectedSeason}`,
                tmdbId: request.tmdbId,
                watchDate: request.watchDate,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const createdSeries = await movieService.addMovie(seriesData);

            // Step 2: Mark as populating and start background process
            seriesPopulationService.addPopulatingId(createdSeries.id);
            this.populateSeriesInBackground(createdSeries.id, request.selectedSeason, request.status, request.watchDate);

            return createdSeries;
        } catch (error) {
            throw error;
        }
    },

    async populateSeriesInBackground(seriesId: string, selectedSeason: number, status: string, watchDate?: string) {
        try {
            await tmdbService.populateSeriesWithTMDBData(seriesId);

            // Apply season logic after population
            await this.applySeasonLogic(seriesId, selectedSeason, status, watchDate);

            // Update overall series status based on seasons
            await this.updateSeriesStatusBasedOnSeasons(seriesId);

        } catch (tmdbError) {
            // TMDB population failed, continue without it
        } finally {
            // Remove from populating list
            seriesPopulationService.removePopulatingId(seriesId);
        }
    },

    async applySeasonLogic(seriesId: string, selectedSeason: number, status: string, watchDate?: string) {
        try {
            // Get current seasons
            const seasons = await seriesService.seasons.getSeriesSeasons(seriesId);

            if (seasons.length === 0) {
                return;
            }

            // Sort seasons by season number
            const sortedSeasons = seasons.sort((a, b) => a.seasonNumber - b.seasonNumber);

            for (const season of sortedSeasons) {
                let newStatus: string;
                let newWatchDate: string | undefined;

                if (season.seasonNumber < selectedSeason) {
                    // Previous seasons should be completed
                    newStatus = 'completed';
                    newWatchDate = watchDate || new Date().toISOString().split('T')[0];
                } else if (season.seasonNumber === selectedSeason) {
                    // Selected season status based on user choice
                    newStatus = status === 'watched' ? 'completed' :
                        status === 'watching' ? 'watching' :
                            'want-to-watch';
                    newWatchDate = status === 'watched' ? (watchDate || new Date().toISOString().split('T')[0]) : undefined;
                } else {
                    // Future seasons should be not-started
                    newStatus = 'not-started';
                    newWatchDate = undefined;
                }

                // Update season status
                await seriesService.seasons.updateSeason(season.id, {
                    status: newStatus,
                    watchDate: newWatchDate
                });

                // If season should be completed, mark all episodes as watched
                if (newStatus === 'completed') {
                    const episodes = await seriesService.episodes.getSeasonEpisodes(season.id);
                    if (episodes.length > 0) {
                        const episodeNumbers = episodes.map(ep => ep.episodeNumber);
                        await seriesService.episodes.bulkUpdateEpisodes(season.id, {
                            episodeNumbers,
                            watched: true,
                            watchDate: newWatchDate
                        });
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    },

    async updateSeriesStatusBasedOnSeasons(seriesId: string) {
        try {
            const seasons = await seriesService.seasons.getSeriesSeasons(seriesId);

            if (seasons.length === 0) return;

            const completedSeasons = seasons.filter(s => s.status === 'completed').length;
            const watchingSeasons = seasons.filter(s => s.status === 'watching').length;
            const totalSeasons = seasons.length;

            let seriesStatus: 'watched' | 'watching' | 'want-to-watch';
            let latestWatchDate: string | undefined;

            if (completedSeasons === totalSeasons) {
                seriesStatus = 'watched';
                // Get the latest completion date
                const completedSeasonsWithDates = seasons
                    .filter(s => s.status === 'completed' && s.watchDate)
                    .sort((a, b) => new Date(b.watchDate!).getTime() - new Date(a.watchDate!).getTime());
                latestWatchDate = completedSeasonsWithDates[0]?.watchDate;
            } else if (watchingSeasons > 0 || completedSeasons > 0) {
                seriesStatus = 'watching';
            } else {
                seriesStatus = 'want-to-watch';
            }

            // Update the main series record
            await movieService.updateMovie(seriesId, {
                status: seriesStatus,
                watchDate: latestWatchDate,
                latestSeasonWatched: completedSeasons > 0 ? Math.max(...seasons.filter(s => s.status === 'completed').map(s => s.seasonNumber)) : undefined
            });


        } catch (error) {
            throw error;
        }
    }
};
