import os, json
import time
import pandas as pd
start_time = time.time()


path_to_json_files = './docs/api/summary/'

json_file_names = [filename for filename in os.listdir(path_to_json_files) if filename.endswith('.json')]

entries = []

for json_file_name in json_file_names:
    with open(os.path.join(path_to_json_files, json_file_name)) as json_file:
        json_text = json.load(json_file)
        entry = dict()

        id = json_text["id"]
     
        entry["nta"] = json_text["counts"]["nta_count"]
        entry["yta"] = json_text["counts"]["yta_count"]
        entry["info"] = json_text["counts"]["info_count"]
        entry["esh"] = json_text["counts"]["esh_count"]
        entry["nah"] = json_text["counts"]["nah_count"]

        entry["id"] = id
        entries.append(entry)

# print("--- %s seconds ---" % (time.time() - start_time))

indexes = open('./docs/api/indexes/indexes.json')
  
data = json.load(indexes)

# entries.sort(key = lambda json: json['id'], reverse=False)
# data.sort(key = lambda json: json['id'], reverse=False)

df1 = pd.DataFrame(data)
df2 = pd.DataFrame(entries)

df = df1.merge(df2, on='id')

# top = df.to_json(orient = 'table')
top = df.to_dict('records')

# top = json.dumps(top, indent = 4) 

def write_to_file(json, file_name):
    f = open("./docs/api/top/" + str(file_name) + ".json", "w")
    f.write(json)
    f.close()

write_to_file(json.dumps(top), "top")

