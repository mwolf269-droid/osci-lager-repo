const ui = {
    // Hilfsfunktion für aufklappbare Bereiche (z.B. im Handbuch oder Dashboard)
    toggleColl(el) { 
        el.classList.toggle("active"); 
        let c = el.nextElementSibling; 
        if (c) c.style.display = (c.style.display === "block") ? "none" : "block"; 
    },

    // Schließt alle Modal-Overlays
    closeModals() { 
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = "none"); 
    },

    // Zeigt die übersichtliche Tabelle nach einem Import
    showImportSummary(items) {
        const list = document.getElementById('importSummaryList');
        if (!list) return;
        let html = '<table style="width:100%; font-size:0.85rem; color:white; border-collapse:collapse;">';
        items.forEach(item => {
            html += `<tr style="border-bottom:1px solid #222;">
                <td style="padding:10px; text-align:left; color:#aaa;">${item.name}</td>
                <td style="padding:10px; text-align:right; color:var(--danger); font-weight:bold;">-${item.amount} ${item.unit}</td>
            </tr>`;
        });
        html += '</table>';
        list.innerHTML = html;
        document.getElementById('importSummaryModal').style.display = "flex";
    },

    // Fenster für Zukauf (+) öffnen
    openAddModal(p) {
        const pD = this.getProdData(p);
        document.getElementById('addModalTitle').innerText = p;
        const opts = document.getElementById('addModalOptions'); 
        opts.innerHTML = "";
        pD.s.forEach(size => {
            const btn = document.createElement('button'); 
            btn.style = "background:#000; color:#fff; border:1px solid #444; padding:15px; width:100%; border-radius:12px; margin-bottom:10px; font-weight:bold; cursor:pointer;";
            btn.innerText = size + pD.u + " hinzufügen";
            btn.onclick = () => { core.addVol(p, size); this.closeModals(); }; 
            opts.appendChild(btn);
        });
        document.getElementById('addModal').style.display = "flex";
    },

    // Fenster für Entnahme (-) öffnen
    openRemModal(p) {
        // ICP SPEZIAL: Sofort 1 Stück abziehen ohne Fenster
        if (p.toLowerCase().includes("icp")) { 
            core.removeAmt(p, 1); 
            return; 
        }
        
        const pD = this.getProdData(p);
        const modal = document.getElementById('remModal');
        const input = document.getElementById('remInput');
        const title = document.getElementById('remModalTitle');
        const unitLabel = document.getElementById('modalUnit');
        const confirmBtn = document.getElementById('remConfirmBtn');

        if (!modal || !input || !confirmBtn) return;

        title.innerText = p;
        unitLabel.innerText = pD.u;
        input.value = "";
        
        // Event-Listener sicher neu binden (verhindert Doppelklicks/falsche Produkte)
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.onclick = () => { 
            let val = parseFloat(input.value); 
            if(!isNaN(val) && val > 0) { 
                core.removeAmt(p, val); 
                this.closeModals(); 
            }
        };
        
        modal.style.display = "flex";
        setTimeout(() => input.focus(), 150);
    },

    // Holt Basisinfos (Dichte, Einheit, Gebinde) aus der config.js
    getProdData(n) { 
        for (let c in productStructure) {
            if (productStructure[c][n]) return productStructure[c][n];
        }
        return { d: 1, u: "ml", s: [1000], l: "#" }; 
    },

    // Zeichnet die gesamte Lager-Tabelle auf dem Dashboard
    renderTable() {
        const container = document.getElementById('lagerContainer'); 
        if(!container) return;

        container.innerHTML = "";
        for (const cat in productStructure) {
            let catCard = document.createElement('div'); 
            catCard.className = 'cat-card';
            let html = `<div class="cat-header">${cat}</div><table>`;
            
            for (const p in productStructure[cat]) {
                const pData = productStructure[cat][p]; 
                const data = core.stockData[p] || { qty: 0, h: [] }; 
                const sId = core.getSafeId(p);
                
                // TREND LOGIK (Vergleich der letzten zwei Werte)
                const hVals = (data.h || []).map(e => typeof e === 'object' ? e.v : e);
                let trendHtml = '';
                if(hVals.length >= 2) {
                    const last = hVals[hVals.length - 1];
                    const prev = hVals[hVals.length - 2];
                    const diff = ((last - prev) / prev) * 100;
                    if(diff > 5) trendHtml = `<span class="trend-icon up" title="Verbrauch steigend">↑</span>`;
                    else if(diff < -5) trendHtml = `<span class="trend-icon down" title="Verbrauch sinkend">↓</span>`;
                    else trendHtml = `<span class="trend-icon stable" title="Verbrauch gleichbleibend">→</span>`;
                }

                // WARN-LOGIK (Blinken wenn Bestand unter 5x Durchschnitt)
                const last5 = (data.h || []).slice(-5).map(i => typeof i === 'object' ? i.v : i);
                let avg = last5.length ? core.r3(last5.reduce((a, b) => a + b, 0) / last5.length) : 0;
                let isWarn = avg > 0 && (parseFloat(data.qty) || 0) < avg;

                // Sonderzeichen in Namen für HTML-Attribute sicher machen
                const pSafe = p.replace(/'/g, "\\'");

                html += `
<tr class="prod-row" onclick="ui.toggleHistory('${sId}')">
    <td class="td-name">
        <span class="prod-link">${p}</span>
        <a href="${pData.l}" target="_blank" class="shop-btn" onclick="event.stopPropagation()">Shop</a>
    </td>
    <td class="td-stand">
        <div class="stock-val-container">
            ${trendHtml}
            <span class="stock-val ${isWarn?'low-stock':''}">${data.qty||0}${pData.u}</span>
        </div>
        <span class="avg-info">${avg > 0 ? 'Ø ' + avg : ''}</span>
    </td>
    <td><button class="btn-sm btn-plus" onclick="event.stopPropagation(); ui.openAddModal('${pSafe}')">+</button></td>
    <td><button class="btn-sm btn-minus" onclick="event.stopPropagation(); ui.openRemModal('${pSafe}')">−</button></td>
</tr>`;;
            }
            html += `</table>`; 
            catCard.innerHTML = html; 
            container.appendChild(catCard);
        }
        
        // Dropdowns auf anderen Modulen (falls vorhanden) befüllen
        if (window.measuring && typeof measuring.fill === 'function') {
            measuring.fill();
        }
    },

    // Blendet die History-Zeile ein oder aus
    toggleHistory(sId) {
        const row = document.getElementById('hist-row-' + sId);
        if (row) {
            const isActive = row.classList.contains('active');
            // Alle anderen offenen Logs schließen für bessere Übersicht
            document.querySelectorAll('.history-row').forEach(r => r.classList.remove('active'));
            if (!isActive) row.classList.add('active');
        }
    }
};
