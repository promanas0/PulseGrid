function extractFirstAmount(text) {
    if (!text || typeof text !== 'string') return null;
    const m = text.match(/(?:\d+(?:\.\d+)?|\.\d+)/);
    if (!m) return null;
    const val = parseFloat(m[0]);
    return isNaN(val) ? null : val;
}

function parseDurationSeconds(text) {
    if (!text) return 86400; // default 1 day
    const mDay = text.match(/([0-9]+)\s*(?:day|days|din)/i);
    if (mDay) return parseInt(mDay[1]) * 86400;
    const mHour = text.match(/([0-9]+)\s*(?:hour|hours|hr|hrs|ghanta|ghante)/i);
    if (mHour) return parseInt(mHour[1]) * 3600;
    const mMin = text.match(/([0-9]+)\s*(?:minute|minutes|min|mins)/i);
    if (mMin) return parseInt(mMin[1]) * 60;
    const mMonth = text.match(/([0-9]+)\s*(?:month|months|mahina|mahine)/i);
    if (mMonth) return parseInt(mMonth[1]) * 30 * 86400;
    return 86400;
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

    // 1. QUERY LOCKED BALANCE INTENT
    if (/(kitna.*lock|locked.*balance|show.*lock|check.*lock|how much.*lock|mera.*lock|view.*lock)/i.test(clean)) {
        return { type: 'QUERY_LOCK' };
    }

    // 2. WITHDRAW / UNLOCK LOCKED USDC INTENT
    if (/(withdraw.*lock|unlock.*usdc|unlock.*lock|nikal.*lock|withdraw.*unlocked)/i.test(clean)) {
        return { type: 'UNLOCK_USDC' };
    }

    // 3. LOCK USDC INTENT
    if (/\b(lock|time-lock|timelock)\b/i.test(clean) && !/(unlock|withdraw|show|check|kitna|view)/i.test(clean)) {
        const parsedAmt = extractFirstAmount(clean);
        const amount = parsedAmt !== null ? parsedAmt : 1.0;
        const durationSeconds = parseDurationSeconds(clean);
        return {
            type: 'LOCK_USDC',
            amount: parseFloat(amount.toFixed(6)),
            durationSeconds,
            reason: "AI Copilot Savings Lock"
        };
    }

    // 4. BATCH TRANSFERS INTENT (1 to 100)
    if (recipient && /(batch|bar|baar|times|multiple|lagatar|karke|txs|transactions|payments|transfers|micro)/i.test(clean)) {
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

        count = Math.min(Math.max(1, count), 100);

        return {
            type: 'BATCH',
            count,
            amountPerTx: parseFloat(amountPerTx.toFixed(6)),
            totalAmount: parseFloat((count * amountPerTx).toFixed(6)),
            recipient
        };
    }

    // 5. SINGLE SEND INTENT
    if (recipient) {
        const parsedAmt = extractFirstAmount(clean);
        const amount = parsedAmt !== null ? parsedAmt : 0.001;
        return {
            type: 'SEND',
            amount: parseFloat(amount.toFixed(6)),
            recipient
        };
    }

    // 6. STAKE INTENT
    if (/(stake|staking|delegate|deposit.*stake)/i.test(clean)) {
        const parsedAmt = extractFirstAmount(clean);
        const amount = parsedAmt !== null ? parsedAmt : 1.0;
        return {
            type: 'STAKE',
            amount: parseFloat(amount.toFixed(6))
        };
    }

    // 7. SWAP INTENT
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

console.log('1. "mera kitna usdc lock hai":', parseNaturalIntent('mera kitna usdc lock hai'));
console.log('2. "lock 5 usdc for 7 days":', parseNaturalIntent('lock 5 usdc for 7 days'));
console.log('3. "lock .01 usdc for 1 hour":', parseNaturalIntent('lock .01 usdc for 1 hour'));
console.log('4. "withdraw locked usdc":', parseNaturalIntent('withdraw locked usdc'));
console.log('5. "10 baar .001 bhej do to 0x90503974A22c3497728AfbcAf1ae7C77023592E7":', parseNaturalIntent('10 baar .001 bhej do to 0x90503974A22c3497728AfbcAf1ae7C77023592E7'));
console.log('6. "100 micro txs of .001 to 0x90503974A22c3497728AfbcAf1ae7C77023592E7":', parseNaturalIntent('100 micro txs of .001 to 0x90503974A22c3497728AfbcAf1ae7C77023592E7'));
