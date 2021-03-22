import { getRange } from './utils';

export type Position = string | number | RowColumnPosition;

/**
 * The position on a 2 dimensional well plate.
 */
export interface RowColumnPosition {
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

export type PositionEncoding = 'index' | 'row_column' | 'formatted';

export enum SubsetMode {
  /**
   * Subset is a range row by row
   */

  columns = 'BY_ROWS',

  /**
   * Subset is a range column by column
   */
  rows = 'BY_COLUMNS',
  /**
   * Subset is a square zone inside the plate
   */
  zone = 'ZONE',
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
export class WellPlate<T = unknown> {
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
  public readonly data: Array<T | undefined>;

  /**
   * The number of wells on the well plate.
   */
  public readonly size: number;

  public constructor(config: IWellPlateConfig) {
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
                position: this._getPositionFromIndex(i, this.iterationOrder),
                code: this._getFormattedPosition(i),
                data: this.getData(i),
              },
        };
      },
    };
  }

  private _getPositionCode(
    inputPosition: Position,
    iterationOrder: IterationOrder,
  ): string {
    if (typeof inputPosition === 'number') {
      this._checkIndex(inputPosition);
      switch (this.positionFormat) {
        case PositionFormat.Sequential: {
          return String(inputPosition + 1);
        }
        case PositionFormat.LetterNumber: {
          const position = this._getPositionFromIndex(
            inputPosition,
            iterationOrder,
          );
          return this._letterNumberCodeFromPosition(position);
        }
        case PositionFormat.NumberNumber: {
          const position = this._getPositionFromIndex(
            inputPosition,
            iterationOrder,
          );
          return this._numberNumberCodeFromPosition(position);
        }
        default: {
          /* istanbul ignore next */
          throw new Error('Unreachable');
        }
      }
    } else if (typeof inputPosition === 'string') {
      // This will check if the input is valid
      this._getPosition(inputPosition);
      return inputPosition;
    } else {
      this._checkPosition(inputPosition);
      switch (this.positionFormat) {
        case PositionFormat.Sequential: {
          return this._sequentialCodeFromPosition(inputPosition);
        }
        case PositionFormat.LetterNumber: {
          return this._letterNumberCodeFromPosition(inputPosition);
        }
        case PositionFormat.NumberNumber: {
          return this._numberNumberCodeFromPosition(inputPosition);
        }
        default: {
          /* istanbul ignore next */
          throw new Error('Unreachable');
        }
      }
    }
  }

  /**
   * Get the code for a specific position on the well.
   *
   * Some wells will return a code compose of a letter and a number
   * Other will will simply return the position
   * @param inputPosition - The index position in any valid encoding [[Position]]
   * @returns The code of the well position. The format depends on the PositionFormat, see [[wellCodeFormat]]
   */
  private _getFormattedPosition(inputPosition: Position): string {
    return this._getPositionCode(inputPosition, this.iterationOrder);
  }

  /**
   * Get a subset of well position codes based it's bounds and a subset method
   * The bounds can be inverted.
   * @param bound1 One of the 2 bounding position to include in the range
   * @param bound2 The other of the 2 bounding position to include in the range
   * @param mode The subset selection mode
   */
  public getPositionSubset(
    bound1: Position,
    bound2: Position,
    mode: SubsetMode,
    encoding: 'index',
  ): number[];
  public getPositionSubset(
    bound1: Position,
    bound2: Position,
    mode: SubsetMode,
    encoding: 'row_column',
  ): RowColumnPosition[];
  public getPositionSubset(
    bound1: Position,
    bound2: Position,
    mode: SubsetMode,
    encoding: 'formatted',
  ): string[];
  public getPositionSubset(
    bound1: Position,
    bound2: Position,
    mode: SubsetMode,
    encoding: PositionEncoding,
  ): Position[];
  public getPositionSubset(
    bound1: Position,
    bound2: Position,
    mode: SubsetMode,
    encoding: PositionEncoding,
  ): Position[] {
    if (mode === SubsetMode.zone) {
      return this._getPositionCodeZone(bound1, bound2).map((position) =>
        this.getPosition(position, encoding),
      );
    }
    this._checkIndex(this._getIndex(bound1));
    this._checkIndex(this._getIndex(bound2));
    const iterationOrder =
      mode === SubsetMode.columns
        ? IterationOrder.ByRow
        : IterationOrder.ByColumn;
    const b1 = typeof bound1 === 'number' ? this._getPosition(bound1) : bound1;
    const b2 = typeof bound2 === 'number' ? this._getPosition(bound2) : bound2;

    let startIndex = this._getOrderedIndex(b1, iterationOrder);
    let endIndex = this._getOrderedIndex(b2, iterationOrder);
    if (startIndex > endIndex) {
      [startIndex, endIndex] = [endIndex, startIndex];
    }
    const size = endIndex - startIndex + 1;
    this._checkIndex(endIndex);
    return getRange(startIndex, size)
      .map((index) => {
        if (iterationOrder !== this.iterationOrder) {
          return this._getPositionFromIndex(index, iterationOrder);
        }
        return index;
      })
      .map((pos) => this.getPosition(pos, encoding));
  }

  /**
   * Get a zone of well position codes. A zone is a rectangle in the well plate.
   * @param bound1 One of the 2 bounding position to include in the zone
   * @param bound2 The other of the 2 bounding position to include in the zone
   */
  private _getPositionCodeZone(
    bound1: Position,
    bound2: Position,
  ): RowColumnPosition[] {
    const startPosition = this._getPosition(bound1);
    const endPosition = this._getPosition(bound2);
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
        range.push({
          row: upperLeft.row + j,
          column: upperLeft.column + i,
        });
      }
    }
    return range;
  }

  private _getOrderedIndex(
    position: Position,
    iterationOrder: IterationOrder,
  ): number {
    if (typeof position === 'number') {
      this._checkIndex(position);
      return position;
    }
    if (typeof position === 'string') {
      return this._getIndexFromCode(position, iterationOrder);
    }
    let index: number;
    this._checkPosition(position);
    if (iterationOrder === IterationOrder.ByColumn) {
      index = position.row * this.columns + position.column;
    } else {
      index = position.column * this.rows + position.row;
    }
    return index;
  }

  private _getIndex(position: Position): number {
    return this._getOrderedIndex(position, this.iterationOrder);
  }

  public getData(position: Position) {
    const index = this._getIndex(position);
    return this.data[index];
  }

  public setData(position: Position, item: T | undefined) {
    const index = this._getIndex(position);
    this.data[index] = item;
  }

  public getPosition(
    input: Position,
    encoding: 'row_column',
  ): RowColumnPosition;
  public getPosition(input: Position, encoding: 'index'): number;
  public getPosition(input: Position, encoding: 'formatted'): string;
  public getPosition(input: Position, encoding: PositionEncoding): Position;
  public getPosition(input: Position, encoding: PositionEncoding): Position {
    switch (encoding) {
      case 'index': {
        return this._getIndex(input);
      }
      case 'row_column': {
        return this._getPosition(input);
      }
      case 'formatted': {
        return this._getFormattedPosition(input);
      }
      default: {
        /* istanbul ignore next */
        throw new Error('unreachable');
      }
    }
  }

  /**
   * Get the well position given a formatted well position code.
   * @param inputPosition The position code.
   */
  private _getPosition(inputPosition: Position): RowColumnPosition {
    if (typeof inputPosition === 'number') {
      this._checkIndex(inputPosition);
      return this._getPositionFromIndex(inputPosition, this.iterationOrder);
    } else if (typeof inputPosition === 'string') {
      if (this.positionFormat === PositionFormat.NumberNumber) {
        const reg = /^(?<row>\d+).(?<column>\d+)$/;
        const m = reg.exec(inputPosition);
        const hasSeparator = inputPosition.includes(this.separator);
        if (!hasSeparator || m === null || !m.groups) {
          throw this._formatError();
        }
        const position = {
          row: +m.groups.row - 1,
          column: +m.groups.column - 1,
        };
        this._checkPosition(position);
        return position;
      } else {
        const reg = /^(?<row>[A-Z])(?<column>\d+)$/;
        const m = reg.exec(inputPosition);
        if (m === null || !m.groups) {
          if (this.positionFormat !== PositionFormat.Sequential) {
            throw this._formatError();
          }
          const wellIndex = +inputPosition - 1;
          if (Number.isNaN(wellIndex)) {
            throw this._formatError();
          }
          this._checkIndex(wellIndex);
          return this._getPositionFromIndex(wellIndex, this.iterationOrder);
        }

        if (this.positionFormat !== PositionFormat.LetterNumber) {
          throw this._formatError();
        }
        const position = {
          row: m.groups.row.charCodeAt(0) - 'A'.charCodeAt(0),
          column: +m.groups.column - 1,
        };
        this._checkPosition(position);
        return position;
      }
    } else {
      return inputPosition;
    }
  }

  public get columnLabels(): string[] {
    const result = [];
    let label = 1;
    for (let i = 0; i < this.columns; i++) {
      result.push(String(label++));
    }
    return result;
  }

  public get rowLabels(): string[] {
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

  private _getPositionFromIndex(
    index: number,
    iterationOrder: IterationOrder,
  ): RowColumnPosition {
    if (iterationOrder === IterationOrder.ByColumn) {
      return {
        row: Math.floor(index / this.columns),
        column: index % this.columns,
      };
    } else {
      return {
        row: index % this.rows,
        column: Math.floor(index / this.rows),
      };
    }
  }

  private _getIndexFromCode(
    formattedPosition: string,
    iterationOrder: IterationOrder,
  ): number {
    return this._getOrderedIndex(
      this._getPosition(formattedPosition),
      iterationOrder,
    );
  }

  private _formatError() {
    switch (this.positionFormat) {
      case PositionFormat.LetterNumber: {
        return new Error(
          'invalid well code format. Must be a letter followed by a number',
        );
      }
      case PositionFormat.Sequential: {
        return new Error('invalid well code format. Must be a number');
      }
      case PositionFormat.NumberNumber: {
        return new Error(
          `invalid well code format. Must be 2 numbers separated by a ${this.separator}`,
        );
      }
      default: {
        /* istanbul ignore next */
        throw new Error('Unreachable');
      }
    }
  }

  private _checkIndex(index: number) {
    if (index < 0 || index >= this.size) {
      throw new RangeError('well position is out of range');
    }
  }

  private _checkPosition(position: RowColumnPosition) {
    if (
      position.row < 0 ||
      position.row >= this.rows ||
      position.column < 0 ||
      position.column >= this.columns
    ) {
      throw new RangeError('well position is out of range');
    }
  }

  private _sequentialCodeFromPosition(position: RowColumnPosition): string {
    return String(position.row * this.columns + position.column + 1);
  }

  private _letterNumberCodeFromPosition(position: RowColumnPosition): string {
    const startCharCode = 'A'.charCodeAt(0);
    const letter = String.fromCharCode(startCharCode + position.row);
    return letter + (position.column + 1);
  }

  private _numberNumberCodeFromPosition(position: RowColumnPosition): string {
    return `${position.row + 1}${this.separator}${position.column + 1}`;
  }
}
