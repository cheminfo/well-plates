import { getRange } from './utils';

/**
 * The position on a 2 dimensional well plate.
 */
export interface IPosition {
  /**
   * The row index on the well plate. Index starts at 0.
   */
  row: number;
  /**
   * The column index on the well plate. Index starts at 0.
   */
  column: number;
}

/**
 * The format of a well position.
 */
export enum PositionFormat {
  /**
   * Sequential. When this format is used, the position code will starts with 1 and will be incremented columns first.
   */
  Sequential = 'SEQUENTIAL',
  /**
   * A letter + a number. When this format is used, the position will be represented
   * as a string with one letter + one number, representing the row and column position. For example B3 is for second row, 3rd column.
   */
  LetterNumber = 'LETTER_NUMBER',
  /**
   * A number + a number. When this format is used, the position will be represented
   * as number for the row and a number for the column. For example 2-4 is for secord row, 4th column.
   */
  NumberNumber = 'NUMBER_NUMBER',
}

/**
 * The iteration order
 * Determines in which order iteration over wells is performed
 */
export enum IterationOrder {
  /**
   * Jump from one column to the next when iterating
   */
  ByColumn = 'BY_COLUMN',
  /**
   * Jump from one row to the next when iterating
   */
  ByRow = 'BY_ROW',
}

export enum RangeMode {
  /**
   * Process ranges row by row
   */

  byRows = 'BY_ROWS',

  /**
   * Process range column by column
   */
  byColumns = 'BY_COLUMNS',
}

export interface IWellPlateConfig {
  rows: number;
  columns: number;
  /**
   * Default: `PositionFormat.LetterNumber`
   */
  positionFormat?: PositionFormat;
  /**
   * Default: `IterationOrder.ByColumn`
   */
  iterationOrder?: IterationOrder;
  separator?: string;
}

/**
 * WellPlate - class representing a well plate
 */
export class WellPlate<T = any> {
  /**
   * The number of rows the well plate has.
   */
  public readonly rows: number;

  /**
   * The number of columns the well plate has.
   */
  public readonly columns: number;

  /**
   * The well code format in use for this well plate.
   */
  public readonly positionFormat: PositionFormat;

  /**
   * The iteration method used for this well plate
   */
  public readonly iterationOrder: IterationOrder;

  /**
   * Separator used in some position formats
   */
  public readonly separator: string;

  /**
   * Data associated to a given well
   */
  public readonly data: T[];

  /**
   * The number of wells on the well plate.
   */
  private size: number;

  constructor(config: IWellPlateConfig) {
    this.rows = config.rows;
    this.columns = config.columns;
    const {
      positionFormat = PositionFormat.LetterNumber,
      iterationOrder = IterationOrder.ByColumn,
    } = config;
    this.positionFormat = positionFormat;
    this.iterationOrder = iterationOrder;
    this.separator = config.separator || '.';
    this.size = this.rows * this.columns;
    this.data = new Array(this.size);
  }

  public [Symbol.iterator]() {
    let i = -1;
    let realIndex = i;
    return {
      next: () => {
        i++;
        if (this.iterationOrder === IterationOrder.ByRow) {
          realIndex = this.getTransposedIndex(i);
        } else {
          realIndex = i;
        }
        const done = i === this.size;
        return {
          done,
          value: done
            ? null
            : {
                index: realIndex,
                position: this._getPositionFromIndex(realIndex),
                code: this.getPositionCode(realIndex),
                data: this.getData(realIndex),
              },
        };
      },
    };
  }

  /**
   * Get the code for a specific position on the well.
   *
   * Some wells will return a code compose of a letter and a number
   * Other will will simply return the position
   * @param arg1 - The index position of the well, starting with 0, or the position of the well, see [[Position]]
   * @returns The code of the well position. The format depends on the PositionFormat, see [[wellCodeFormat]]
   */
  public getPositionCode(arg1: number | IPosition): string {
    if (typeof arg1 === 'number') {
      this._checkIndex(arg1);
      switch (this.positionFormat) {
        case PositionFormat.Sequential: {
          return String(arg1 + 1);
        }
        case PositionFormat.LetterNumber: {
          const position = this._getPositionFromIndex(arg1);
          return this._letterNumberCodeFromPosition(position);
        }
        case PositionFormat.NumberNumber: {
          const position = this._getPositionFromIndex(arg1);
          return this._numberNumberCodeFromPosition(position);
        }
        default: {
          throw new Error('Unreachable');
        }
      }
    } else {
      this._checkPosition(arg1);
      switch (this.positionFormat) {
        case PositionFormat.Sequential: {
          return this._sequentialCodeFromPosition(arg1);
        }
        case PositionFormat.LetterNumber: {
          return this._letterNumberCodeFromPosition(arg1);
        }
        case PositionFormat.NumberNumber: {
          return this._numberNumberCodeFromPosition(arg1);
        }
        default: {
          throw new Error('Unreachable');
        }
      }
    }
  }

