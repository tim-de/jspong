
# PONG clone

A browser based implementation of Pong in js.

### Why a Makefile?
Currently it is being loaded from a file rather than hosted on a server, which
means that import and export statements are forbidden by some browsers in order
to enforce the same origin policy. To solve this I have written a simple Makefile
to combine the source files into a single file which can be included in the webpage,
commenting out or removing all import or export statements.
