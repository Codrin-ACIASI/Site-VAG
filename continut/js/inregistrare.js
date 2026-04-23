function initInregistrare() {
    var form = document.getElementById('form-inregistrare');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Colectează datele din formular
        var date = {};
        var inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(function (el) {
            if (el.name) {
                if (el.type === 'checkbox') {
                    date[el.name] = el.checked;
                } else {
                    date[el.name] = el.value;
                }
            }
        });

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/utilizatori', true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function () {
            var mesaj = document.getElementById('reg-mesaj');
            if (!mesaj) return;

            if (this.status === 200 || this.status === 201) {
                mesaj.style.display = 'block';
                mesaj.style.background = '#d4edda';
                mesaj.style.color = '#155724';
                mesaj.style.border = '1px solid #c3e6cb';
                mesaj.textContent = '✓ Înregistrare realizată cu succes!';
                form.reset();
            } else {
                mesaj.style.display = 'block';
                mesaj.style.background = '#f8d7da';
                mesaj.style.color = '#721c24';
                mesaj.style.border = '1px solid #f5c6cb';
                mesaj.textContent = '✗ Eroare la înregistrare (status: ' + this.status + ').';
            }
        };

        xhr.onerror = function () {
            var mesaj = document.getElementById('reg-mesaj');
            if (mesaj) {
                mesaj.style.display = 'block';
                mesaj.style.background = '#f8d7da';
                mesaj.style.color = '#721c24';
                mesaj.style.border = '1px solid #f5c6cb';
                mesaj.textContent = '✗ Eroare de rețea.';
            }
        };

        xhr.send(JSON.stringify(date));
    });
}