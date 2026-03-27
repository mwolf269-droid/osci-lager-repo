const importer = {
    process() {
        const textArea = document.getElementById('importText');
        const text = textArea.value.trim();
        if (!text) return;

        let itemsFound = [];
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length >= 2) {
            const headers = lines[0].split(/\t|\s{2,}/).map(h => h.trim());
            const values = lines[1].split(/\t|\s{2,}/).map(v => v.trim());
            if (headers.length > 1) {
                headers.forEach((hName, index) => {
                    let amount = parseFloat(values[index]?.replace(/[^\d,.-]/g, '').replace(',', '.'));
                    if (amount > 0) {
                        let pMatch = this.matchProduct(hName);
                        if (pMatch) itemsFound.push({ id: pMatch, amount: amount });
                    }
                });
            }
        }

        if (itemsFound.length === 0) {
            const amountRegex = /([\d,.-]+)\s*(ml|m|Stk|g)\b/gi;
            let match, lastIndex = 0;
            while ((match = amountRegex.exec(text)) !== null) {
                const amount = parseFloat(match[1].replace(',', '.'));
                const startPos = Math.max(0, match.index - 50);
                const textBefore = text.substring(startPos, match.index);
                let pMatch = this.matchProductInText(textBefore);
                if (pMatch && amount > 0) itemsFound.push({ id: pMatch, amount: amount });
            }
        }

        if (itemsFound.length > 0) {
            let summary = [];
            itemsFound.forEach(item => {
                core.ensureProd(item.id);
                core.stockData[item.id].qty = core.r3(Math.max(0, parseFloat(core.stockData[item.id].qty || 0) - item.amount));
                if (!core.stockData[item.id].h) core.stockData[item.id].h = [];
                core.stockData[item.id].h.push({ v: core.r3(item.amount), t: core.getDt() });
                if (core.stockData[item.id].h.length > 12) core.stockData[item.id].h.shift();
                summary.push({ name: item.id, amount: item.amount, unit: ui.getProdData(item.id).u });
            });
            core.save(); ui.showImportSummary(summary); textArea.value = "";
        } else alert("Keine Produkte erkannt.");
    },

    matchProduct(str) {
        str = str.toLowerCase();
        for (let cat in productStructure) {
            for (let p in productStructure[cat]) {
                const symbol = p.match(/\(([^)]+)\)/)?.[1]?.toLowerCase() || "";
                if (str === "1" && symbol === "i") return p;
                if (symbol === str || p.toLowerCase().includes(str)) return p;
            }
        }
        return null;
    },

    matchProductInText(text) {
        let bestMatch = null, lastPos = -1;
        for (let cat in productStructure) {
            for (let p in productStructure[cat]) {
                const symbol = p.match(/\(([^)]+)\)/)?.[1] || "";
                const name = p.split('(')[0].trim();
                const sRegex = new RegExp(`\\b${symbol.replace('+', '\\+')}\\b`, 'i');
                const nRegex = new RegExp(`\\b${name}\\b`, 'i');
                let sMatch = symbol ? text.search(sRegex) : -1;
                let nMatch = text.search(nRegex);
                if (symbol.toLowerCase() === "i") {
                    let fMatch = text.search(/(?<![\d.])\b1\b(?![\d.])/);
                    if (fMatch > sMatch) sMatch = fMatch;
                }
                let currentPos = Math.max(sMatch, nMatch);
                if (currentPos > lastPos) { lastPos = currentPos; bestMatch = p; }
            }
        }
        return bestMatch;
    }
};
