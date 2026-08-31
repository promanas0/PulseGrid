import fs from 'fs';

// Let's read the main and footer
let main = fs.readFileSync('agent_ai_main_extracted.html', 'utf8');
let footer = fs.readFileSync('agent_ai_footer_extracted.html', 'utf8');

// Replace leading slash on images so they work with relative path
main = main.replace(/src=\"\/images\//g, 'src="images/');
main = main.replace(/src=\"\/hero-bg\.png\"/g, 'src="hero-bg.png"');
main = main.replace(/src=\"\/video-poster\.png\"/g, 'src="video-poster.png"');
main = main.replace(/src=\"\/logo\.svg\"/g, 'src="logo.png"');
footer = footer.replace(/src=\"\/logo\.svg\"/g, 'src="logo.png"');

// Fix internal navigation links
main = main.replace(/href=\"\/overview\"/g, 'href="#infrastructure"');
main = main.replace(/href=\"\/customers\"/g, 'href="#customers"');
main = main.replace(/href=\"\/blog\"/g, 'href="#capabilities"');
main = main.replace(/href=\"\/contact\"/g, 'href="archpulse.html?page=assistant"');
main = main.replace(/href=\"\/platform\"/g, 'href="archpulse.html"');
main = main.replace(/href=\"\/login\"/g, 'href="archpulse.html?page=wallet"');
main = main.replace(/href=\"\/signup\"/g, 'href="archpulse.html"');
main = main.replace(/href=\"\/demo\"/g, 'href="archpulse.html"');
main = main.replace(/href=\"\/pricing\"/g, 'href="#pricing"');

footer = footer.replace(/href=\"\/agent\"/g, 'href="archpulse.html?page=assistant"');
footer = footer.replace(/href=\"\/data\"/g, 'href="archpulse.html?page=monitor"');
footer = footer.replace(/href=\"\/tools\/[^\"]*\"/g, 'href="archpulse.html?page=swap"');
footer = footer.replace(/href=\"\/docs\"/g, 'href="https://testnet.arcscan.app"');
footer = footer.replace(/href=\"\/changelog\"/g, 'href="#roadmap"');
footer = footer.replace(/href=\"\/integrations\"/g, 'href="#capabilities"');
footer = footer.replace(/href=\"\/status\"/g, 'href="archpulse.html?page=monitor"');

// Strip out the outer <main> inside main if it exists
main = main.replace(/^<main[^>]*>/i, '').replace(/<\/main>$/i, '');

const finalHtml = `<!DOCTYPE html>
<html lang="en" class="dark scroll-smooth">
<head>
    <link rel="icon" type="image/png" href="logo.png">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Ai | AI Infrastructure &amp; Revenue Operations Platform</title>
    <meta name="description" content="Agent Ai gives revenue teams the data layer, workflow tools, integrations, and intelligent agents they need to automate go-to-market operations safely.">
    <meta property="og:title" content="Agent Ai | AI Infrastructure for Revenue Teams">
    <meta property="og:description" content="Launch autonomous AI agents that prospect, engage, qualify, and support customers while continuously learning from every interaction.">

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        neutral: {
                            950: '#0a0a0a',
                            900: '#171717',
                            800: '#262626',
                            700: '#404040',
                        }
                    },
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
                        mono: ['"Fira Code"', 'monospace'],
                    },
                    animation: {
                        'marquee': 'marquee 30s linear infinite',
                        'marquee-reverse': 'marquee-reverse 30s linear infinite',
                        'accordion-down': 'accordionDown 0.2s ease-out',
                        'accordion-up': 'accordionUp 0.2s ease-out',
                    },
                    keyframes: {
                        marquee: {
                            '0%': { transform: 'translateX(0%)' },
                            '100%': { transform: 'translateX(-50%)' }
                        },
                        'marquee-reverse': {
                            '0%': { transform: 'translateX(-50%)' },
                            '100%': { transform: 'translateX(0%)' }
                        },
                        accordionDown: {
                            from: { height: '0', opacity: '0' },
                            to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
                        },
                        accordionUp: {
                            from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
                            to: { height: '0', opacity: '0' }
                        }
                    }
                }
            }
        }
    </script>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet">
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            background-color: #0a0a0a;
            color: #ffffff;
            overflow-x: hidden;
        }

        .bg-gradient {
            background-image: radial-gradient(120% 80% at 50% 0%, rgba(255, 200, 150, 0.055), transparent 60%);
        }

        /* Marquee Animation Support */
        .marquee-container {
            position: relative;
            width: 100%;
            overflow: hidden;
            mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee 25s linear infinite;
            gap: 3rem;
            align-items: center;
        }
        .marquee-track:hover {
            animation-play-state: paused;
        }

        /* FAQ Accordion Transitions */
        .faq-content {
            display: none;
            overflow: hidden;
            transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
        }
        .faq-content.open {
            display: block;
        }
        .faq-icon {
            transition: transform 0.2s ease;
        }
        .faq-icon.rotate-45 {
            transform: rotate(45deg);
        }

        /* Tab Switcher in Infrastructure */
        .infra-tab-content {
            display: none;
        }
        .infra-tab-content.active {
            display: block;
            animation: fadeIn 0.3s ease forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #262626; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #404040; }
    </style>
</head>

<body class="bg-neutral-950 text-white min-h-screen selection:bg-white selection:text-neutral-950">

    <!-- ════════════════════════ STICKY NAVBAR ════════════════════════ -->
    <nav class="sticky top-0 z-50 w-full bg-neutral-950/90 backdrop-blur-md border-b border-white/[0.06]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16 md:h-20">
                
                <!-- Logo -->
                <a class="flex items-center gap-2 text-white z-50 group" href="index.html">
                    <img alt="logo" width="28" height="28" class="rounded-lg border border-white/20 p-0.5 bg-neutral-900 object-cover" src="logo.png"/>
                    <span class="text-lg font-semibold tracking-tight text-white group-hover:text-white/80 transition-colors">Agent Ai</span>
                </a>

                <!-- Desktop Navigation Links -->
                <div class="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    <a class="text-sm text-white/55 hover:text-white transition-colors font-medium" href="#overview">Overview</a>
                    <a class="text-sm text-white/55 hover:text-white transition-colors font-medium" href="#customers">Customers</a>
                    <a class="text-sm text-white/55 hover:text-white transition-colors font-medium" href="#capabilities">Platform</a>
                    <a class="text-sm text-white/55 hover:text-white transition-colors font-medium" href="#pricing">Pricing</a>
                    <a class="text-sm text-white/55 hover:text-white transition-colors font-medium" href="#faq">FAQ</a>
                </div>

                <!-- Auth / Action Buttons -->
                <div class="hidden md:flex items-center gap-4">
                    <a class="text-sm text-white/55 hover:text-white transition-colors font-medium" href="archpulse.html?page=wallet">Login</a>
                    <a class="bg-white text-neutral-950 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors shadow-sm" href="archpulse.html">Launch App</a>
                </div>

                <!-- Mobile Menu Button -->
                <button id="mobile-menu-btn" onclick="toggleMobileNav()" class="md:hidden text-white p-2 rounded-lg hover:bg-white/5" aria-label="Toggle menu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>
                </button>
            </div>
        </div>

        <!-- Mobile Menu Dropdown -->
        <div id="mobile-menu" class="hidden md:hidden bg-neutral-950/95 border-b border-white/[0.08] px-6 py-5 flex-col gap-4 text-sm font-medium">
            <a class="text-white/70 hover:text-white py-1" href="#overview" onclick="toggleMobileNav()">Overview</a>
            <a class="text-white/70 hover:text-white py-1" href="#customers" onclick="toggleMobileNav()">Customers</a>
            <a class="text-white/70 hover:text-white py-1" href="#capabilities" onclick="toggleMobileNav()">Platform</a>
            <a class="text-white/70 hover:text-white py-1" href="#pricing" onclick="toggleMobileNav()">Pricing</a>
            <a class="text-white/70 hover:text-white py-1" href="#faq" onclick="toggleMobileNav()">FAQ</a>
            <div class="pt-3 border-t border-white/10 flex gap-3">
                <a class="flex-1 text-center py-2 rounded-lg border border-white/20 text-white text-xs font-semibold" href="archpulse.html?page=wallet">Login</a>
                <a class="flex-1 text-center py-2 rounded-lg bg-white text-neutral-950 text-xs font-bold" href="archpulse.html">Launch App</a>
            </div>
        </div>
    </nav>

    <!-- ════════════════════════ MAIN CONTENT (12 SECTIONS) ════════════════════════ -->
    <main id="overview" class="w-full min-h-screen bg-neutral-950">
        ${main}
    </main>

    <!-- ════════════════════════ FOOTER ════════════════════════ -->
    ${footer}

    <!-- ════════════════════════ INTERACTIVE SCRIPTS ════════════════════════ -->
    <script>
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Mobile Nav Toggle
        function toggleMobileNav() {
            const menu = document.getElementById('mobile-menu');
            if (menu) {
                menu.classList.toggle('hidden');
                menu.classList.toggle('flex');
            }
        }

        // Infrastructure Tab Switcher Logic
        document.addEventListener('DOMContentLoaded', () => {
            const tabLinks = document.querySelectorAll('section[data-section="infrastructure"] nav a');
            const tabPanels = document.querySelectorAll('section[data-section="infrastructure"] .lg\\:col-span-9 > article');

            if (tabLinks.length && tabPanels.length) {
                // Ensure the first panel is visible and others are displayed properly
                tabLinks.forEach((link, idx) => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        
                        // Update active styling on nav
                        tabLinks.forEach(l => {
                            l.classList.remove('bg-white/[0.04]', 'border-l-2', 'border-white');
                            l.classList.add('opacity-70');
                        });
                        link.classList.add('bg-white/[0.04]', 'border-l-2', 'border-white');
                        link.classList.remove('opacity-70');

                        // Scroll smoothly to target or show target panel
                        const targetId = link.getAttribute('href').replace('#', '');
                        const targetArticle = document.getElementById(targetId);
                        if (targetArticle) {
                            targetArticle.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    });
                });
            }

            // FAQ Accordions Toggle Logic
            const faqItems = document.querySelectorAll('section[data-section="faq"] [data-state]');
            faqItems.forEach(item => {
                const trigger = item.querySelector('button') || item.querySelector('h3') || item.firstElementChild;
                const content = item.querySelector('[role="region"]') || item.querySelector('div:last-child');
                const icon = item.querySelector('svg');

                if (trigger && content) {
                    trigger.style.cursor = 'pointer';
                    trigger.addEventListener('click', () => {
                        const isExpanded = item.getAttribute('data-state') === 'open';
                        
                        if (isExpanded) {
                            item.setAttribute('data-state', 'closed');
                            content.style.display = 'none';
                            if (icon) icon.style.transform = 'rotate(0deg)';
                        } else {
                            item.setAttribute('data-state', 'open');
                            content.style.display = 'block';
                            if (icon) icon.style.transform = 'rotate(45deg)';
                        }
                    });
                }
            });
        });
    </script>
</body>
</html>
`;

fs.writeFileSync('index.html', finalHtml);
console.log('Successfully updated index.html with clean relative paths, total size:', finalHtml.length);
