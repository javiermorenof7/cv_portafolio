#!/usr/bin/env python3
"""Quita los metadatos (EXIF, XMP, IPTC, comentarios) de imágenes JPEG y PNG.

La imagen no se recomprime: solo se eliminan los bloques de metadatos. En los
JPEG se conserva la orientación, para que la foto no aparezca girada.

Uso: quitar_metadatos.py <archivo> [<archivo> ...]
Imprime la ruta de cada archivo que ha modificado.
"""
import struct
import sys

# APP1 (EXIF y XMP), APP13 (IPTC/Photoshop) y COM (comentario).
JPEG_METADATOS = {0xE1, 0xED, 0xFE}
PNG_METADATOS = {b"eXIf", b"tEXt", b"iTXt", b"zTXt", b"tIME"}


def orientacion_exif(segmento):
    """Devuelve la orientación EXIF del segmento APP1, o None si no la tiene."""
    if segmento[:6] != b"Exif\x00\x00":
        return None
    tiff = segmento[6:]
    orden = "<" if tiff[:2] == b"II" else ">"
    try:
        ifd = struct.unpack(orden + "I", tiff[4:8])[0]
        entradas = struct.unpack(orden + "H", tiff[ifd:ifd + 2])[0]
        for k in range(entradas):
            base = ifd + 2 + 12 * k
            if struct.unpack(orden + "H", tiff[base:base + 2])[0] == 0x0112:
                return struct.unpack(orden + "H", tiff[base + 8:base + 10])[0]
    except struct.error:
        pass
    return None


def exif_minimo(orientacion):
    """Segmento APP1 que solo declara la orientación."""
    tiff = b"MM\x00\x2a\x00\x00\x00\x08" + struct.pack(">HHHIHHI", 1, 0x0112, 3, 1, orientacion, 0, 0)
    cuerpo = b"Exif\x00\x00" + tiff
    return b"\xff\xe1" + struct.pack(">H", len(cuerpo) + 2) + cuerpo


def limpiar_jpeg(datos):
    salida = bytearray(datos[:2])
    i = 2
    orientacion = None
    while i + 4 <= len(datos) and datos[i] == 0xFF and datos[i + 1] != 0xDA:
        marcador = datos[i + 1]
        largo = struct.unpack(">H", datos[i + 2:i + 4])[0]
        segmento = datos[i + 4:i + 2 + largo]
        if marcador in JPEG_METADATOS:
            if marcador == 0xE1 and orientacion is None:
                orientacion = orientacion_exif(segmento)
        else:
            salida += datos[i:i + 2 + largo]
        i += 2 + largo
    salida += datos[i:]
    if orientacion not in (None, 1):
        # Tras el SOI y, si existe, el APP0 (JFIF), que debe ir primero.
        pos = 2
        if salida[2:4] == b"\xff\xe0":
            pos = 4 + struct.unpack(">H", salida[4:6])[0]
        salida[pos:pos] = exif_minimo(orientacion)
    return bytes(salida)


def limpiar_png(datos):
    salida = bytearray(datos[:8])
    i = 8
    while i + 8 <= len(datos):
        largo = struct.unpack(">I", datos[i:i + 4])[0]
        tipo = datos[i + 4:i + 8]
        fin = i + 12 + largo
        if tipo not in PNG_METADATOS:
            salida += datos[i:fin]
        i = fin
    return bytes(salida)


def limpiar(ruta):
    with open(ruta, "rb") as f:
        datos = f.read()
    if datos[:2] == b"\xff\xd8":
        nuevo = limpiar_jpeg(datos)
    elif datos[:8] == b"\x89PNG\r\n\x1a\n":
        nuevo = limpiar_png(datos)
    else:
        return False
    if nuevo == datos:
        return False
    with open(ruta, "wb") as f:
        f.write(nuevo)
    return True


if __name__ == "__main__":
    for ruta in sys.argv[1:]:
        if limpiar(ruta):
            print(ruta)
