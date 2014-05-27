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
from nira.base.wrapper import authenticate
from nira.common import utility
from nira.data.mongodbManager import mongo, notDeleted

class Default(DefaultRequestHandler):
    @authenticate
    def get(self):         
        self.render("project/list.html")    

class Create(CreateRequestHandler):
    pass

class Edit(EditRequestHandler):
    pass

class PagedList(PagedListRequestHandler):
    pass

class PickerList(PickerListRequestHandler):
    pass

class DataList(JsonRequestHandler):
    @authenticate
    def get(self):
        moduleName = self.module.name
        projects = mongo.db[moduleName].find({'sysId':self.identity.sysId, 'isDeleted':notDeleted})
        users = mongo.db['project_user'].group(['projectId'],{'sysId':self.identity.sysId}, 
                                   {'users':0},
                                   'function(obj, prev) {prev.users++}')   
        p_users = {}
        for u in users:
            p_users[u['projectId']] = u['users']
        
        curVersion = mongo.db['project_user'].find({'sysId':self.identity.sysId, 'processStatus':1},{'projectId','name.full'})
        p_curVersion = {}
        for v in curVersion:
            p_curVersion[v['projectId']] = v['name']['full']
                
        
        results = []
        for project in projects:
            project['users'] = p_users.get(project['_id']) or 0
            project['curVersion'] = p_curVersion.get(project['_id']) or ''
            
            results.append(project)
        
        self.sendMsg(rows=results)
       


class Data(DataRequestHandler):
    pass

class Delete(DeleteRequestHandler):
    pass


if __name__ == '__main__':
    pass