function incarcaPersoane() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/resurse/persoana.xml', true);
    xhr.onload = function () {
        if (this.status === 200) {
            var xmlDoc = this.responseXML;
            if (!xmlDoc) {
                // fallback: parse from text
                var parser = new DOMParser();
                xmlDoc = parser.parseFromString(this.responseText, 'application/xml');
            }

            var persoane = xmlDoc.getElementsByTagName('persoana');

            if (persoane.length === 0) {
                document.getElementById('continut').innerHTML =
                    '<p style="color:#c62828; padding:20px;">Nu s-au găsit persoane în fișierul XML.</p>';
                return;
            }

            // Collect all unique tag names as column headers (excluding 'persoana')
            var coloane = [];
            for (var i = 0; i < persoane.length; i++) {
                var copii = persoane[i].children;
                for (var j = 0; j < copii.length; j++) {
                    var tag = copii[j].tagName;
                    if (coloane.indexOf(tag) === -1) {
                        coloane.push(tag);
                    }
                }
            }

            // Also check attributes on <persoana>
            var atribute = [];
            for (var i = 0; i < persoane[0].attributes.length; i++) {
                atribute.push('@' + persoane[0].attributes[i].name);
            }

            var toateColoane = atribute.concat(coloane);

            var html = '<div class="main-layout"><div class="continut">';
            html += '<div style="background-color:#fff; border-radius:20px; padding:30px; box-shadow:0 4px 20px rgba(0,24,80,0.12);">';
            html += '<h2 class="sectiune-titlu">Lista persoane</h2>';
            html += '<div style="overflow-x:auto;">';
            html += '<table id="tabelPersoane" style="border-collapse:collapse; width:100%; font-size:14px;">';

            html += '<thead><tr>';
            html += '<th style="background:#001850;color:#fff;padding:10px 14px;text-align:left;">#</th>';
            for (var c = 0; c < toateColoane.length; c++) {
                var label = toateColoane[c].startsWith('@')
                    ? toateColoane[c].substring(1)
                    : toateColoane[c];
                // Capitalize first letter
                label = label.charAt(0).toUpperCase() + label.slice(1);
                html += '<th style="background:#001850;color:#fff;padding:10px 14px;text-align:left;">' + label + '</th>';
            }
            html += '</tr></thead>';

            // Body
            html += '<tbody>';
            for (var i = 0; i < persoane.length; i++) {
                var bg = (i % 2 === 1) ? 'background:#f5f7fb;' : '';
                html += '<tr>';
                html += '<td style="padding:9px 14px;border:1px solid #ddd;' + bg + '">' + (i + 1) + '</td>';

                for (var c = 0; c < toateColoane.length; c++) {
                    var val = '';
                    if (toateColoane[c].startsWith('@')) {
                        var attrName = toateColoane[c].substring(1);
                        val = persoane[i].getAttribute(attrName) || '';
                    } else {
                        var el = persoane[i].getElementsByTagName(toateColoane[c])[0];
                        val = el ? el.textContent : '';
                    }
                    html += '<td style="padding:9px 14px;border:1px solid #ddd;' + bg + '">' + val + '</td>';
                }
                html += '</tr>';
            }
            html += '</tbody></table></div></div></div></div>';

            document.getElementById('continut').innerHTML = html;
        } else {
            document.getElementById('continut').innerHTML =
                '<p style="color:#c62828; padding:20px;">Eroare la încărcarea fișierului XML (status: ' + this.status + ').</p>';
        }
    };
    xhr.onerror = function () {
        document.getElementById('continut').innerHTML =
            '<p style="color:#c62828; padding:20px;">Eroare de rețea la încărcarea persoane.xml.</p>';
    };
    xhr.send();
}