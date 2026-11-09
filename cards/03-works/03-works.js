/*
  03-works.js: the mgmt.srvcs look and the EN / ID switch for every card in cards/03-works/.
  Loaded by a card only when it is opened with ?look=ms (mgmt.srvcs iframes it that way). Never runs on pubs pages:
  they take only the card's <article>, not its <head>.

  What it does:
    1. splits the article into one box per <h4>: "9. forms that do the work" becomes eyebrow "step 09" + heading.
       text before the first <h4> becomes the opening box; the last section becomes the dark closing band.
    2. puts an EN | ID button in the opening box. ID loads the sibling card with the same name plus "-id"
       (cards-03-01-workspace.html -> cards-03-01-workspace-id.html) and shows its article instead.
       A card with no "-id" file gets no button.
    3. remembers the choice in this browser (localStorage "wk-lang"), so a reload keeps the language.
  The page stays hidden until the boxes and 03-works.css are ready, so the plain text never flashes.
*/
(function () {
    'use strict';

    var root = document.documentElement;
    var KEY = 'wk-lang';
    var WORDS = {
        en: { step: 'step', overview: 'overview', practice: 'in practice', label: 'Language' },
        id: { step: 'langkah', overview: 'gambaran umum', practice: 'dalam praktik', label: 'Bahasa' }
    };

    var path = location.pathname;
    var urls = { en: path.replace(/-id\.html$/, '.html') };
    urls.id = urls.en.replace(/\.html$/, '-id.html');
    var pageLang = /-id\.html$/.test(path) ? 'id' : 'en';

    var source = {};          // lang -> the article's original nodes, kept untouched and cloned on every render
    var hasId = false;        // set once we know the "-id" file exists

    function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function save(lang) { try { localStorage.setItem(KEY, lang); } catch (e) {} }

    function grab(article) {
        return Array.prototype.map.call(article.childNodes, function (n) { return n.cloneNode(true); });
    }

    function fetchArticle(lang) {
        if (source[lang]) return Promise.resolve(true);
        return fetch(urls[lang]).then(function (r) {
            if (!r.ok) throw new Error(r.status);
            return r.text();
        }).then(function (html) {
            var article = new DOMParser().parseFromString(html, 'text/html').querySelector('.card-body');
            if (!article) throw new Error('no .card-body in ' + urls[lang]);
            source[lang] = grab(article);
            return true;
        });
    }

    // one <section> per <h4>
    function boxes(nodes, lang) {
        var w = WORDS[lang], sections = [], current = null, seenStep = false;
        function start(cls) {
            current = document.createElement('section');
            current.className = 'wk-sec ' + cls;
            sections.push(current);
        }
        start('wk-intro');
        nodes.forEach(function (original) {
            var node = original.cloneNode(true);
            if (node.nodeName !== 'H4') { current.appendChild(node); return; }
            var text = node.textContent.trim();
            var m = /^(\d+)\.\s*(.*)$/.exec(text);
            start(m ? 'wk-step' : 'wk-note');
            var eyebrow = document.createElement('span');
            eyebrow.className = 'wk-eyebrow';
            if (m) { seenStep = true; eyebrow.textContent = w.step + ' ' + (m[1].length < 2 ? '0' : '') + m[1]; }
            else eyebrow.textContent = seenStep ? w.practice : w.overview;
            var title = m ? m[2] : text;
            var h2 = document.createElement('h2');
            h2.textContent = title.charAt(0).toUpperCase() + title.slice(1);
            current.appendChild(eyebrow);
            current.appendChild(h2);
        });
        if (sections.length > 1) sections[sections.length - 1].classList.add('wk-band');
        return sections.filter(function (s) { return s.textContent.trim(); });
    }

    function switcher(lang) {
        var bar = document.createElement('div');
        bar.className = 'wk-lang';
        bar.setAttribute('role', 'group');
        bar.setAttribute('aria-label', WORDS[lang].label);
        ['en', 'id'].forEach(function (code) {
            var b = document.createElement('button');
            b.type = 'button';
            b.textContent = code.toUpperCase();
            b.setAttribute('aria-pressed', code === lang ? 'true' : 'false');
            b.addEventListener('click', function () { if (code !== lang) show(code, true); });
            bar.appendChild(b);
        });
        return bar;
    }

    function render(lang) {
        var article = document.querySelector('.card-body');
        var sections = boxes(source[lang], lang);
        if (hasId && sections.length) sections[0].insertBefore(switcher(lang), sections[0].firstChild);
        article.replaceChildren.apply(article, sections);
        root.lang = lang;
    }

    function show(lang, remember) {
        return fetchArticle(lang).then(function () {
            render(lang);
            if (remember) save(lang);
        }).catch(function (error) {
            console.error('03-works: could not load the ' + lang + ' text:', error);
            render(pageLang);      // stay on the language already on the page
        });
    }

    // reveal once 03-works.css has loaded (or at once if it is already there)
    function whenCss(done) {
        var link = document.querySelector('link[href$="03-works.css"]');
        if (!link || link.sheet) return done();
        link.addEventListener('load', done);
        link.addEventListener('error', done);
    }

    function start() {
        var article = document.querySelector('.card-body');
        if (!article) { root.classList.add('wk-ready'); return; }
        source[pageLang] = grab(article);

        var other = pageLang === 'en' ? 'id' : 'en';
        var wanted = saved() === other ? other : pageLang;

        // the button appears only when the sibling file exists
        fetchArticle(other).then(function () { hasId = true; }, function () { hasId = false; })
            .then(function () { return show(hasId ? wanted : pageLang, false); })
            .then(function () { whenCss(function () { root.classList.add('wk-ready'); }); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
