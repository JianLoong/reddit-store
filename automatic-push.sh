#!/usr/bin/bash
HOME=/home/pi
cd /home/pi/reddit-store
git add .
git commit -m "Updated"
GIT_SSH_COMMAND='ssh -i ~/redditbot' git push 