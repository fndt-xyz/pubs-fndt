#!/bin/bash
# local test server for pubs.fndt.xyz on port 8020.
# same as "python3 -m http.server", plus one thing: a folder address ending in ?list
# returns the plain file listing even when the folder has an index.html,
# so the folder index pages (contents/index.html, posts/index.html) can list local files before you push.

cd "$(dirname "$0")" || exit 1

# Kill any process currently running on port 8020
fuser -k 8020/tcp > /dev/null 2>&1

# Start the server in the background
nohup python3 -c '
import http.server, os
class H(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if self.path.split("?")[0].endswith("/") and self.path.endswith("?list") and os.path.isdir(path):
            return self.list_directory(path)
        return super().send_head()
http.server.ThreadingHTTPServer(("", 8020), H).serve_forever()
' > /dev/null 2>&1 &

echo "Server started at http://localhost:8020"
echo "Process running in background. Use 'fuser -k 8020/tcp' to stop it."
