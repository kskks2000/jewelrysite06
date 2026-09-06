"""Rebuild AUQUE web images and silent mood film from preserved source PNGs.

Requires Python 3, Pillow, imageio-ffmpeg, numpy. Locally installed dependencies
are read from ./tooldeps. Run: python build_auque_media.py
Web copies receive only resizing and compression. Creative compositing is
confined to film frames, which are never written over the source photographs.
"""
from pathlib import Path
import json
import math
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'tooldeps'))
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
import imageio_ffmpeg

SOURCE = ROOT / 'originals'
FILES = {
    'hero': 'palace-muse.png',
    'necklace': 'la-couronne.png',
    'watch': 'heure-doree.png',
    'perfume': 'le-desir.png',
}
WEB = ROOT.parent / 'public' / 'images'
WEB.mkdir(exist_ok=True)
W, H, FPS = 1920, 1080, 30
CLIP_SECONDS, DISSOLVE_SECONDS = 4.4, 1.0
CLIP_FRAMES = round(CLIP_SECONDS * FPS)
OVERLAP = round(DISSOLVE_SECONDS * FPS)
STEP = CLIP_FRAMES - OVERLAP
TOTAL = 5 * CLIP_FRAMES - 4 * OVERLAP
FILM = ROOT.parent / 'public' / 'films' / 'auque-desire.mp4'

sources = {key: Image.open(SOURCE / name).convert('RGB') for key, name in FILES.items()}
manifest = {'film': str(FILM), 'web_images': {}}
for key, im in sources.items():
    cap = 1920 if key == 'hero' else 1200
    size = (min(cap, im.width), round(im.height * min(1, cap / im.width)))
    delivery = im.resize(size, Image.Resampling.LANCZOS) if size != im.size else im.copy()
    stem = Path(FILES[key]).stem
    jpg = WEB / f'{stem}.jpg'
    webp = WEB / f'{stem}.webp'
    delivery.save(jpg, 'JPEG', quality=92, subsampling=0, optimize=True, progressive=True)
    delivery.save(webp, 'WEBP', quality=92, method=6)
    manifest['web_images'][key] = {
        'source': str(SOURCE / FILES[key]), 'width': size[0], 'height': size[1],
        'jpeg': str(jpg), 'jpeg_bytes': jpg.stat().st_size,
        'webp': str(webp), 'webp_bytes': webp.stat().st_size,
    }
    print(f'Web image ready: {key}, {size[0]}x{size[1]}', flush=True)


