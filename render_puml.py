import zlib
import urllib.request
import os

def plantuml_encode(text):
    compressed = zlib.compress(text.encode('utf-8'))[2:-4]
    return _encode64(compressed)

def _encode6bit(b):
    if b < 10: return chr(48 + b)
    b -= 10
    if b < 26: return chr(65 + b)
    b -= 26
    if b < 26: return chr(97 + b)
    b -= 26
    if b == 0: return '-'
    if b == 1: return '_'
    return '?'

def _append3bytes(b1, b2, b3):
    c1 = b1 >> 2
    c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
    c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
    c4 = b3 & 0x3F
    return _encode6bit(c1&0x3F) + _encode6bit(c2&0x3F) + _encode6bit(c3&0x3F) + _encode6bit(c4&0x3F)

def _encode64(data):
    r = ""
    for i in range(0, len(data), 3):
        if i+2 < len(data): r += _append3bytes(data[i], data[i+1], data[i+2])
        elif i+1 < len(data): r += _append3bytes(data[i], data[i+1], 0)
        else: r += _append3bytes(data[i], 0, 0)
    return r

SERVERS = [
    "https://kroki.io/plantuml/png/",
    "http://www.plantuml.com/plantuml/png/",
    "https://plantuml.gitlab-static.net/png/",
]

def render_puml(puml_path, output_path):
    with open(puml_path, 'r', encoding='utf-8') as f:
        text = f.read()
    encoded = plantuml_encode(text)
    
    for server in SERVERS:
        url = f"{server}{encoded}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req, timeout=15)
            with open(output_path, 'wb') as out:
                out.write(response.read())
            size = os.path.getsize(output_path)
            print(f"  OK via {server.split('/')[2]} ({size} bytes)")
            return True
        except Exception as e:
            print(f"  Failed {server.split('/')[2]}: {e}")
    return False

puml_dir = r"D:\navimart\diagrams\Usecase"
output_dir = r"D:\navimart\diagrams\Usecase\images"
os.makedirs(output_dir, exist_ok=True)

puml_files = sorted([f for f in os.listdir(puml_dir) if f.endswith('.puml')])

for puml_file in puml_files:
    puml_path = os.path.join(puml_dir, puml_file)
    png_name = puml_file.replace('.puml', '.png')
    output_path = os.path.join(output_dir, png_name)
    print(f"Rendering: {puml_file}")
    render_puml(puml_path, output_path)

print(f"\nDone!")
