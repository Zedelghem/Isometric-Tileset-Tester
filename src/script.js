const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let tileWidth = parseInt(document.getElementById("tileWidth").value);
let tileHeight = parseInt(document.getElementById("tileHeight").value);
let spritesheetCrop = parseInt(
  document.getElementById("spritesheetCrop").value,
);
let tileCrop = parseInt(document.getElementById("tileCrop").value);
let tilesetImage;
let grid = [];
let selectedTileIndex = null;

const tileWidthDisplay = document.getElementById("tileWidthValue");
const tileHeightDisplay = document.getElementById("tileHeightValue");
const spritesheetCropDisplay = document.getElementById("spritesheetCropValue");
const tileCropDisplay = document.getElementById("tileCropValue");
const tilesetDisplay = document.getElementById("tilesetDisplay");
const tsvEditor = document.getElementById("tsvEditor");
const saveButton = document.getElementById("saveButton");

document.getElementById("tileWidth").addEventListener("input", () => {
  tileWidth = parseInt(document.getElementById("tileWidth").value);
  tileWidthDisplay.textContent = tileWidth;
  document.getElementById("tileWidthInput").value = tileWidth;
  if (grid.length > 0 && tilesetImage) drawGrid();
  if (tilesetImage) displayTileset();
});

document.getElementById("tileWidthInput").addEventListener("input", () => {
  tileWidth = parseInt(document.getElementById("tileWidthInput").value);
  tileWidthDisplay.textContent = tileWidth;
  document.getElementById("tileWidth").value = tileWidth;
  if (grid.length > 0 && tilesetImage) drawGrid();
  if (tilesetImage) displayTileset();
});

document.getElementById("tileHeight").addEventListener("input", () => {
  tileHeight = parseInt(document.getElementById("tileHeight").value);
  tileHeightDisplay.textContent = tileHeight;
  document.getElementById("tileHeightInput").value = tileHeight;
  if (grid.length > 0 && tilesetImage) drawGrid();
  if (tilesetImage) displayTileset();
});

document.getElementById("tileHeightInput").addEventListener("input", () => {
  tileHeight = parseInt(document.getElementById("tileHeightInput").value);
  tileHeightDisplay.textContent = tileHeight;
  document.getElementById("tileHeight").value = tileHeight;
  if (grid.length > 0 && tilesetImage) drawGrid();
  if (tilesetImage) displayTileset();
});

document.getElementById("spritesheetCrop").addEventListener("input", () => {
  spritesheetCrop = parseInt(document.getElementById("spritesheetCrop").value);
  spritesheetCropDisplay.textContent = spritesheetCrop;
  document.getElementById("spritesheetCropInput").value = spritesheetCrop;
  if (grid.length > 0 && tilesetImage) drawGrid();
  if (tilesetImage) displayTileset();
});

document
  .getElementById("spritesheetCropInput")
  .addEventListener("input", () => {
    spritesheetCrop = parseInt(
      document.getElementById("spritesheetCropInput").value,
    );
    spritesheetCropDisplay.textContent = spritesheetCrop;
    document.getElementById("spritesheetCrop").value = spritesheetCrop;
    if (grid.length > 0 && tilesetImage) drawGrid();
    if (tilesetImage) displayTileset();
  });

document.getElementById("tileCrop").addEventListener("input", () => {
  tileCrop = parseInt(document.getElementById("tileCrop").value);
  tileCropDisplay.textContent = tileCrop;
  document.getElementById("tileCropInput").value = tileCrop;
  if (grid.length > 0 && tilesetImage) drawGrid();
  if (tilesetImage) displayTileset();
});

document.getElementById("tileCropInput").addEventListener("input", () => {
  tileCrop = parseInt(document.getElementById("tileCropInput").value);
  tileCropDisplay.textContent = tileCrop;
  document.getElementById("tileCrop").value = tileCrop;
  if (grid.length > 0 && tilesetImage) drawGrid();
  if (tilesetImage) displayTileset();
});

document.getElementById("fileInput").addEventListener("change", handleFile);
document.getElementById("imageInput").addEventListener("change", handleImage);
saveButton.addEventListener("click", saveGrid);

document
  .getElementById("generateGridButton")
  .addEventListener("click", generateRandomGrid);

document.getElementById("downloadPngButton").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "grid.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

tsvEditor.addEventListener("input", () => {
  const text = tsvEditor.value.trim();
  grid = parseText(text);
  if (tilesetImage) drawGrid();
});

canvas.addEventListener("click", handleCanvasClick);

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const delimiter = detectDelimiter(text);
    const parsedText = text
      .split("\n")
      .map((line) => line.trim().split(delimiter));
    grid = parsedText;
    tsvEditor.value = text.replace(new RegExp(delimiter, "g"), " ");
    if (tilesetImage) drawGrid();
  };
  reader.readAsText(file);
}

