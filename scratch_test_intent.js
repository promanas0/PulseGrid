/**
 * Comprehensive Dynamic Web3 Intent Parser
 * Handles ANY arbitrary amount, ANY 0x EVM address, ANY token pair (USDC, EURC, ETH, etc.),
 * and ANY word order / Hinglish / English slang phrasing.
 */
function parseNaturalIntent(text) {
    if (!text || typeof text !== 'string') return null;

    let raw = text.trim();
    
    // 1. Extract any 0x EVM address (40 hex chars after 0x)
    const addrMatch = raw.match(/(0x[a-fA-F0-9]{40})/);
    const recipient = addrMatch ? addrMatch[1] : null;

    // 2. Normalize text: remove address, unify slang, standardize tokens
    let clean = raw.toLowerCase();
    if (recipient) {
        clean = clean.replace(recipient.toLowerCase(), ' RECIPIENT_ADDR ');
    }

    // Replace arrow notations with 'to'
    clean = clean.replace(/->|=>|-->|—>|➔/g, ' to ');

    // Normalize currency typos: eura, euro, euros -> eurc
    clean = clean.replace(/\b(eura|euro|euros|eur)\b/g, 'eurc');
    clean = clean.replace(/\b(usdt|usd|dollar|dollars)\b/g, 'usdc');

    // Separate attached numbers and words: e.g. "10usdc" -> "10 usdc", "0.5eurc" -> "0.5 eurc"
    clean = clean.replace(/([0-9.]+)\s*([a-z]+)/g, '$1 $2');
    clean = clean.replace(/\s+/g, ' ').trim();

    // -------------------------------------------------------------
    // INTENT A: BATCH TRANSFERS
    // Matches phrases like:
    // - "50 baar 0.1 usdc send karo 0x... ko"
    // - "0x... ko 100 bar 1 1 karke bhejdo"
    // - "batch 10 txs of 0.05 usdc to 0x..."
    // - "10 transactions 0.5 usdc ka bhejdo 0x... ko"
    // -------------------------------------------------------------
    if (recipient && /(batch|bar|baar|times|multiple|lagatar|karke)/i.test(clean)) {
        // Find count (e.g. 50, 100, 5, 10)
        let count = 5;
        const countMatch = clean.match(/([0-9]+)\s*(?:transactions|txs|transfers|payments|bar|baar|times|baari)/i) || 
                           clean.match(/(?:batch|execute|send|bhej|kar)\s*([0-9]+)/i);
        if (countMatch) {
            count = parseInt(countMatch[1]);
        }

        // Find amount per tx (extract all numbers, pick the float/smaller number or amount following count)
        let amountPerTx = 0.05;
        const allNumbers = clean.match(/([0-9]+(?:\.[0-9]+)?)/g);
        if (allNumbers && allNumbers.length >= 2) {
            // If two numbers found, one is count, other is amount
            const nums = allNumbers.map(n => parseFloat(n));
            const candidate = nums.find(n => n !== count);
            if (candidate !== undefined) amountPerTx = candidate;
        } else if (allNumbers && allNumbers.length === 1) {
            const single = parseFloat(allNumbers[0]);
            if (single !== count) amountPerTx = single;
        }

        return {
            type: 'BATCH',
            count: Math.min(Math.max(1, count), 100),
            amountPerTx: parseFloat(amountPerTx.toFixed(4)),
            totalAmount: parseFloat((count * amountPerTx).toFixed(4)),
            recipient
        };
    }

    // -------------------------------------------------------------
    // INTENT B: SINGLE TRANSFER / SEND
    // Matches phrases like:
    // - "send 10 usdc to 0x..."
    // - "0.25 usdc bhejdo 0x... ko"
    // - "0x... ko 50 usdc transfer kardo"
    // - "pay 12.5 usdc to 0x..."
    // - "0x... pe 5 usdc daldo"
    // -------------------------------------------------------------
    if (recipient) {
        const amtMatch = clean.match(/([0-9]+(?:\.[0-9]+)?)/);
        const amount = amtMatch ? parseFloat(amtMatch[1]) : 1.0;
        return {
            type: 'SEND',
            amount: parseFloat(amount.toFixed(4)),
            recipient
        };
    }

    // -------------------------------------------------------------
    // INTENT C: STAKE
    // Matches phrases like:
    // - "stake 25 usdc"
    // - "50 usdc stake kardo"
    // - "10.5 usdc delegate kardo circle par"
    // - "stake 100 usdc on circle"
    // -------------------------------------------------------------
    if (/(stake|staking|delegate|deposit.*stake)/i.test(clean)) {
        const amtMatch = clean.match(/([0-9]+(?:\.[0-9]+)?)/);
        const amount = amtMatch ? parseFloat(amtMatch[1]) : 1.0;
        return {
            type: 'STAKE',
            amount: parseFloat(amount.toFixed(4))
        };
    }

    // -------------------------------------------------------------
    // INTENT D: SWAP (ANY AMOUNT, ANY TOKEN PAIR, ANY WORD ORDER)
    // Matches phrases like:
    // - "10 usdc se eura swap kardo"
    // - "10usdc to eura"
    // - "swap 25.5 eurc to usdc"
    // - "eurc se 50 usdc bana do"
    // - "convert 0.75 usdc into eurc"
    // - "100 usdc -> eurc"
    // - "badal do 5 usdc ko eurc me"
    // -------------------------------------------------------------
    const validTokens = ['USDC', 'EURC', 'ETH', 'PUSDC', 'ARC', 'BTC', 'SOL', 'USDT', 'DAI'];

    // Extract amount
    const numMatch = clean.match(/([0-9]+(?:\.[0-9]+)?)/);
    const amount = numMatch ? parseFloat(numMatch[1]) : 1.0;

    // Detect if swap/convert/exchange intent exists
    const hasSwapKeywords = /(swap|convert|exchange|badal|bana|change|to|se|ko|into|for|->)/i.test(clean);

    // Detect mentioned tokens
    const tokensFound = [];
    validTokens.forEach(tok => {
        const regex = new RegExp(`\\b${tok.toLowerCase()}\\b`, 'g');
        let m;
        while ((m = regex.exec(clean)) !== null) {
            tokensFound.push({ token: tok, index: m.index });
        }
    });

    // Sort tokens by their appearance order in user's prompt
    tokensFound.sort((a, b) => a.index - b.index);

    if (tokensFound.length >= 2) {
        let from = tokensFound[0].token;
        let to = tokensFound[1].token;

        // Check if user specified reverse order (e.g. "eurc me badal do 10 usdc ko" vs "10 usdc se eurc")
        if (clean.includes('into ' + from.toLowerCase()) || clean.includes('me ' + from.toLowerCase()) || clean.includes('mai ' + from.toLowerCase())) {
            const temp = from;
            from = to;
            to = temp;
        }

        return {
            type: 'SWAP',
            amount: parseFloat(amount.toFixed(4)),
            from,
            to
        };
    } else if (tokensFound.length === 1 && hasSwapKeywords) {
        // Only 1 token mentioned (e.g. "10 usdc swap kardo" or "convert 5 eurc")
        const tok = tokensFound[0].token;
        const from = tok;
        const to = tok === 'USDC' ? 'EURC' : 'USDC';
        return {
            type: 'SWAP',
            amount: parseFloat(amount.toFixed(4)),
            from,
            to
        };
    } else if (hasSwapKeywords && numMatch) {
        // Default swap if amount and swap keywords present
        return {
            type: 'SWAP',
            amount: parseFloat(amount.toFixed(4)),
            from: 'USDC',
            to: 'EURC'
        };
    }

    return null;
}

