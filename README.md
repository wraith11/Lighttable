# LightTable Ultimate

> ## ⚠️ AI-Generierte Software / AI-Generated Software
>
> Dieses Projekt wurde **überwiegend mit Unterstützung von KI (Large Language Models) erstellt** – einschließlich großer Teile des Quellcodes, der Architektur und dieses Dokuments. Es ist das Ergebnis einer Zusammenarbeit zwischen dem Autor und KI-gestützten Entwicklungswerkzeugen. Die Logik einzelner komplexer Systeme (z.&nbsp;B. Fog-of-War-Grundsystem, Mauer-Überlappungs-Lösung) basiert auf Ideen des Autors und wurde mit KI umgesetzt und gepflegt.

**LightTable Ultimate** ist ein interaktives Virtual Tabletop (VTT) für Pen&Paper-Runden. Es wird per Beamer von oben auf den Spieltisch projiziert und verwandelt den physischen Tisch in eine lebendige Spielwelt.

- **GM-Ansicht** zum Bauen und Steuern der Karte (im Browser des Spielleiters).
- **Player-Ansichten**, die einfach über den Browser geöffnet werden – z.&nbsp;B. auf einem Android-TV-Stick am Beamer.
- **Betriebssystem-unabhängig** (alles läuft im Browser, Server ist Python).
- **IR-Blob-Tracking** mit Kamera, um echte Miniaturen auf dem Tisch automatisch zu verfolgen.

---

## Features

### Editor
- **Ebenen-System** – Objekte/Wände/Säulen werden über einen Z-Index gerendert und können zwischen Hintergrund und Vordergrund verschoben werden (`mapLow`, `objectsHigh`).
- **Asset-Manager** – heruntergeladene Assets (z.&nbsp;B. von *Forgotten Adventures*) werden über einen Ordner-Browser verwaltet, in Unterordner sortiert und per Klick oder Drag & Drop platziert.
- **Mauern & Säulen** – zeichnbare Wände (frei oder gebogen, mit Textur/Breite) und polygonale Säulen. Wände können „unsichtbar“ sein und dienen dann als Sicht-/Kollisionsblocker.
- **Beleuchtungssystem** – platzierbare Lichtquellen mit Radius, Helligkeit, Falloff, Farbe, Flacker-Effekt und Licht-Icons. Tag/Nacht-Umschaltung mit weichem Übergang.
- **Zeichenwerkzeuge** – Pinsel (Strich), Rechteck, Kreis und Raster-Füllung, jeweils mit Farbe oder Textur.
- **Hintergrundbild** – hochladbares Kartenbild mit Skalierung, Wiederholung und Position.
- **Raster & Snapping** – einstellbares Grid, magnetisches Ausrichten beim Platzieren und Bewegen.

### Sicht & Fog of War (FoW)
- **GM-Ansicht + Player-Ansicht** – der GM sieht alles und kann die Player-Sicht frei verschieben; die Player sehen nur ihren Bildausschnitt.
- **Fog of War** in zwei Modi:
  - **Modus 2 (temporär):** nur der aktuelle Sichtbereich ist sichtbar.
  - **Modus 1 (permanent):** erkundete Gebiete bleiben aufgedeckt („Memory“).
- **Sichtberechnung** basierend auf Wänden/Säulen (echte Verdeckung, keine künstliche Durchdringung) mit weichem Sichtrand pro Token mit Vision.
- **FoW-Pinsel** zum manuellen Aufdecken/Verbergen.

### Figuren-Tracking (Blob Tracking)
- **IR-Kamera-Tracking:** Kamera mit IR-Filter-Linse + IR-Emittern; Figuren tragen kleine Reflektorflächen.
- **Korrekturoptionen:** Threshold/Binarisierung, Merge-Distance, Min/Max-Area, Hotspot-Kompensation, Parallax-Korrektur, Smoothing, Flip X/Y.
- **Kamera-Kalibrierung** über vier verschiebbare Eckpunkte in einer Live-Vorschau.
- **Blob-Verfolgung** mit Anker-/Teleport-Logik, ID-Zuordnung, Verlust- und Wiederfinden-Handling.
- **Token** mit Größe, Farbe/Spotlight, Namen, HP-Anzeige, Ringen mit Text, Vision-Reichweite und Blink-Funktion.

