import { IterationOrder, PositionFormat, RangeMode, WellPlate } from '..';

describe('Computed / read-only properties', () => {
  it('read-only size property', () => {
    const wellPlate = new WellPlate({ rows: 2, columns: 8 });
    expect(wellPlate.rows).toStrictEqual(2);
    expect(wellPlate.columns).toStrictEqual(8);
    expect(wellPlate.size).toStrictEqual(16);
  });

  it('computed columnLabels property', () => {
    const wellPlate = getWellPlate('8x12');
    const expected = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
    ];
    expect(wellPlate.columnLabels).toStrictEqual(expected);

    const wellPlateSeq = getWellPlate('3x4', PositionFormat.Sequential);
    expect(wellPlateSeq.columnLabels).toStrictEqual(['1', '2', '3', '4']);
  });

  it('computed rowLabels property', () => {
    const wellPlate = getWellPlate('8x12');
    const expected = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    expect(wellPlate.rowLabels).toStrictEqual(expected);

    const wellPlateSeq = getWellPlate('3x4', PositionFormat.Sequential);
    expect(wellPlateSeq.rowLabels).toStrictEqual(['1', '2', '3']);
  });
});

describe('getPosition with all different output encoding and format', () => {
  it('any input - formatted encoding - LetterNumber format', () => {
    const wellPlate = new WellPlate({ rows: 4, columns: 6 });
    expect(wellPlate.getPosition(0, 'formatted')).toStrictEqual('A1');
    expect(wellPlate.getPosition(3, 'formatted')).toStrictEqual('A4');
    expect(wellPlate.getPosition(8, 'formatted')).toStrictEqual('B3');
    expect(wellPlate.getPosition('B3', 'formatted')).toStrictEqual('B3');
    expect(() => wellPlate.getPosition('U2', 'formatted')).toThrow(
      /well position is out of range/,
    );
    expect(
      wellPlate.getPosition({ row: 3, column: 3 }, 'formatted'),
    ).toStrictEqual('D4');
    expect(() => wellPlate.getPosition(24, 'formatted')).toThrow(
      /well position is out of range/,
    );
    expect(() =>
      wellPlate.getPosition({ row: 4, column: 0 }, 'formatted'),
    ).toThrow(/well position is out of range/);
  });

  it('any input - formatted encoding - sequential format', () => {
    const wellPlate = getWellPlate('6x8', PositionFormat.Sequential);
    expect(wellPlate.getPosition(18, 'formatted')).toStrictEqual('19');
    expect(wellPlate.getPosition('11', 'formatted')).toStrictEqual('11');
    expect(
      wellPlate.getPosition({ row: 2, column: 5 }, 'formatted'),
    ).toStrictEqual('22');
    expect(() => wellPlate.getPosition('49', 'formatted')).toThrow(
      /well position is out of range/,
    );
    expect(() => wellPlate.getPosition(48, 'formatted')).toThrow(
      /well position is out of range/,
    );
    expect(() =>
      wellPlate.getPosition({ row: 7, column: 9 }, 'formatted'),
    ).toThrow(/well position is out of range/);
  });

  it('any input - formatted encoding - number-number format', () => {
    const wellPlate = getWellPlate('9x9', PositionFormat.NumberNumber);
    expect(wellPlate.getPosition(55, 'formatted')).toStrictEqual('7.2');
    expect(
      wellPlate.getPosition({ row: 2, column: 5 }, 'formatted'),
    ).toStrictEqual('3.6');
    expect(() =>
      wellPlate.getPosition({ row: 7, column: 9 }, 'formatted'),
    ).toThrow(/well position is out of range/);
  });

  it('any input, formatted encoding - letter-number format - iterationOrder BY_ROW', () => {
    const wellPlate = new WellPlate({
      rows: 4,
      columns: 6,
      iterationOrder: IterationOrder.ByRow,
    });
    expect(wellPlate.getPosition(0, 'formatted')).toStrictEqual('A1');
    expect(wellPlate.getPosition(3, 'formatted')).toStrictEqual('D1');
    expect(wellPlate.getPosition(9, 'formatted')).toStrictEqual('B3');
    expect(
      wellPlate.getPosition({ row: 3, column: 3 }, 'formatted'),
    ).toStrictEqual('D4');
    expect(() => wellPlate.getPosition(24, 'formatted')).toThrow(
      /well position is out of range/,
    );
    expect(() =>
      wellPlate.getPosition({ row: 4, column: 0 }, 'formatted'),
    ).toThrow(/well position is out of range/);
  });
  it('any input - row_column encoding', () => {
    const wellPlate = getWellPlate('4x6');
    expect(wellPlate.getPosition('A6', 'row_column')).toStrictEqual({
      row: 0,
      column: 5,
    });

    expect(wellPlate.getPosition('C3', 'row_column')).toStrictEqual({
      row: 2,
      column: 2,
    });

    expect(() => wellPlate.getPosition('E1', 'row_column')).toThrow(
      /out of range/,
    );
    expect(() => wellPlate.getPosition('B7', 'row_column')).toThrow(
      /out of range/,
    );
    expect(() => wellPlate.getPosition('123', 'row_column')).toThrow(
      /invalid well code format. Must be a letter followed by a number/,
    );
    expect(() => wellPlate.getPosition('a1', 'row_column')).toThrow(
      /invalid well code format. Must be a letter followed by a number/,
    );
  });

  it('any input - index encoding', () => {
    const wellPlate = getWellPlate('4x6');
    expect(wellPlate.getPosition('A6', 'index')).toStrictEqual(5);
    expect(wellPlate.getPosition(23, 'index')).toStrictEqual(23);
    expect(() => wellPlate.getPosition('F1', 'index')).toThrow(/out of range/);
    expect(() =>
      wellPlate.getPosition(
        {
          row: 4,
          column: 0,
        },
        'index',
      ),
    ).toThrow(/out of range/);
    expect(() => wellPlate.getPosition(24, 'index')).toThrow(/out of range/);
  });

  it('getIndex, iteration order by row', () => {
    const wellPlate = getWellPlate(
      '4x6',
      PositionFormat.LetterNumber,
      IterationOrder.ByRow,
    );
    expect(wellPlate.getPosition('A6', 'index')).toStrictEqual(20);
    expect(wellPlate.getPosition(23, 'index')).toStrictEqual(23);
    expect(() => wellPlate.getPosition('F1', 'index')).toThrow(/out of range/);
    expect(() =>
      wellPlate.getPosition(
        {
          row: 4,
          column: 0,
        },
        'index',
      ),
    ).toThrow(/out of range/);
    expect(() => wellPlate.getPosition(24, 'index')).toThrow(/out of range/);
  });

  it('get index with number-number format', () => {
    const wellPlate = getWellPlate('4x6', PositionFormat.NumberNumber);
    expect(wellPlate.getPosition('2.4', 'index')).toStrictEqual(9);
  });

  it('sequential and letterNumber formats', () => {
    const wellPlateSeq = getWellPlate('9x9', PositionFormat.Sequential);
    expect(wellPlateSeq.positionFormat).toStrictEqual(
      PositionFormat.Sequential,
    );
    // Check this because format can come from a database
    expect(wellPlateSeq.positionFormat).toStrictEqual('SEQUENTIAL');

    const wellPlate = getWellPlate('9x9');
    expect(wellPlate.positionFormat).toStrictEqual(PositionFormat.LetterNumber);
    // Check this because format can come from a database
    expect(wellPlate.positionFormat).toStrictEqual('LETTER_NUMBER');
  });

  it('getPosition Sequential format', () => {
    const wellPlate = getWellPlate('6x8', PositionFormat.Sequential);
    expect(wellPlate.getPosition('9', 'row_column')).toStrictEqual({
      row: 1,
      column: 0,
    });

    expect(wellPlate.getPosition('45', 'row_column')).toStrictEqual({
      row: 5,
      column: 4,
    });

    expect(() => wellPlate.getPosition('82', 'row_column')).toThrow(
      /out of range/,
    );
    expect(() => wellPlate.getPosition('A1', 'row_column')).toThrow(
      /invalid well code format. Must be a number/,
    );
    expect(() => wellPlate.getPosition('inv', 'row_column')).toThrow(
      /invalid well code format. Must be a number/,
    );
  });

  it('getPosition NumberNumber format', () => {
    const wellPlate = getWellPlate('9x9', PositionFormat.NumberNumber);
    expect(wellPlate.getPosition('1.9', 'row_column')).toStrictEqual({
      row: 0,
      column: 8,
    });

    expect(wellPlate.getPosition('7.5', 'row_column')).toStrictEqual({
      row: 6,
      column: 4,
    });

    expect(() => wellPlate.getPosition('10.1', 'row_column')).toThrow(
      /out of range/,
    );
    expect(() => wellPlate.getPosition('1.0', 'row_column')).toThrow(
      /out of range/,
    );
    expect(() => wellPlate.getPosition('0.1', 'row_column')).toThrow(
      /out of range/,
    );
    expect(() => wellPlate.getPosition('A1', 'row_column')).toThrow(
      'invalid well code format. Must be 2 numbers separated by a .',
    );
  });
});

