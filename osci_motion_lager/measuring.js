<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Messstation - Osci Lager</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<div class="app-container">
    <div class="header-container"><img src="header.png" class="banner-img"></div>
    <nav class="top-nav">
        <a href="index.html" class="nav-link">← Zurück</a>
        <div style="flex:1; text-align:center; color:var(--primary); font-weight:bold; font-size:0.8rem;">MESSSTATION</div>
    </nav>

    <div class="section-card" style="margin-top:20px;">
        <div class="section-header">⚖️ Produkt Wiegen</div>
        <div class="section-body" style="padding:20px; display:flex; flex-direction:column; gap:15px;">
            <label style="font-size:0.8rem; color:#888;">Produkt auswählen:</label>
            <select id="prodSelect"></select>
            
            <label style="font-size:0.8rem; color:#888;">Flasche & Gewicht:</label>
            <div style="display: flex; gap: 10px;">
                <select id="gebindeSelect" style="flex:1;">
                    <option value="9.3">30ml (9,3g)</option>
                    <option value="18.5">100ml (18,5g)</option>
                    <option value="57" selected>1L (57g)</option>
                    <option value="260">5L (260g)</option>
                    <option value="440">10L (440g)</option>
                </select>
                <input type="number" id="weightInput" style="flex:1;" placeholder="Gramm Waage" oninput="measuring.calculate()">
            </div>
            
            <div style="background:#000; padding:20px; border-radius:12px; text-align:center; border:1px solid #333;">
                <div style="font-size:0.7rem; color:#666; text-transform:uppercase;">Berechneter Inhalt</div>
                <div id="calcResult" style="font-weight:bold; font-size: 3rem; color: var(--primary);">0</div>
            </div>
            
            <button class="big-btn btn-blue" onclick="measuring.updateStock()">ERGEBNIS ÜBERNEHMEN</button>
        </div>
    </div>
    <div class="footer-container"><img src="footer.png" class="footer-img"></div>
</div>

<script src="config.js"></script><script src="core.js"></script><script src="ui.js"></script><script src="measuring.js"></script>
<script>
    window.onload = async () => { 
        await core.init(); 
        measuring.fill(); 
    };
</script>
</body>
</html>
