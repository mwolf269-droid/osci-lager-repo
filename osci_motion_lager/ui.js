const ui = {
    toggleColl(el) { el.classList.toggle("active"); let c = el.nextElementSibling; c.style.display = (c.style.display === "block") ? "none" : "block"; },
    closeModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = "none"); },

    showImportSummary(items) {
        const list = document.getElementById('importSummaryList');
        let html = '<table style="width:100%; font-size:0.85rem; color:white; border-collapse:collapse;">';
        items.forEach(item => {
            html += `<tr style="border-bottom:1px solid #222;"><td style="padding:10px; text-align:left; color:#aaa;">${item.name}</td><td style="padding:10px; text-align:right; color:var(--danger); font-weight:bold;">-${item.amount} ${item.unit}</td></tr>`;
        });
        html += '</table>';
        list.innerHTML = html;
        document.getElementById('importSummaryModal').style.display = "flex";
    },

    openAddModal(p) {
        const pD = this.getProdData(p);
        document.getElementById('addModalTitle').innerText = p;
        const opts = document.getElementById('addModalOptions'); opts.innerHTML = "";
        pD.s.forEach(size => {
            const btn = document.createElement('button'); btn.style = "background:#000; color:#fff; border:1px solid #444; padding:15px; width:100%; border-radius:12px; margin-bottom:10px; font-weight:bold; cursor:pointer;";
            btn.innerText = size + pD.u + " hinzufügen";
            btn.onclick = () => { core.addVol(p, size); this.closeModals(); }; opts.appendChild(btn);
        });
        document.getElementById('addModal').style.display = "flex";
    },

    openRemModal(p) {
        if (p.toLowerCase().includes("icp")) { core.removeAmt(p, 1); return; }
        const pD = this.getProdData(p);
        document.getElementById('remModalTitle').innerText = p;
        document.getElementById('modalUnit').innerText = pD.u;
        const input = document.getElementById('remInput'); input.value = "";
        document.getElementById('remConfirmBtn').onclick = () => { 
            let val = parseFloat(input.value); if(val > 0) { core.removeAmt(p, val); this.closeModals(); } 
        };
        document.getElementById('remModal').style.display = "flex";
        setTimeout(() => input.focus(), 150);
    },

    getProdData(n) { for (let c in productStructure) if (productStructure[c][n]) return productStructure[c][n]; return { d: 1, u: "ml", s: [1000], l: "#" }; },

    renderTable() {
        const container = document.getElementById('lagerContainer'); if(!container) return;
        container.innerHTML = "";
        for (const cat in productStructure) {
            let catCard = document.createElement('div'); catCard.className = 'cat-card';
            let html = `<div class="cat-header">${cat}</div><table>`;
            for (const p in productStructure[cat]) {
                const pData = productStructure[cat][p]; const data = core.stockData[p] || { qty: 0, h: [] }; const sId = core.getSafeId(p);
                const last5 = (data.h || []).slice(-5).map(i => typeof i === 'object' ? i.v : i);
                let avg = last5.length ? core.r3(last5.reduce((a, b) => a + b, 0) / last5.length) : 0;
                let isWarn = avg > 0 && (parseFloat(data.qty) || 0) < avg;
                html += `<tr class="prod-row" onclick="ui.toggleHistory('${sId}')"><td class="td-name"><span class="prod-link">${p}</span><a href="${pData.l}" target="_blank" class="shop-btn" onclick="event.stopPropagation()">Shop</a></td><td class="td-stand"><span class="stock-val ${isWarn?'low-stock':''}">${data.qty||0}${pData.u}</span><span class="avg-info">${avg>0?'Ø '+avg:''}</span></td><td><button class="btn-sm btn-plus" onclick="event.stopPropagation(); ui.openAddModal('${p}')">+</button></td><td><button class="btn-sm btn-minus" onclick="event.stopPropagation(); ui.openRemModal('${p}')">−</button></td></tr><tr id="hist-row-${sId}" class="history-row"><td colspan="4"><div class="history-container"><span style="color:var(--primary); font-size:0.7rem; font-weight:bold; width:100%; display:block; margin-bottom:5px;">LOGS (Max 12):</span>${(data.h && data.h.length > 0) ? data.h.slice(-12).reverse().map((e, i) => {
                    const v = typeof e === 'object' ? e.v : e; const t = typeof e === 'object' ? e.t : '--';
                    return `<div class="history-item"><span style="font-size:0.6rem; color:#666;">${t}</span> <b>${v}${pData.u}</b><button class="history-del" onclick="event.stopPropagation(); core.stockData['${p}'].h.splice(${data.h.length-1-i},1); core.save();">×</button></div>`;
                }).join('') : "Keine Einträge"}</div></td></tr>`;
            }
            html += `</table>`; catCard.innerHTML = html; container.appendChild(catCard);
        }
        if (window.measuring && typeof measuring.fill === 'function') measuring.fill();
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
