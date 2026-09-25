<p align="center">
  <img src="docs/images/banner.svg" alt="ScryTable" width="100%" style="border-radius:8px;">
</p>

> 🌐 **Sprache / Language:** [Deutsch](README.de.md) · [English](README.md)

**ScryTable** ist ein interaktives Virtual Tabletop (VTT) für Pen&Paper-Runden. Es wird per Beamer von oben auf den Spieltisch projiziert und verwandelt den physischen Tisch in eine lebendige Spielwelt.

- **GM-Ansicht** zum Bauen und Steuern der Karte (im Browser des Spielleiters).
- **Player-Ansichten**, die einfach über den Browser geöffnet werden – z.&nbsp;B. auf einem Android-TV-Stick am Beamer.
- **Betriebssystem-unabhängig** (alles läuft im Browser, Server ist Python).
- **IR-Blob-Tracking** mit Kamera, um echte Miniaturen auf dem Tisch automatisch zu verfolgen.
- **Mehrsprachig** – Englisch (Standard) und Deutsch.

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
- **Token** mit Größe, Farbe/Spotlight, Namen, Ringen mit Text, Vision-Reichweite und Blink-Funktion.

### Turn-basierte Korrektur (Stabilisierung der Blob-Zuordnung)
Das Basis-Tracking funktioniert gut, wenn sich eine Figur bewegt und andere dabei kurz verdeckt
werden. Bewegt sich jedoch mehr als eine Figur, während Blobs verdeckt sind, kann die
Greedy-Teleport-Logik des Trackers Blob-IDs vertauschen (die Kamera sieht keine Identität).
Dafür liegt eine **konservative Korrekturschicht** über dem Tracking:

- Sie erfasst kontinuierlich die Positionen der sichtbaren Blobs („Snapshot“).
- Wird eine Störung erkannt (ein Blob verschwindet), wird der Snapshot eingefroren.
- Sobald **alle** Blobs wieder sichtbar sind, wird „vorher“ mit „nachher“ verglichen:
  - Blob an derselben Position → unverändert, gehört weiter zum selben Token.
  - Blob an einer neuen Position → gehört zu dem Token, dessen alter Blob verschwunden ist
    (diese Figur wurde bewegt).
- Es werden **nur Blob-IDs permutiert** (nie neue erzeugt, nie gelöscht) → die ID-Menge bleibt
  stabil, der Client erzeugt/löscht dadurch **keine** Tokens (kein Hin- und Herspringen).
- Unbewegte / nie verdeckte Figuren werden nie angefasst.
- **Mehrdeutigkeit (Verwechslungsgefahr):** Wenn sich mehrere Blobs in einem **engen Bereich**
  bewegt haben (dichtes Figuren-Cluster), ist die Zuordnung unklar. Dann wird die wahrscheinlichste
  Variante (minimale Gesamtbewegung) angenommen, dem GM ein Hinweis „unsicher“ angezeigt und ein
  Button **„Alternative anwenden“** angeboten – der bei genau 2 bewegten Blobs die einzig andere
  Verteilung (Tausch der beiden Tokens) sofort anwendet. Bewegungen in **weit getrennten**
  Figuren-Gruppen gelten dagegen als zuverlässig (Kreuz-Bewegung über größere Distanz ist sehr
  unwahrscheinlich) und lösen **keine** Meldung aus.

Das Verhalten lässt sich über die Konstanten in `TurnCorrectionLayer.__init__` (in
`scrytable.py`) feinjustieren: `anchor_radius`, `moved_threshold`, `max_disruption` und
`uncertainty_gap` (Schwelle für die räumliche Nähe der bewegten Blobs).

### Player-Ansicht / Blackout / Medien
- **Blackout-Funktion:** sofortiges Abdunkeln der Player-Sicht, damit der GM unbemerkt vorbereiten kann.
- **Media-System:** Bilder und Videos über die Blackout-Funktion in **Full**, **Split** oder **Quad**-Aufteilung abspielen – inkl. Flip und Loop pro Slot.
- **Status-Infos & Namen**, die neben Figuren projiziert werden.

---

## Voraussetzungen

| Komponente | Anforderung |
|------------|-------------|
| **Betriebssystem** | Windows / Linux / macOS (Server) |
| **Python** | 3.8 oder neuer |
| **Browser** | Aktueller Chrome / Firefox / Edge (WebGL) |
| **Kamera** | Webcam, idealerweise mit IR-Filter-Linse |
| **Player-Gerät** | Beliebiger Browser (z.&nbsp;B. Android-TV, Tablet, Laptop) |

---

## Installation

### 1. Projekt herunterladen

```bash
git clone https://github.com/wraith11/ScryTable.git
cd ScryTable
```

> Möchtest du die neueste Entwicklungs-Version testen, wechsle auf den Branch `dev`:
> ```bash
> git checkout dev
> ```

### 2. Abhängigkeiten installieren

