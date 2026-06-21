import sys
sys.stdout.reconfigure(encoding='utf-8')
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

def render_puml(puml_path, output_path):
    with open(puml_path, 'r', encoding='utf-8') as f:
        text = f.read()
    encoded = plantuml_encode(text)
    url = f"https://kroki.io/plantuml/png/{encoded}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req, timeout=15)
    with open(output_path, 'wb') as out:
        out.write(response.read())
    size = os.path.getsize(output_path)
    print(f"  OK ({size} bytes)")

puml_path = r"D:\navimart\diagrams\New_Analysis_Class_Diagrams\Module_3_ShoppingList_Detailed.puml"
output_path = r"D:\navimart\diagrams\New_Analysis_Class_Diagrams\images\Module_3_ShoppingList_Detailed.png"
print(f"Rendering: Module_3_ShoppingList_Detailed.puml")
render_puml(puml_path, output_path)

print("\nDone!")
