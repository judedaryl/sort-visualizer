import { SortItem, SortComparator } from ".";
import { DelayToken, CancellationToken } from '../util/tokens';
import { sleep } from '../util/sleep';

async function merge(
    array: SortItem[], 
    left: SortItem[], 
    right: SortItem[],
    comparator: SortComparator, 
    stoppingToken: CancellationToken
    ) {
    let nL = left.length, nR = right.length;
    let l = 0, r = 0, a = 0;
    while (l < nL && r < nR) {
        let _left = left[l];
        let _right = right[r];
        if (stoppingToken.cancelRequested) break;
        if (!comparator(_left, _right)) {
            array[a] = {..._left};
            l++;
        } else {
            array[a] = {..._right};
            r++;
        }
        a++;
    }
    while (l < nL) {       
        array[a] = left[l]; l++; a++;
    }
    while (r < nR) {
        array[a] = right[r]; r++; a++;
    } 
    
}

async function mergeSorter(originalArray: SortItem[], array: MergeSortItem[], comparator: SortComparator, delayToken: DelayToken, stoppingToken: CancellationToken) {
    var len = array.length;
    if (len === 1) return;
    var mid = Math.round(len / 2);
    var left = array.slice(0 , mid)
    var right = array.slice(mid, len);
    await mergeSorter(originalArray, left, comparator, delayToken, stoppingToken);
    await mergeSorter(originalArray, right, comparator, delayToken, stoppingToken);
    let arrayRef = array.slice(0);
    await merge(array, left, right, comparator, stoppingToken);
    let next = array;
    let i = 0;
    while(i < len) {       
        if (stoppingToken.cancelRequested) break;
        let ref = arrayRef[i];
        let _n = next[i];
        /// is now in the final recursion
        if(originalArray.length === array.length) _n.finalrun = true;
        _n.active = true;
        originalArray[_n.index].active = true;
        originalArray[ref.index].active = true;
        await sleep(delayToken.delay);

        if(!comparator(originalArray[_n.index], originalArray[ref.index]) && originalArray[_n.index] !== originalArray[ref.index]) {
            originalArray[_n.index].swapping = true;
            originalArray[ref.index].swapping = true;
        }
        await sleep(delayToken.delay);
        originalArray[_n.index].swapping = false;
        originalArray[ref.index].swapping = false;        
        originalArray[ref.index] = _n;
        _n.active = false;
        originalArray[_n.index].active = false
        originalArray[ref.index].active = false;

        i++;
    }
}

export async function mergeSort(array: SortItem[], comparator: SortComparator, delayToken: DelayToken, stoppingToken: CancellationToken) {
    var arr = array.map((q, index) => ({...q, index}))
    await mergeSorter(array, arr, comparator, delayToken, stoppingToken);
}

interface MergeSortItem extends SortItem {
    // internally used id to determine the index
    // of the item to be swapped
    index: number;
}