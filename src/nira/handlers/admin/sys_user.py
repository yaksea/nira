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
from nira.base.wrapper import authenticate


class Default(DefaultRequestHandler):
    def get(self): 
        moduleName = self.module.name
        
        self.render("user/list.html")

class Create(CreateRequestHandler):
    pass

class Edit(EditRequestHandler):
    pass

class PagedList(PagedListRequestHandler):
    pass

class PickerList(PickerListRequestHandler):
    pass

class Data(DataRequestHandler):
    pass

class Delete(DeleteRequestHandler):
    pass

class Invite(JsonRequestHandler):
    @authenticate
    def post(self): 
        id = self.params['_id']
        email = self.params['email']
        realName = self.params['realName']
        if not id:
            data = {'_id':utility.getUUID(), 'realName':realName, 'email':email, 'version':utility.getVersion(), 'status':0}
            data['sysId'] = self.identity.sysId
            mongo.db['sys_user'].insert(data)
            
            
        email = {'to':email,'subject':'invite to join nira', 'content':id or data['_id']}
        queueManager.queue.push(queueManager.QueueManager.Keys.SendEmails, email)
        if not id:
            self.sendMsg(**data)
        else:
            self.sendMsg()


if __name__ == '__main__':
    pass