/* global document, MutationObserver, requestAnimationFrame, window */

/*
 * Keeps the left sidebar still across page changes.
 *
 * Material opens only the current page's section. With instant navigation the
 * new page's sidebar arrives already in that state, so leaving a section
 * collapses it and entering one expands it in a single frame, and every row
 * below jumps. Instead:
 *
 * - a section the reader had open stays open when they navigate away;
 * - a section that opens because the reader navigated into it expands with
 *   Material's own transition rather than appearing at full height;
 * - the sidebar keeps its scroll position, unless the new page's entry
 *   would then be out of view.
 *
 * Desktop only: below 76.25em the sidebar is Material's sliding drawer, where
 * an open toggle means "this panel is showing", not "this list is expanded".
 */
(() => {
    const desktop = window.matchMedia('(min-width: 76.25em)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const SIDEBAR = '.md-sidebar--primary';
    const TOGGLES = `${SIDEBAR} input.md-nav__toggle[id^="__nav_"]`;
    const SCROLLWRAP = `${SIDEBAR} .md-sidebar__scrollwrap`;

    // Ids of the toggles open on the page being left; null before the first
    // page, which keeps Material's own state.
    let openIds = null;
    let scrollTop = 0;

    const afterNextPaint = (callback) =>
        requestAnimationFrame(() => requestAnimationFrame(callback));

    // Each section's collapse-all button (see addCollapseButtons) shows only
    // while at least one list in that section is open.
    const syncCollapseButtons = () => {
        for (const button of document.querySelectorAll(
            `${SIDEBAR} .futa-nav-collapse`,
        )) {
            const section = button.closest('.md-nav__item--section');
            button.hidden = !section?.querySelector(
                ':scope > .md-nav input.md-nav__toggle[id^="__nav_"]:checked',
            );
        }
    };

    // Material syncs aria-expanded only when a label is clicked.
    const setOpen = (toggle, open) => {
        toggle.checked = open;
        document
            .querySelector(`[aria-labelledby="${toggle.id}_label"]`)
            ?.setAttribute('aria-expanded', `${open}`);
        syncCollapseButtons();
    };

    // Material measures the new sidebar as soon as it mounts, so the browser
    // has already styled it in Material's state; flipping a toggle now would
    // play the expand/collapse transition from there. Flip it with the
    // transition off, so it is simply in the reader's state.
    const setOpenInstantly = (toggle, open) => {
        const list = toggle.parentElement.querySelector(':scope > .md-nav');
        if (!list) {
            setOpen(toggle, open);
            return;
        }
        list.style.transition = 'none';
        setOpen(toggle, open);
        void list.offsetHeight; // Commit the new state before restoring.
        list.style.transition = '';
    };

    const recordOpen = () => {
        openIds = new Set(
            [...document.querySelectorAll(TOGGLES)]
                .filter((toggle) => toggle.checked)
                .map((toggle) => toggle.id),
        );
    };

    document.addEventListener('change', (event) => {
        if (!event.target.matches?.(TOGGLES)) return;
        recordOpen();
        syncCollapseButtons();
    });

    // Scroll events don't bubble, so listen in the capture phase.
    document.addEventListener(
        'scroll',
        (event) => {
            if (event.target.matches?.(SCROLLWRAP)) {
                scrollTop = event.target.scrollTop;
            }
        },
        { capture: true, passive: true },
    );

    const keepScrollPosition = () => {
        const scrollwrap = document.querySelector(SCROLLWRAP);
        if (!scrollwrap) return;
        scrollwrap.scrollTop = scrollTop;
        // Material centres the active entry on the frame after the page
        // mounts; restore the reader's position again after that.
        afterNextPaint(() => {
            scrollwrap.scrollTop = scrollTop;
            const active = scrollwrap.querySelector('.md-nav__link--active');
            if (!active) return;
            const row = active.getBoundingClientRect();
            const view = scrollwrap.getBoundingClientRect();
            if (row.top < view.top || row.bottom > view.bottom) {
                active.scrollIntoView({ block: 'nearest' });
            }
        });
    };

    // VscCollapseAllCompact (VS Code Codicons, via react-icons).
    const COLLAPSE_ALL_ICON = `
        <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M11 2.08984C11.58 2.28984 12 2.85 12 3.5V8.5C11.9999 10.4299 10.4299 12 8.5 12H3.5C2.85006 12 2.28985 11.5799 2.08984 11H8.5C9.87995 11 10.9999 9.87993 11 8.5V2.08984Z"></path>
            <path d="M7.5 4.5C7.78 4.5 8 4.72 8 5C8 5.28 7.78 5.5 7.5 5.5H2.5C2.22 5.5 2 5.28 2 5C2 4.72 2.22 4.5 2.5 4.5H7.5Z"></path>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 0C9.33 0 10 0.67 10 1.5V8.5C10 9.33 9.33 10 8.5 10H1.5C0.67 10 0 9.33 0 8.5V1.5C0 0.67 0.67 0 1.5 0H8.5ZM1.5 1C1.22 1 1 1.22 1 1.5V8.5C1 8.78 1.22 9 1.5 9H8.5C8.78 9 9 8.78 9 8.5V1.5C9 1.22 8.78 1 8.5 1H1.5Z"></path>
        </svg>
    `;

    // A collapse-all button at the right end of each section bar that has
    // lists to collapse, shown while any of them is open. Material replaces
    // the sidebar on every page change, so this runs for each new sidebar. The button is hidden below 76.25em
    // (extra.css), where sections are drawer panels rather than bars.
    const addCollapseButtons = () => {
        const sections = document.querySelectorAll(
            `${SIDEBAR} .md-nav__item--section`,
        );
        for (const section of sections) {
            const bar = section.querySelector(':scope > .md-nav__link');
            const list = section.querySelector(':scope > .md-nav');
            if (!bar || !list || bar.querySelector('.futa-nav-collapse')) {
                continue;
            }
            const nested = () =>
                list.querySelectorAll('input.md-nav__toggle[id^="__nav_"]');
            if (!nested().length) continue;

            const name = bar.textContent.trim();
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'futa-nav-collapse';
            button.title = 'Collapse all';
            button.setAttribute('aria-label', `Collapse all in ${name}`);
            button.innerHTML = COLLAPSE_ALL_ICON;
            button.addEventListener('click', () => {
                // The button hides once nothing is open; hand keyboard focus
                // to the section's own link rather than dropping it on <body>.
                const hadFocus = document.activeElement === button;
                // Material's own transition animates each list closed.
                for (const toggle of nested()) setOpen(toggle, false);
                recordOpen();
                if (hadFocus) bar.querySelector('a.md-nav__link')?.focus();
            });
            bar.append(button);
        }
        syncCollapseButtons();
    };

    const restoreSidebar = () => {
        addCollapseButtons();
        if (openIds === null || !desktop.matches) {
            recordOpen();
            return;
        }

        const expanding = [];
        for (const toggle of document.querySelectorAll(TOGGLES)) {
            const wasOpen = openIds.has(toggle.id);
            if (wasOpen && !toggle.checked) {
                setOpenInstantly(toggle, true);
            } else if (!wasOpen && toggle.checked && !reducedMotion.matches) {
                // Start closed, as the reader last saw it, and open it once
                // that state has painted so the transition runs.
                setOpenInstantly(toggle, false);
                expanding.push(toggle);
            }
        }

        if (expanding.length) {
            afterNextPaint(() => {
                for (const toggle of expanding) setOpen(toggle, true);
            });
        }

        recordOpen();
        for (const toggle of expanding) openIds.add(toggle.id);
        keepScrollPosition();
    };

    // Material's `document$` fires a frame after the new sidebar has already
    // painted, which would show the jump and then undo it. A mutation
    // observer runs before that paint. A new first toggle means Material
    // swapped the sidebar in.
    let firstToggle = null;
    const onMutation = () => {
        const toggle = document.querySelector(TOGGLES);
        if (!toggle || toggle === firstToggle) return;
        firstToggle = toggle;
        restoreSidebar();
    };

    onMutation();
    new MutationObserver(onMutation).observe(document.body, {
        childList: true,
        subtree: true,
    });
})();
