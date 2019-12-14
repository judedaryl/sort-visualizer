import { SortItem, SortComparator } from '.';

import { CancellationToken, DelayToken } from '../util/tokens';
import { sleep } from '../util/sleep';


/**
 * Swaps two values in the heap
 *
 * @param {int} indexA Index of the first item to be swapped
 * @param {int} indexB Index of the second item to be swapped
 */
function swap(array: SortItem[], indexA: number, indexB: number) {
    var temp = array[indexA];
    array[indexA] = array[indexB];
    array[indexB] = temp;
}

/**
 * Partitions the (sub)array into values less than and greater
 * than the pivot value
 *
 * @param {SortItem[]} array The target array
 * @param {number} pivot The index of the pivot
 * @param {number} left The index of the leftmost element
 * @param {number} left The index of the rightmost element
 */
async function partition(array: SortItem[], pivot: number, left: number, right: number, comparator: SortComparator, delayToken: DelayToken, stoppingToken: CancellationToken) {
  
    if (stoppingToken.cancelRequested) return;
    var storeIndex = left,
        pivotValue = array[pivot];
    // put the pivot on the right
    swap(array, pivot, right);
    // go through the rest
    for (var v = left; v < right; v++) {       
        if (stoppingToken.cancelRequested) break;
        // if the value is less than the pivot's
        // value put it to the left of the pivot
        // point and move the pivot point along one
        array[v].active = true;
        array[storeIndex].active = true;
        await sleep(delayToken.delay);

        if (comparator(pivotValue, array[v]) && pivotValue.value !== array[v].value) {
            array[v].swapping = true;
            array[storeIndex].swapping = true;
            await sleep(delayToken.delay);
            swap(array, v, storeIndex);
            array[v].swapping = false;
            array[storeIndex].swapping = false;
            await sleep(delayToken.delay);
            array[storeIndex].active = false;
            storeIndex++;
        }
        array[v].active = false;
        array[storeIndex].active = false;
    }

    // finally put the pivot in the correct place
    swap(array, right, storeIndex);
    return storeIndex;
}

/**
 * Sorts the (sub-)array
 *
 * @param {Array} array The target array
 * @param {int} left The index of the leftmost element, defaults 0
 * @param {int} left The index of the rightmost element,
 defaults array.length-1
 */
async function sort(array: SortItem[], left: number, right: number, comparator: SortComparator, delayToken: DelayToken, stoppingToken: CancellationToken) {

    var pivot = null;

    if (typeof left !== 'number') {
        left = 0;
    }

    if (typeof right !== 'number') {
        right = array.length - 1;
    }

    // effectively set our base
    // case here. When left == right
    // we'll stop
    if (left < right) {
        // pick a pivot between left and right
        // and update it once we've partitioned
        // the array to values < than or > than
        // the pivot value
        pivot = left + Math.ceil((right - left) * 0.5);
        array[pivot].pivot = true;
        var newPivot = await partition(array, pivot, left, right, comparator, delayToken, stoppingToken);

        // recursively sort to the left and right
        await sort(array, left, newPivot - 1, comparator, delayToken, stoppingToken);
        await sort(array, newPivot + 1, right, comparator, delayToken, stoppingToken);
        array.forEach(async q => q.pivot = false)
    }

}

export async function quickSort(data: SortItem[], comparator: SortComparator, delay: DelayToken, stoppingToken: CancellationToken) {
    await sort(data, undefined, undefined, comparator, delay, stoppingToken);
}
