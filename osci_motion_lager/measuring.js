const measuring = {
    fill() {
        const pSel = document.getElementById('prodSelect'); 
        if (!pSel) return;
        
        // Dropdown komplett leeren und Platzhalter setzen
        pSel.innerHTML = '<option value="">Produkt wählen...</option>'; 

        // Prüfen, ob die Daten aus der config.js da sind
        if (typeof productStructure === 'undefined') {
            console.error("config.js wurde nicht gefunden!");
            return;
        }

        for (const cat in productStructure) {
            let group = document.createElement('optgroup'); 
            group.label = cat;
            
            for (const p in productStructure[cat]) {
                const pD = productStructure[cat][p];
                // Nur flüssige Produkte zum Wiegen zulassen
                const nonLiquid = ["Mischbettharz", "ICP Ocean Check", "ICP Ocean Check Pro"];
                if (!nonLiquid.includes(p)) {
                    let opt = document.createElement('option'); 
                    opt.value = p; 
                    opt.innerText = p; 
                    group.appendChild(opt);
                }
            }
            if (group.children.length > 0) {
                pSel.appendChild(group);
            }
        }
    },

    calculate() {
        const p = document.getElementById('prodSelect').value; 
        if (!p) return;
        const pD = ui.getProdData(p);
        const weight = parseFloat(document.getElementById('weightInput').value) || 0;
        const tara = parseFloat(document.getElementById('gebindeSelect').value) || 0;
        
        // Dichte-Berechnung
        const res = core.r3((weight - tara) / pD.d);
        document.getElementById('calcResult').innerText = Math.max(0, res) + " " + pD.u;
    },

    updateStock() {
        let p = document.getElementById('prodSelect').value; 
        if (!p) return;
        const pD = ui.getProdData(p);
        const weight = parseFloat(document.getElementById('weightInput').value) || 0;
        const tara = parseFloat(document.getElementById('gebindeSelect').value) || 0;
        const res = core.r3((weight - tara) / pD.d);
        
        core.ensureProd(p); 
        core.stockData[p].qty = Math.max(0, res); 
        core.save();
        
        // Felder zurücksetzen
        document.getElementById('weightInput').value = ""; 
        document.getElementById('calcResult').innerText = "0";
        alert(p + " wurde auf " + Math.max(0, res) + pD.u + " gesetzt.");
    }
};