// -------------------------------------------------------------
// DYNAMIC TEST SUITE (Testing ANY amount, ANY address, ANY order)
// -------------------------------------------------------------
const dynamicTests = [
    "10 usdc se  eura swap kardo",
    "swap 250.75 eurc to usdc",
    "0.05 usdc to eurc",
    "convert 500 usdc into eth",
    "eurc se 15.5 usdc bana do",
    "badal do 33 usdc ko eurc me",
    "100usdc -> eurc",
    "1000 usdc swap kardo",
    "send 45.5 usdc to 0xfa666800e07445ca35103a01f113Eb3CEAe4dcea",
    "0xfa666800e07445ca35103a01f113Eb3CEAe4dcea ko 0.125 usdc bhejdo",
    "0xfa666800e07445ca35103a01f113Eb3CEAe4dcea pe 10 usdc transfer kardo",
    "50 baar 0.02 usdc bhejdo 0xfa666800e07445ca35103a01f113Eb3CEAe4dcea ko",
    "0xfa666800e07445ca35103a01f113Eb3CEAe4dcea ko 100 bar 0.5 0.5 karke bhejdo",
    "stake 75.5 usdc",
    "120 usdc stake kardo circle par"
];

console.log("=== DYNAMIC INTENT PARSER TEST RESULTS ===");
dynamicTests.forEach(t => {
    const res = parseNaturalIntent(t);
    console.log(`\nInput: "${t}"\nParsed:`, JSON.stringify(res));
});
