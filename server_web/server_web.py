import socket
import gzip
from pathlib import Path

TIPURI_MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.otf': 'font/otf',
    '.xml': 'application/xml',
    '.json': 'application/json',
    '.dtd': 'application/xml-dtd'
}

def determinare_mime(cale):
    extensie = Path(cale).suffix.lower()
    return TIPURI_MIME.get(extensie, 'application/octet-stream')

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_socket.bind(('', 5678))
server_socket.listen(5)

while True:
    print('#########################################################################')
    print('Serverul asculta potentiali clienti')

    client_socket, address = server_socket.accept()
    print('S-a conectat un client de la adresa:', address)

    cerere = ''
    linieDeStart = ''

    while True:
        data = client_socket.recv(1024)

        if not data:
            print("Clientul a inchis conexiunea!")
            break

        cerere += data.decode(errors='ignore')

        print('S-a citit mesajul:\n---------------------------\n' + cerere + '\n---------------------------')

        pozitie = cerere.find('\r\n')
        if pozitie > -1:
            linieDeStart = cerere[:pozitie]
            print('Linie start:', linieDeStart)
            break

    sir_interpretat = linieDeStart.split(' ')

    if len(sir_interpretat) < 3:
        print("Cerere HTTP invalida:", linieDeStart)
        client_socket.close()
        continue

    metoda, resursa, versiune = sir_interpretat

    if metoda != 'GET':
        raspuns = (
            'HTTP/1.1 405 Method Not Allowed\r\n'
            'Content-Length: 0\r\n'
            'Connection: close\r\n\r\n'
        ).encode()
        client_socket.sendall(raspuns)
        client_socket.close()
        continue

    if versiune != 'HTTP/1.1':
        raspuns = (
            'HTTP/1.1 505 HTTP Version Not Supported\r\n'
            'Content-Length: 0\r\n'
            'Connection: close\r\n\r\n'
        ).encode()
        client_socket.sendall(raspuns)
        client_socket.close()
        continue

    if resursa == '/':
        resursa = '/index.html'

    BASE_DIR = (Path(__file__).resolve().parent.parent / 'continut').resolve()
    cale_fisier = (BASE_DIR / resursa.lstrip('/')).resolve()

    if not str(cale_fisier).startswith(str(BASE_DIR)):
        raspuns = (
            'HTTP/1.1 403 Forbidden\r\n'
            'Content-Length: 0\r\n'
            'Connection: close\r\n\r\n'
        ).encode()
        client_socket.sendall(raspuns)
        client_socket.close()
        continue

    if cale_fisier.exists() and cale_fisier.is_file():
        with open(cale_fisier, 'rb') as f:
            continut = f.read()

        tip_mime = determinare_mime(str(cale_fisier))

        accepta_gzip = 'Accept-Encoding: gzip' in cerere

        tipuri_compresabile = [
            'text/',
            'application/javascript',
            'application/json',
            'application/xml'
        ]

        foloseste_gzip = accepta_gzip and any(tip_mime.startswith(t) for t in tipuri_compresabile)

        if foloseste_gzip:
            continut = gzip.compress(continut)
            encoding_header = 'Content-Encoding: gzip\r\n'
        else:
            encoding_header = ''

        antet = (
            'HTTP/1.1 200 OK\r\n'
            f'Content-Type: {tip_mime}\r\n'
            f'Content-Length: {len(continut)}\r\n'
            f'{encoding_header}'
            'Server: ServerWeb-PW-2025\r\n'
            'Connection: close\r\n'
            '\r\n'
        ).encode()

        raspuns = antet + continut
        print('Raspuns: 200 OK -', tip_mime, '(gzip)' if foloseste_gzip else '')

    else:
        corp = b'<h1>404 Not Found</h1><p>Resursa ceruta nu exista.</p>'
        antet = (
            'HTTP/1.1 404 Not Found\r\n'
            'Content-Type: text/html; charset=utf-8\r\n'
            f'Content-Length: {len(corp)}\r\n'
            'Server: ServerWeb-PW-2025\r\n'
            'Connection: close\r\n'
            '\r\n'
        ).encode()

        raspuns = antet + corp
        print('Raspuns: 404 Not Found -', cale_fisier)

    client_socket.sendall(raspuns)
    client_socket.close()
    print('Conexiune inchisa.')