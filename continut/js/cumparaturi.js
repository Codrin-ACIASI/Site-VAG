class StorageBase {
    save(produs) { throw new Error("save() not implemented"); }
    getAll() { throw new Error("getAll() not implemented"); }
    clear() { throw new Error("clear() not implemented"); }
}

class LocalStorage extends StorageBase {
    constructor() {
        super();
        this.key = "cumparaturi";
    }

    save(produs) {
        return new Promise((resolve) => {
            const lista = this.getAll();
            lista.push(produs);
            localStorage.setItem(this.key, JSON.stringify(lista));
            resolve(produs);
        });
    }

    getAll() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    clear() {
        return new Promise((resolve) => {
            localStorage.removeItem(this.key);
            resolve();
        });
    }
}

class IndexedDBStorage extends StorageBase {
    constructor() {
        super();
        this.dbName = "cumparaturiDB";
        this.storeName = "produse";
        this.db = null;
    }

    init() {
        return new Promise((resolve, reject) => {
            if (this.db) { resolve(); return; }
            const req = indexedDB.open(this.dbName, 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: "id", autoIncrement: true });
                }
            };
            req.onsuccess = (e) => { this.db = e.target.result; resolve(); };
            req.onerror = () => reject(req.error);
        });
    }

    save(produs) {
        return this.init().then(() => new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            const req = store.add(produs);
            req.onsuccess = () => resolve(produs);
            req.onerror = () => reject(req.error);
        }));
    }

    getAll() {
        return this.init().then(() => new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, "readonly");
            const store = tx.objectStore(this.storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        }));
    }

    clear() {
        return this.init().then(() => new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        }));
    }
}

class Produs {
    constructor(id, nume, cantitate) {
        this.id = id;
        this.nume = nume;
        this.cantitate = cantitate;
    }
}

let storageInstance = new LocalStorage();
let worker = null;

const initWorker = () => {
    if (worker) { worker.terminate(); worker = null; }
    worker = new Worker("js/worker.js");
    worker.onmessage = (e) => addRowToTable(e.data);
};

const getNextId = () => {
    return new Promise((resolve) => {
        const result = storageInstance.getAll();
        if (result && result.then) {
            result.then(lista => {
                resolve(lista.length > 0 ? Math.max(...lista.map(p => p.id)) + 1 : 1);
            });
        } else {
            resolve(result.length > 0 ? Math.max(...result.map(p => p.id)) + 1 : 1);
        }
    });
};

const addRowToTable = (produs) => {
    const tbody = document.getElementById("lista-tbody");
    if (!tbody) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${produs.id}</td><td>${produs.nume}</td><td>${produs.cantitate}</td>`;
    tbody.appendChild(tr);
};

const loadTableFromStorage = () => {
    const tbody = document.getElementById("lista-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const result = storageInstance.getAll();
    if (result && result.then) {
        result.then(lista => lista.forEach(p => addRowToTable(p)));
    } else {
        result.forEach(p => addRowToTable(p));
    }
};

const clearList = () => {
    const tbody = document.getElementById("lista-tbody");
    if (tbody) tbody.innerHTML = "";
    storageInstance.clear();
};

const switchStorage = (type) => {
    storageInstance = type === "indexeddb" ? new IndexedDBStorage() : new LocalStorage();
    loadTableFromStorage();
};

const adaugaProdus = () => {
    const numeEl = document.getElementById("camp-nume");
    const cantEl = document.getElementById("camp-cantitate");
    if (!numeEl || !cantEl) return;

    const nume = numeEl.value.trim();
    const cantitate = cantEl.value.trim();
    if (!nume || !cantitate) return;

    getNextId().then(id => {
        const produs = new Produs(id, nume, cantitate);
        storageInstance.save(produs).then(() => {
            worker.postMessage(produs);
            numeEl.value = "";
            cantEl.value = "";
        });
    });
};

const initCumparaturi = () => {
    console.log("init cumparaturi ruleaza");

    initWorker();
    loadTableFromStorage();

    const btnAdd = document.getElementById("btn-adauga");
    const btnClear = document.getElementById("btn-clear");
    const storageType = document.getElementById("storage-type");

    if (btnAdd) btnAdd.addEventListener("click", adaugaProdus);
    if (btnClear) btnClear.addEventListener("click", clearList);
    if (storageType) storageType.addEventListener("change", (e) => switchStorage(e.target.value));
};

window.initCumparaturi = initCumparaturi;