def film_plate(key):
    """Portrait scenes retain their complete object within a softened backdrop."""
    src = sources[key]
    if key == 'hero':
        return ImageOps.fit(src, (W, H), Image.Resampling.LANCZOS)
    background = ImageOps.fit(src, (W, H), Image.Resampling.LANCZOS)
    background = background.filter(ImageFilter.GaussianBlur(46))
    background = Image.blend(background, Image.new('RGB', (W, H), '#e9dfcf'), 0.22)
    portrait = ImageOps.contain(src, (W, H), Image.Resampling.LANCZOS)
    # The unobtrusive feather joins the original palace photograph to the
    # blurred photographic backdrop, without changing the product itself.
    width, height = portrait.size
    xx = np.arange(width)
    edge = np.minimum(xx, width - 1 - xx).astype(np.float32)
    mask_row = (np.clip(edge / 68.0, 0, 1) * 255).astype(np.uint8)
    mask = Image.fromarray(np.tile(mask_row, (height, 1)), 'L')
    background.paste(portrait, ((W-width)//2, (H-height)//2), mask)
    return background


plates = [film_plate(key) for key in ('hero', 'necklace', 'watch', 'perfume', 'hero')]


def ease(value):
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


def moving_frame(scene, frame):
    fraction = ease(frame / (CLIP_FRAMES-1))
    # Gentle opposing movements avoid a repetitive slideshow rhythm.
    scale = (1.045 - 0.045*fraction) if scene % 2 else (1 + 0.045*fraction)
    cw, ch = W / scale, H / scale
    center_x = W * (0.51 if scene in (0, 4) else 0.5)
    center_y = H * (0.49 + 0.02*fraction)
    left = max(0, min(W-cw, center_x-cw/2))
    top = max(0, min(H-ch, center_y-ch/2))
    return plates[scene].transform((W, H), Image.Transform.EXTENT,
            (left, top, left+cw, top+ch), Image.Resampling.BICUBIC)


serif = ImageFont.truetype('C:/Windows/Fonts/BOD_R.TTF', 132)
tagline = ImageFont.truetype('C:/Windows/Fonts/GARA.TTF', 39)
small = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 17)


def spaced_text(draw, xy, text, font, fill, spacing):
    x, y = xy
    for character in text:
        draw.text((x, y), character, font=font, fill=fill)
        x += draw.textlength(character, font=font) + spacing


def title_layer(opacity):
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    dark = (54, 43, 31, round(255*opacity))
    muted = (88, 72, 52, round(240*opacity))
    spaced_text(draw, (142, 331), 'AUQUE', serif, dark, 13)
    draw.line((146, 500, 435, 500), fill=(126, 98, 60, round(180*opacity)), width=1)
    draw.text((146, 535), 'The Art of Desire', font=tagline, fill=dark)
    spaced_text(draw, (147, 601), 'HAUTE CREATION', small, muted, 4)
    return layer


ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
args = [ffmpeg, '-hide_banner', '-y', '-f', 'rawvideo', '-vcodec', 'rawvideo',
        '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
        '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
        '-metadata', 'title=AUQUE | The Art of Desire',
        '-metadata', 'comment=Silent image-based editorial mood film', str(FILM)]
log_path = ROOT / 'ffmpeg-render.log'
with log_path.open('w', encoding='utf-8') as log:
    encoder = subprocess.Popen(args, stdin=subprocess.PIPE, stderr=log)
    try:
        for frame_number in range(TOTAL):
            scene = min(4, frame_number // STEP)
            local = frame_number - scene * STEP
            current = moving_frame(scene, local)
            if scene > 0 and local < OVERLAP:
                previous = moving_frame(scene-1, STEP+local)
                current = Image.blend(previous, current, ease(local / OVERLAP))
            seconds = frame_number / FPS
            alpha = 0.0
            if seconds < 4.0:
                alpha = ease((seconds-0.3)/0.85) * (1-ease((seconds-3.1)/0.8))
            if seconds >= 14.3:
                alpha = ease((seconds-14.3)/1.0)
            if alpha > 0:
                current = Image.alpha_composite(current.convert('RGBA'), title_layer(alpha)).convert('RGB')
            # A brief cinematic fade in and out provides a clean loop boundary.
            exposure = min(ease(seconds/0.45), ease((TOTAL/FPS-seconds)/0.65))
            if exposure < 1:
                current = Image.blend(Image.new('RGB', (W, H), '#efe7d8'), current, exposure)
            if frame_number in (60, 165, 267, 369, 480):
                current.save(ROOT / f'film-check-{frame_number:03}.jpg', quality=88)
            encoder.stdin.write(current.tobytes())
            if frame_number % 90 == 0:
                print(f'Film frames: {frame_number}/{TOTAL}', flush=True)
        encoder.stdin.close()
        returncode = encoder.wait()
        if returncode:
            raise RuntimeError(f'ffmpeg failed with code {returncode}; see {log_path}')
    except BaseException:
        encoder.kill()
        raise

# Decode the finished file completely, with ffmpeg's metadata retained as QA.
verification = subprocess.run([ffmpeg, '-hide_banner', '-i', str(FILM),
        '-map', '0:v:0', '-f', 'null', '-'], capture_output=True, text=True)
(ROOT / 'verification.txt').write_text(verification.stderr, encoding='utf-8')
if verification.returncode:
    raise RuntimeError('Full video decode failed; see verification.txt')
metadata_reader = imageio_ffmpeg.read_frames(str(FILM), pix_fmt='rgb24')
metadata = next(metadata_reader)
metadata_reader.close()
assert tuple(metadata['size']) == (W, H), metadata
assert abs(metadata['duration'] - TOTAL/FPS) < 0.1, metadata
assert metadata['codec'] == 'h264', metadata
manifest['video'] = {
    'codec': metadata['codec'], 'width': W, 'height': H, 'fps': FPS,
    'frames': TOTAL, 'duration_seconds': metadata['duration'],
    'pixel_format': 'yuv420p', 'audio': False,
    'bytes': FILM.stat().st_size, 'full_decode_verified': True,
    'scenes': ['hero', 'necklace', 'watch', 'perfume', 'hero'],
}
(ROOT / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(json.dumps(manifest['video'], indent=2), flush=True)
print(f'Completed: {FILM}', flush=True)