  /**
   * Get a range of well position codes. Inverting the start and end positions
   * @param bound1 One of the 2 bounding position to include in the range
   * @param bound2 The other of the 2 bounding position to include in the range
   * @param mode If the range sholud be along rows or columns
   */
  public getPositionCodeRange(
    bound1: number | string | IPosition,
    bound2: number | string | IPosition,
    mode: RangeMode = RangeMode.byRows
  ): string[] {
    this._checkIndex(this.getIndex(bound1));
    this._checkIndex(this.getIndex(bound2));
    if (mode === RangeMode.byRows) {
      let startIndex = this.getIndex(bound1);
      let endIndex = this.getIndex(bound2);
      if (startIndex > endIndex) {
        [startIndex, endIndex] = [endIndex, startIndex];
      }
      const size = endIndex - startIndex + 1;
      this._checkIndex(endIndex);
      return getRange(startIndex, size).map((index) =>
        this.getPositionCode(index)
      );
    } else if (mode === RangeMode.byColumns) {
      let startPosition = this.getPosition(bound1);
      let endPosition = this.getPosition(bound2);
      const transposed = new WellPlate({
        rows: this.columns,
        columns: this.rows,
        positionFormat: this.positionFormat,
      });

      let size =
        transposed.getIndex({
          row: endPosition.column,
          column: endPosition.row,
        }) -
        transposed.getIndex({
          row: startPosition.column,
          column: startPosition.row,
        });

      if (size < 0) {
        size = -size;
        [startPosition, endPosition] = [endPosition, startPosition];
      }
      size = size + 1;

      const range: IPosition[] = [];

      for (let i = 0; i < size; i++) {
        const newPosition: IPosition = {
          row: (startPosition.row + i) % this.rows,
          column:
            startPosition.column +
            Math.floor((i + startPosition.row) / this.rows),
        };
        range.push(newPosition);
      }
      return range.map(this.getPositionCode.bind(this));
    } else {
      throw new Error('Unexperted range mode');
    }
  }

