export * from './bubblesort';
export * from './quicksort';
export * from './mergesort';
export * from './heapsort';

export interface SortItem {
    value: number;
    active: boolean;
    swapping: boolean;
    finalrun: boolean;
    pivot: boolean;
}

export type SortComparator = (a: SortItem, b: SortItem) => boolean;
export type SortEmitter = (array: SortItem[]) => void;

export enum SortingAlg {
    bubble = 0,
    merge = 1,
    heap = 2
}