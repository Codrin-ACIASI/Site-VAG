self.onmessage = function(e) {
    const produs = e.data;
    console.log("worker: produs primit ->", produs);
    self.postMessage(produs);
};