/* ============================================================
   script.js  -  Volkswagen Group  |  Lab 05
   Functionality for:
     - Section 1: Browser / BOM info
     - Section 2: Canvas drawing with mouse
     - Section 3: Dynamic table - insert row / column
   ============================================================ */

/* ===========================================================
   SECTION 1 - Browser and system info
   =========================================================== */

function afiseazaInfo() {
    function actualizeazaOra() {
        const acum = new Date();
        document.getElementById('oraCurenta').innerHTML = acum.toLocaleString();
    }

    actualizeazaOra();
    setInterval(actualizeazaOra, 1000);

    document.getElementById('adresaURL').innerHTML = window.location.href;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                document.getElementById('locatie').innerHTML =
                    "Latitudine: " + position.coords.latitude.toFixed(4) +
                    ", Longitudine: " + position.coords.longitude.toFixed(4);
            },
            function() {
                document.getElementById('locatie').innerHTML = "Locatie indisponibila";
            }
        );
    } else {
        document.getElementById('locatie').innerHTML = "Locatie indisponibila";
    }

    document.getElementById('browser').innerHTML = navigator.appName + " " + navigator.appVersion;
    document.getElementById('os').innerHTML = navigator.platform;
}

/* ===========================================================
   UTILITY - hamburger nav toggle
   =========================================================== */

function actualizareNav() {
    const btn  = document.getElementById('nav-btn');
    const menu = document.getElementById('nav-menu');
    btn.addEventListener('click', () => {
        btn.classList.toggle('open');
        menu.classList.toggle('open');
    });
}

/* ===========================================================
   SECTION 2 - Interactive canvas
   =========================================================== */

var canvasState = {
    canvas:  null,
    ctx:     null,
    primaAp: false,   /* true after first click */
    x1: 0,
    y1: 0             /* coordinates of first click */
};

/* Initialize canvas: draw default content and attach event listeners.
   Called via onload event on body. */
function initCanvas() {
    var canvas = document.getElementById("desenCanvas");
    if (!canvas) return;

    canvasState.canvas = canvas;
    canvasState.ctx    = canvas.getContext("2d");

    /* Set canvas pixel dimensions to match its display size */
    canvas.width  = canvas.offsetWidth  || 800;
    canvas.height = canvas.offsetHeight || 420;

    deseneazaFundal();

    /* Mouse event listeners */
    canvas.addEventListener("click", onCanvasClick);

    /* Stroke width slider */
    var slider   = document.getElementById("grosimeContur");
    var valLabel = document.getElementById("grosimeVal");
    if (slider && valLabel) {
        slider.addEventListener("input", function () {
            valLabel.textContent = slider.value;
        });
    }
}

/* Draw the default background content on the canvas. */
function deseneazaFundal() {
    var ctx = canvasState.ctx;
    var w   = canvasState.canvas.width;
    var h   = canvasState.canvas.height;

    /* Gradient background */
    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#eef2ff");
    grad.addColorStop(1, "#dce4f5");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    /* Decorative rectangle 1 */
    ctx.strokeStyle = "#001850";
    ctx.fillStyle   = "rgba(0, 24, 80, 0.08)";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.roundRect(30, 30, 280, 80, 10);
    ctx.fill();
    ctx.stroke();

    /* Decorative rectangle 2 */
    ctx.strokeStyle = "#0047ab";
    ctx.fillStyle   = "rgba(0, 71, 171, 0.10)";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.roundRect(w - 220, h - 110, 190, 80, 10);
    ctx.fill();
    ctx.stroke();

    /* Informational text */
    ctx.fillStyle = "#001850";
    ctx.font      = "bold 14px sans-serif";
    ctx.fillText("Volkswagen Group - Interactive Canvas", 40, 80);

    ctx.fillStyle = "#555";
    ctx.font      = "12px sans-serif";
    ctx.fillText("Click to start drawing rectangles!", w / 2 - 110, h / 2);
}

/* Handle canvas click events.
   First click saves the first corner; second click draws the rectangle. */
function onCanvasClick(e) {
    var rect   = canvasState.canvas.getBoundingClientRect();
    var scaleX = canvasState.canvas.width  / rect.width;
    var scaleY = canvasState.canvas.height / rect.height;
    var mx = (e.clientX - rect.left) * scaleX;
    var my = (e.clientY - rect.top)  * scaleY;

    if (!canvasState.primaAp) {
        /* First click - save coordinates and draw a marker dot */
        canvasState.x1      = mx;
        canvasState.y1      = my;
        canvasState.primaAp = true;

        var ctx = canvasState.ctx;
        ctx.fillStyle = "#0047ab";
        ctx.beginPath();
        ctx.arc(mx, my, 5, 0, 2 * Math.PI);
        ctx.fill();
    } else {
        /* Second click - draw the rectangle using fill() and stroke() */
        var x1 = canvasState.x1;
        var y1 = canvasState.y1;
        var x2 = mx;
        var y2 = my;

        var culoareContur  = document.getElementById("culoareContur").value;
        var culoareUmplere = document.getElementById("culoareUmplere").value;
        var grosime        = parseInt(document.getElementById("grosimeContur").value) || 2;

        var ctx = canvasState.ctx;
        ctx.fillStyle   = culoareUmplere;
        ctx.strokeStyle = culoareContur;
        ctx.lineWidth   = grosime;

        var rx = Math.min(x1, x2);
        var ry = Math.min(y1, y2);
        var rw = Math.abs(x2 - x1);
        var rh = Math.abs(y2 - y1);

        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);

        canvasState.primaAp = false;
    }
}