describe('get position ranges and subsets', () => {
  it('getCodeRange by rows', () => {
    const wellPlate = getWellPlate('4x6');
    const expected = ['C5', 'C6', 'D1', 'D2', 'D3'];
    expect(wellPlate.getPositionCodeRange(16, 20)).toStrictEqual(expected);
    expect(wellPlate.getPositionCodeRange(20, 16)).toStrictEqual(expected);
    expect(wellPlate.getPositionCodeRange('C5', 'D3')).toStrictEqual(expected);
    expect(wellPlate.getPositionCodeRange('D3', 'C5')).toStrictEqual(expected);
    expect(wellPlate.getPositionCodeRange('C5', 20)).toStrictEqual(expected);
    expect(
      wellPlate.getPositionCodeRange(
        { row: 3, column: 2 },
        { row: 2, column: 4 },
      ),
    ).toStrictEqual(expected);
  });

  it('getCodeRange by rows, iteration order by rows', () => {
    const wellPlate = getWellPlate(
      '4x6',
      PositionFormat.LetterNumber,
      IterationOrder.ByRow,
    );
    const expected = ['C5', 'C6', 'D1', 'D2', 'D3'];
    expect(wellPlate.getPositionCodeRange(11, 18)).toStrictEqual(expected);
    expect(wellPlate.getPositionCodeRange(18, 11)).toStrictEqual(expected);
    expect(wellPlate.getPositionCodeRange('C5', 'D3')).toStrictEqual(expected);
    expect(wellPlate.getPositionCodeRange('D3', 'C5')).toStrictEqual(expected);
    expect(wellPlate.getPositionCodeRange('C5', 11)).toStrictEqual(expected);
    expect(
      wellPlate.getPositionCodeRange(
        { row: 3, column: 2 },
        { row: 2, column: 4 },
      ),
    ).toStrictEqual(expected);
  });

  it('getCodeRange by columns', () => {
    const wellPlate = getWellPlate('5x6');
    const expected = ['C5', 'D5', 'E5', 'A6', 'B6', 'C6', 'D6', 'E6'];
    expect(
      wellPlate.getPositionCodeRange(16, 29, RangeMode.byColumns),
    ).toStrictEqual(expected);
    expect(
      wellPlate.getPositionCodeRange(29, 16, RangeMode.byColumns),
    ).toStrictEqual(expected);
    expect(
      wellPlate.getPositionCodeRange('C5', 'E6', RangeMode.byColumns),
    ).toStrictEqual(expected);
    expect(
      wellPlate.getPositionCodeRange('E6', 'C5', RangeMode.byColumns),
    ).toStrictEqual(expected);
    expect(
      wellPlate.getPositionCodeRange('A3', 'E2', RangeMode.byColumns),
    ).toStrictEqual(['E2', 'A3']);
    expect(
      wellPlate.getPositionCodeRange(
        { row: 2, column: 4 },
        { row: 4, column: 5 },
        RangeMode.byColumns,
      ),
    ).toStrictEqual(expected);
  });

  it('getPositionCodeZone', () => {
    const wellPlate = getWellPlate('4x6');
    const expected = ['C2', 'C3', 'C4', 'D2', 'D3', 'D4'];
    expect(wellPlate.getPositionCodeZone('C2', 'D4')).toStrictEqual(expected);
    expect(wellPlate.getPositionCodeZone('D4', 'C2')).toStrictEqual(expected);
    expect(wellPlate.getPositionCodeZone('D4', 'D4')).toStrictEqual(['D4']);
    expect(wellPlate.getPositionCodeZone('B3', 'C2')).toStrictEqual([
      'B2',
      'B3',
      'C2',
      'C3',
    ]);
  });

  it('getPositionCodeZone with indices', () => {
    const wellPlate = getWellPlate('4x6');
    const expected = ['C2', 'C3', 'C4', 'D2', 'D3', 'D4'];
    expect(wellPlate.getPositionCodeZone(13, 21)).toStrictEqual(expected);
    expect(wellPlate.getPositionCodeZone(21, 13)).toStrictEqual(expected);
    expect(wellPlate.getPositionCodeZone(21, 21)).toStrictEqual(['D4']);
    expect(wellPlate.getPositionCodeZone(8, 13)).toStrictEqual([
      'B2',
      'B3',
      'C2',
      'C3',
    ]);
  });
});

