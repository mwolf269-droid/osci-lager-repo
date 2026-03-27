const core = {
    stockData: {},
    r3: n => Math.round(parseFloat(n) * 1000) / 1000,
    getSafeId: p => p.replace(/\s+/g, '-').replace(/[()]/g, ''),

    async init() {
        this.token = localStorage.getItem('osci_lager_token');
        if(!this.token) {
            this.token = prompt("Home Assistant Token eingeben:");
            if(this.token) localStorage.setItem('osci_lager_token', this.token);
        }
        await this.load();
        // Erst nach dem Laden die UI-Elemente befüllen
        measuring.fill(); 
    },

    async load() {
        try {
            const res = await fetch(`${window.location.origin}/api/states/sensor.osci_motion_db`, { 
                headers: { "Authorization": `Bearer ${this.token}`, "Content-Type": "application/json" } 
            });
            const data = await res.json();
            let raw = data.attributes?.lager || {};
            // Migration alter Datenformate
            for (let p in raw) {
                this.stockData[p] = typeof raw[p] === 'number' ? { qty: this.r3(raw[p]), h: [] } : raw[p];
            }
            document.getElementById('status').innerText = "● Synchronisiert";
            ui.renderTable();
        } catch (e) { 
            document.getElementById('status').innerText = "● Verbindungsfehler"; 
        }
    },

    async save() {
        await fetch(`${window.location.origin}/api/states/sensor.osci_motion_db`, { 
            method: "POST", 
            headers: { "Authorization": `Bearer ${this.token}`, "Content-Type": "application/json" }, 
            body: JSON.stringify({ 
                state: "online", 
                attributes: { lager: this.stockData, friendly_name: "Osci-Lager", icon: "mdi:database" }
            }) 
        });
        ui.renderTable();
    },

    ensureProd(p) { if (!this.stockData[p]) this.stockData[p] = { qty: 0, h: [] }; },
    addVol(p, val) { this.ensureProd(p); this.stockData[p].qty = this.r3(parseFloat(this.stockData[p].qty || 0) + val); this.save(); },
    removeAmt(p, val) {
        this.ensureProd(p);
        if(val > 0) {
            this.stockData[p].qty = this.r3(Math.max(0, parseFloat(this.stockData[p].qty || 0) - val));
            if (!this.stockData[p].h) this.stockData[p].h = [];
            this.stockData[p].h.push(this.r3(val));
            if (this.stockData[p].h.length > 5) this.stockData[p].h.shift();
            this.save();
        }
    }
};
