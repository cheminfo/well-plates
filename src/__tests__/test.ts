import { WellPlate } from '..';

describe('WellPlate', () => {
  it('invalid construction', () => {
    expect(() => new WellPlate('inv')).toThrowError(/invalid well plate type/);
  });
  it('getPositionCode', () => {
    const wellPlate = new WellPlate(4, 6);
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
    const wellPlate = new WellPlate('9x9');
    expect(wellPlate.getPositionCode(55)).toEqual('56');
    expect(wellPlate.getPositionCode({ row: 2, column: 5 })).toEqual('24');
    expect(() => wellPlate.getPositionCode({ row: 7, column: 9 })).toThrowError(
      /well position is out of range/
    );
  });

  it('getCodeRange', () => {
    const wellPlate = new WellPlate('4x6');
    expect(wellPlate.getPositionCodeRange(16, 5)).toEqual([
      'C5',
      'C6',
      'D1',
      'D2',
      'D3'
    ]);
  });

  it('getPosition', () => {
    const wellPlate = new WellPlate('4x6');
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

  it('getPosition Sequential format', () => {
    const wellPlate = new WellPlate('9x9');
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
});
