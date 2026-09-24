/* global URL, document, document$, localStorage, window */

/*
 * Page bookmarks: a toggle beside each article's title and a list of the
 * bookmarked pages in the right rail, under the table of contents.
 *
 * Bookmarks are kept in this browser's localStorage and nowhere else. When
 * storage is unavailable (private windows, blocked site data) they last for
 * the session only. The rail is hidden below 60em, so on narrow screens the
 * toggle works but the list is not visible.
 *
 * Material swaps the article and both sidebars on instant navigation, so the
 * toggle and list are mounted again on every page.
 */
(() => {
    const STORAGE_KEY = 'futa-docs:bookmarks';
    const RAIL = '.md-sidebar--secondary .md-sidebar__inner';

    // Font Awesome 5 via react-icons: FaRegBookmark, FaBookmark, FaTimes.
    const svg = (viewBox, path) => `
        <svg viewBox="${viewBox}" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="${path}"></path>
        </svg>
    `;
    const BOOKMARK_ICON = svg(
        '0 0 384 512',
        'M336 0H48C21.49 0 0 21.49 0 48v464l192-112 192 112V48c0-26.51-21.49-48-48-48zm0 428.43l-144-84-144 84V54a6 6 0 0 1 6-6h276c3.314 0 6 2.683 6 5.996V428.43z',
    );
    const BOOKMARKED_ICON = svg(
        '0 0 384 512',
        'M0 512V48C0 21.49 21.49 0 48 0h288c26.51 0 48 21.49 48 48v464L192 400 0 512z',
    );
    const REMOVE_ICON = svg(
        '0 0 352 512',
        'M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z',
    );

    // Material's `base` is relative to the page the site was first loaded
    // on; this script runs once, on that page, so resolve it now. Bookmarks
    // are stored relative to it, so they survive a different host or prefix.
    const siteRoot = (() => {
        try {
            const config = JSON.parse(
                document.getElementById('__config').textContent,
            );
            return new URL(config.base, window.location.href);
        } catch {
            return new URL('/', window.location.href);
        }
    })();

    const currentPath = () => {
        let path = window.location.pathname;
        if (path.startsWith(siteRoot.pathname)) {
            path = path.slice(siteRoot.pathname.length);
        }
        return path.replace(/index\.html$/, '');
    };

    // Newest first. `memory` stands in when localStorage throws.
    let memory = [];
    const load = () => {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (Array.isArray(stored)) {
                memory = stored.filter(
                    (entry) =>
                        typeof entry?.path === 'string' &&
                        typeof entry?.title === 'string',
                );
            }
        } catch {
            // Keep the session's copy.
        }
        return memory;
    };
    const save = (bookmarks) => {
        memory = bookmarks;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        } catch {
            // Session only.
        }
    };

    const isBookmarked = (path) => load().some((entry) => entry.path === path);

    // The title's own text: the permalink and this toggle are children of
    // the h1 too.
    const pageTitle = (heading) =>
        [...heading.childNodes]
            .filter(
                (node) =>
                    node.nodeType === 3 ||
                    (node.nodeType === 1 &&
                        !node.matches('.headerlink, .futa-bookmark')),
            )
            .map((node) => node.textContent)
            .join('')
            .trim();

    const syncToggle = () => {
        const toggle = document.querySelector('.futa-bookmark');
        if (!toggle) return;
        const active = isBookmarked(currentPath());
        toggle.setAttribute('aria-pressed', `${active}`);
        toggle.title = active ? 'Remove bookmark' : 'Bookmark this page';
        toggle.innerHTML = active ? BOOKMARKED_ICON : BOOKMARK_ICON;
    };

    const renderList = () => {
        const rail = document.querySelector(RAIL);
        if (!rail) return;

        let nav = rail.querySelector(':scope > .futa-bookmarks');
        if (!nav) {
            nav = document.createElement('nav');
            nav.className = 'md-nav futa-bookmarks';
            nav.tabIndex = -1;
            nav.setAttribute('aria-labelledby', 'futa-bookmarks-title');
            // Above the page's last-modified date, which stays last.
            rail.insertBefore(
                nav,
                rail.querySelector(':scope > .futa-last-modified'),
            );
        }

        const bookmarks = load();
        const here = currentPath();
        nav.innerHTML =
            '<span class="md-nav__title" id="futa-bookmarks-title">Bookmarks</span>';

        if (!bookmarks.length) {
            const empty = document.createElement('p');
            empty.className = 'futa-bookmarks__empty';
            empty.textContent = 'No bookmarks yet.';
            nav.append(empty);
            return;
        }

        const list = document.createElement('ul');
        list.className = 'md-nav__list';
        for (const { path, title } of bookmarks) {
            const item = document.createElement('li');
            item.className = 'md-nav__item futa-bookmarks__item';

            const link = document.createElement('a');
            link.className = 'md-nav__link';
            link.href = new URL(path, siteRoot).href;
            link.textContent = title;
            if (path === here) {
                link.classList.add('md-nav__link--active');
                link.setAttribute('aria-current', 'page');
            }

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'futa-bookmarks__remove';
            remove.title = 'Remove bookmark';
            remove.setAttribute('aria-label', `Remove bookmark: ${title}`);
            remove.innerHTML = REMOVE_ICON;
            remove.addEventListener('click', () => {
                const index = load().findIndex((entry) => entry.path === path);
                save(load().filter((entry) => entry.path !== path));
                renderList();
                syncToggle();
                // Hand focus to a neighbouring row rather than <body>.
                const links = nav.querySelectorAll('.md-nav__link');
                (links[index] ?? links[index - 1] ?? nav).focus();
            });

            item.append(link, remove);
            list.append(item);
        }
        nav.append(list);
    };

    const mountToggle = () => {
        const heading = document.querySelector('.md-content__inner h1');
        if (!heading || heading.querySelector('.futa-bookmark')) return;

        const path = currentPath();
        const title = pageTitle(heading);

        // A bookmarked page's title may have changed since it was saved.
        const bookmarks = load();
        const saved = bookmarks.find((entry) => entry.path === path);
        if (saved && title && saved.title !== title) {
            saved.title = title;
            save(bookmarks);
        }

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'futa-bookmark';
        toggle.setAttribute('aria-label', 'Bookmark this page');
        toggle.addEventListener('click', () => {
            const current = load();
            save(
                isBookmarked(path)
                    ? current.filter((entry) => entry.path !== path)
                    : [{ path, title: title || document.title }, ...current],
            );
            syncToggle();
            renderList();
        });
        heading.append(toggle);
        syncToggle();
    };

    const mount = () => {
        mountToggle();
        renderList();
    };

    if (typeof document$ !== 'undefined') {
        document$.subscribe(mount);
    } else if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }

    // Another tab added or removed a bookmark.
    window.addEventListener('storage', (event) => {
        if (event.key !== STORAGE_KEY) return;
        syncToggle();
        renderList();
    });
})();