### Player-Ansicht / Blackout / Medien
- **Blackout-Funktion:** sofortiges Abdunkeln der Player-Sicht, damit der GM unbemerkt vorbereiten kann.
- **Media-System:** Bilder und Videos über die Blackout-Funktion in **Full**, **Split** oder **Quad**-Aufteilung abspielen – inkl. Flip und Loop pro Slot.
- **Status-Infos & Namen**, die neben Figuren projiziert werden.

---

## Installation & Start

**Voraussetzungen:** Python 3.8+, OpenCV, eine Webcam (möglichst mit IR-Filter), ein Browser.

```bash
# Abhängigkeiten installieren
pip install aiohttp python-socketio opencv-python numpy

# Server starten
python lighttable.py
```

Beim Start werden automatisch die Ordner `assets/`, `maps/` und `media/` angelegt.

- **GM-Ansicht:** öffnet sich automatisch im Browser → `http://localhost:8080/?view=gm`
- **Player-Ansicht:** `http://<IP-des-Rechners>:8080/` (z.&nbsp;B. auf einem Android-TV-Browser)

Die lokale IP-Adresse wird im Settings-Tab angezeigt.

---

## Bedienung (Kurzübersicht)

| Aktion | Eingabe |
|--------|---------|
| Werkzeug wählen | Sidebar-Tabs (Tools, Tokens, Map, Settings) |
| Ansicht verschieben (GM) | Rechte Maustaste + ziehen |
| Zoomen (GM) | Mausrad |
| Objekt platzieren | Asset anklicken (Stempel) oder per Drag & Drop auf die Karte |
| Objekt bewegen | Auswählen + ziehen |
| Objekt skalieren | Auswählen + Eckgriff ziehen, oder Breite/Höhe im Kontextmenü |
| Objekt drehen | Rotationsgriff über dem Objekt |
| Mauer zeichnen | Wand-Werkzeug, ziehen für Start/Ende |
| Kamera kalibrieren | Settings → Kamera Setup |

---

## Projektstruktur

```
Lighttable/
├── lighttable.py          # Python-Server (aiohttp + Socket.IO + OpenCV-Tracking)
├── index.html             # Vue-UI (GM- & Player-Ansicht)
├── css/style.css          # Styling
├── js/
│   ├── app.js             # Vue-App, Socket-Events, Lifecycle
│   ├── state.js           # Initialer UI- & Scene-State
│   ├── renderer.js        # PixiJS-Renderer (Karte, Licht, FoW, Tokens)
│   ├── interactions.js    # Maus/Tastatur-Interaktionen
│   ├── core-methods.js    # UI-Aktionen & Scene-Logik
│   ├── socket-client.js   # Socket.IO-Instanz
│   └── utils.js           # Geometrie/Sichtbarkeits-Helfer
├── assets/                # Hochgeladene/verwaltete Assets (automatisch)
├── media/                 # Bilder/Videos für Blackout (automatisch)
└── maps/                  # Gespeicherte Karten (.json, automatisch)
```

**Technologien:** Python (aiohttp, Socket.IO, OpenCV) · JavaScript (Vue 3, PixiJS 7, iro.js) · WebGL.

---

## Hinweise & Grenzen

- **Flackern ist teuer:** Lichtquellen mit Flacker-Effekt aktivieren einen dauerhaften Render-Loop – bewusst so gelassen.
- Beim **Laden einer Karte** wird der Blackout automatisch aktiviert, damit der GM vorbereiten kann, ohne den Spielern etwas zu spoilern.
- Der Server ist für den Betrieb im **lokalen Netzwerk** gedacht. Beim Einsatz in ungesicherten Netzen sollte er hinter einem Reverse-Proxy mit Authentifizierung laufen.
- Das Tracking setzt einen stabilen Kontrast (IR-Reflektoren) und eine ruhige Beleuchtung voraus.

---

## Lizenz

Derzeit ist keine Lizenz hinterlegt. Bei Verwendung bitte zuerst den Autor kontaktieren.