from PIL import Image, ImageDraw, ImageFont
import os

def make_icon(size, path):
    img = Image.new('RGBA', (size, size), (10, 10, 15, 255))
    draw = ImageDraw.Draw(img)
    
    # Outer glow circle
    margin = int(size * 0.06)
    draw.ellipse([margin, margin, size-margin, size-margin], 
                 fill=(232, 197, 71, 25), outline=(232, 197, 71, 180), width=max(2, size//64))
    
    # Inner circle
    m2 = int(size * 0.18)
    draw.ellipse([m2, m2, size-m2, size-m2], 
                 fill=(18, 18, 28, 255), outline=(232, 197, 71, 100), width=max(1, size//96))
    
    # "LX" text
    font_size = int(size * 0.32)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "LX"
    bbox = draw.textbbox((0,0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1]
    draw.text((x, y), text, fill=(232, 197, 71, 255), font=font)
    
    img.save(path, 'PNG')
    print(f"✓ {path} ({size}x{size})")

os.makedirs('/home/claude/lifexp/public', exist_ok=True)
make_icon(192, '/home/claude/lifexp/public/icon-192.png')
make_icon(512, '/home/claude/lifexp/public/icon-512.png')
