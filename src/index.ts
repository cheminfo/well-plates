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
  Sequential,
  /**
   * A letter + a number. When this format is used, the position will be represented
   * as a string with one letter + one number, representing the row and column position. For example B3 is for second row, 3rd column.
   */
  LetterNumber
}

/**
 * WellPlate - class representing a well plate
 */
export class WellPlate {
  /**
   * The number of rows the well plate has.
   */
  public readonly rows: number;
  /**
   * The number of columns the well plate has.
   */
  public readonly columns: number;
  /**
   * The number of well o nthe well plate.
   */
  /**
   * The well code format in use for this well plate.
   */
  public readonly positionFormat: PositionFormat;
  private size: number;
  /**
   * Constructor using a string representing the dimensions of the well plate.
   * @param rows The number of rows in the well plate.
   * @param columns The number of columns in the well plate.
   */
  constructor(rows: number, columns: number);
  constructor(type: string);
  constructor(arg1: number | string, columns?: number) {
    if (typeof arg1 === 'string') {
      const reg = /^(\d+)x(\d+)$/;
      const m = reg.exec(arg1);
      if (m === null) {
        throw new Error(
          'invalid well plate type, type must be formatted as <number>x<number>'
        );
      }
      this.rows = +m[1];
      this.columns = +m[2];
    } else {
      this.rows = arg1;
      this.columns = columns || 0;
    }

    this.size = this.rows * this.columns;
    if (this.columns === 9 && this.rows === 9) {
      this.positionFormat = PositionFormat.Sequential;
    } else {
      this.positionFormat = PositionFormat.LetterNumber;
    }
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
      if (this.positionFormat === PositionFormat.Sequential) {
        return String(arg1 + 1);
      } else {
        const position = this._getPositionFromIndex(arg1);
        return this._letterNumberCodeFromPosition(position);
      }
    } else {
      this._checkPosition(arg1);
      if (this.positionFormat === PositionFormat.Sequential) {
        return this._sequentialCodeFromPosition(arg1);
      } else {
        return this._letterNumberCodeFromPosition(arg1);
      }
    }
  }

  /**
   * Get a range of well position codes
   * @param startIndex The index where the range starts
   * @param size The number of sequential positions to include in the range.
   */
  public getPositionCodeRange(startIndex: number, size: number) {
    const endIndex = startIndex + size - 1;
    this._checkIndex(startIndex);
    this._checkIndex(endIndex);

    return getRange(startIndex, size).map(this.getPositionCode.bind(this));
  }

  /**
   * Get the well position given a formatted well position code.
   * @param wellCode The position code.
   */
  public getPosition(wellCode: string): IPosition {
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

  private _getPositionFromIndex(index: number): IPosition {
    return {
      row: Math.floor(index / this.columns),
      column: index % this.columns
    };
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
}
