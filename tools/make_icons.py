"""Gera os ícones do app (pixel art) em icons/. Uso: python3 tools/make_icons.py"""
from PIL import Image

N = 32
SKY = ['#1d6fd8', '#2a8cf0', '#29adff', '#5cc4ff', '#8fd8ff', '#c7f0ff']
LIGHT, BODY, SHADE, HEAD, HEADD = '#f6dca0', '#e8c27a', '#b8894a', '#d8342c', '#7a1a16'


def hexc(c):
    return tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,)


def draw(scale_content=1.0):
    img = Image.new('RGBA', (N, N))
    px = img.load()
    for y in range(N):
        for x in range(N):
            px[x, y] = hexc(SKY[min(5, y * 6 // N)])
    # sol
    for y in range(3, 8):
        for x in range(3, 8):
            if (x - 5) ** 2 + (y - 5) ** 2 <= 5:
                px[x, y] = hexc('#ffec27')
    # chão
    for y in range(27, N):
        for x in range(N):
            px[x, y] = hexc('#00e436' if y == 27 else '#008751' if y == 28 else ('#6a3a20' if (x + y) % 3 else '#5a3018'))

    def put(x, y, c):
        if 0 <= x < N and 0 <= y < N and c:
            px[x, y] = hexc(c)

    # torre oblíqua: L=12 (comprimento), D=6 (profundidade), camadas de 2px
    L, D, X0, base = 12, 6, 7, 26
    layers = 8
    for i in range(layers):
        yb = base - i * 2
        if i % 2 == 0:  # palitos ao longo de X (fundo e frente)
            for oz in (D - 1, 1):
                hl = (i // 2) % 2 == 0
                for x in range(L):
                    head = x < 2 if hl else x >= L - 2
                    put(X0 + oz + x, yb - oz - 1, HEAD if head else LIGHT)
                    put(X0 + oz + x, yb - oz, HEADD if head else SHADE)
        else:  # palitos ao longo de Z (diagonal)
            for k, xb in enumerate((1, L - 3)):
                near = ((i // 2) + k) % 2 == 0
                for j in range(D):
                    head = j < 1 if near else j >= D - 1
                    put(X0 + xb + j, yb - j - 1, HEAD if head else LIGHT)
                    put(X0 + xb + j, yb - j, HEADD if head else BODY)
                    put(X0 + xb + j + 1, yb - j, HEADD if head else SHADE)
    # bandeira no canto mais alto da torre
    fx, ftop = X0 + L - 3 + D, base - (layers - 1) * 2 - D
    for y in range(ftop - 6, ftop):
        put(fx, y, '#5f574f')
    for y in range(ftop - 6, ftop - 3):
        for x in range(fx + 1, fx + 4 - (y - (ftop - 6))):
            put(x, y, '#ff004d')
    return img


def save(size, name, pad=0):
    img = draw()
    if pad:
        # versão "maskable": arte reduzida dentro da área segura, fundo céu
        inner = size - 2 * pad
        big = img.resize((inner, inner), Image.NEAREST)
        out = Image.new('RGBA', (size, size), hexc(SKY[2]))
        out.paste(big, (pad, pad))
    else:
        out = img.resize((size, size), Image.NEAREST)
    out.convert('RGB').save('icons/' + name, optimize=True)


save(180, 'apple-touch-icon.png')
save(192, 'icon-192.png')
save(512, 'icon-512.png')
save(512, 'icon-maskable-512.png', pad=64)
save(32, 'favicon-32.png')
print('ok')
