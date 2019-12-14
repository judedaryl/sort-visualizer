import { sleep } from '../util/sleep';
import { SortItem, SortComparator } from './';
import { CancellationToken, DelayToken } from '../util/tokens';

export async function bubbleSort(data: SortItem[], comparator: SortComparator, delayToken: DelayToken, stoppingToken: CancellationToken) {
    let n = data.length - 1;
    do {
        for (var i = 0; i < n; i++) {
            if(stoppingToken.cancelRequested) break;
            let cur = data[i];
            let next = data[i + 1];
            cur.active = true;
            next.active = true;
            if (comparator(cur,next)) {
                await sleep(delayToken.delay);
                cur.swapping  = true;
                next.swapping = true;
                await sleep(delayToken.delay);
                let temp = cur.value;
                cur.value = next.value;
                next.value = temp;
                cur.swapping  = false;
                next.swapping = false;
            }
            await sleep(delayToken.delay);
            cur.active = false;
            next.active = false;
        }
        if(!stoppingToken.cancelRequested) data[n].finalrun = true;
        n--;
    } while (n && !stoppingToken.cancelRequested);
    if(!stoppingToken.cancelRequested) data[0].finalrun = true;
}

