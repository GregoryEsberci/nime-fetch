import startDownloadWorker from './download';
import startEpisodeScraper from './episode-scraper';

const startWorkers = () => {
  startDownloadWorker();
  startEpisodeScraper();
};

export default startWorkers;