```bash
pip install -r requirements.txt
```

**Linux/macOS (falls `pip` nicht verfügbar):**
```bash
pip3 install -r requirements.txt
```

Optional in einer virtuellen Umgebung:
```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Ordnerstruktur

Beim ersten Start werden automatisch die Ordner `assets/`, `maps/` und `media/` angelegt.

- `assets/` – hierher legst du deine heruntergeladenen Assets (Bilder/Texturen), z.&nbsp;B. von *Forgotten Adventures*.
- `media/` – Bilder/Videos für die Blackout-Funktion.
- `maps/` – gespeicherte Karten (`.json`).

---

## Starten

```bash
python scrytable.py
```

Oder mit einem der **Start-Skripte**:
- **Windows:** `start.bat`
- **Linux/macOS:** `./start.sh` (ggf. vorher `chmod +x start.sh`)

Beim Start öffnet sich automatisch die **GM-Ansicht** im Standard-Browser:
- **GM:** `http://localhost:8080/?view=gm`
- **Player:** `http://<IP-des-Rechners>:8080/`

Die lokale IP-Adresse des Rechners wird im **Settings-Tab** angezeigt (z.&nbsp;B. `192.168.1.50`). Verbinde Player-Geräte (Android-TV, Tablet, Zweitrechner) einfach über diese Adresse im WLAN.

---

## Konfiguration

### Host & Port
Standardmäßig bindet der Server an `0.0.0.0` (alle Interfaces) auf Port `8080`. Das lässt sich über **Kommandozeilen-Argumente** ändern:

```bash
# Anderen Port verwenden
python scrytable.py --port 9090

# Nur lokale Verbindungen zulassen
python scrytable.py --host 127.0.0.1

# Beides
python scrytable.py --host 0.0.0.0 --port 9090
```

Alternativ lässt sich Host/Port dauerhaft in **`config.json`** unter der Sektion `"server"` festlegen:
```json
{
  "server": { "host": "0.0.0.0", "port": 8080 }
}
```
> Kommandozeilen-Argumente haben Vorrang vor `config.json`.

### Sprache
Die UI ist **mehrsprachig** (Englisch als Standard, Deutsch verfügbar):
- Im **Settings-Tab** über das Dropdown „Language / Sprache“ umschalten.
- Oder direkt per URL-Parameter: `?lang=en` bzw. `?lang=de`.
- Die Auswahl wird pro Browser im `localStorage` gespeichert.

---

## Kamera-Aufbau (Blob-Tracking)

Das Tracking erkennt Figuren über **IR-Reflektorflächen** und eine **IR-Kamera**. So baust du es auf:

### Benötigte Hardware
- **Kamera mit IR-Filter-Linse** – eine „IR-only“- oder „Webcam mit IR-Filter“. 
- **IR-Beleuchtung** – ein oder mehrere IR-Emitter (z.&nbsp;B. IR-LED-Scheinwerfer mit 850 nm), die den Tisch gleichmäßig ausleuchten. Die Reflektorflächen werfen das IR-Licht zur Kamera zurück.
- **Reflektoren** – kleine Reflektorflächen (z.&nbsp;B. retroreflektierendes Material, Katzenaugen-Folie oder kleine IR-Reflektorpunkte), die du den Miniaturen/Figuren anbringst (z.&nbsp;B. unten an der Base).

Ich habe eine USB-Webcam-Platine mit Nachtsicht (inkl. IR-Emitter), einen günstigen IR850-Infrarotfilter für eine Kamera und ein passendes schwarzes Plastikgehäuse auf Amazon gekauft. Ich habe den Helligkeitssensor abgeklebt, sodass die Kamera immer im Nachtsicht-Modus ist. Dann habe ich eine Aussparung in das Gehäuse gemacht, die Linse davor geklebt und die Kamera im Gehäuse hinter der Linse platziert, sodass die IR-Emitter durch die Linse leuchten können.

