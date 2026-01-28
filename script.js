const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const dropZone = document.getElementById('dropZone');
const imageInput = document.getElementById('imageInput');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const fontSizeInput = document.getElementById('fontSize');
const textColorInput = document.getElementById('textColor');
const stickerModeInput = document.getElementById('stickerMode');
const downloadBtn = document.getElementById('downloadBtn');
const downloadMemeBtn = document.getElementById('downloadMemeBtn');

let currentImage = null;

// Initial state
canvas.width = 512;
canvas.height = 512;

// Event Listeners for Controls
[topTextInput, bottomTextInput, fontSizeInput, textColorInput, stickerModeInput].forEach(el => {
    el.addEventListener('input', drawMeme);
});

// Drag and Drop
dropZone.addEventListener('click', () => imageInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--primary)';
    dropZone.style.background = 'rgba(15, 23, 42, 0.6)';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '';
    dropZone.style.background = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '';
    dropZone.style.background = '';

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadImage(e.dataTransfer.files[0]);
    }
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        loadImage(e.target.files[0]);
    }
});

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            dropZone.classList.add('hidden');
            drawMeme();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function drawMeme() {
    if (!currentImage) return;

    const isStickerMode = stickerModeInput.checked;
    const padding = 20;

    // Canvas sizing
    if (isStickerMode) {
        // WhatsApp Sticker Standard
        canvas.width = 512;
        canvas.height = 512;
    } else {
        // Original Ratio (limited to max view width logic handled by CSS, but here actual pixels)
        // Limit max width to avoid massive canvases
        const maxWidth = 1200;
        let w = currentImage.width;
        let h = currentImage.height;

        if (w > maxWidth) {
            h = (h / w) * maxWidth;
            w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
    }

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Image
    if (isStickerMode) {
        // "Contain" logic for sticker
        const scale = Math.min(canvas.width / currentImage.width, canvas.height / currentImage.height);
        const x = (canvas.width / 2) - (currentImage.width / 2) * scale;
        const y = (canvas.height / 2) - (currentImage.height / 2) * scale;

        // Optional: Rounded corners? No, standard stickers are usually just the image.
        ctx.drawImage(currentImage, x, y, currentImage.width * scale, currentImage.height * scale);
    } else {
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    }

    // Text Configuration
    const fontSize = fontSizeInput.value;
    ctx.fillStyle = textColorInput.value;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = Math.max(2, fontSize / 15);
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';

    // We use Impact because it is THE meme font. Fallback to sans-serif.
    ctx.font = `900 ${fontSize}px "Impact", "Arial Black", "sans-serif"`;

    // Draw Top Text
    if (topTextInput.value) {
        ctx.textBaseline = 'top';
        const textX = canvas.width / 2;
        const textY = padding;

        // Stroke first
        ctx.strokeText(topTextInput.value.toUpperCase(), textX, textY);
        // Fill second
        ctx.fillText(topTextInput.value.toUpperCase(), textX, textY);
    }

    // Draw Bottom Text
    if (bottomTextInput.value) {
        ctx.textBaseline = 'bottom';
        const textX = canvas.width / 2;
        const textY = canvas.height - padding;

        ctx.strokeText(bottomTextInput.value.toUpperCase(), textX, textY);
        ctx.fillText(bottomTextInput.value.toUpperCase(), textX, textY);
    }
}

function downloadImage(format) {
    if (!currentImage) {
        alert('Upload gambar dulu bang!');
        return;
    }

    const link = document.createElement('a');

    if (format === 'webp') {
        link.download = `meme-sticker-${Date.now()}.webp`;
        link.href = canvas.toDataURL('image/webp', 0.8); // 0.8 quality to try to keep size down
    } else {
        link.download = `meme-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
    }

    link.click();
}

downloadBtn.addEventListener('click', () => downloadImage('webp'));
downloadMemeBtn.addEventListener('click', () => downloadImage('png'));
