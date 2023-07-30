#!/usr/bin/bash
# export GIT_TRACE_PACKET=1
# export GIT_TRACE=1
# export GIT_CURL_VERBOSE=1
HOME=/home/pi
cd /home/pi/reddit-store
/home/pi/reddit-store/venv/bin/python /home/pi/reddit-store/subreddit.py
/home/pi/reddit-store/venv/bin/python /home/pi/reddit-store/analytics.py
/home/pi/reddit-store/venv/bin/python /home/pi/reddit-store/search.py
/home/pi/reddit-store/venv/bin/python /home/pi/reddit-store/top.py
git add .
git commit -m "Updated"
# GIT_SSH_COMMAND='ssh -i /home/pi/redditbot' git push 
date >> /home/pi/reddit-store/push.log 2>&1
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_rsa -F /dev/null" git push >> /home/pi/reddit-store/push.log 2>&1
