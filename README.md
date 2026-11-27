# MaD's Loot Lab

Static Project Zomboid loot-rule builder hosted on GitHub Pages. Open index.html through a local web server; no build step or dependencies are required.

The catalog includes 5,092 vanilla item definitions read from the locally installed Build 42 game, with English display names and game categories. It includes props and specialized items as well as normal loot; catalog inclusion does not guarantee an item is a useful zombie drop. Nine broad categories and the original game subcategories organize the browser. Search matches name, full item ID, and subcategory, with 48 results per page.

There are 4,564 matched inventory sprites. Some props, furniture, and specialized items have no matched standalone sprite and show a placeholder. Artwork belongs to The Indie Stone; see assets/CREDITS.txt. Game scripts, game atlases, binaries, and mod files are not included.

Run the data and export checks with `node tests/catalog_spec.mjs`.

Run a local preview with `python -m http.server 8000` and open http://localhost:8000.
