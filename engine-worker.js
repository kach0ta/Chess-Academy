// Stockfish 19 lite single-threaded UCI worker.
// The engine and its WASM binary are fetched from jsDelivr on first analysis.
const ENGINE_BASE = "https://cdn.jsdelivr.net/npm/stockfish@19.0.1/";
self.Module = {
  locateFile(path) {
    return ENGINE_BASE + path;
  }
};
importScripts(ENGINE_BASE + "stockfish-19-lite-single.js");
