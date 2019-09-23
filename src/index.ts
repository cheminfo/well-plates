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
  NumberNumber = 'NUMBER_NUMBER'
}

export enum RangeMode {
  /**
   * Process ranges row by row
   */

  byRows = 'BY_ROWS',

  /**
   * Process range column by column
   */
  byColumns = 'BY_COLUMNS'
}

export interface IWellPlateConfig {
  rows: number;
  columns: number;
  /**
   * Default: `PositionFormat.LetterNumber`
   */
  positionFormat?: PositionFormat;
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
    const { positionFormat = PositionFormat.LetterNumber } = config;
    this.positionFormat = positionFormat;
    this.separator = config.separator || '.';
    this.size = this.rows * this.columns;
    this.data = new Array(this.size);
  }

  public [Symbol.iterator]() {
    let i = -1;
    return {
      next: () => {
        i++;
        const done = i === this.size;
        return {
          done,
          value: done
            ? null
            : {
                index: i,
                position: this._getPositionFromIndex(i),
                code: this.getPositionCode(i),
                data: this.getData(i)
              }
        };
      }
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
  public getPositionCode(arg1: number | IPosition) {
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
   * Get a range of well position codes
   * @param startIndex The index where the range starts
   * @param size The number of sequential positions to include in the range.
   */
  public getPositionCodeRange(
    start: number | string | IPosition,
    sizeOrEnd: number | string | IPosition,
    mode: RangeMode = RangeMode.byRows
  ) {
    let startIndex = this.getIndex(start);
    this._checkIndex(startIndex);
    if (mode === RangeMode.byRows) {
      let size;
      let endIndex;
      if (typeof sizeOrEnd === 'number') {
        size = sizeOrEnd;
        endIndex = startIndex + size - 1;
      } else {
        endIndex = this.getIndex(sizeOrEnd);
        if (startIndex > endIndex) {
          [startIndex, endIndex] = [endIndex, startIndex];
        }
        size = endIndex - startIndex + 1;
      }
      this._checkIndex(endIndex);
      return getRange(startIndex, size).map((index) =>
        this.getPositionCode(index)
      );
    } else if (mode === RangeMode.byColumns) {
      let size;
      let endIndex;
      if (typeof sizeOrEnd === 'number') {
        size = sizeOrEnd;
        endIndex = startIndex + size - 1;
      } else {
        endIndex = this.getIndex(sizeOrEnd);
        if (
          this._getIndexByColumn(startIndex) > this._getIndexByColumn(endIndex)
        ) {
          [startIndex, endIndex] = [endIndex, startIndex];
        }
        const startPosition = this.getPosition(startIndex);
        const endPosition = this.getPosition(endIndex);
        size =
          (endPosition.column - startPosition.column) * this.rows -
          startPosition.row +
          endPosition.row +
          1;
      }
      this._checkIndex(endIndex);
      const range: IPosition[] = [];
      const position = this.getPosition(startIndex);
      for (let i = 0; i < size; i++) {
        const newPosition: IPosition = {
          row: (position.row + i) % this.rows,
          column: position.column + Math.floor((i + position.row) / this.rows)
        };
        range.push(newPosition);
      }
      return range.map(this.getPositionCode.bind(this));
    }
  }

  public getPositionCodeZone(start: string | number, end: string | number) {
    const startPosition = this.getPosition(start);
    const endPosition = this.getPosition(end);
    this._checkPosition(startPosition);
    this._checkPosition(endPosition);
    const upperLeft = {
      row: Math.min(startPosition.row, endPosition.row),
      column: Math.min(startPosition.column, endPosition.column)
    };
    const bottomRight = {
      row: Math.max(startPosition.row, endPosition.row),
      column: Math.max(startPosition.column, endPosition.column)
    };

    const width = bottomRight.column - upperLeft.column + 1;
    const height = bottomRight.row - upperLeft.row + 1;
    const range = [];
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        range.push(
          this.getPositionCode({
            row: upperLeft.row + j,
            column: upperLeft.column + i
          })
        );
      }
    }
    return range;
  }

  public getIndex(position: IPosition | string | number): number {
    if (typeof position === 'number') {
      return position;
    }
    if (typeof position === 'string') {
      return this._getIndexFromCode(position);
    }
    return position.row * this.columns + position.column;
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
  public getPosition(wellCode: string | number): IPosition {
    if (typeof wellCode === 'number') {
      this._checkIndex(wellCode);
      return this._getPositionFromIndex(wellCode);
    } else {
      const reg = /^([A-Z])(\d+)$/;
      const m = reg.exec(wellCode);
      if (m === null) {
        if (this.positionFormat !== PositionFormat.Sequential) {
          this._formatError();
        }
        const wellIndex = +wellCode - 1;
        if (Number.isNaN(wellIndex)) {
          this._formatError();
        }
        this._checkIndex(wellIndex);
        return this._getPositionFromIndex(wellIndex);
      }

      if (this.positionFormat !== PositionFormat.LetterNumber) {
        this._formatError();
      }
      const position = {
        row: m[1].charCodeAt(0) - 'A'.charCodeAt(0),
        column: +m[2] - 1
      };
      this._checkPosition(position);
      return position;
    }
  }

  get columnLabels() {
    const result: string[] = [];
    let label = 1;
    for (let i = 0; i < this.columns; i++) {
      result.push(String(label++));
    }
    return result;
  }

  get rowLabels() {
    if (this.positionFormat !== PositionFormat.LetterNumber) {
      const result: string[] = [];
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
      column: index % this.columns
    };
  }

  private _getIndexFromCode(wellCode: string) {
    return this.getIndex(this.getPosition(wellCode));
  }

  private _getIndexByColumn(position: number | string | IPosition) {
    if (typeof position === 'number' || typeof position === 'string') {
      position = this.getPosition(position);
    }
    return position.column * this.rows + position.row;
  }

  private _formatError() {
    switch (this.positionFormat) {
      case PositionFormat.LetterNumber: {
        throw new Error(
          'invalid well code format. Must be a letter followed by a number'
        );
      }
      case PositionFormat.Sequential: {
        throw new Error('invalid well code format. Must be a number');
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

  private _sequentialCodeFromPosition(position: IPosition) {
    return String(position.row * this.rows + position.column + 1);
  }

  private _letterNumberCodeFromPosition(position: IPosition) {
    const startCharCode = 'A'.charCodeAt(0);
    const letter = String.fromCharCode(startCharCode + position.row);
    return letter + (position.column + 1);
  }

  private _numberNumberCodeFromPosition(position: IPosition) {
    return `${position.row + 1}${this.separator}${position.column + 1}`;
  }
}