function handleImage(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    tilesetImage = new Image();
    tilesetImage.onload = function () {
      displayTileset();
      if (grid.length > 0) drawGrid();
    };
    tilesetImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function parseText(text) {
  return text
    .trim()
    .split("\n")
    .map((line) => line.trim().split(/\s+/));
}

function detectDelimiter(text) {
  const delimiters = [",", "\t", ";", " "];
  const counts = delimiters.map((d) => text.split(d).length - 1);
  const maxCount = Math.max(...counts);
  return delimiters[counts.indexOf(maxCount)];
}

function getEffectiveSpritesheetDimensions() {
  const effectiveWidth = tilesetImage.width - spritesheetCrop * 2;
  const effectiveHeight = tilesetImage.height - spritesheetCrop * 2;
  return { width: effectiveWidth, height: effectiveHeight };
}

function getTilesPerRow() {
  const { width } = getEffectiveSpritesheetDimensions();
  return Math.floor(width / (tileWidth + tileCrop * 2));
}

function drawGrid() {
  const rows = grid.length;
  const cols = grid[0].length;

  const canvasWidth = (cols + 1) * tileWidth;
  const canvasHeight = ((rows + 1) * tileHeight) / 2;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tileIndex = parseInt(grid[row][col]);
      if (!isNaN(tileIndex)) {
        const tilesPerRow = getTilesPerRow();
        const tileCol = tileIndex % tilesPerRow;
        const tileRow = Math.floor(tileIndex / tilesPerRow);

        const sx =
          spritesheetCrop + tileCol * (tileWidth + tileCrop * 2) + tileCrop;
        const sy =
          spritesheetCrop + tileRow * (tileHeight + tileCrop * 2) + tileCrop;

        drawTile(row, col, sx, sy);
      }
    }
  }
}

function drawTile(row, col, sx, sy) {
  const xIso = (col - row) * (tileWidth / 2);
  const yIso = (col + row) * (tileHeight / 4);

  ctx.drawImage(
    tilesetImage,
    sx,
    sy,
    tileWidth,
    tileHeight,
    xIso + canvas.width / 2 - tileWidth / 2,
    yIso,
    tileWidth,
    tileHeight,
  );
}

function displayTileset() {
  tilesetDisplay.innerHTML = "";
  const { width, height } = getEffectiveSpritesheetDimensions();
  const tilesPerRow = Math.floor(width / (tileWidth + tileCrop * 2));
  const rows = Math.floor(height / (tileHeight + tileCrop * 2));
  let tileIndex = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < tilesPerRow; col++) {
      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = tileWidth;
      tileCanvas.height = tileHeight;
      const tileCtx = tileCanvas.getContext("2d");

      const sx = spritesheetCrop + col * (tileWidth + tileCrop * 2) + tileCrop;
      const sy = spritesheetCrop + row * (tileHeight + tileCrop * 2) + tileCrop;

      tileCtx.drawImage(
        tilesetImage,
        sx,
        sy,
        tileWidth,
        tileHeight,
        0,
        0,
        tileWidth,
        tileHeight,
      );

      const tileDiv = document.createElement("div");
      tileDiv.className = "tile";
      tileDiv.appendChild(tileCanvas);
      const label = document.createElement("div");
      label.textContent = `Tile ${tileIndex}`;
      tileDiv.appendChild(label);

      tileDiv.addEventListener("click", () => selectTile(tileIndex, tileDiv));

      tilesetDisplay.appendChild(tileDiv);

      tileIndex++;
    }
  }
}

function selectTile(tileIndex, tileDiv) {
  selectedTileIndex = tileIndex;

  document.querySelectorAll(".tile canvas").forEach((canvas) => {
    canvas.classList.remove("selected-tile");
  });

  tileDiv.querySelector("canvas").classList.add("selected-tile");
}

function handleCanvasClick(event) {
  if (selectedTileIndex === null) return;

  const canvasRect = canvas.getBoundingClientRect();
  const x = event.clientX - canvasRect.left;
  const y = event.clientY - canvasRect.top;

  const col = Math.floor(x / tileWidth);
  const row = Math.floor((y - (col * tileHeight) / 2) / (tileHeight / 2));

  if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
    grid[row][col] = selectedTileIndex;
    tsvEditor.value = grid.map((row) => row.join(" ")).join("\n");
    drawGrid();
  }
}

function saveGrid() {
  const tsvContent = grid.map((row) => row.join("\t")).join("\n");
  const blob = new Blob([tsvContent], { type: "text/tab-separated-values" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "grid.tsv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateRandomGrid() {
  const rows = 20;
  const cols = 20;
  const tilesPerRow = getTilesPerRow();
  const { height } = getEffectiveSpritesheetDimensions();
  const totalRows = Math.floor(height / (tileHeight + tileCrop * 2));
  const totalTiles = tilesPerRow * totalRows;

  grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () =>
      Math.floor(Math.random() * Math.max(totalTiles, 1)),
    ),
  );
  tsvEditor.value = grid.map((row) => row.join(" ")).join("\n");
  drawGrid();
}