  /**
   * Get a zone of well position codes. A zone is a rectangle in the well plate.
   * @param bound1 One of the 2 bounding position to include in the zone
   * @param bound2 The other of the 2 bounding position to include in the zone
   */
  public getPositionCodeZone(
    bound1: string | number | IPosition,
    bound2: string | number | IPosition
  ) {
    const startPosition = this.getPosition(bound1);
    const endPosition = this.getPosition(bound2);
    this._checkPosition(startPosition);
    this._checkPosition(endPosition);
    const upperLeft = {
      row: Math.min(startPosition.row, endPosition.row),
      column: Math.min(startPosition.column, endPosition.column),
    };
    const bottomRight = {
      row: Math.max(startPosition.row, endPosition.row),
      column: Math.max(startPosition.column, endPosition.column),
    };

    const width = bottomRight.column - upperLeft.column + 1;
    const height = bottomRight.row - upperLeft.row + 1;
    const range = [];
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        range.push(
          this.getPositionCode({
            row: upperLeft.row + j,
            column: upperLeft.column + i,
          })
        );
      }
    }
    return range;
  }

  public getIndex(position: IPosition | string | number): number {
    if (typeof position === 'number') {
      this._checkIndex(position);
      return position;
    }
    if (typeof position === 'string') {
      return this._getIndexFromCode(position);
    }
    const index = position.row * this.columns + position.column;
    this._checkIndex(index);
    return index;
  }

  public getData(position: IPosition | string | number) {
    const index = this.getIndex(position);
    return this.data[index];
  }

  public setData(position: IPosition | string | number, item: T) {
    const index = this.getIndex(position);
    this.data[index] = item;
  }

  /**
   * Get the well position given a formatted well position code.
   * @param wellCode The position code.
   */
  public getPosition(wellCode: string | number | IPosition): IPosition {
    if (typeof wellCode === 'number') {
      this._checkIndex(wellCode);
      return this._getPositionFromIndex(wellCode);
    } else if (typeof wellCode === 'string') {
      if (this.positionFormat === PositionFormat.NumberNumber) {
        const reg = /^(\d+).(\d+)$/;
        const m = reg.exec(wellCode);
        const hasSeparator = wellCode.indexOf(this.separator) !== -1;
        if (!hasSeparator || m === null) {
          throw this._formatError();
        }
        const position = {
          row: +m[1] - 1,
          column: +m[2] - 1,
        };
        this._checkPosition(position);
        return position;
      } else {
        const reg = /^([A-Z])(\d+)$/;
        const m = reg.exec(wellCode);
        if (m === null) {
          if (this.positionFormat !== PositionFormat.Sequential) {
            throw this._formatError();
          }
          const wellIndex = +wellCode - 1;
          if (Number.isNaN(wellIndex)) {
            throw this._formatError();
          }
          this._checkIndex(wellIndex);
          return this._getPositionFromIndex(wellIndex);
        }

        if (this.positionFormat !== PositionFormat.LetterNumber) {
          throw this._formatError();
        }
        const position = {
          row: m[1].charCodeAt(0) - 'A'.charCodeAt(0),
          column: +m[2] - 1,
        };
        this._checkPosition(position);
        return position;
      }
    } else {
      return wellCode;
    }
  }

  /**
   * This library works with indices that increment by jumping from one column to the next
   * If you own index works by jumping from one row to the next, you can use this method to transform your index.
   * This is especially useful to iterate on portions of the plates by row instead of by column
   * @param byRowIndex The index by row
   * @returns The index by column, such as used by the library
   */
  public getTransposedIndex(byRowIndex: number) {
    const row = byRowIndex % this.rows;
    const column = Math.floor(byRowIndex / this.rows);
    return row * this.columns + column;
  }

  get columnLabels(): string[] {
    const result = [];
    let label = 1;
    for (let i = 0; i < this.columns; i++) {
      result.push(String(label++));
    }
    return result;
  }

  get rowLabels(): string[] {
    if (this.positionFormat !== PositionFormat.LetterNumber) {
      const result = [];
      let label = 1;
      for (let i = 0; i < this.rows; i++) {
        result.push(String(label++));
      }
      return result;
    } else {
      const result: string[] = [];
      let label = 'A'.charCodeAt(0);
      for (let i = 0; i < this.rows; i++) {
        result.push(String.fromCharCode(label++));
      }
      return result;
    }
  }

  private _getPositionFromIndex(index: number): IPosition {
    return {
      row: Math.floor(index / this.columns),
      column: index % this.columns,
    };
  }

  private _getIndexFromCode(wellCode: string): number {
    return this.getIndex(this.getPosition(wellCode));
  }

  private _formatError() {
    switch (this.positionFormat) {
      case PositionFormat.LetterNumber: {
        return new Error(
          'invalid well code format. Must be a letter followed by a number'
        );
      }
      case PositionFormat.Sequential: {
        return new Error('invalid well code format. Must be a number');
      }
      case PositionFormat.NumberNumber: {
        return new Error(
          `invalid well code format. Must be 2 numbers separated by a ${this.separator}`
        );
      }
    }
  }

  private _checkIndex(index: number) {
    if (index < 0 || index >= this.size) {
      throw new RangeError('well index is out of range');
    }
  }

  private _checkPosition(position: IPosition) {
    if (
      position.row < 0 ||
      position.row >= this.rows ||
      position.column < 0 ||
      position.column >= this.columns
    ) {
      throw new RangeError('well position is out of range');
    }
  }

  private _sequentialCodeFromPosition(position: IPosition): string {
    return String(position.row * this.columns + position.column + 1);
  }

  private _letterNumberCodeFromPosition(position: IPosition): string {
    const startCharCode = 'A'.charCodeAt(0);
    const letter = String.fromCharCode(startCharCode + position.row);
    return letter + (position.column + 1);
  }

  private _numberNumberCodeFromPosition(position: IPosition): string {
    return `${position.row + 1}${this.separator}${position.column + 1}`;
  }
}
