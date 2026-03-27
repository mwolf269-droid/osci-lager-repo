const ui = {
    toggleColl(el) { 
        el.classList.toggle("active"); 
        let c = el.nextElementSibling; 
        if (c) c.style.display = (c.style.display === "block") ? "none" : "block"; 
    },

    closeModals() { 
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = "none"); 
    },

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

    openRemModal(p) {
        console.log("Öffne Entnahme für:", p); // Debug-Info für die Konsole
        
        // ICP SPEZIAL: Sofort 1 Stück abziehen
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

        if (!modal || !input || !confirmBtn) {
            console.error("Modal-Elemente nicht gefunden!");
            return;
        }

        title.innerText = p;
        unitLabel.innerText = pD.u;
        input.value = "";
        
        // WICHTIG: Alten Event-Listener entfernen durch Klonen des Buttons
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.onclick = () => { 
            let val = parseFloat(input.value); 
            console.log("Abziehen bestätigt:", p, val);
            if(!isNaN(val) && val > 0) { 
                core.removeAmt(p, val); 
                this.closeModals(); 
            } else {
                alert("Bitte eine gültige Menge eingeben.");
            }
        };
        
        modal.style.display = "flex";
        setTimeout(() => input.focus(), 150);
    },

    getProdData(n) { 
        for (let c in productStructure) {
            if (productStructure[c][n]) return productStructure[c][n];
        }
        return { d: 1, u: "ml", s: [1000], l: "#" }; 
    },

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

                const last5 = (data.h || []).slice(-5).map(i => typeof i === 'object' ? i.v : i);
                let avg = last5.length ? core.r3(last5.reduce((a, b) => a + b, 0) / last5.length) : 0;
                let isWarn = avg > 0 && (parseFloat(data.qty) || 0) < avg;

                // Escape den Produktnamen für das HTML Attribut (um Fehler bei Klammern zu vermeiden)
                const pEscaped = p.replace(/'/g, "\\'");

                html += `
                <tr class="prod-row" onclick="ui.toggleHistory('${sId}')">
                    <td class="td-name">
                        <span class="prod-link">${p}</span>
                        <a href="${pData.l}" target="_blank" class="shop-btn" onclick="event.stopPropagation()">Shop</a>
                    </td>
                    <td class="td-stand">
                        <div style="display:flex; align-items:center; justify-content:flex-end; gap:5px;">
                            ${trendHtml}
                            <span class="stock-val ${isWarn?'low-stock':''}">${data.qty||0}${pData.u}</span>
                        </div>
                        <span class="avg-info">${avg > 0 ? 'Ø ' + avg : ''}</span>
                    </td>
                    <td><button class="btn-sm btn-plus" onclick="event.stopPropagation(); ui.openAddModal('${pEscaped}')">+</button></td>
                    <td><button class="btn-sm btn-minus" onclick="event.stopPropagation(); ui.openRemModal('${pEscaped}')">−</button></td>
                </tr>
                <tr id="hist-row-${sId}" class="history-row">
                    <td colspan="4">
                        <div class="history-container">
                            <span style="color:var(--primary); font-size:0.7rem; font-weight:bold; width:100%; display:block; margin-bottom:5px;">LOGS:</span>
                            ${(data.h && data.h.length > 0) ? data.h.slice(-12).reverse().map((e, i) => {
                                const v = typeof e === 'object' ? e.v : e; 
                                const t = typeof e === 'object' ? e.t : '--';
                                return `<div class="history-item">
                                    <span style="font-size:0.6rem; color:#666;">${t}</span> 
                                    <b>${v}${pData.u}</b>
                                    <button class="history-del" onclick="event.stopPropagation(); core.stockData['${pEscaped}'].h.splice(${data.h.length-1-i},1); core.save();">×</button>
                                </div>`;
                            }).join('') : "Keine Einträge"}
                        </div>
                    </td>
                </tr>`;
            }
            html += `</table>`; 
            catCard.innerHTML = html; 
            container.appendChild(catCard);
        }
    },

    toggleHistory(sId) {
        const row = document.getElementById('hist-row-' + sId);
        if (row) {
            const isActive = row.classList.contains('active');
            document.querySelectorAll('.history-row').forEach(r => r.classList.remove('active'));
            if (!isActive) row.classList.add('active');
        }
    }
};
