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
from nira.base.handlers.pickerListHandler import PickerListRequestHandler
from nira.base.handlers.jsonHandler import JsonRequestHandler
from nira.base.handlers.pageHandler import PageRequestHandler
from nira.common import utility
from nira.data.mongodbManager import mongo
from nira.base.wrapper import wrapError


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

class Join(PageRequestHandler):
    @wrapError
    def get(self):
        self.render('user/join.html', sysName='hundup', userName='hundup@gmail.com')
    
    @wrapError
    def post(self):
        if self.params['registered']:
            #
            pass
        else:
#            需要判断是否重复注册
            userId = utility.getUUID()
            newUser = {'_id':userId}
            newUser['userName'] = newUser['email'] = self.params['userName']
            newUser['passwords'] = self.params['passwords1']
            mongo.db['user'].insert(newUser)
        
        mongo.db['sys_user'].update({'_id':self.params['id'],
                                     },{'$set':{'realName':self.params['realName'], 
                                                'userId':userId, 'status':1}})
        
        self.sendMsg()


if __name__ == '__main__':
    pass