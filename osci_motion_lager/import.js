const importer = {
    process() {
        const textArea = document.getElementById('importText');
        const text = textArea.value.trim();
        if (!text) return;

        let itemsFound = [];

        // --- VERSUCH 1: HORIZONTALE TABELLE (NaCl MgCl2 ...) ---
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length >= 2) {
            const headers = lines[0].split(/\t|\s{2,}/).map(h => h.trim()).filter(h => h !== "");
            const values = lines[1].split(/\t|\s{2,}/).map(v => v.trim()).filter(v => v !== "");
            if (headers.length > 1 && values.length > 1) {
                headers.forEach((hName, index) => {
                    const rawValue = values[index];
                    if (!hName || !rawValue) return;
                    let amount = parseFloat(rawValue.replace(/[^\d,.-]/g, '').replace(',', '.'));
                    if (!isNaN(amount) && amount > 0) {
                        let pMatch = this.matchProduct(hName);
                        if (pMatch) itemsFound.push({ id: pMatch, amount: amount });
                    }
                });
            }
        }

        // --- VERSUCH 2: STREAM / VERTIKAL (Trace-Analyse) ---
        if (itemsFound.length === 0) {
            // Sucht nach Zahlen, die zwingend mit ml, m, g oder Stk enden
            const amountRegex = /([\d,.-]+)\s*(ml|m|Stk|g)\b/gi;
            let match, lastIndex = 0;
            
            while ((match = amountRegex.exec(text)) !== null) {
                const amount = parseFloat(match[1].replace(',', '.'));
                
                // Wir schauen nur die letzten 50 Zeichen VOR dem Fund an, um das Produkt zu finden
                // Das verhindert, dass eine "1" vom Anfang des Textes Werte am Ende überschreibt
                const searchRange = 50;
                const startPos = Math.max(0, match.index - searchRange);
                const textBefore = text.substring(startPos, match.index);
                
                let pMatch = this.matchProductInText(textBefore);
                
                if (pMatch && !isNaN(amount) && amount > 0) {
                    itemsFound.push({ id: pMatch, amount: amount });
                }
            }
        }

        // --- VERARBEITUNG ---
        if (itemsFound.length > 0) {
            let summary = [];
            itemsFound.forEach(item => {
                const pD = ui.getProdData(item.id);
                core.ensureProd(item.id);
                
                // Wert abziehen
                core.stockData[item.id].qty = core.r3(Math.max(0, parseFloat(core.stockData[item.id].qty || 0) - item.amount));
                
                // In History loggen
                if (!core.stockData[item.id].h) core.stockData[item.id].h = [];
                core.stockData[item.id].h.push(core.r3(item.amount));
                if (core.stockData[item.id].h.length > 10) core.stockData[item.id].h.shift();
                
                summary.push({ name: item.id, amount: item.amount, unit: pD.u });
            });

            core.save();
            ui.showImportSummary(summary);
            textArea.value = "";
        } else {
            alert("Keine passenden Produkte im Text erkannt.");
        }
    },

    // Abgleich für horizontale Tabellenköpfe
    matchProduct(str) {
        str = str.trim().toLowerCase();
        for (let cat in productStructure) {
            for (let p in productStructure[cat]) {
                const symbol = p.match(/\(([^)]+)\)/)?.[1]?.toLowerCase() || "";
                if (str === "1" && symbol === "i") return p; // Exakter Jod-Check
                if (symbol === str || p.toLowerCase().includes(str)) return p;
            }
        }
        return null;
    },

    // Abgleich für Freitext/Stream
    matchProductInText(text) {
        let bestMatch = null;
        let lastPos = -1;

        for (let cat in productStructure) {
            for (let p in productStructure[cat]) {
                const symbol = p.match(/\(([^)]+)\)/)?.[1] || "";
                const name = p.split('(')[0].trim();
                
                // Suche nach Kürzel oder Name als eigenständiges Wort
                const sRegex = new RegExp(`\\b${symbol.replace('+', '\\+')}\\b`, 'i');
                const nRegex = new RegExp(`\\b${name}\\b`, 'i');
                
                let sMatch = symbol ? text.search(sRegex) : -1;
                let nMatch = text.search(nRegex);
                
                // DER JOD-FIX (Präzise): 
                // Suche "1", aber nur wenn KEIN Punkt oder Ziffer davor/danach steht
                if (symbol.toLowerCase() === "i") {
                    const iodStrict = /(?<![\d.])\b1\b(?![\d.])/;
                    let fMatch = text.search(iodStrict);
                    if (fMatch > sMatch) sMatch = fMatch;
                }

                let currentPos = Math.max(sMatch, nMatch);
                // Wir nehmen das Produkt, das am nähesten am Wert steht (höchster Index)
                if (currentPos > lastPos) {
                    lastPos = currentPos;
                    bestMatch = p;
                }
            }
        }
        return bestMatch;
    }
};
