import '@/setup';
import '@/app';
import '@/controllers/index';
import '@/server';

import startWorkers from '@/workers/index';

startWorkers();
