function parseNaturalIntent(text) {
    if (!text) return null;
    let raw = text.trim();
    
    // 1. Check if prompt contains an EVM address FIRST
    const addrMatch = raw.match(/(0x[a-fA-F0-9]{40})/i);
    const recipient = addrMatch ? addrMatch[1] : null;

    let clean = raw.toLowerCase();
    clean = clean.replace(/->|=>|-->/g, ' to ');
    clean = clean.replace(/\beura\b/g, 'eurc').replace(/\beuro\b/g, 'eurc');

    // If an address is present, it's either BATCH or SEND
    if (recipient) {
        // Remove address for numeric extraction
        const cleanWithoutAddr = clean.replace(recipient.toLowerCase(), '');
        if (/(batch|bar|baar|times|multiple|lagatar)/i.test(cleanWithoutAddr)) {
            const countMatch = cleanWithoutAddr.match(/([0-9]+)\s*(?:transactions|txs|transfers|payments|bar|baar|times)/i) || cleanWithoutAddr.match(/(?:batch|send|bhej|kar)\s*([0-9]+)/i);
            const count = countMatch ? parseInt(countMatch[1]) : 5;
            const strWithoutCount = cleanWithoutAddr.replace(countMatch ? countMatch[0] : '', '');
            const amtMatch = strWithoutCount.match(/([0-9.]+)\s*(?:usdc)?/i);
            const amt = amtMatch ? parseFloat(amtMatch[1]) : 0.05;
            return { type: 'BATCH', count, amountPerTx: amt, recipient };
        } else {
            const amtMatch = cleanWithoutAddr.match(/([0-9.]+)\s*(?:usdc)?/i);
            const amt = amtMatch ? parseFloat(amtMatch[1]) : 0.1;
            return { type: 'SEND', amount: amt, recipient };
        }
    }

    // Now safely split attached units like '1usdc' -> '1 usdc'
    clean = clean.replace(/([0-9.]+)([a-z]+)/g, '$1 $2');

    // If stake is mentioned
    if (/(stake|delegate|staking)/i.test(clean)) {
        const amtMatch = clean.match(/([0-9.]+)\s*(?:usdc)?/i);
        const amt = amtMatch ? parseFloat(amtMatch[1]) : 1.0;
        return { type: 'STAKE', amount: amt };
    }

    // SWAP: match any variation of "1 usdc se eurc kardo", "1usdc to eura", "swap 1 usdc to eurc", "1 usdc ko eurc me badal do", "1 usdc to eth"
    const swapMatch = clean.match(/([0-9.]+)\s*([a-z0-9]+)?\s*(?:se|ko|to|for|into|me|mai|mein|in)\s*([a-z0-9]+)/i) || 
                      clean.match(/(?:swap|convert|exchange|badal|change)\s+([0-9.]+)\s*([a-z0-9]+)?(?:\s*(?:to|for|se|into)\s*([a-z0-9]+))?/i);
    if (swapMatch) {
        const amt = parseFloat(swapMatch[1]);
        let token1 = (swapMatch[2] || 'USDC').toUpperCase();
        let token2 = (swapMatch[3] || 'EURC').toUpperCase();
        const validTokens = ['USDC', 'EURC', 'ETH', 'PUSDC', 'ARC', 'BTC', 'SOL', 'USDT', 'DAI'];
        if (validTokens.includes(token2) || validTokens.includes(token1)) {
            if (!validTokens.includes(token1)) token1 = 'USDC';
            if (!validTokens.includes(token2)) token2 = 'EURC';
            if (token1 === token2) token1 = token2 === 'USDC' ? 'EURC' : 'USDC';
            return { type: 'SWAP', amount: amt, from: token1, to: token2 };
        }
    }

    return null;
}

const allTests = [
    "1 usdc se eura swap kardo",
    "1usdc to eura",
    "1 usdc to eurc",
    "swap 1 usdc to eurc",
    "1 usdc ko eurc me badal do",
    "1usdc -> eurc",
    "0.5usdc to eth",
    "2 usdc into eurc convert kardo",
    "0.1 usdc bhejdo 0xfa666800e07445ca35103a01f113Eb3CEAe4dcea ko",
    "send 1usdc to 0xfa666800e07445ca35103a01f113Eb3CEAe4dcea",
    "5 baar 0.05 usdc bhejdo 0xfa666800e07445ca35103a01f113Eb3CEAe4dcea ko",
    "1 usdc stake kardo",
    "stake 5usdc"
];

allTests.forEach(t => console.log(t, '=>', JSON.stringify(parseNaturalIntent(t))));
