import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { bubbleSort, heapSort, mergeSort, SortComparator, SortingAlg, SortItem } from 'src/lib/sorter';
import { sleep } from 'src/lib/util/sleep';
import { CancellationToken, DelayToken } from 'src/lib/util/tokens';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AppComponent implements OnInit {
  title = 'sort-visualizer';
  cachedRandomData: SortItem[] = [];
  data: SortItem[] = [];
  maxValue = 100;
  itemWidth = 5;
  maxWidth = 20;
  maxDelay = 500;
  widthScalingRate = 50;
  delayScalingRate = 200;
  arraySizeScalingRate = 100;
  stoppingToken: CancellationToken;
  delayToken: DelayToken = new DelayToken();
  delay: number = 0;
  maxArraySize = 100;
  minArraySize = 4;
  arraySize = this.maxArraySize;
  availableSortingAlg: { name: string, alg: SortingAlg, active: boolean }[] = [
    { name: 'Bubble Sort', alg: SortingAlg.bubble, active: true },
    { name: 'Merge Sort', alg: SortingAlg.merge, active: false },
    { name: 'Heap Sort', alg: SortingAlg.heap, active: false },
  ]

  $start = new BehaviorSubject<boolean>(false);

  get sortingAlg() {
    return this.availableSortingAlg.find(q => q.active);
  }

  ngOnInit() {
    this.randomize();
    this.delayToken.set(this.delay);
  }

  // [1,6,3,2].map((value,index) => ({value,index,active: false, isboundary: false}));
  randomize() {
    this.cachedRandomData = Array(this.maxArraySize)
      .fill(null)
      .map(() => ({ value: Math.floor(Math.random() * this.maxValue), active: false, finalrun: false, swapping: false, pivot: false }));
    this.reset();
  }

  reset() {
    if (typeof this.stoppingToken !== 'undefined') this.stoppingToken.stop();
    this.data = this.cachedRandomData.slice(0, this.arraySize);
    for(let i = 0; i < this.data.length; i++) { this.data[i] = {...this.data[i], active: false, swapping: false, finalrun: false, pivot: false }}
    delete this.stoppingToken;
  }

  async sort(data: SortItem[]) {
    if(typeof this.stoppingToken !== 'undefined') this.stop();
    this.$start.next(true);
    const comparator: SortComparator = (a, b) => a.value > b.value;
    this.stoppingToken = new CancellationToken;
    data.forEach(q => ({ ...q, active: false, swapping: false, finalrun: false, pivot: false }))

    switch (this.sortingAlg.alg) {
      case SortingAlg.bubble:
        await bubbleSort(data, comparator, this.delayToken, this.stoppingToken);
        break;
      case SortingAlg.merge:
        await mergeSort(data, comparator, this.delayToken, this.stoppingToken);
        break;
      case SortingAlg.heap:
        await heapSort(data, comparator, this.delayToken, this.stoppingToken);
        break;

    }
   
    if (typeof this.stoppingToken !== 'undefined' && !this.stoppingToken.cancelRequested) {
      data.forEach(q => ({ ...q, active: true }));
      await sleep(1000);
      data.forEach(q => ({ ...q, active: false }));
    }
    this.stop();
  }

  stop() {
    this.$start.next(false);
    if (typeof this.stoppingToken !== 'undefined') this.stoppingToken.stop();
    this.data.forEach(async q => ({ ...q, active: false, swapping: false, finalrun: false, pivot: false }))
  }

  async setItemWidth({ value }: MatSliderChange) {
    let offset: number = Math.log(1 - (5 / this.maxWidth)) * this.widthScalingRate * -1;
    this.arraySize = 5 + this.maxArraySize * (1 - Math.exp(-value / this.arraySizeScalingRate));
    this.itemWidth = 5 + this.maxWidth * Math.exp(-(value + offset) / this.widthScalingRate);
    this.reset();
  }

  setDelay({ value }: MatSliderChange) {
    var delay = this.maxDelay * Math.exp(-value / this.delayScalingRate);
    this.delayToken.set(delay);
  }

  setSorter(sort: SortingAlg) {
    this.availableSortingAlg = this.availableSortingAlg.map(q => ({ ...q, active: q.alg === sort }))
  }
}
