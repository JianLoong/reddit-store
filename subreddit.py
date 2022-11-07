import calendar
import json
import sys
import time
from ast import main
from datetime import datetime, timedelta
from encodings.utf_8 import encode
from mimetypes import init

import praw
from peewee import *

import config

subreddit_name = "AmItheAsshole"
reddit = None
db = SqliteDatabase(subreddit_name + '.sqlite')
UPDATE = True
POST_LIMIT = 50

class BaseModel(Model):
    class Meta:
        database = db
        
class Submission(BaseModel):
    id = AutoField()
    submission_id = CharField(unique=True)
    title = TextField()
    selftext = TextField()
    created_utc = DateField()
    permalink = TextField()
    score = IntegerField()

class Comment(BaseModel):
    id = AutoField()
    submission = ForeignKeyField(Submission, backref='comments')
    message = TextField()
    comment_id = CharField(unique=True)
    parent_id = CharField()
    created_utc = DateField()
    score = IntegerField()

def create_database():
        
    db = SqliteDatabase(subreddit_name + '.sqlite')
    db.connect()
    db.create_tables([Submission, Comment])
    
def get_submissions():

    reddit: praw.Reddit = None

    agent = "Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion"

    client_id = config.client_id
    client_secret = config.client_secret
    
    if client_id == None or client_secret == None:
        exit(1)
    
    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=agent
    )

    display = 1
    for submission in reddit.subreddit(subreddit_name).hot(limit=POST_LIMIT):
        print(display)
        display = display + 1
        submission.comments.replace_more(limit=0)
        # submission.comments.replace_more(limit=None, threshold=0)
        query = Submission.select().where(Submission.submission_id == submission.id)
        if query.exists() == False:
            Submission.create(
                submission_id = submission.id, 
                title = submission.title, 
                selftext = submission.selftext, 
                created_utc = submission.created_utc, 
                permalink = submission.permalink,
                score = submission.score
            )
        else:
            if UPDATE is False:
                continue
            else:
            # print("Updating submission")
                update_query = Submission.update(title = submission.title, 
                                                    selftext = submission.selftext, 
                                                    created_utc = submission.created_utc, 
                                                    permalink = submission.permalink,
                                                    score = submission.score).where(Submission.submission_id == submission.id)
                update_query.execute()
        # Submission.update()
        comments = submission.comments.list()
        for comment in comments:
            query = Comment.select().where(Comment.comment_id == comment.id)
            if query.exists() == False:
                Comment.create(submission_id=submission.id, 
                                message = comment.body, 
                                comment_id = comment.id, 
                                parent_id = comment.parent_id, 
                                created_utc = comment.created_utc, 
                                score = comment.score)
            else:
                if UPDATE is False:
                    continue
                else:
                    update_query = Comment.update(submission_id = submission.id, 
                                message = comment.body, 
                                parent_id = comment.parent_id, 
                                created_utc = comment.created_utc, 
                                score = comment.score).where(Comment.comment_id == comment.id)
                    update_query.execute()
       


def main():
    create_database()
    get_submissions()
    create_warehouse()
    

# A super simple warehouse that is not even a warehouse, basically it qets all submissions for a day and builds up
# a json and also the indexes
def create_warehouse():
    # This function will make indices in for the API to consume with the submission IDs and the file name is the unix timestamp

    # This does not need to be date aware
    today = datetime.today() 
    start = datetime(today.year, today.month, today.day) + timedelta(1)
    yesterday = start - timedelta(1)
    
    # Convert time to UTC time
    start_utc = calendar.timegm(start.timetuple())
    yesterday_utc = calendar.timegm(yesterday.timetuple())
    
    query = Submission.select().order_by(Submission.score.desc())
      
    submissions = list(query.dicts())
    
    sys.stdout.reconfigure(encoding='utf-8')
    
    results = []
    indexes = []
    created_utcs = []
    scores = []
    entries = []
        
    for index in range(0,len(submissions)):
        _submission_id = (submissions[index]["submission_id"])
        _submission_pk = submissions[index]["id"]
        _score = submissions[index]["score"]
        _created_utc = submissions[index]["created_utc"]
        
        # indexes.append(_submission_pk)
        # scores.append(_score)
        # created_utcs.append(_created_utc)
        entry = {
            "id": _submission_pk,
            "scores": _score,
            "created_utc": _created_utc
        }

        _comment_query = Comment.select(Comment.message).where(Comment.submission == _submission_id)
        _replies_list = list(_comment_query.dicts())
        # print((replies))
        replies = []
        for reply in _replies_list:
            replies.append(reply["message"])
        submissions[index]["replies"] = replies
        # This is the summary of the submission
        write_to_file(json.dumps(submissions[index]), "./submissions/" + str(_submission_pk))
        entries.append(entry)
    
    # print(json.dumps(submissions[0]))
    
    # json_indexes = {
    #     "indexes": indexes,
    #     "scores": scores,
    #     "created_utcs": created_utcs
    # }
    
    # Create indexes for query
    write_to_file(json.dumps(entries), "./indexes/" + "indexes")

def write_to_file(json, file_name):
    f = open("./docs/api/" + str(file_name) + ".json", "w")
    f.write(json)
    f.close()
        
if __name__ == '__main__':
    get_submissions()
    create_warehouse()
    # main()