> 📷 **Siehe:** [IR-Sensor in „Bilder & Screenshots“](#bilder--screenshots)

### Aufbau
1. **Kamera positionieren** – senkrecht über dem Spielfeld, z.&nbsp;B. an einem Stativ über dem Tisch oder am Beamer-Gestänge. Die Kamera sollte das gesamte Spielfeld erfassen.
2. **IR-Beleuchtung** gleichmäßig über den Tisch richten – ohne grelle Hotspots.
3. **Reflektoren anbringen** – an jeder Figur, die getrackt werden soll. Ich habe der Basis einen dünnen Streifen zwischen die Beine geklebt, sodass der Reflektor von allen Seiten zu sehen ist. 
4. **Kamera im System einrichten:**
   - In der GM-Ansicht: **Settings → Camera Setup**.
   - Kamera auswählen und ggf. den Treiber-Dialog öffnen.
   - **Kalibrieren:** Die vier Eckpunkte auf die Ecken des Spielfelds ziehen, damit das Bild entzerrt wird.

> 📷 **Siehe:** [Kamera-Einstellungen in „Bilder & Screenshots“](#bilder--screenshots)


### Kalibrierung & Korrekturoptionen
Nach der Ausrichtung stellst du in **Settings → Camera Setup** die Tracking-Parameter ein:

| Parameter | Zweck |
|-----------|-------|
| **Threshold** | Helligkeitsschwelle für die Binärisierung – erhöhen, wenn zu viel Rauschen erkannt wird. |
| **Merge-Distance** | Punkte innerhalb dieser Distanz werden zu einem Blob zusammengefasst. |
| **Min/Max-Area** | Filtert zu kleine (Rauschen) und zu große (Reflexionen) Flächen. |
| **Hotspot** | Kompensiert helle Stellen in der Ausleuchtung. |
| **Parallax** | Korrigiert den Parallax-Fehler bei nicht exakt senkrechter Kamera. |
| **Smoothing** | Glättet die Blob-Bewegung (höher = ruhiger, aber träger). |
| **Flip X/Y** | Spiegelt das Bild, falls die Kamera gedreht montiert ist. |

### Verknüpfen mit Tokens
- Im **Tokens-Tab** wählst du bei einem Token den gewünschten **Blob** (ID) aus.
- Sobald der Blob erkannt wird, folgt der Token der Figur automatisch über den Tisch.
- Figuren mit **Vision** decken den **Fog of War** auf.

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
| Kamera kalibrieren | Settings → Camera Setup |
| Karte speichern | Settings → Speichern / Speichern unter |

---

## Projektstruktur

```
ScryTable/
├── scrytable.py          # Python-Server (aiohttp + Socket.IO + OpenCV-Tracking)
├── index.html             # Vue-UI (GM- & Player-Ansicht, mehrsprachig)
├── css/style.css          # Styling
├── js/
│   ├── app.js             # Vue-App, Socket-Events, Lifecycle
│   ├── state.js           # Initialer UI- & Scene-State
│   ├── renderer.js        # PixiJS-Renderer (Karte, Licht, FoW, Tokens)
│   ├── interactions.js    # Maus/Tastatur-Interaktionen
│   ├── core-methods.js    # UI-Aktionen & Scene-Logik
│   ├── socket-client.js   # Socket.IO-Instanz
│   ├── i18n.js            # Übersetzungen (en/de)
│   └── utils.js           # Geometrie/Sichtbarkeits-Helfer
├── requirements.txt       # Python-Abhängigkeiten
├── start.bat / start.sh   # Start-Skripte
├── assets/                # Hochgeladene/verwaltete Assets (automatisch)
├── media/                 # Bilder/Videos für Blackout (automatisch)
└── maps/                  # Gespeicherte Karten (.json, automatisch)
```

**Technologien:** Python (aiohttp, Socket.IO, OpenCV) · JavaScript (Vue 3, PixiJS 7, iro.js) · WebGL.

---

## Hinweise & Grenzen

- **Flackern ist teuer:** Lichtquellen mit Flacker-Effekt aktivieren einen dauerhaften Render-Loop.
- Beim **Laden einer Karte** wird der Blackout automatisch aktiviert, damit der GM vorbereiten kann, ohne den Spielern etwas zu spoilern.
- Der Server ist für den Betrieb im **lokalen Netzwerk** gedacht. Beim Einsatz in ungesicherten Netzen sollte er hinter einem Reverse-Proxy mit Authentifizierung laufen.
- Das Tracking setzt einen stabilen Kontrast (IR-Reflektoren) voraus.

---

## Bilder & Screenshots

| Spiel-Ansicht (GM + Player) |
|-----------------------------|
| ![Spiel-Ansicht](docs/images/PlayingView.png) |

| Map-Editor | Reales Setup |
|------------|--------------|
| ![Map-Editor](docs/images/MapEditor.png) | ![Reales Setup](docs/images/RealLife.jpg) |

| Kamera-Einstellungen | IR-Sensor |
|----------------------|-----------|
| ![Kamera-Einstellungen](docs/images/CamSettings.png) | ![IR-Sensor](docs/images/IR-Sensor.jpg) |

---

## Lizenz

Dieses Projekt ist unter der **GNU General Public License v3.0 (GPLv3)** lizenziert. Details finden sich in der [LICENSE](LICENSE) Datei.

---

## Hinweis: KI-Unterstützung / AI-Generated Software

Dieses Projekt wurde **überwiegend mit Unterstützung von KI (Large Language Models) erstellt** – einschließlich großer Teile des Quellcodes, der Architektur und dieses Dokuments. Es ist das Ergebnis einer Zusammenarbeit zwischen dem Autor und KI-gestützten Entwicklungswerkzeugen. Die Logik einzelner komplexer Systeme basiert auf Ideen des Autors und wurde mit KI umgesetzt und gepflegt.