describe('position data', () => {
  it('set and get data', () => {
    const wellPlate = getWellPlate('8x12');
    wellPlate.setData(4, 'data1');
    wellPlate.setData('B5', 'data2');
    wellPlate.setData({ row: 3, column: 5 }, 'data3');
    expect(wellPlate.getData(10)).toBeUndefined();
    expect(wellPlate.getData(4)).toStrictEqual('data1');
    expect(wellPlate.getData('B5')).toStrictEqual('data2');
    expect(wellPlate.getData({ row: 3, column: 5 })).toStrictEqual('data3');
  });
});

describe('iteration', () => {
  it('iterator', () => {
    const wellPlate = getWellPlate('2x3');
    expect([...wellPlate]).toStrictEqual([
      {
        index: 0,
        position: { row: 0, column: 0 },
        code: 'A1',
        data: undefined,
      },
      {
        index: 1,
        position: { row: 0, column: 1 },
        code: 'A2',
        data: undefined,
      },
      {
        index: 2,
        position: { row: 0, column: 2 },
        code: 'A3',
        data: undefined,
      },
      {
        index: 3,
        position: { row: 1, column: 0 },
        code: 'B1',
        data: undefined,
      },
      {
        index: 4,
        position: { row: 1, column: 1 },
        code: 'B2',
        data: undefined,
      },
      {
        index: 5,
        position: { row: 1, column: 2 },
        code: 'B3',
        data: undefined,
      },
    ]);
  });

  it('iterator by rows', () => {
    const wellPlate = getWellPlate(
      '2x3',
      PositionFormat.LetterNumber,
      IterationOrder.ByRow,
    );
    expect([...wellPlate]).toStrictEqual([
      {
        index: 0,
        position: { row: 0, column: 0 },
        code: 'A1',
        data: undefined,
      },
      {
        index: 1,
        position: { row: 1, column: 0 },
        code: 'B1',
        data: undefined,
      },
      {
        index: 2,
        position: { row: 0, column: 1 },
        code: 'A2',
        data: undefined,
      },
      {
        index: 3,
        position: { row: 1, column: 1 },
        code: 'B2',
        data: undefined,
      },
      {
        index: 4,
        position: { row: 0, column: 2 },
        code: 'A3',
        data: undefined,
      },
      {
        index: 5,
        position: { row: 1, column: 2 },
        code: 'B3',
        data: undefined,
      },
    ]);
  });
});

function getWellPlate(
  type: string,
  positionFormat = PositionFormat.LetterNumber,
  iterationOrder = IterationOrder.ByColumn,
) {
  const result = /^(?<nRows>\d+)x(?<nCols>\d+)$/.exec(type);
  if (!result || !result.groups) {
    throw new Error('wrong type');
  }
  return new WellPlate({
    rows: parseInt(result.groups.nRows, 10),
    columns: parseInt(result.groups.nCols, 10),
    positionFormat,
    iterationOrder,
  });
}
