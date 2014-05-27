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
from nira.base.handlers.pickerListHandler import PickerListRequestHandler
from nira.base.handlers.emailHandler import EmailRequestHandler
from nira.common.queue import queueManager
from nira.base.handlers.jsonHandler import JsonRequestHandler
from nira.common import utility
from nira.data.mongodbManager import mongo


class Default(DefaultRequestHandler):
    def get(self): 
        moduleName = self.module.name
        
        self.render("admin/role.html")

class Create(CreateRequestHandler):
    pass

class Edit(EditRequestHandler):
    pass

class PagedList(PagedListRequestHandler):
    pass



class Data(DataRequestHandler):
    pass

class Delete(DeleteRequestHandler):
    pass




if __name__ == '__main__':
    pass