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
                document.getElementById('locatie').innerHTML = "Locație indisponibilă";
            }
        );
    } else {
        document.getElementById('locatie').innerHTML = "Locație indisponibilă";
    }

    document.getElementById('browser').innerHTML = navigator.appName + " " + navigator.appVersion;
    document.getElementById('os').innerHTML = navigator.platform;
}