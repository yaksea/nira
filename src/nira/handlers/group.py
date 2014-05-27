'''
Created on 2013-4-26

@author: Alex
'''
from nira.base.handlers.editHandler import EditRequestHandler
from nira.base.handlers.createHandler import CreateRequestHandler
from nira.base.handlers.dataHandler import DataRequestHandler
from nira.base.handlers.defaultHandler import DefaultRequestHandler
from nira.base.handlers.pagedListHandler import PagedListRequestHandler
from nira.base.handlers.deleteHandler import DeleteRequestHandler
from nira.base.wrapper import wrapError
from nira.common import utility
from nira.data.mongodbManager import mongo
from nira.common.utility import tryParse

class Create(CreateRequestHandler):
    @wrapError
    def post(self):
        group = self.params
        group['_id'] = utility.getUUID()
        mongo.db['group'].insert(group)
        self.sendMsg(**group)
        
        
class ChangeOrder(EditRequestHandler):
    @wrapError
    def post(self):
        id = self.params['id']
        order = tryParse(self.params['order'], float, 10) 
        mongo.db['group'].update({'_id':id}, {'$set':{'order':order}})
        self.sendMsg()    

class Edit(EditRequestHandler):
    @wrapError
    def post(self):
        id, newValues = self.getVerifiedValue('group')
        mongo.db['group'].update({'_id':id}, {'$set':newValues})
        self.sendMsg()

class List(PagedListRequestHandler):        
    @wrapError
    def get(self):
        rows = mongo.db['group'].find({}).sort([('order', 1)])
        self.sendMsg(rows=list(rows))

class Data(DataRequestHandler):
    pass

class Delete(DeleteRequestHandler):
    pass


if __name__ == '__main__':
    pass