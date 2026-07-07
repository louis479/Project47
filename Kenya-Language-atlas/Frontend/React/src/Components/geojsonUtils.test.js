import { attachCountyLayerHandlers } from './geojsonUtils';

describe('attachCountyLayerHandlers', () => {
  it('handles layers that do not support setStyle', () => {
    const layer = {
      bindPopup: jest.fn(),
      on: jest.fn(),
      openPopup: jest.fn(),
      closePopup: jest.fn(),
    };

    expect(() => attachCountyLayerHandlers(layer, { popupContent: '<b>Test</b>', onSelect: jest.fn() })).not.toThrow();
  });
});
