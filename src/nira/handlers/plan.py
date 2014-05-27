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
from nira.data.mongodbManager import mongo
from nira.common import utility
from nira.base.wrapper import wrapError

class Default(DefaultRequestHandler):
    def get(self):
        self.projectId
        self.render("plan/list.html")

class Create(CreateRequestHandler):
    def get(self):
        self.render("plan/create.html")
        
    @wrapError
    def post(self):
        plan = self.params
        plan['_id'] = utility.getUUID()
        plan['projectId'] = self.projectId 
        mongo.db['plan'].insert(plan)
        self.sendMsg()
        

class Edit(EditRequestHandler):
    pass

class PagedList(PagedListRequestHandler):
    @wrapError
    def get(self):
        rows = mongo.db['plan'].find({'projectId':self.projectId})
        self.sendMsg(rows=list(rows))

class Data(DataRequestHandler):
    pass

class Delete(DeleteRequestHandler):
    pass


if __name__ == '__main__':
    pass