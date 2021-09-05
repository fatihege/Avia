import ytSearch from 'yt-search';

const videoFinder = async (query, count: number = 1) => {
    const videoResult = await ytSearch(query);
    let results: any = [];
    if (videoResult.videos.length) {
        for (let i = 0; i < count; i++) {
            results.push(videoResult.videos[i]);
        }

        return results.length === 1 ? videoResult.videos[0] : results;
    } else {
        return null;
    }
}

export default videoFinder;
