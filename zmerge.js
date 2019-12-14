function merge(array, left, right, comparator) {
    let nL = left.length, nR = right.length;
    let l = 0, r = 0, a = 0;
    while(l < nL && r < nR) {
        let _left = left[l];
        let _right = right[r];
        if(comparator(_left, _right)) {
            array[a] = _left;
            l++;
        } else {
            array[a] = _right;
            r++;
        }
        a++;
    }
    while(l < nL) {
        array[a] = left[l]; l++;  a++;
    }
    while(r < nR) {
        array[a] = right[r]; r++; a++;
    }
}


function mergeSort(array) {
    var len = array.length;
    if(len === 1) return;
    var mid = Math.round(len / 2);
    var left = array.slice(0, mid);
    var right = array.slice(mid, len);
    mergeSort(left)
    mergeSort(right)
    merge(array, left, right, (a,b) => a > b)
}