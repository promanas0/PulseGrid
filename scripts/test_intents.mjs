function extractFirstAmount(text) {
    if (!text || typeof text !== 'string') return null;
    const m = text.match(/(?:\d+(?:\.\d+)?|\.\d+)/);
    if (!m) return null;
    const val = parseFloat(m[0]);
    return isNaN(val) ? null : val;
}

function parseNaturalIntent(text) {
    if (!text || typeof text !== 'string') return null;
    let raw = text.trim();
    const addrMatch = raw.match(/(0x[a-fA-F0-9]{40})/i);
    const recipient = addrMatch ? addrMatch[1] : null;
    let clean = raw.toLowerCase();
    if (recipient) clean = clean.replace(recipient.toLowerCase(), ' RECIPIENT_ADDR ');
    clean = clean.replace(/->|=>|-->|—>|➔/g, ' to ');
    clean = clean.replace(/\b(eura|euro|euros|eur)\b/g, 'eurc');
    clean = clean.replace(/\b(usdt|usd|dollar|dollars)\b/g, 'usdc');
    clean = clean.replace(/([0-9.]+)\s*([a-z]+)/g, '$1 $2');
    clean = clean.replace(/\s+/g, ' ').trim();

    if (recipient) {
        const parsedAmt = extractFirstAmount(clean);
        const amount = parsedAmt !== null ? parsedAmt : 0.001;
        return { type: 'SEND', amount: parseFloat(amount.toFixed(6)), recipient };
    }
    if (/(stake|staking|delegate|deposit.*stake)/i.test(clean)) {
        const parsedAmt = extractFirstAmount(clean);
        const amount = parsedAmt !== null ? parsedAmt : 1.0;
        return { type: 'STAKE', amount: parseFloat(amount.toFixed(6)) };
    }
    const validTokens = ['USDC', 'EURC', 'ETH', 'PUSDC', 'ARC', 'BTC', 'SOL', 'USDT', 'DAI'];
    const parsedAmt = extractFirstAmount(clean);
    const amount = parsedAmt !== null ? parsedAmt : 1.0;
    const hasSwapKeywords = /(swap|convert|exchange|badal|bana|change|to|se|ko|into|for|->)/i.test(clean);
    const tokensFound = [];
    validTokens.forEach(tok => {
        const regex = new RegExp('\\b' + tok.toLowerCase() + '\\b', 'g');
        let m;
        while ((m = regex.exec(clean)) !== null) tokensFound.push({ token: tok, index: m.index });
    });
    tokensFound.sort((a, b) => a.index - b.index);
    if (tokensFound.length >= 2) {
        let from = tokensFound[0].token;
        let to = tokensFound[1].token;
        if (clean.includes('into ' + from.toLowerCase()) || clean.includes('me ' + from.toLowerCase()) || clean.includes('mai ' + from.toLowerCase())) {
            const temp = from; from = to; to = temp;
        }
        return { type: 'SWAP', amount: parseFloat(amount.toFixed(6)), from, to };
    } else if (tokensFound.length === 1 && hasSwapKeywords) {
        const tok = tokensFound[0].token;
        return { type: 'SWAP', amount: parseFloat(amount.toFixed(6)), from: tok, to: tok === 'USDC' ? 'EURC' : 'USDC' };
    } else if (hasSwapKeywords && parsedAmt !== null) {
        return { type: 'SWAP', amount: parseFloat(amount.toFixed(6)), from: 'USDC', to: 'EURC' };
    }
    return null;
}

console.log('1. ".01 usdc to eurc":', parseNaturalIntent('.01 usdc to eurc'));
console.log('2. ".001 usdc to eurc":', parseNaturalIntent('.001 usdc to eurc'));
console.log('3. "0.001 usdc se eurc swap kardo":', parseNaturalIntent('0.001 usdc se eurc swap kardo'));
console.log('4. "send .001 usdc to 0x90503974A22c3497728AfbcAf1ae7C77023592E7":', parseNaturalIntent('send .001 usdc to 0x90503974A22c3497728AfbcAf1ae7C77023592E7'));
console.log('5. "stake .05 usdc":', parseNaturalIntent('stake .05 usdc'));
console.log('6. "10 usdc to eurc":', parseNaturalIntent('10 usdc to eurc'));
console.log('7. "0.5 usdc into eurc":', parseNaturalIntent('0.5 usdc into eurc'));
