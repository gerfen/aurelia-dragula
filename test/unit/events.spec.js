import {raise} from './lib/events';
import {createDragula} from './lib/create-dragula';
import {Options} from '../../src/options';

describe('events', function() {

  beforeEach(function() {
    this.div = document.createElement('div');
    this.item = document.createElement('div');
    this.div.appendChild(this.item);
    document.body.appendChild(this.div);
  });

  afterEach(function() {
    document.body.removeChild(this.div);
  });

  it('.start() emits "cloned" for copies', function() {
    //arrange
    let drake = createDragula([this.div], { copy: true });

    drake.on('cloned', (copy, original, type) => {
      //assert
      expect(copy).not.toBe(this.item, 'copy is not a reference to item');
      expect(copy).toEqual(this.item, 'copy of original is provided');
      expect(original).toBe(this.item, 'original item is provided');
    });

    //act
    drake.manualStart(this.item);
    drake.destroy();
  });

  it('.start() emits "drag" for items', function() {
    let drake = createDragula([this.div]);
    drake.on('drag', (original, container) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
      expect(container).toBe(this.div, 'container matches expected div');
    });

    drake.manualStart(this.item);

    drake.destroy();
  });

  it('.end() emits "cancel" when not moved', function() {
    let drake = createDragula([this.div]);

    drake.on('dragend', (original) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
    });
    drake.on('cancel', (original, container) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
      expect(container).toBe(this.div, 'container matches expected div');
    });

    raise(this.item, 'mousedown', { which: 1 });
    raise(this.item, 'mousemove', { which: 1 });

    drake.end();

    drake.destroy();
  });

  it('.end() emits "drop" when moved', function() {
    let div2 = document.createElement('div');
    let drake = createDragula([this.div, div2]);
    document.body.appendChild(div2);

    drake.on('dragend', (original) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
    });
    drake.on('drop', (original, target, container) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
      expect(target).toBe(div2, 'target matches expected div');
      expect(container).toBe(this.div, 'container matches expected div');
    });

    raise(this.item, 'mousedown', { which: 1 });
    raise(this.item, 'mousemove', { which: 1 });
    div2.appendChild(this.item);

    drake.end();

    drake.destroy();
  });

  it('.remove() emits "remove" for items', function() {
    let drake = createDragula([this.div]);

    drake.on('dragend', (original) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
    });

    drake.on('remove', (original, container) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
      expect(container).toBe(this.div, 'container matches expected div');
    });

    raise(this.item, 'mousedown', { which: 1 });
    raise(this.item, 'mousemove', { which: 1 });

    drake.remove();

    drake.destroy();
  });

  it('.remove() emits "cancel" for copies', function() {
    let dragendCalled = false;
    //let drake = createDragula([this.div], { copy: true });
    let drake = createDragula([this.div], { copy: Options.always });
    let copiedItem;
    this.item.classList.add('test');

    drake.on('dragend', () => dragendCalled = true);
    drake.on('cancel', (copy, container) => {
      copiedItem = copy;
      expect(container).toBe(null, 'container matches expectation');
    });

    raise(this.item, 'mousedown', { which: 1 });
    raise(this.item, 'mousemove', { which: 1 });

    drake.remove();

    expect(dragendCalled).toBeTruthy();
    expect(copiedItem).not.toBe(this.item, 'copy is not a reference to item');
    expect(copiedItem.isEqualNode(this.item)).toBeTruthy('item is a copy of item');

    drake.destroy();
  });

  it('.cancel() emits "cancel" when not moved', function() {
    let drake = createDragula([this.div]);

    drake.on('dragend', (original) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
    });
    drake.on('cancel', (original, container) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
      expect(container).toBe(this.div, 'container matches expected div');
    });

    raise(this.item, 'mousedown', { which: 1 });
    raise(this.item, 'mousemove', { which: 1 });

    drake.cancel();

    drake.destroy();
  });

  it('.cancel() emits "drop" when not reverted', function() {
    let div2 = document.createElement('div');
    let drake = createDragula([this.div]);
    document.body.appendChild(div2);

    drake.on('dragend', (original) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
    });
    drake.on('drop', (original, parent, container) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
      expect(parent).toBe(div2, 'parent matches expected div');
      expect(container).toBe(this.div, 'container matches expected div');
    });

    raise(this.item, 'mousedown', { which: 1 });
    raise(this.item, 'mousemove', { which: 1 });

    div2.appendChild(this.item);

    drake.cancel();

    drake.destroy();
  });

  it('.cancel() emits "cancel" when reverts', function() {
    let div2 = document.createElement('div');
    let drake = createDragula([this.div], { revertOnSpill: true });
    document.body.appendChild(div2);

    drake.on('dragend', (original) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
    });
    drake.on('cancel', (original, container) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
      expect(container).toBe(this.div, 'container matches expected div');
    });

    raise(this.item, 'mousedown', { which: 1 });
    raise(this.item, 'mousemove', { which: 1 });

    div2.appendChild(this.item);

    drake.cancel();

    drake.destroy();
  });

  it('mousedown emits "cloned" for mirrors', function() {
    let drake = createDragula([this.div]);
    this.item.classList.add('test');
    this.item.style['width'] = '250px';
    this.item.style['height'] = '22px';
    let mirror;

    drake.on('cloned', (copy, original, type) => {
      if (type === 'mirror') {
        mirror = copy;
        expect(original).toBe(this.item, 'original item is provided');
      }
    });

    raise(this.item, 'mousedown', { which: 1 });
    raise(this.item, 'mousemove', { which: 1 });

    expect(mirror).not.toBe(this.item, 'mirror is not a reference to item');
    expect(mirror.style).toEqual(this.item.style);
    expect(this.item.classList.contains('gu-transit')).toBeTruthy();
    expect(mirror.classList.contains('gu-mirror')).toBeTruthy();
    expect(this.item.classList.contains('test')).toBeTruthy();
    expect(mirror.classList.contains('test')).toBeTruthy();

    drake.destroy();
  });

  it('mousedown emits "cloned" for copies', function() {
    //let drake = createDragula([this.div], { copy: true });
let drake = createDragula([this.div], { copy: Options.always });
    drake.on('cloned', (copy, original, type) => {
      if (type === 'copy') {
        expect(copy).not.toBe(this.item, 'copy is not a reference to item');
        expect(copy).toEqual(this.item, 'copy of original is provided');
        expect(original).toBe(this.item, 'original item is provided');
      }
    });

    raise(this.item, 'mousedown', { which: 1 });
    raise(this.item, 'mousemove', { which: 1 });

    drake.destroy();
  });

  it('mousedown emits "drag" for items', function() {
    let drake = createDragula([this.div]);

    drake.on('drag', (original, container) => {
      expect(original).toBe(this.item, 'item is a reference to moving target');
      expect(container).toBe(this.div, 'container matches expected div');
    });

    raise(this.item, 'mousedown', { which: 1 });
    raise(this.item, 'mousemove', { which: 1 });

    drake.destroy();
  });
});
