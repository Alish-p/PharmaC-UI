/**
 * Generate a static map image as a base64 data URL using OpenStreetMap tiles.
 * Draws a simple red marker at the center. Works entirely client-side via canvas.
 *
 * @param {number} lat  - Latitude
 * @param {number} lng  - Longitude
 * @param {number} [zoom=15] - Zoom level (1-18)
 * @param {number} [width=300] - Image width in px
 * @param {number} [height=200] - Image height in px
 * @returns {Promise<string>} base64 data URL (image/png)
 */
export function generateStaticMapImage(lat, lng, zoom = 15, width = 300, height = 200) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Convert lat/lng to fractional tile coordinates
    const n = 2 ** zoom;
    const tileXf = ((lng + 180) / 360) * n;
    const latRad = (lat * Math.PI) / 180;
    const tileYf = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;

    // Pixel offset of the center within its tile (tile = 256px)
    const tileSize = 256;
    const centerTileX = Math.floor(tileXf);
    const centerTileY = Math.floor(tileYf);
    const offsetX = (tileXf - centerTileX) * tileSize;
    const offsetY = (tileYf - centerTileY) * tileSize;

    // How many tiles needed in each direction to fill the canvas
    const tilesX = Math.ceil(width / tileSize) + 1;
    const tilesY = Math.ceil(height / tileSize) + 1;

    let loaded = 0;
    let totalTiles = 0;
    const tiles = [];

    for (let dx = -Math.floor(tilesX / 2); dx <= Math.ceil(tilesX / 2); dx += 1) {
      for (let dy = -Math.floor(tilesY / 2); dy <= Math.ceil(tilesY / 2); dy += 1) {
        const tx = centerTileX + dx;
        const ty = centerTileY + dy;
        if (tx < 0 || ty < 0 || tx >= n || ty >= n) {
          // eslint-disable-next-line no-continue
          continue;
        }
        totalTiles += 1;
        tiles.push({ dx, dy, tx, ty });
      }
    }

    if (totalTiles === 0) {
      // Fallback: just return a blank canvas
      resolve(canvas.toDataURL('image/png'));
      return;
    }

    const drawWhenReady = () => {
      // Draw marker at center
      const cx = width / 2;
      const cy = height / 2;

      // Pin shadow
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, 6, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fill();

      // Pin body (red teardrop shape)
      ctx.beginPath();
      ctx.arc(cx, cy - 12, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#E53935';
      ctx.fill();
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pin point
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 6);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx + 5, cy - 6);
      ctx.fillStyle = '#E53935';
      ctx.fill();

      // White dot in center
      ctx.beginPath();
      ctx.arc(cx, cy - 12, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      resolve(canvas.toDataURL('image/png'));
    };

    tiles.forEach(({ dx, dy, tx, ty }) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Calculate draw position so that the center lat/lng is at the center of the canvas
        const drawX = width / 2 - offsetX + dx * tileSize;
        const drawY = height / 2 - offsetY + dy * tileSize;
        ctx.drawImage(img, drawX, drawY, tileSize, tileSize);
        loaded += 1;
        if (loaded === totalTiles) {
          drawWhenReady();
        }
      };
      img.onerror = () => {
        loaded += 1;
        if (loaded === totalTiles) {
          drawWhenReady();
        }
      };
      img.src = `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`;
    });
  });
}
