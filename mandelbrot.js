const canvas = document.getElementById('mandelbrotCanvas');
const ctx = canvas.getContext('2d');
let isDragging = false;
let lastX;
let lastY;

function render() {
    const width = canvas.width;
    const height = canvas.height;
    const imageData = createImageData(width, height);
    drawImageData(imageData);
}

function drawImageData(imageData) {
    ctx.putImageData(imageData, 0, 0);
}

function hexToRgb(hex) {
    hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => {
        return '#' + r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function createImageData(width, height) {
    const imageData = ctx.createImageData(width, height);
    const imageDataArray = imageData.data;

    const maxIterations = 100;
    const escapeRadius = 2;
    const zoom = parseFloat(document.getElementById('zoom').value);
    const offsetX = parseFloat(document.getElementById('shiftX').value);
    const offsetY = parseFloat(document.getElementById('shiftY').value);
    const color = hexToRgb(document.getElementById('color').value);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const cx = (x - width / 2) / zoom - offsetX;
            const cy = (y - height / 2) / zoom - offsetY;
            const c = calculateColor(cx, cy, maxIterations, escapeRadius, color);
            setPixel(imageDataArray, x, y, c);
        }
    }

    return imageData;
}

function calculateColor(cx, cy, maxIterations, escapeRadius, color) {
    let zx = 0;
    let zy = 0;
    let i = 0;

    while (zx * zx + zy * zy < escapeRadius * escapeRadius && i < maxIterations) {
        const temp = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = temp;
        i++;
    }

    if (i === maxIterations) {
        return [0, 0, 0];
    } else {
        const colorValue = color.slice();
        colorValue[0] *= i / maxIterations;
        colorValue[1] *= i / maxIterations;
        colorValue[2] *= i / maxIterations;
        return colorValue;
    }
}

function setPixel(imageDataArray, x, y, color) {
    const pixelIndex = (y * canvas.width + x) * 4;
    imageDataArray[pixelIndex] = color[0];
    imageDataArray[pixelIndex + 1] = color[1];
    imageDataArray[pixelIndex + 2] = color[2];
    imageDataArray[pixelIndex + 3] = 255;
}

function handleMouseDown(event) {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
}

function handleMouseUp() {
    isDragging = false;
}

function handleMouseMove(event) {
    if (!isDragging) return;
    const offsetX = parseFloat(document.getElementById('shiftX').value);
    const offsetY = parseFloat(document.getElementById('shiftY').value);
    const deltaX = (event.clientX - lastX) / parseFloat(document.getElementById('zoom').value);
    const deltaY = (event.clientY - lastY) / parseFloat(document.getElementById('zoom').value);
    document.getElementById('shiftX').value = offsetX + deltaX;
    document.getElementById('shiftY').value = offsetY + deltaY;
    lastX = event.clientX;
    lastY = event.clientY;
    render();
}

function handleWheel(event) {
    const zoomInput = document.getElementById('zoom');
    const currentZoom = parseFloat(zoomInput.value);
    const newZoom = currentZoom * (1 - event.deltaY * 0.001);
    zoomInput.value = Math.max(1, Math.min(5000, newZoom));
    render();
    event.preventDefault();
}

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('wheel', handleWheel);

document.getElementById('zoom').addEventListener('input', render);
document.getElementById('shiftX').addEventListener('input', render);
document.getElementById('shiftY').addEventListener('input', render);

render();
