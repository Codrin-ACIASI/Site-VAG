function verificaUtilizator() {
    var user = document.getElementById('ver-user').value.trim();
    var parola = document.getElementById('ver-parola').value.trim();
    var rezultat = document.getElementById('ver-rezultat');

    if (!user || !parola) {
        rezultat.style.display = 'block';
        rezultat.style.background = '#fff3cd';
        rezultat.style.color = '#856404';
        rezultat.style.border = '1px solid #ffc107';
        rezultat.textContent = 'Vă rugăm completați ambele câmpuri.';
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/resurse/utilizatori.json', true);
    xhr.onload = function () {
        if (this.status === 200) {
            var utilizatori;
            try {
                utilizatori = JSON.parse(this.responseText);
            } catch (e) {
                rezultat.style.display = 'block';
                rezultat.style.background = '#f8d7da';
                rezultat.style.color = '#721c24';
                rezultat.style.border = '1px solid #f5c6cb';
                rezultat.textContent = 'Eroare la parsarea fișierului JSON.';
                return;
            }

            var gasit = false;
            for (var i = 0; i < utilizatori.length; i++) {
                if (utilizatori[i].utilizator === user && utilizatori[i].parola === parola) {
                    gasit = true;
                    break;
                }
            }

            rezultat.style.display = 'block';
            if (gasit) {
                rezultat.style.background = '#d4edda';
                rezultat.style.color = '#155724';
                rezultat.style.border = '1px solid #c3e6cb';
                rezultat.textContent = '✓ Utilizator și parolă corecte! Bine ați venit, ' + user + '!';
            } else {
                rezultat.style.background = '#f8d7da';
                rezultat.style.color = '#721c24';
                rezultat.style.border = '1px solid #f5c6cb';
                rezultat.textContent = '✗ Numele de utilizator sau parola sunt incorecte.';
            }
        } else {
            rezultat.style.display = 'block';
            rezultat.style.background = '#f8d7da';
            rezultat.style.color = '#721c24';
            rezultat.style.border = '1px solid #f5c6cb';
            rezultat.textContent = 'Eroare la încărcarea fișierului utilizatori.json (status: ' + this.status + ').';
        }
    };
    xhr.onerror = function () {
        rezultat.style.display = 'block';
        rezultat.style.background = '#f8d7da';
        rezultat.style.color = '#721c24';
        rezultat.style.border = '1px solid #f5c6cb';
        rezultat.textContent = 'Eroare de rețea.';
    };
    xhr.send();
}