/* Clear the canvas and redraw the default background. */
function stergeCanvas() {
    var canvas = canvasState.canvas;
    var ctx    = canvasState.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    deseneazaFundal();
    canvasState.primaAp = false;
}

/* ===========================================================
   SECTION 3 - Dynamic table
   =========================================================== */

/* Insert a new row at the given 1-based position.
   Background color is applied to each cell individually. */
function insereazaLinie() {
    var tabel   = document.getElementById("tabelMasini");
    var tbody   = tabel.querySelector("tbody");
    var pozEl   = document.getElementById("pozitie");
    var culoare = document.getElementById("culoareTabel").value;
    var msgEl   = document.getElementById("tabelMsg");
    var poz     = parseInt(pozEl.value);
    var randuri = tbody.rows;

    if (isNaN(poz) || poz < 1) {
        msgEl.style.color = "#c62828";
        msgEl.textContent = "Introduceti o pozitie valida (minim 1).";
        return;
    }

    msgEl.textContent = "";

    /* Number of columns based on first existing row */
    var nrColoane = (randuri.length > 0)
        ? randuri[0].cells.length
        : tabel.querySelector("thead tr").cells.length;

    /* Create new row */
    var randNou = document.createElement("tr");
    for (var i = 0; i < nrColoane; i++) {
        var celula = document.createElement("td");
        celula.textContent           = "-";
        celula.style.backgroundColor = culoare;
        randNou.appendChild(celula);
    }

    /* Insert at position (0-indexed: poz - 1) */
    if (poz - 1 >= randuri.length) {
        tbody.appendChild(randNou);
    } else {
        tbody.insertBefore(randNou, randuri[poz - 1]);
    }

    msgEl.style.color = "#2e7d32";
    msgEl.textContent = "Linie inserata la pozitia " + poz + ".";
}

/* Insert a new column at the given 1-based index.
   Iterates over all rows (thead + tbody) using tabel.rows (NodeList navigation).
   Background color is applied to each new cell individually. */
function insereazaColoana() {
    var tabel   = document.getElementById("tabelMasini");
    var pozEl   = document.getElementById("pozitie");
    var culoare = document.getElementById("culoareTabel").value;
    var msgEl   = document.getElementById("tabelMsg");
    var poz     = parseInt(pozEl.value);

    msgEl.textContent = "";

    if (isNaN(poz) || poz < 1) {
        msgEl.style.color = "#c62828";
        msgEl.textContent = "Introduceti o pozitie valida (minim 1).";
        return;
    }

    /* tabel.rows returns all rows including thead - used for NodeList navigation */
    var toateRandurile = tabel.rows;

    for (var i = 0; i < toateRandurile.length; i++) {
        var rand   = toateRandurile[i];
        var celule = rand.cells;

        /* Use th for header row, td for body rows */
        var celNou;
        if (rand.parentNode.tagName === "THEAD") {
            celNou             = document.createElement("th");
            celNou.textContent = "Col.";
        } else {
            celNou             = document.createElement("td");
            celNou.textContent = "-";
        }
        celNou.style.backgroundColor = culoare;

        /* Insert cell at index (poz - 1) */
        if (poz - 1 >= celule.length) {
            rand.appendChild(celNou);
        } else {
            rand.insertBefore(celNou, celule[poz - 1]);
        }
    }

    msgEl.style.color = "#2e7d32";
    msgEl.textContent = "Coloana inserata la pozitia " + poz + ".";
}

function initPaginaInvat() {
    afiseazaInfo();
    initCanvas();
    
}
//=========================================================================
function schimbaContinut(resursa, jsFisier, jsFunctie) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        document.getElementById("continut").innerHTML = this.responseText;
        if (jsFisier) {
            var elementScript = document.createElement('script');
            elementScript.onload = function () {
            console.log("hello");
            if (jsFunctie) {
                window[jsFunctie]();
                }
            };
            elementScript.src = jsFisier;
            document.head.appendChild(elementScript);
            } else {
                if (jsFunctie) {
                    window[jsFunctie]();
                }
            }
        }
        };
    xhttp.open("GET", resursa + ".html", true);
    xhttp.send();
}