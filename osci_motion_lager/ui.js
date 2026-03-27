const ui = {
    // ... (toggleColl, closeModals, openAddModal, openRemModal identisch) ...
    
    renderTable() {
        const container = document.getElementById('lagerContainer'); if(!container) return;
        container.innerHTML = "";
        for (const cat in productStructure) {
            let catCard = document.createElement('div'); catCard.className = 'cat-card';
            let html = `<div class="cat-header">${cat}</div><table>`;
            for (const p in productStructure[cat]) {
                const pData = productStructure[cat][p]; const data = core.stockData[p] || { qty: 0, h: [] }; const sId = core.getSafeId(p);
                
                // Unterstützung für altes Format (nur Zahl) und neues Format (Objekt)
                const last5 = (data.h || []).slice(-5).map(i => typeof i === 'object' ? i.v : i);
                let avg = last5.length ? core.r3(last5.reduce((a, b) => a + b, 0) / last5.length) : 0;
                let isWarn = avg > 0 && (parseFloat(data.qty) || 0) < avg;
                
                html += `<tr class="prod-row" onclick="ui.toggleHistory('${sId}')">
                    <td class="td-name"><span class="prod-link">${p}</span><a href="${pData.l}" target="_blank" class="shop-btn" onclick="event.stopPropagation()">Shop</a></td>
                    <td class="td-stand"><span class="stock-val ${isWarn?'low-stock':''}">${data.qty||0}${pData.u}</span><span class="avg-info">${avg>0?'Ø '+avg:''}</span></td>
                    <td><button class="btn-sm btn-plus" onclick="event.stopPropagation(); ui.openAddModal('${p}')">+</button></td>
                    <td><button class="btn-sm btn-minus" onclick="event.stopPropagation(); ui.openRemModal('${p}')">−</button></td>
                </tr><tr id="hist-row-${sId}" class="history-row"><td colspan="4"><div class="history-container">
                    <span style="color:var(--primary); font-size:0.7rem; font-weight:bold; width:100%; display:block; margin-bottom:5px;">LETZTE VERBRÄUCHE (Max 12):</span>
                    ${(data.h && data.h.length > 0) ? data.h.slice(-12).reverse().map((entry, i) => {
                        const val = typeof entry === 'object' ? entry.v : entry;
                        const date = typeof entry === 'object' ? entry.t : '--';
                        return `<div class="history-item"><span style="font-size:0.6rem; color:#666; margin-right:4px;">${date}</span> <b>${val}${pData.u}</b>
                        <button class="history-del" onclick="event.stopPropagation(); core.stockData['${p}'].h.splice(${data.h.length-1-i},1); core.save();">×</button></div>`;
                    }).join('') : "Keine Einträge"}</div></td></tr>`;
            }
            html += `</table>`; catCard.innerHTML = html; container.appendChild(catCard);
        }
        if (window.measuring) measuring.fill();
    },
    // ... (toggleHistory identisch) ...
};
