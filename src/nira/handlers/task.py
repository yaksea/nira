#encoding=utf-8
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
from nira.data.mongodbManager import mongo, notDeleted
from nira.base.handlers.jsonHandler import JsonRequestHandler
from nira.common.utility import tryParse
from nira.form import formAdapter

TYPES = {'str':unicode, 'list': list, 'float': float, 'int': int, 'dict': dict}

class Default(DefaultRequestHandler):
    pass

class Todo(DefaultRequestHandler):
    @wrapError
    def get(self):         
        self.render("task/todo.html")   
        
class Create(CreateRequestHandler):
    @wrapError
    def post(self):
        task = self.params
        task['_id'] = utility.getUUID()
        mongo.db['task'].insert(task)
        self.sendMsg(**task)
        

           
class Classify(JsonRequestHandler):
#   分类整理
    def post(self):
        pass

class Done(EditRequestHandler):
    @wrapError
    def post(self):
        id = self.params['id']
        done = tryParse(self.params['done'], int, 1) #undo:0 
        mongo.db['task'].update({'_id':id}, {'$set':{'done':done}})
        self.sendMsg()
        
class ChangeOrder(EditRequestHandler):
    @wrapError
    def post(self):
        id = self.params['id']
        groupId = self.params['groupId']
        order = tryParse(self.params['order'], float, 10) 
        mongo.db['task'].update({'_id':id}, {'$set':{'order':order, 'groupId':groupId}})
        self.sendMsg()
        

class Edit(EditRequestHandler):
    @wrapError
    def post(self):
        id, newValues = self.getVerifiedValue('task')
        mongo.db['task'].update({'_id':id}, {'$set':newValues})
        self.sendMsg()

class PagedList(PagedListRequestHandler):
    @wrapError
    def get(self):
        sort = self.params['sort']
        order = self.params['order']
        filters = self.params['filters']
        
class List(PagedListRequestHandler):        
    @wrapError
    def get(self):
        groupId = self.params['groupId']
        rows = mongo.db['task'].find({'groupId':groupId, 'done':notDeleted,'isDeleted':notDeleted}).sort([('order', 1)])
        self.sendMsg(rows=list(rows))
        


class Data(DataRequestHandler):
    pass

class Delete(DeleteRequestHandler):
    @wrapError
    def post(self):    
        id = self.params['id']
        mongo.db['task'].update({'_id':id}, {'$set':{'isDeleted':True}})
        self.sendMsg()    


if __name__ == '__main__':
    pass