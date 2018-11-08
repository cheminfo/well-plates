import { PositionFormat, WellPlate } from '..';

describe('WellPlate', () => {
  it('size', () => {
    const wellPlate = new WellPlate({ rows: 2, columns: 8 });
    expect(wellPlate.rows).toEqual(2);
    expect(wellPlate.columns).toEqual(8);
  });

  it('getPositionCode', () => {
    const wellPlate = new WellPlate({ rows: 4, columns: 6 });
    expect(wellPlate.getPositionCode(0)).toEqual('A1');
    expect(wellPlate.getPositionCode(3)).toEqual('A4');
    expect(wellPlate.getPositionCode(8)).toEqual('B3');
    expect(wellPlate.getPositionCode({ row: 3, column: 3 })).toEqual('D4');
    expect(() => wellPlate.getPositionCode(24)).toThrowError(
      /well index is out of range/
    );
    expect(() => wellPlate.getPositionCode({ row: 4, column: 0 })).toThrowError(
      /well position is out of range/
    );
  });

  it('getPositionCode sequential format', () => {
    const wellPlate = getWellPlate('9x9', PositionFormat.Sequential);
    expect(wellPlate.getPositionCode(55)).toEqual('56');
    expect(wellPlate.getPositionCode({ row: 2, column: 5 })).toEqual('24');
    expect(() => wellPlate.getPositionCode({ row: 7, column: 9 })).toThrowError(
      /well position is out of range/
    );
  });

  it('getCodeRange', () => {
    const wellPlate = getWellPlate('4x6');
    const expected = ['C5', 'C6', 'D1', 'D2', 'D3'];
    expect(wellPlate.getPositionCodeRange(16, 5)).toEqual(expected);
    expect(wellPlate.getPositionCodeRange('C5', 5)).toEqual(expected);
  });

  it('getPosition', () => {
    const wellPlate = getWellPlate('4x6');
    expect(wellPlate.getPosition('A6')).toEqual({
      row: 0,
      column: 5
    });

    expect(wellPlate.getPosition('C3')).toEqual({
      row: 2,
      column: 2
    });

    expect(() => wellPlate.getPosition('E1')).toThrowError(/out of range/);
    expect(() => wellPlate.getPosition('B7')).toThrowError(/out of range/);
    expect(() => wellPlate.getPosition('123')).toThrowError(
      /invalid well code format. Must be a letter followed by a number/
    );
    expect(() => wellPlate.getPosition('a1')).toThrowError(
      /invalid well code format. Must be a letter followed by a number/
    );
  });

  it('getIndex', () => {
    const wellPlate = getWellPlate('4x6');
    expect(wellPlate.getIndex('A6')).toEqual(5);
  });

  it('sequential and letterNumber formats', () => {
    const wellPlateSeq = getWellPlate('9x9', PositionFormat.Sequential);
    expect(wellPlateSeq.positionFormat).toEqual(PositionFormat.Sequential);
    // Check this because format can come from a database
    expect(wellPlateSeq.positionFormat).toEqual('SEQUENTIAL');

    const wellPlate = getWellPlate('9x9');
    expect(wellPlate.positionFormat).toEqual(PositionFormat.LetterNumber);
    // Check this because format can come from a database
    expect(wellPlate.positionFormat).toEqual('LETTER_NUMBER');
  });

  it('getPosition Sequential format', () => {
    const wellPlate = getWellPlate('9x9', PositionFormat.Sequential);
    expect(wellPlate.getPosition('9')).toEqual({
      row: 0,
      column: 8
    });

    expect(wellPlate.getPosition('77')).toEqual({
      row: 8,
      column: 4
    });

    expect(() => wellPlate.getPosition('82')).toThrowError(/out of range/);
    expect(() => wellPlate.getPosition('A1')).toThrowError(
      /invalid well code format. Must be a number/
    );
    expect(() => wellPlate.getPosition('inv')).toThrowError(
      /invalid well code format. Must be a number/
    );
  });

  it('should return column labels', () => {
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
      '12'
    ];
    expect(wellPlate.columnLabels).toEqual(expected);

    const wellPlateSeq = getWellPlate('3x4', PositionFormat.Sequential);
    expect(wellPlateSeq.columnLabels).toEqual(['1', '2', '3', '4']);
  });

  it('should return row labels', () => {
    const wellPlate = getWellPlate('8x12');
    const expected = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    expect(wellPlate.rowLabels).toEqual(expected);

    const wellPlateSeq = getWellPlate('3x4', PositionFormat.Sequential);
    expect(wellPlateSeq.rowLabels).toEqual(['1', '2', '3']);
  });

  it('set and get data', () => {
    const wellPlate = getWellPlate('8x12');
    wellPlate.setData(4, 'data1');
    wellPlate.setData('B5', 'data2');
    wellPlate.setData({ row: 3, column: 5 }, 'data3');
    expect(wellPlate.getData(10)).toBeUndefined();
    expect(wellPlate.getData(4)).toEqual('data1');
    expect(wellPlate.getData('B5')).toEqual('data2');
    expect(wellPlate.getData({ row: 3, column: 5 })).toEqual('data3');
  });

  it('iterator', () => {
    const wellPlate = getWellPlate('2x2');
    expect([...wellPlate]).toEqual([
      {
        index: 0,
        position: { row: 0, column: 0 },
        code: 'A1',
        data: undefined
      },
      {
        index: 1,
        position: { row: 0, column: 1 },
        code: 'A2',
        data: undefined
      },
      {
        index: 2,
        position: { row: 1, column: 0 },
        code: 'B1',
        data: undefined
      },
      { index: 3, position: { row: 1, column: 1 }, code: 'B2', data: undefined }
    ]);
  });
});

function getWellPlate(
  type: string,
  positionFormat = PositionFormat.LetterNumber
) {
  const result = /^(\d+)x(\d+)$/.exec(type);
  if (!result) {
    throw new Error('wrong type');
  }
  return new WellPlate({
    rows: parseInt(result[1], 10),
    columns: parseInt(result[2], 10),
    positionFormat
  });
}
