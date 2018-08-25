interface IWellPosition {
  row: number;
  column: number;
}

enum WellCodeFormat {
  Sequential,
  LetterNumber
}

/**
 * WellPlate - creates a new Well Plate
 */
export class WellPlate {
  public rows: number;
  public columns: number;
  public size: number;
  private wellCodeFormat: WellCodeFormat;
  constructor(type: string) {
    const reg = /^(\d+)x(\d+)$/;
    const m = reg.exec(type);
    if (m === null) {
      throw new Error(
        'invalid well plate type, type must be formatted as <number>x<number>'
      );
    }
    this.rows = +m[1];
    this.columns = +m[2];
    this.size = this.rows * this.columns;
    if (this.columns === 9 && this.rows === 9) {
      this.wellCodeFormat = WellCodeFormat.Sequential;
    } else {
      this.wellCodeFormat = WellCodeFormat.LetterNumber;
    }
  }

  /**
   * Get the code of the well, given the well sequential position
   * Some wells will return a code compose of a letter and a number
   * Other will will simply return the position
   * @param index - The index position of the well. Starts with 0
   * @returns The code of the well
   */
  public getCode(index: number) {
    const startCharCode = 'A'.charCodeAt(0);
    this._checkIndex(index);

    if (this.rows === 9 && this.columns === 9) {
      return String(index + 1);
    } else {
      const position = this._getPositionFromIndex(index);
      const letter = String.fromCharCode(startCharCode + position.row);
      return letter + (position.column + 1);
    }
  }

  public getCodeRange(startIndex: number, size: number) {
    const endIndex = startIndex + size - 1;
    this._checkIndex(startIndex);
    this._checkIndex(endIndex);

    return getRange(startIndex, size).map(this.getCode.bind(this));
  }

  public getPosition(wellCode: string): IWellPosition {
    const reg = /^([A-Z])(\d+)$/;
    const m = reg.exec(wellCode);
    if (m === null) {
      if (this.wellCodeFormat !== WellCodeFormat.Sequential) {
        this._formatError();
      }
      const wellIndex = +wellCode - 1;
      if (Number.isNaN(wellIndex)) {
        this._formatError();
      }
      this._checkIndex(wellIndex);
      return this._getPositionFromIndex(wellIndex);
    }

    if (this.wellCodeFormat !== WellCodeFormat.LetterNumber) {
      this._formatError();
    }
    const position = {
      row: m[1].charCodeAt(0) - 'A'.charCodeAt(0),
      column: +m[2] - 1
    };
    this._checkPosition(position);
    return position;
  }

  private _getPositionFromIndex(index: number): IWellPosition {
    return {
      row: Math.floor(index / this.columns),
      column: index % this.columns
    };
  }

  private _formatError() {
    switch (this.wellCodeFormat) {
      case WellCodeFormat.LetterNumber: {
        throw new Error(
          'invalid well code format. Must be a letter followed by a number'
        );
      }
      case WellCodeFormat.Sequential: {
        throw new Error('invalid well code format. Must be a number');
      }
    }
  }

  private _checkIndex(index: number) {
    if (index < 0 || index >= this.size) {
      throw new RangeError('well index is out of range');
    }
  }

  private _checkPosition(position: IWellPosition) {
    if (
      position.row < 0 ||
      position.row >= this.rows ||
      position.column < 0 ||
      position.column >= this.columns
    ) {
      throw new RangeError('well position is out of range');
    }
  }
}

function getRange(start: number, size: number) {
  const result = [];

  for (let i = 0; i < size; i++) {
    result[i] = start + i;
  }
  return result;
}
