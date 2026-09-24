/* global URL, console, document, document$, fetch, navigator, window */

(() => {
    const CHATGPT_URL = 'https://chatgpt.com/?q=';
    const CLAUDE_URL = 'https://claude.ai/new?q=';

    const icon = (path) => `
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="${path}"></path>
        </svg>
    `;

    const claudeIcon = icon(
        'm4.714 15.956 4.718-2.648.079-.23-.079-.128h-.231l-.789-.048-2.696-.073-2.337-.097-2.265-.122-.57-.121-.535-.705.055-.352.48-.322.686.061 1.518.103 2.276.158 1.652.097 2.447.255h.388l.055-.158-.134-.097-.103-.097-2.356-1.591-2.55-1.688-1.336-.972-.722-.491-.365-.462-.157-1.008.655-.722.88.06.225.061.893.686 1.906 1.475 2.489 1.834.364.303.146-.103.018-.073-.164-.273-1.354-2.447-1.445-2.489-.643-1.032-.17-.619-.104-.729.018-.449.413-.134.996.134.419.364.619 1.415 1.002 2.228 1.554 3.03.455.898.243.832.091.255h.158v-.146l.127-1.706.237-2.095.231-2.696.079-.759.376-.91.747-.492.583.279.48.686-.067.443-.286 1.852-.558 2.902-.364 1.943h.212l.243-.243.984-1.305 1.651-2.064.729-.82.85-.904.546-.431h1.032l.759 1.129-.34 1.166-1.062 1.348-.881 1.141-1.263 1.7-.789 1.36.073.109.188-.018 2.853-.607 1.542-.28 1.84-.315.832.389.09.394-.327.808-1.967.485-2.307.462-3.436.813-.043.031.049.06 1.548.146.662.036h1.621l3.017.225.789.522.474.637-.079.486-1.214.619-1.64-.389-3.825-.91-1.311-.328h-.182v.109l1.093 1.069 2.003 1.809 2.508 2.331.127.577-.322.455-.34-.048-2.204-1.658-.85-.746-1.924-1.621h-.128v.17l.443.649 2.344 3.522.121 1.08-.17.352-.607.213-.668-.122-1.372-1.924-1.336-2.046-1.141-1.943-.14.079-.674 7.255-.315.371-.729.279-.607-.462-.322-.746.322-1.476.389-1.924.315-1.53.286-1.9.17-.631-.012-.043-.14.019-1.433 1.967-2.179 2.945-1.724 1.845-.413.164-.716-.37.067-.662.4-.589 2.386-3.035 1.439-1.882.929-1.087-.006-.158h-.055l-6.338 4.117-1.13.145-.485-.455.06-.747.231-.242 1.906-1.312Z',
    );
    const chatGptIcon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M11.217 19.384A3.501 3.501 0 0 0 18 18.167V13l-6-3.35"></path>
            <path d="M5.214 15.014A3.501 3.501 0 0 0 9.66 20.28L14 17.746V10.8"></path>
            <path d="M6 7.63c-1.391-.236-2.787.395-3.534 1.689a3.474 3.474 0 0 0 1.271 4.745L8 16.578l6-3.348"></path>
            <path d="M12.783 4.616A3.501 3.501 0 0 0 6 5.833V10.9l6 3.45"></path>
            <path d="M18.786 8.986A3.501 3.501 0 0 0 14.34 3.72L10 6.254V13.2"></path>
            <path d="M18 16.302c1.391.236 2.787-.395 3.534-1.689a3.474 3.474 0 0 0-1.271-4.745l-4.308-2.514L10 10.774"></path>
        </svg>
    `;
    const copyIcon = icon(
        'M8 7V3h11v13h-4v5H4V7h4Zm2 0h5v7h2V5h-7v2Zm3 2H6v10h7V9Z',
    );
    const documentIcon = icon(
        'M6 2h8l4 4v16H6V2Zm2 2v16h8V8h-4V4H8Zm2 8h4v2h-4v-2Zm0 4h4v2h-4v-2Z',
    );
    const externalIcon = icon(
        'M14 4h6v6h-2V7.4l-7.3 7.3-1.4-1.4L16.6 6H14V4ZM5 6h6v2H7v9h9v-4h2v6H5V6Z',
    );
    const chevronIcon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m8 10 4 4 4-4"></path>
        </svg>
    `;

    const markdownUrlForPage = () => {
        // Published by hooks/agent_markdown.py on every page.
        const markdownLink = document.querySelector(
            'link[rel="alternate"][type="text/markdown"]',
        );
        if (markdownLink) {
            return new URL(
                markdownLink.getAttribute('href'),
                window.location.origin,
            ).href;
        }

        const url = new URL(window.location.href);
        let path = url.pathname;

        if (path.endsWith('/')) {
            path += 'index.md';
        } else if (path.endsWith('.html')) {
            path = `${path.slice(0, -5)}.md`;
        } else if (!path.endsWith('.md')) {
            path += '.md';
        }

        return `${url.origin}${path}`;
    };

    const promptForPage = (markdownUrl) => {
        return `Read from ${markdownUrl} so I can ask questions about it.`;
    };

    const copyText = async (text) => {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.append(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) {
            throw new Error('The browser did not grant clipboard access.');
        }
    };

    const menuLink = ({ href, label, description, itemIcon }) => {
        const link = document.createElement('a');
        link.className = 'futa-ai-menu__item';
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = `
            <span class="futa-ai-menu__icon">${itemIcon}</span>
            <span>
                <strong>${label}</strong>
                <small>${description}</small>
            </span>
            <span class="futa-ai-menu__external">${externalIcon}</span>
        `;
        return link;
    };

    const mountMenu = () => {
        const article = document.querySelector('.md-content__inner');
        if (!article || article.querySelector(':scope > .futa-ai-menu')) {
            return;
        }

        const markdownUrl = markdownUrlForPage();
        const plainTextUrl = markdownUrl.replace(/\.md$/, '.txt');
        const prompt = encodeURIComponent(promptForPage(markdownUrl));
        const menu = document.createElement('div');
        menu.className = 'futa-ai-menu';
        menu.innerHTML = `
            <a class="futa-ai-menu__primary" href="${CLAUDE_URL}${prompt}" target="_blank" rel="noopener noreferrer">
                <span>${claudeIcon}</span>
                Open in Claude
            </a>
            <details class="futa-ai-menu__dropdown">
                <summary aria-label="More AI options">
                    <span class="futa-ai-menu__chevron">${chevronIcon}</span>
                </summary>
                <div class="futa-ai-menu__panel"></div>
            </details>
        `;

        const dropdown = menu.querySelector('.futa-ai-menu__dropdown');
        const panel = menu.querySelector('.futa-ai-menu__panel');
        panel.append(
            menuLink({
                href: `${CLAUDE_URL}${prompt}`,
                label: 'Open in Claude',
                description: 'Ask questions about this page',
                itemIcon: claudeIcon,
            }),
            menuLink({
                href: `${CHATGPT_URL}${prompt}`,
                label: 'Open in ChatGPT',
                description: 'Ask questions about this page',
                itemIcon: chatGptIcon,
            }),
        );

        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'futa-ai-menu__item';
        copyButton.innerHTML = `
            <span class="futa-ai-menu__icon">${copyIcon}</span>
            <span>
                <strong aria-live="polite">Copy page</strong>
                <small>Copy page as Markdown for LLMs</small>
            </span>
        `;
        copyButton.addEventListener('click', async () => {
            const originalLabel =
                copyButton.querySelector('strong').textContent;
            try {
                const response = await fetch(markdownUrl);
                if (!response.ok) {
                    throw new Error(
                        `Markdown request failed with ${response.status}.`,
                    );
                }
                await copyText(await response.text());
                copyButton.querySelector('strong').textContent = 'Copied';
            } catch (error) {
                copyButton.querySelector('strong').textContent = 'Copy failed';
                console.error(
                    'Could not copy the FUTA documentation page.',
                    error,
                );
            }
            window.setTimeout(() => {
                copyButton.querySelector('strong').textContent = originalLabel;
            }, 2000);
        });

        panel.append(copyButton);
        panel.append(
            menuLink({
                href: plainTextUrl,
                label: 'View as Markdown',
                description: 'View this page as plain text',
                itemIcon: documentIcon,
            }),
        );

        dropdown.addEventListener('toggle', () => {
            if (dropdown.open) {
                panel.querySelector('a, button')?.focus();
            }
        });
        dropdown.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                dropdown.open = false;
                dropdown.querySelector('summary').focus();
            }
        });

        article.prepend(menu);
    };

    if (typeof document$ !== 'undefined') {
        document$.subscribe(mountMenu);
    } else if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountMenu);
    } else {
        mountMenu();
    }

    document.addEventListener('click', (event) => {
        document
            .querySelectorAll('.futa-ai-menu__dropdown[open]')
            .forEach((dropdown) => {
                if (!dropdown.parentElement.contains(event.target)) {
                    dropdown.open = false;
                }
            });
    });
})();
