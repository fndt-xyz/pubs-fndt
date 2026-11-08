/*
 * cards/embed.js: for websites that show pubs cards in an iframe.
 * Add once per page, anywhere:  <script src="https://pubs.fndt.xyz/cards/embed.js"></script>
 * Every pubs card iframe on the page then grows or shrinks to fit its text (no inner scrollbar).
 * Works for iframes added later too (e.g. a frameworks module that swaps content in),
 * as long as this script is on the main page, not inside the swapped-in html.
 */
(function () {
    if (window.pubsCardEmbed) return;   // loaded twice: do nothing the second time
    window.pubsCardEmbed = true;
    window.addEventListener('message', function (e) {
        if (!e.data || e.data.type !== 'pubs-card-height') return;
        if (!/^https?:\/\/(pubs\.fndt\.xyz|localhost(:\d+)?|127\.0\.0\.1(:\d+)?)$/.test(e.origin)) return;   // only pubs cards
        var frames = document.getElementsByTagName('iframe');
        for (var i = 0; i < frames.length; i++) {
            if (frames[i].contentWindow === e.source) {
                frames[i].style.height = Math.ceil(e.data.height) + 'px';
                break;
            }
        }
    });
})();
