#!/usr/bin/env python3
"""Builds ONE self-contained preview file from the site folder (CSS, JS and images inlined).
Use it to show a page on a phone without running a server.

  python3 tools/build_preview.py white-physio /mnt/user-data/outputs/white-physio-preview.html [page.html]

Arguments: site folder, output file, and (optional) which page to build, default index.html.
In-page links (#programs) work. Links to OTHER pages of the site (/home-service, /studio, /programmes/..., /payment, /) are
pointed at the published preview artifact of that page, read from tools/preview-links.json (path -> artifact link), and open in a new tab.
If a page has no entry in that file its links stay dead and a warning is printed. When a NEW page gets its own preview artifact, add its path there.
Nothing here touches the real site: the real files keep their normal links."""
import re, base64, os, sys, json
root = sys.argv[1] if len(sys.argv) > 1 else 'white-physio'
out  = sys.argv[2] if len(sys.argv) > 2 else 'white-physio-preview.html'
page = sys.argv[3] if len(sys.argv) > 3 else 'index.html'

def rd(p): return open(os.path.join(root, p), encoding='utf-8').read()
def uri(path):
    ext = path.rsplit('.', 1)[1].lower()
    mime = {'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'webp': 'image/webp'}[ext]
    return 'data:%s;base64,%s' % (mime, base64.b64encode(open(os.path.join(root, path.lstrip('/')), 'rb').read()).decode())
def inline_assets(t): return re.sub(r'/assets/[\w\-]+\.(?:png|jpe?g|webp)', lambda m: uri(m.group(0)), t)
HERE = os.path.dirname(os.path.abspath(__file__))
LINKS = {}
if os.path.exists(os.path.join(HERE, 'preview-links.json')):
    LINKS = json.load(open(os.path.join(HERE, 'preview-links.json'), encoding='utf-8'))

def route_of(page):                     # 'index.html' -> '/', 'programmes/x.html' -> '/programmes/x'
    r = '/' + re.sub(r'\.html$', '', page).replace('\\', '/')
    return '/' if r == '/index' else r
ROUTE = route_of(page)
UNMAPPED = set()

def fix_links(t):
    # href="/path?query#hash" (also inside JS strings, where the quotes are escaped: href=\"/path\")
    def one(m):
        q, path, tail = m.group(1), m.group(2), (m.group(3) or '')
        if path.startswith('//') or path.startswith('/assets'):
            return m.group(0)
        norm = path.rstrip('/') or '/'
        if norm == ROUTE:                                    # a link to this same page: stay on the page
            return 'href=' + q + (tail if tail.startswith('#') else '#') + q
        if norm in LINKS:                                    # another page: its preview artifact, new tab
            return 'href=' + q + LINKS[norm] + tail + q + ' target=' + q + '_blank' + q + ' rel=' + q + 'noopener' + q
        UNMAPPED.add(norm)
        return m.group(0)
    return re.sub(r'href=(\\?["\'])(/[^"\'\\#?]*)([?#][^"\'\\]*)?\1', one, t)

html = rd(page); css = rd('css/style.css'); comp = rd('js/components.js'); main = rd('js/main.js')
comp = comp.replace('</script>', '<\\/script>'); main = main.replace('</script>', '<\\/script>')
html = html.replace(' media="print" onload="this.media=\'all\'"', '')      # plain font link in the preview
html = re.sub(r'\s*<link rel="(?:icon|apple-touch-icon)"[^>]*>', '', html)
html = html.replace('<link rel="stylesheet" href="/css/style.css">', '<style>\n' + inline_assets(css) + '\n</style>')
comp = fix_links(inline_assets(comp))
html = html.replace('<script src="/js/components.js"></script>', '@@HEAD@@', 1)
html = html.replace('<script src="/js/components.js" data-part="footer"></script>', '@@FOOT@@', 1)
html = html.replace('<script src="/js/main.js" defer></script>', '@@MAIN@@', 1)
html = html.replace('@@HEAD@@', '<script>\n' + comp + '\n</script>').replace('@@FOOT@@', '<script data-part="footer">\n' + comp + '\n</script>').replace('@@MAIN@@', '<script>\n' + main + '\n</script>')
html = html.replace('<script src="/js/videos.js" defer></script>', '<script>\n' + rd('js/videos.js').replace('</script>', '<\\/script>') + '\n</script>', 1)
BOOK_TAG = '<script src="/js/booking.js" defer></script>'          # /home-service only: the booking quiz script
if BOOK_TAG in html:
    html = html.replace(BOOK_TAG, '<script>\n' + rd('js/booking.js').replace('</script>', '<\\/script>') + '\n</script>')
html = fix_links(inline_assets(html))
# Preview only: the registration form cannot post to Netlify from here, so it shows a demo result (see main.js). Never in the real site.
html = re.sub(r'^<body', '<body data-form-preview', html, count=1, flags=re.M)
# Links that the page scripts build at run time (the footer lists) are not in the source text, so a small script at the end of the
# preview points every remaining internal link (href starting with "/") at its preview artifact, exactly like fix_links does above.
runtime = '''<script>
(function () {
  var LINKS = %s, ROUTE = %s;
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="/"]'), function (a) {
    var raw = a.getAttribute('href');
    if (raw.indexOf('//') === 0 || raw.indexOf('/assets') === 0) return;
    var m = raw.match(/^(\\/[^?#]*)([?#].*)?$/);
    if (!m) return;
    var path = m[1].replace(/\\/+$/, '') || '/', tail = m[2] || '';
    if (path === ROUTE) { a.setAttribute('href', tail.charAt(0) === '#' ? tail : '#'); return; }
    if (LINKS[path]) { a.setAttribute('href', LINKS[path] + tail); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
  });
})();
</script>''' % (json.dumps(LINKS), json.dumps(ROUTE))
html = html.replace('</body>', runtime + '\n</body>', 1)
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(html)
print('preview written:', out, round(len(html) / 1024), 'KB')
if UNMAPPED: print('WARNING: links to pages with no preview artifact (left dead):', sorted(UNMAPPED))
