/* ===========================================================
                    Browser and system info
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
    document.getElementById('limba').innerHTML = navigator.language;
}

/* ===========================================================
                    hamburger nav toggle
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
                     Interactive canvas
   =========================================================== */

var canvasState = {
    canvas:  null,
    ctx:     null,
    primaAp: false,
    x1: 0,
    y1: 0
};

function initCanvas() {
    var canvas = document.getElementById("desenCanvas");
    if (!canvas) return;

    canvasState.canvas = canvas;
    canvasState.ctx    = canvas.getContext("2d");

    canvas.width  = canvas.offsetWidth  || 800;
    canvas.height = canvas.offsetHeight || 420;

    deseneazaFundal();

    canvas.addEventListener("click", onCanvasClick);

    var slider   = document.getElementById("grosimeContur");
    var valLabel = document.getElementById("grosimeVal");
    if (slider && valLabel) {
        slider.addEventListener("input", function () {
            valLabel.textContent = slider.value;
        });
    }
}

function deseneazaFundal() {
    var ctx = canvasState.ctx;
    var w   = canvasState.canvas.width;
    var h   = canvasState.canvas.height;

    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#eef2ff");
    grad.addColorStop(1, "#dce4f5");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#001850";
    ctx.fillStyle   = "rgba(0, 24, 80, 0.08)";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.roundRect(30, 30, 280, 80, 10);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#0047ab";
    ctx.fillStyle   = "rgba(0, 71, 171, 0.10)";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.roundRect(w - 220, h - 110, 190, 80, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#001850";
    ctx.font      = "bold 14px sans-serif";
    ctx.fillText("Volkswagen Group - Interactive Canvas", 40, 80);

    ctx.fillStyle = "#555";
    ctx.font      = "12px sans-serif";
    ctx.fillText("Click to start drawing rectangles!", w / 2 - 110, h / 2);
}

function onCanvasClick(e) {
    var rect   = canvasState.canvas.getBoundingClientRect();
    var scaleX = canvasState.canvas.width  / rect.width;
    var scaleY = canvasState.canvas.height / rect.height;
    var mx = (e.clientX - rect.left) * scaleX;
    var my = (e.clientY - rect.top)  * scaleY;

    if (!canvasState.primaAp) {
        canvasState.x1      = mx;
        canvasState.y1      = my;
        canvasState.primaAp = true;

        var ctx = canvasState.ctx;
        ctx.fillStyle = "#0047ab";
        ctx.beginPath();
        ctx.arc(mx, my, 2, 0, 2 * Math.PI);
        ctx.fill();
    } else {
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

function stergeCanvas() {
    var canvas = canvasState.canvas;
    var ctx    = canvasState.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    deseneazaFundal();
    canvasState.primaAp = false;
}

/* ===========================================================
                         Dynamic table
   =========================================================== */

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

    var nrColoane = (randuri.length > 0)
        ? randuri[0].cells.length
        : tabel.querySelector("thead tr").cells.length;

    var randNou = document.createElement("tr");
    for (var i = 0; i < nrColoane; i++) {
        var celula = document.createElement("td");
        celula.textContent           = "-";
        celula.style.backgroundColor = culoare;
        randNou.appendChild(celula);
    }

    if (poz - 1 >= randuri.length) {
        tbody.appendChild(randNou);
    } else {
        tbody.insertBefore(randNou, randuri[poz - 1]);
    }

    msgEl.style.color = "#2e7d32";
    msgEl.textContent = "Linie inserata la pozitia " + poz + ".";
}

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

    var toateRandurile = tabel.rows;

    for (var i = 0; i < toateRandurile.length; i++) {
        var rand   = toateRandurile[i];
        var celule = rand.cells;

        var celNou;
        if (rand.parentNode.tagName === "THEAD") {
            celNou             = document.createElement("th");
            celNou.textContent = "Col.";
        } else {
            celNou             = document.createElement("td");
            celNou.textContent = "-";
        }
        celNou.style.backgroundColor = culoare;

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

/* ===========================================================
                        pentru index
   =========================================================== */

function schimbaContinut(resursa, jsFisier, jsFunctie) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            document.getElementById("continut").innerHTML = this.responseText;

            if (jsFisier) {
                var scriptExistent = document.querySelector('script[src="' + jsFisier + '"]');

                const ruleazaFunctia = () => {
                    setTimeout(() => {
                        if (jsFunctie && typeof window[jsFunctie] === "function") {
                            window[jsFunctie]();
                        }
                    }, 50);
                };

                if (scriptExistent) {
                    ruleazaFunctia();
                } else {
                    var elementScript = document.createElement('script');

                    elementScript.onload = function() {
                        ruleazaFunctia();
                    };

                    elementScript.src = jsFisier;
                    document.head.appendChild(elementScript);
                }

            } else {
                if (jsFunctie && typeof window[jsFunctie] === "function") {
                    window[jsFunctie]();
                }
            }
        }
    };

    xhttp.open("GET", resursa + ".html", true);
    xhttp.send();
}
/* ===========================================================
                        Inregistrare
   =========================================================== */

function initInregistrare() {
    const form = document.querySelector('.RegContent form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const utilizatorNou = {
            username:      document.getElementById('username').value,
            nume:          document.getElementById('nume').value,
            prenume:       document.getElementById('prenume').value,
            email:         document.getElementById('email').value,
            telefon:       document.getElementById('telefon').value,
            parola:        document.getElementById('parola').value,
            sex:           document.getElementById('sex').value,
            mancare:       document.getElementById('mancare').value,
            culoare:       document.getElementById('culoare').value,
            data_nasterii: document.getElementById('data_nasterii').value,
            ora_nasterii:  document.getElementById('ora_nasterii').value,
            varsta:        document.getElementById('varsta').value,
            url_personal:  document.getElementById('url_personal').value,
            descriere:     document.getElementById('descriere').value,
        };

        const existenti = JSON.parse(localStorage.getItem('utilizatori') || '[]');

        const duplicat = existenti.find(u => u.username === utilizatorNou.username);
        if (duplicat) {
            alert('Username-ul exista deja!');
            return;
        }

        existenti.push(utilizatorNou);
        localStorage.setItem('utilizatori', JSON.stringify(existenti));

        alert('Inregistrare reusita!');
        form.reset();
    });
}