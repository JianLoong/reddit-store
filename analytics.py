# Perform sentiment analysis and then create JSON files that will be used for application
import calendar
import json
import re
import sys
from datetime import datetime, timedelta

from afinn import Afinn
from nltk.probability import FreqDist
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nrclex import NRCLex
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

def process(submissions):
    
    afinn = Afinn()
    
    results = []
    
    for submission in submissions:
        result = {
            "id": 0,
            "afinn": 0,
            "emotion": 0,
            "word_freq": 0,
            "counts": 0
        }
    
        replies = ""
        for reply in submission["replies"]:
            replies = replies + reply
        result["id"] = submission["id"]
        result["afinn"] = afinn.score(replies)
        result["emotion"] = NRCLex(replies).raw_emotion_scores
        frequencies = word_frequency(replies)
        result["word_freq"] = frequencies[0]
        result["counts"] = frequencies[1]
        # results.append(result)
    # print(json.dumps(results))
        write_to_file(json.dumps(result), str(submission["id"]))
   

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
        
    for index in range(0,len(submissions)):
        _submission_id = (submissions[index]["submission_id"])
        _submission_pk = submissions[index]["id"]
        
        indexes.append(_submission_pk)

        _comment_query = Comment.select(Comment.message).where(Comment.submission == _submission_id)
        _replies_list = list(_comment_query.dicts())
        # print((replies))
        replies = []
        for reply in _replies_list:
            replies.append(reply["message"])
        submissions[index]["replies"] = replies
        
    sys.stdout.reconfigure(encoding='utf-8')    
    # print(json.dumps(submissions[0]))
    
    return submissions
    
def word_frequency(text): 
      
   
    text = text.lower().replace(".", " ")
    text = re.sub('\W+',' ', text )
    text = word_tokenize(text)
    text = remove_stop_words(text)
    
    
    fdist = FreqDist(text) #.most_common(10)
    
    freq = dict(fdist)
    nta_count = 0
    yta_count = 0
    esh_count = 0
    info_count = 0
    nah_count = 0

    if "nta" in freq:
        nta_count = freq["nta"]
    if "yta" in freq:
        yta_count = freq["yta"]
    if "esh" in freq:
        esh_count = freq["esh"]
    if "info" in freq:
        info_count = freq["info"]
    if "nah" in freq:
        nah_count = freq["nah"]
        
    counts = {
        "nta_count": nta_count,
        "yta_count": yta_count,
        "esh_count": esh_count,
        "info_count": info_count,
        "nah_count": nah_count
    }
        
    return [dict(fdist.most_common(30)),counts]


def remove_stop_words(word_tokens):
    stop_words = set(stopwords.words('english'))
  
    
    filtered_sentence = [w for w in word_tokens if not w.lower() in stop_words]
    filtered_sentence = []
    
    for w in word_tokens:
        if w not in stop_words:
            filtered_sentence.append(w)
    
    return filtered_sentence

def write_to_file(json, file_name):
    f = open("./docs/api/summary/" + str(file_name) + ".json", "w")
    f.write(json)
    f.close()
        
if __name__ == '__main__':
    print("Running analytics")
    submissions = get_submissions()
    print("Processing submissions")
    process(submissions)
