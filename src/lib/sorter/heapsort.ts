import { SortItem, SortComparator } from ".";
import { DelayToken, CancellationToken } from '../util/tokens';
import { sleep } from '../util/sleep';

async function heap_root(input, i, len, comparator: SortComparator, delayToken: DelayToken, stoppingToken: CancellationToken) {
    var left = 2 * i + 1;
    var right = 2 * i + 2;
    var max = i;

    if (left < len && comparator(input[left], input[max])) {
        max = left;
    }

    if (right < len && comparator(input[right], input[max])) {
        max = right;
    }
    input[i].active = true;
    input[max].active = true;
    await sleep(delayToken.delay);
    if (max != i) {
        input[i].swapping = true;
        input[max].swapping = true;
        await sleep(delayToken.delay);
        await swap(input, i, max);
        input[i].swapping = false;
        input[max].swapping = false;
        await heap_root(input, max, len, comparator, delayToken, stoppingToken);
    }

    input[i].active = false;
    input[max].active = false;
}

async function swap(input, index1, index_B) {
    var temp = input[index1];
    input[index1] = input[index_B];
    input[index_B] = temp;
}

export async function heapSort(data: SortItem[], comparator: SortComparator, delayToken: DelayToken, stoppingToken: CancellationToken) {
    let len = data.length;
    for (var i = Math.floor(len / 2); i >= 0; i -= 1) {
        if(stoppingToken.cancelRequested) break;
        await heap_root(data, i, len, comparator, delayToken, stoppingToken);
    }

    for (i = data.length - 1; i > 0; i--) {
        if(stoppingToken.cancelRequested) break;
        await swap(data, 0, i);
        len--;
        await heap_root(data, 0, len, comparator, delayToken, stoppingToken);
        data[len].finalrun = true;
    }
}
