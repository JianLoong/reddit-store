#!/bin/bash
# export GIT_TRACE_PACKET=1
# export GIT_TRACE=1
# export GIT_CURL_VERBOSE=1
HOME=/home/jian
cd /home/jian/reddit-store
/home/jian/reddit-store/venv/bin/python /home/jian/reddit-store/subreddit.py
/home/jian/reddit-store/venv/bin/python /home/jian/reddit-store/analytics.py
/home/jian/reddit-store/venv/bin/python /home/jian/reddit-store/search.py
/home/jian/reddit-store/venv/bin/python /home/jian/reddit-store/top.py
git add .
git commit -m "Updated"
# GIT_SSH_COMMAND='ssh -i /home/jian/redditbot' git push 
date >> /home/jian/reddit-store/push.log 2>&1
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519 -F /dev/null" git push >> /home/jian/reddit-store/push.log 2>&1
