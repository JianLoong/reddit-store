# Reddit Data

As of Jan 2024, this project is no longer maintained because the methodology of static API does not ongoing increase in size. 

This was causing a build time of 15 minutes on gh-pages. This project has been migrated to use Fast API so submissions can comments can be queried more easily.

A demo dashboard can be seen [here](https://jianliew.me/reddit-store)

![GitHub repo size](https://img.shields.io/github/repo-size/JianLoong/reddit-store)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=square)](https://github.com/JianLoong/reddit-store/issues)
![Maintenance](https://img.shields.io/maintenance/yes/2022)
![GitHub issues](https://img.shields.io/github/issues/JianLoong/reddit-store)

This repository serves as the source codes of a data crawler and website meant to be deployed on a remote machine. 

Currently, at every second hour, it crawls the ``/r/amitheasshole`` subreddit of Reddit

The data obtained is then inserted into an SQLite database with a ``Submission`` and ``Comment`` table.

Upon completion, it will perform data preprocessing and transformation which includes

-  the creation of indexes, which will be used by the front-end demo website. These files are JSON files.
-  creation of JSON files for each submission and all comments linked to it. The name of this file is the Submission ID obtained above.
-  sentiment analysis of all the comments for a specific submission
-  generation of a search corpus to be used by Fuse.js

This current project is currently deployed to my RaspberryPi, moving away from the free AWS EC2 tier.

## Dashboards
---

A demo dashboard can be seen [here](https://jianliew.me/reddit-store)

- ChartJS for charts.
- d3 word cloud for the creation of word clouds
- NRC Word-Emotion Lexicon for sentiment analysis

Refer [here](http://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm) for more information regarding NRC Word-Emotion Lexicon

## API

The API for this project uses a combination of GitHub Pages and Cloudflare CDN for a static readonly API. 

The easiest way to use the API  would be just to do a simple ``GET`` request to the endpoints.

The base URL for the API of the project is ``https://jianliew.me/reddit-store/api``

```sh
curl https://jianliew.me/reddit-store/api/indexes/indexes.json
```

would retrieve a list of indexes 

```json
[
    {
        "id": 662,
        "scores": 27442,
        "created_utc": 1666957642
    },
    {
        "id": 12,
        "scores": 17278,
        "created_utc": 1667216880
    },
    ......
]
```

These ids can be used to query specific submissions using the ``Submission`` endpoint.

```sh
curl https://jianliew.me/reddit-store/api/submissions/662.json
```

would return

```json
{
    "id": 662,
    "submission_id": "yfm01l",
    "title": "AITA for cancelling a check of $12,000 that I wrote for my infertile friend for her next IVF cycle over a joke?",
    "selftext": "\n\n\nI (F35) am infertile. My ex husband and I tried everything to have kids ...",
    "created_utc": 1666957642,
    "permalink": "/r/AmItheAsshole/comments/yfm01l/aita_for_cancelling_a_check_of_12000_that_i_wrote/",
    "score": 27442,
    "replies": [..........]}
}
```

The Submission JSON contains all the top-level replies for that specific Submission and can be very large.

There are also the results of the analytics. These analytics are obtained using rudimentary techniques and can be significantly improved upon.

```sh
curl https://jianliew.me/reddit-store/api/summary/662.json
```

which returns 

```json
{
    "id": 662,
    "afinn": 832,
    "emotion": {
        "negative": 1096,
        "fear": 448,
        "trust": 1134,
        "positive": 1547,
        "anticipation": 689,
        "joy": 1057,
        "anger": 724,
        "disgust": 418,
        "sadness": 505,
        "surprise": 432
    },
    "word_freq": {
        "nta": 326,
        "friend": 272,
        "money": 213,
        "joke": 201
        ..........
    },
    "counts": {
        "nta_count": 326,
        "yta_count": 1,
        "esh_count": 0,
        "info_count": 1,
        "nah_count": 1
    }
}
```

## Important
---

1. Please note that the NRC Emotion Lexicon used to obtain the emotions are meant for research and academic use only. Please refer to the author for more information from [this website](https://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm)

2. If you do not want to deal with APIs, you can contact me for the ``.sqlite`` database file. The current size is roughly 50 MB with 1400 submissions  and 
140,000 comments.
