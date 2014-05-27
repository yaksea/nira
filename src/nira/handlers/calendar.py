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
from nira.data.mongodbManager import mongo
from nira.base.handlers.jsonHandler import JsonRequestHandler
from nira.base.handlers.pageHandler import PageRequestHandler

class Default(PageRequestHandler):
    @wrapError
    def get(self):
        self.render('calendar/default.html')
#         self.render("task/todo.html") 
            
class MoveGroup(CreateRequestHandler):
    @wrapError
    def post(self):
        pass
        

class CreateGroup(JsonRequestHandler):
    #建立任务组
    def post(self):
        pass
            
class Classify(JsonRequestHandler):
#   分类整理
    def post(self):
        pass



class Edit(EditRequestHandler):
    pass

class PagedList(PagedListRequestHandler):
    @wrapError
    def get(self):
        sort = self.params['sort']
        order = self.params['order']
        filters = self.params['filters']
        
        

class Data(DataRequestHandler):
    pass

class Delete(DeleteRequestHandler):
    pass


if __name__ == '__main__':
    pass