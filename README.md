# Reddit Data

A demo dashboard can be seen [here](https://jianliew.me/reddit-store)

![GitHub repo size](https://img.shields.io/github/repo-size/JianLoong/reddit-store)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=square)](https://github.com/JianLoong/reddit-store/issues)
![Maintenance](https://img.shields.io/maintenance/yes/2022)
![GitHub issues](https://img.shields.io/github/issues/JianLoong/reddit-store)

This repository serves as the source codes of a data crawler and website meant to be deployed on a remote machine. 

Currently, at every second hour, it crawls the ``/r/amitheasshole`` subreddit of Reddit

This information is then inserted into an SQLite database with a ``Submission`` and ``Comment`` table.

Upon completion, it will peform data preprocessing and transformation which includes

-  creation of indexes, which will be used by the front end demo website. These files are json files, with UTC times as their name and contains a list of Submission IDs.
-  creation of json file for each submission and all comments linked to it. The name of this file is the Submision ID obtained above.
-  sentiment analysis of all the comments for a specific submission

## Dashboards

A demo dashboard can be seen [here](https://jianliew.me/reddit-store)

- ChartJS for charts.
- d3 word cloud for the creation of word clouds
- NRC Word-Emotion Lexicon for sentiment analysis

Refer [here](http://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm) for more information regarding NRC Word-Emotion Lexicon


