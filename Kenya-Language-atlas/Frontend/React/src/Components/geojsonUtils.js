export function attachCountyLayerHandlers(layer, { popupContent, onSelect, hoverStyle, defaultStyle }) {
  if (!layer || typeof layer.bindPopup !== 'function') return;

  layer.bindPopup(popupContent);

  const supportsStyle = typeof layer.setStyle === 'function';
  const styleLayer = supportsStyle ? layer : null;

  if (styleLayer) {
    layer.on('mouseover', function () {
      styleLayer.setStyle(hoverStyle);
      this.openPopup();
    });

    layer.on('mouseout', function () {
      styleLayer.setStyle(defaultStyle);
      this.closePopup();
    });
  } else {
    layer.on('mouseover', function () {
      this.openPopup();
    });

    layer.on('mouseout', function () {
      this.closePopup();
    });
  }

  layer.on('click', function () {
    onSelect?.();
  });
}
