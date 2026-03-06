import urllib.request
import urllib.parse
import zlib
import base64
import string
import os

plantuml_alphabet = string.digits + string.ascii_uppercase + string.ascii_lowercase + '-_'
base64_alphabet   = string.ascii_uppercase + string.ascii_lowercase + string.digits + '+/'

# IMPORTANT: base64 returns bytes, so we need a bytes translation table
b64_to_plantuml = bytes.maketrans(base64_alphabet.encode('ascii'), plantuml_alphabet.encode('ascii'))

def encode_plantuml(text) -> str:
    """Encodes PlantUML text into the URL format expected by the PlantUML server."""
    if not isinstance(text, str):
        text = str(text)
        
    zlibbed_str = zlib.compress(text.encode('utf-8'))
    # The first two bytes of zlib compression are the header, which PlantUML expects us to strip
    compressed_string = zlibbed_str[2:-4]
    return base64.b64encode(compressed_string).translate(b64_to_plantuml).decode('utf-8')

def download_plantuml_image(uml_code: str, filename: str) -> str:
    """
    Takes a PlantUML string representation and downloads the rendered PNG
    from the public PlantUML web server. Returns the path to the saved image.
    """
    encoded = encode_plantuml(uml_code)
    url = f"http://www.plantuml.com/plantuml/png/{encoded}"
    
    os.makedirs("app/static/diagrams", exist_ok=True)
    filepath = f"app/static/diagrams/{filename}.png"
    
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
            
        return filepath
    except Exception as e:
        print(f"Failed to generate PlantUML diagram {filename}: {e}")
        return None
