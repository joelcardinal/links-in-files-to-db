**This node script gets links from .txt files, requests each web page link, gets meta-data, and puts the meta-data in a db.**

***To Use:***

1. Clone repo.
2. In terminal, cd to "links-in-files-to-db" directory.
3. In terminal, execute:```npm install```.
4. Create .txt files which have links written in it, line delimated.  Place the files in the "linkFiles" directory.
5. In terminal, execute: ```node index.js```

Data will get added to a sqlite3 db (created if it doesn't exist).

DB storeage in sqlite3 is a temporary solution, this is part of a personal project and will likely change soon.

***Meta-Data Collected (if present)***

- Title
- Description
- Keywords
- h1
- OG description
- OG image
- OG title
- First schema description
- First schema image
- First schema title
- First schema headline
- First schema about

***Requires:***

- node
- npm
- sqlite3
