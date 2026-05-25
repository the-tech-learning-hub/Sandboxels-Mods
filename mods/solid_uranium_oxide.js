// ============================================================
//  Sandboxels Mod: Solid Uranium + Molten Solid Uranium
//  Korrekte Mod-Syntax nach offiziellem Wiki
// ============================================================

// --- 1. molten_solid_uranium (wird zuerst definiert, da solid_uranium darauf verweist) ---

elements.molten_solid_uranium = {
    color: "#c47a00",
    colorRange: 25,
    behavior: behaviors.LIQUID,
    category: "solids",
    state: "liquid",
    density: 17500,
    viscosity: 60000,
    tempLow: 1405,
    stateLow: "solid_uranium",
    desc: "Geschmolzenes Solid-Uran. Entsteht wenn molten_uranium und molten_steel gemischt werden. Kühlt zu Solid Uranium ab.",
};

// --- 2. solid_uranium ---

elements.solid_uranium = {
    color: "#8c8c8c",
    colorRange: 12,
    behavior: behaviors.WALL,
    category: "solids",
    state: "solid",
    density: 19100,
    tempHigh: 1405,
    stateHigh: "molten_solid_uranium",

    // Reaktion mit Neutronen → Kettenreaktion (Atomspaltung)
    reactions: {
        "neutron": { elem1: "solid_uranium", elem2: "explosion", chance: 0.4 },
    },

    // Tick: Spontane Hintergrundstrahlung + schwache Selbsterwärmung
    tick: function(pixel) {
        // Sehr seltene spontane Spaltung
        if (Math.random() < 0.0002) {
            pixel.temp += 60 + Math.random() * 100;

            // Neutronen in Nachbarzellen erzeugen (falls leer)
            let directions = [
                [0, -1], [0, 1], [-1, 0], [1, 0],
                [-1, -1], [1, -1], [-1, 1], [1, 1]
            ];
            let chosen = directions[Math.floor(Math.random() * directions.length)];
            let nx = pixel.x + chosen[0];
            let ny = pixel.y + chosen[1];
            if (elements["neutron"]) {
                changePixel(pixel, "solid_uranium"); // bleibt, gibt aber Energie ab
                pixel.temp += 30;
            }
        }

        // Schwache konstante Wärmeabgabe an Nachbarn (Radioaktivität)
        if (Math.random() < 0.005) {
            pixel.temp += 0.2;
        }
    },

    desc: "Festes Uran. Radioaktiv. Reagiert mit Neutronen und löst eine Kettenreaktion aus. Entsteht wenn molten_solid_uranium abkühlt.",
};

// --- 3. Reaktion: molten_uranium + molten_steel → molten_solid_uranium ---
// Reaktionen müssen NACH der Element-Definition zu bestehenden Elementen hinzugefügt werden.

runAfterLoad(function() {
    // Sicherstellen dass beide Basis-Elemente existieren
    if (elements.molten_uranium) {
        if (!elements.molten_uranium.reactions) {
            elements.molten_uranium.reactions = {};
        }
        elements.molten_uranium.reactions["molten_steel"] = {
            elem1: "molten_solid_uranium",
            elem2: "molten_solid_uranium",
        };
    }

    if (elements.molten_steel) {
        if (!elements.molten_steel.reactions) {
            elements.molten_steel.reactions = {};
        }
        elements.molten_steel.reactions["molten_uranium"] = {
            elem1: "molten_solid_uranium",
            elem2: "molten_solid_uranium",
        };
    }
});
