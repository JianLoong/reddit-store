# Search corpus for Fuse JS just needs title and index
# Perform sentiment analysis and then create JSON files that will be used for application
import calendar
import json
import sys
from datetime import datetime, timedelta

from peewee import *

subreddit_name = "AmItheAsshole";
reddit = None
db = SqliteDatabase(subreddit_name + '.sqlite')

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

def main():
    pass    


# A super simple warehouse that is not even a warehouse, basically it qets all submissions for a day and builds up
# a json and also the indexes
def get_submissions():
    # This function will make indices in for the API to consume with the submission IDs and the file name is the unix timestamp
    # This does not need to be date aware
    today = datetime.today()
    start = datetime(today.year, today.month, today.day)
    yesterday = start - timedelta(1)
    
    # Convert time to UTC time
    start_utc = calendar.timegm(start.timetuple())
    yesterday_utc = calendar.timegm(yesterday.timetuple())
    
    query = Submission.select().where(Submission.created_utc.between(yesterday_utc, start_utc)).order_by(Submission.score.desc())
      
    submissions = list(query.dicts())
    
    indexes = []
        
        
    sys.stdout.reconfigure(encoding='utf-8')    
    # print(json.dumps(submissions[0]))
    
    json_submission = json.dumps(submissions)
    write_to_file(json_submission, "search")
    
    return submissions
    

def write_to_file(json, file_name):
    f = open("./docs/api/search/" + str(file_name) + ".json", "w")
    f.write(json)
    f.close()
        
if __name__ == '__main__':
    print("Running analytics")
    submissions = get_submissions()
    print("Processing submissions");
