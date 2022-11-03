#!/usr/bin/bash
# export GIT_TRACE_PACKET=1
# export GIT_TRACE=1
# export GIT_CURL_VERBOSE=1
HOME=/home/pi
cd /home/pi/reddit-store
# /home/pi/reddit-store/venv/bin/python /home/pi/reddit-store/subreddit.py
# /home/pi/reddit-store/venv/bin/python /home/pi/reddit-store/analytics.py
git add .
git commit -m "Updated"
GIT_SSH_COMMAND='ssh -i ~/redditbot' git push 