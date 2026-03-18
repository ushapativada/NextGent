import pymongo

client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['reqarchitect']
sessions = db['sessions']
session_id = '40e7a4dc-dab4-4528-a837-f0d715f12e0a'

session = sessions.find_one({'session_id': session_id})
chat = session.get('validator_chat', [])
new_chat = [msg for msg in chat if 'hello+world' not in msg.get('content', '') and 'hello world' not in msg.get('content', '')]
sessions.update_one({'session_id': session_id}, {'$set': {'validator_chat': new_chat}})

print('Cleaned validator_chat for session', session_id)
