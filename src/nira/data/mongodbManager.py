'''
Created on 2012-2-8

@author: Administrator
'''
from gridfs import GridFS
from nira import settings
from pymongo.mongo_client import MongoClient



#asyncdb = asyncmongo.Client(pool_id='nira', host=settings.DB['host'], port=settings.DB['port'], 
#                            maxcached=10, maxconnections=50, dbname=settings.DB['db_name'])

class GridFSEx(GridFS):   
    def __init__(self, database, collection="fs"):
        super(GridFSEx, self).__init__(database, collection)
        self.files = database[collection].files
        
    def update(self, *args, **kwargs):
        self.files.update(*args, **kwargs)
    
    def remove(self, *args, **kwargs):
        self.files.remove(*args, **kwargs)
        
    def find(self, *args, **kwargs):
        return self.files.find(*args, **kwargs)        
        
class mongoClass():    
    connection = MongoClient(settings.DB['host'], settings.DB['port'])    
#    db = connection['local']
    db = connection[settings.DB['db_name']]
    if settings.DB.has_key('user_name') and settings.DB.has_key('passwords'):
        connection.admin.authenticate(settings.DB['user_name'], settings.DB['passwords'])
    
#    customer = db.customer
#    contact = db.contact
#    follow = db.follow
#    opportunity = db.opportunity
#    order = db.order
#    contract = db.contract
#    product = db.product
#    user = db.user
#    product_category = db['product_category']
#    sys_role = db['sys_role']
#    sys_count = db['sys_count']
#    product = db['product']
#    department = db['department']
#    fs = GridFSEx(db)

    
    def batchUpsert(self, collection, ids=[], values={}):
        for id in ids:
            mongoClass.db[collection].update({'_id':id}, values, True)
                   
    def getFieldsDict(self, fieldsList, type=1):
        fields = {}
        for field in fieldsList:
            fields[field] = type
        return fields
    

        
mongo = mongoClass()

notDeleted = {'$nin': [True, 1]}        
    
if __name__ == '__main__':
    print list(mongo.db['task'].find())
    print 'done.'
    
    
    
    
    
    
        
