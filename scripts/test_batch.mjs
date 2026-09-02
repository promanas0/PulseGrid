function extractFirstAmount(text) {
    if (!text || typeof text !== 'string') return null;
    const m = text.match(/(?:\d+(?:\.\d+)?|\.\d+)/);
    if (!m) return null;
    const val = parseFloat(m[0]);
    return isNaN(val) ? null : val;
}

function parseBatchIntent(text) {
    let raw = text.trim();
    const addrMatch = raw.match(/(0x[a-fA-F0-9]{40})/i);
    const recipient = addrMatch ? addrMatch[1] : '0x90503974A22c3497728AfbcAf1ae7C77023592E7';
    let clean = raw.toLowerCase();
    if (addrMatch) clean = clean.replace(addrMatch[1].toLowerCase(), ' RECIPIENT_ADDR ');
    clean = clean.replace(/\b(usdt|usd|dollar|dollars)\b/g, 'usdc');
    clean = clean.replace(/([0-9.]+)\s*([a-z]+)/g, '$1 $2');
    clean = clean.replace(/\s+/g, ' ').trim();

    let count = 5;
    const countMatch = clean.match(/([0-9]+)\s*(?:transactions|txs|transfers|payments|bar|baar|times|baari|micro)/i) ||
                       clean.match(/(?:batch|execute|send|bhej|kar|kardo)\s*([0-9]+)/i);
    if (countMatch) {
        count = parseInt(countMatch[1]);
    }

    let amountPerTx = 0.001;
    const allNumbers = clean.match(/(?:\d+(?:\.\d+)?|\.\d+)/g);
    if (allNumbers && allNumbers.length >= 2) {
        const nums = allNumbers.map(n => parseFloat(n));
        const candidate = nums.find(n => n !== count);
        if (candidate !== undefined) amountPerTx = candidate;
    } else if (allNumbers && allNumbers.length === 1) {
        const single = parseFloat(allNumbers[0]);
        if (single !== count) amountPerTx = single;
    }

    // Clamp count strictly between 1 and 100
    count = Math.min(Math.max(1, count), 100);

    return {
        type: 'BATCH',
        count,
        amountPerTx: parseFloat(amountPerTx.toFixed(6)),
        totalAmount: parseFloat((count * amountPerTx).toFixed(6)),
        recipient
    };
}

console.log('1. "10 baar .001 bhej do to 0x90503974A22c3497728AfbcAf1ae7C77023592E7":', parseBatchIntent('10 baar .001 bhej do to 0x90503974A22c3497728AfbcAf1ae7C77023592E7'));
console.log('2. "25 micro transactions of 0.005 usdc to 0x9050...":', parseBatchIntent('25 micro transactions of 0.005 usdc to 0x90503974A22c3497728AfbcAf1ae7C77023592E7'));
console.log('3. "100 txs of .001 to 0x9050...":', parseBatchIntent('100 txs of .001 to 0x90503974A22c3497728AfbcAf1ae7C77023592E7'));
console.log('4. "50 baar 0.01 bhej do to 0x9050...":', parseBatchIntent('50 baar 0.01 bhej do to 0x90503974A22c3497728AfbcAf1ae7C77023592E7'));
console.log('5. "1 baar .05 bhej do to 0x9050...":', parseBatchIntent('1 baar .05 bhej do to 0x90503974A22c3497728AfbcAf1ae7C77023592E7'));
