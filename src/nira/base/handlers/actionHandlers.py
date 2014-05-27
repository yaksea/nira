#encoding=utf-8

import tornado

from nira.data.mongodbManager import mongo, notDeleted, mongoClass
from nira.common.utility import getUUID, pickout_non_alphanumerics, \
    parseUrlParams, tryParse, parse_json
import datetime
import time
from nira import data, settings, handlers
import re
import os
import nira
from nira.common import utility, pinyin
import traceback
from tornado.web import RequestHandler
import string
import Image
import StringIO
import json
import mimetypes
import pymongo
from nira.base.handlers.sessionHandler import SessionRequestHandler
from nira.base.handlers.editHandler import EditRequestHandler
from nira.base.handlers.dataHandler import DataRequestHandler
from nira.base.handlers.detailHandler import DetailRequestHandler
from nira.base.handlers.wrapper import authenticate
from nira.base.handlers.listDataHandler import ListDataRequestHandler
from nira.base.handlers.jsonHandler import JsonRequestHandler
from nira.base.handlers.formHandler import FormRequestHandler
from pyes.query import *
from nira.data.search.esManager import searcher
from nira.form.formAdapter import getFieldsDef
from nira.base.handlers.permissionHandler import PermissionRequestHandler
from nira.base.handlers.tagDataHandler import TagDataRequestHandler
from nira.base.handlers.createHandler import CreateRequestHandler
from nira.base.handlers.listFilterHandler import ListFilterRequestHandler
from nira.form import webFields, mobileFields
from nira.base.handlers.pageHandler import PageRequestHandler
from nira.base.handlers.exportHandler import ExportRequestHandler
from nira.base.handlers.importHandler import ImportRequestHandler
from nira.base.handlers.organizationHandler import OrganizationRequestHandler
from nira.data.search.conditions import conditions
from nira.base.handlers.mobileListHandler import MobileListRequestHandler
from nira.form.webFields import nameFields
#from nira.data.form import initUserForm

def saveImage(vals, key, oldPath=None):    
    if oldPath != vals.get(key):
        if oldPath:
            oldId = getFileIdFromPath(oldPath)
            if oldId:
                mongo.fs.delete(oldId)
                mongo.fs.delete('thumbnail_' + oldId)       
        
        if vals.get(key):
            fileId = getFileIdFromPath(vals[key])
            mongo.fs.update({'_id':{'$in':[fileId, 'thumbnail_' + fileId]}}, {'$unset':{'temp':1}}, multi=True)
            thumbnailPath = vals[key]
            thumbnailPath = thumbnailPath.replace('/common/file/', '/common/file/thumbnail_', 1)            
            vals[key + '_thumbnail'] = thumbnailPath
        else:
            vals[key + '_thumbnail'] = ''
            
          
     
def saveFiles(files, oldFiles=None):
    if oldFiles:
        delFiles = list(set(oldFiles) - set(files))
        for f in delFiles:
            oldId = getFileIdFromPath(f)
            if oldId:
                mongo.fs.delete(oldId)
                
        
        oldFiles = list(set(oldFiles) & set(files))       
        files = list(set(files) - set(oldFiles))
        
    fileIds = []
    for file in files:
        
        fileId = getFileIdFromPath(file)
        if fileId:
            fileIds.append(fileId)
        
    mongo.fs.update({'_id':{'$in':fileIds}}, {'$unset':{'temp':1}}, multi=True)


REGEX_FILE_ID = re.compile(ur'^/common/file/(?P<id>.+)/.+$', re.I)

def getFileIdFromPath(path):
    match = re.match(REGEX_FILE_ID, path)
    if match:
        return match.group('id')    
  
REGEX_FILE_NAME = re.compile(ur'^/common/file/.+/(?P<name>.+)$', re.I)

def getFileNameFromPath(path):
    match = re.match(REGEX_FILE_NAME, path)
    if match:
        return match.group('name')    
  

class Default(PageRequestHandler):
    @authenticate
    def get(self): 
        moduleName = self.module.name
        fieldsDef = getFieldsDef(moduleName)
        searchFieldsOptions = {}
        for fieldName in conditions.searchFields[moduleName]:
            field = fieldsDef.get(fieldName)
            if field and field.has_key('options'):
                searchFieldsOptions[fieldName] = field['options']                
        
        searchFieldsOptions = json.dumps(searchFieldsOptions)
        searchFields = json.dumps(conditions.listConditions[moduleName])
       
        #filter
        filter = []
        if moduleName in ('customer', 'contact', 'opportunity', 'order', 'contract'):
            if self.identity.userId > 0:
                moduleTitle = self.module.title
                filter.extend([{'id':1, 'text':'我的' + moduleTitle}, {'id':3, 'text':'共享' + moduleTitle}])
                if self.identity.isManager:
                    filter.append({'id':2, 'text':'部门' + moduleTitle})
                    
            if moduleName == 'customer':
                filter.extend([{'id':4, 'text':'企业客户'}, {'id':5, 'text':'个人客户'}])                    
            elif moduleName == 'contact':
                filter.extend([{'id':4, 'text':'普通联系人'}, {'id':5, 'text':'个人客户'}, {'id':6, 'text':'企业联系人'}])
        
        elif moduleName == 'follow':
            filter = [{'id':1, 'text':'拜访'}, {'id':2, 'text':'来访'}, {'id':3, 'text':'电话'}, {'id':4, 'text':'其他'}]
        elif moduleName == 'customer_care':
            filter = [{'id':1, 'text':'本周'}, {'id':2, 'text':'本月'}]
        elif moduleName == 'anniversary':
            filter = [{'id':1, 'text':'7天内'}, {'id':2, 'text':'30天内'}, {'id':3, 'text':'100天内'}]       
        filter = json.dumps(filter)
        
        self.render(moduleName + "/list.html", searchFieldsOptions=searchFieldsOptions,
                        searchFields=searchFields, filter=filter)
            
            
        
class Create(CreateRequestHandler, PageRequestHandler):
    pass

class Edit(EditRequestHandler, PageRequestHandler):
    pass
        

     
# 点击名称后的查看页面
# 只读, 适合打印的
class Detail(DetailRequestHandler, PageRequestHandler):        
    @authenticate
    def get(self):
        template = self.formTemplate
        self.render("molds/detail.html", tabs='', forms=template['forms'])

class Delete(EditRequestHandler): 
    def postProcessing(self):  #后期处理
        pass
       
    @authenticate    
    def post(self):
        self.get()
        
    @authenticate    
    def get(self):
        moduleName = self.module.name 
        version = utility.getVersion()         
        data = mongo.db[moduleName].find_one({'_id':self.params['id']}, {'owner':1, 'sysId':1, 'type':1})    
             
        if self.permit(data, 'edit'):
            mongo.db[moduleName].update({'_id':self.params['id']}, {'$set':{'isDeleted': True, 'version':version}}) 

            #idividual customer   
            if moduleName in ('customer', 'contact') and data.get('type') == 1:
                mongo.db['customer' if moduleName == 'contact' else 'contact'].update(
                          {'_id':self.params['id']}, {'$set':{'isDeleted': True, 'version':version}}) 
            
            self.postProcessing()
            
            #日志
            self.log_data(self.params['id'])            
            
            data['version'] = version
            self.sendMsgForQueue(data) 
            self.sendMsg() 
        else:
            self.sendMsg_NoPermission()

        
class BulkDelete(EditRequestHandler):
    @authenticate
    def post(self):   
        moduleName = self.module.name 
        version = utility.getVersion()      
        deptId = self.identity.deptId
        userId = self.identity.userId
        
        ids = self.params['ids']     
        conditions = {'_id':{'$in':ids}}
        conditions.update(self.editCondition)   
        count = mongo.db[moduleName].update(conditions,
                    {'$set':{'isDeleted': True, 'version':version}}, multi=True, safe=True)['n']
        
        #idividual customer   
        if moduleName in ('customer', 'contact'):
            mongo.db['customer' if moduleName == 'contact' else 'contact'].update(conditions,
                    {'$set':{'isDeleted': True, 'version':version}}, multi=True)
        
        #日志
        for id in ids:
            self.log_data(id)
            
        self.sendMsgForQueue({'version':version}) 
        self.sendMsg(count=count) 

class MobileList(MobileListRequestHandler):
    pass
                
               
class PagedList(ListDataRequestHandler, ListFilterRequestHandler, PermissionRequestHandler):  
    @property
    def conditions(self):
        return []

    @property
    def fields(self):
        _fields = webFields.listFields[self.module.name]
        _fields.extend(['owner', 'sharers', '_id'])
        return ','.join(set(_fields))
    
    @property
    def sort(self):
        return ''
        
    def outputProcessing(self, dataRow):
        return dataRow
       
    @authenticate
    def post(self):
        moduleName = self.module.name

        self.filterByPermission()
        self.filterByConditions()
        self.filterByType()
        self._conditions.extend(self.conditions)

        
        q = BoolQuery(must=self._conditions, must_not=TermQuery("isDeleted", True))
        kwargs = dict(fields=self.fields, sort=self.sort)
        kwargs['start'] = tryParse(self.params['i'], int, 0)
        kwargs['size'] = tryParse(self.params['l'], int, 100)  
#        sortOrder = self.params['sortOrder']
#        if not sortOrder:
#            nameFields
        kwargs['sort'] = self.params['sortOrder']
        
        results = searcher.search(moduleName, q, **kwargs)        
              
        rows = []
        for row in results:
            row['canEdit'] = self.permit(row, "edit")
            row = self.parseValue(row)
            row = self.outputProcessing(row)
            rows.append(row)
                            
        self.sendMsg(total=results.count(), rows=rows)   



class GetTags(JsonRequestHandler):
    @authenticate
    def get(self):       
        moduleName = self.module.name
        uapId = self.identity.uapId
        fieldName = self.params['fieldName'] or 'tags'                  
        tags = []
          
        row = mongo.db['user_tag'].find_one({'_id':uapId}, {'%s.%s' % (moduleName, fieldName):1})
        if row and row.get(moduleName):
            tags = row[moduleName][fieldName]   
            
        self.sendMsg(tags=tags)

    
class AddTag(EditRequestHandler, TagDataRequestHandler):
    @authenticate
    def post(self):
        moduleName = self.module.name
  
        uapId = self.identity.uapId        
        fieldName = self.params['fieldName'] or 'tags'
        
        
        tag = self.params['tag']  
        if not tag or len(tag.encode('gbk', 'ignore')) > 20:
            self.sendMsg_WrongParameter()       
                        
        mongo.db['user_tag'].update({'_id':uapId}, {'$addToSet':{'%s.%s' % (moduleName, fieldName):tag}})
        self.sendMsg()
        
class ManageTags(EditRequestHandler):
    @authenticate    
    def post(self):     
        tags = self.params['tags']
        moduleName = self.module.name
        fieldName = self.params['fieldName'] or 'tags'
        if type(tags) == list:
            mongo.db['user_tag'].update({'_id':self.identity.uapId},
                                        {'$set':{'%s.%s' % (moduleName, fieldName): tags}}, True)
            self.sendMsg()
        else:
            self.sendMsg_WrongParameter()


class ConnectTags(EditRequestHandler):
    @authenticate  
    def post(self):
        moduleName = self.module.name
        ids = self.params['ids'] or [self.params['id'] ]      
  
        uapId = self.identity.uapId        
#        fieldName = self.params['fieldName'] or 'tags'
        
        tags = self.params['tags']
        if type(tags) != list or not ids:
            self.sendMsg_WrongParameter()
        
        if self.params['ids'] and tags == []:
            self.sendMsg()

        conditions = {'_id':{'$in':ids}}
        conditions.update(self.editCondition)                          
        
        op = {'$set':{'tags':tags}} if self.params['id'] else {'$addToSet':{'tags':{'$each':tags}}}
            
        #日志 
        for id in ids:
            self.logDataChanges(vals1=dict(_id=id, tags=tags))
                     
        count = mongo.db[moduleName].update(conditions, op, multi=True, safe=True)['n']
        
        #idividual customer
        if moduleName == 'customer':             
            mongo.db['contact'].update(conditions, op, multi=True)
        elif moduleName == 'contact':             
            mongo.db['customer'].update(conditions, op, multi=True)  

    
        self.sendMsg(count=count)




class Data(DataRequestHandler, PermissionRequestHandler):   
    def outputProcessing(self, dataRow):
        return dataRow
        
    @authenticate  
    def get(self):
        moduleName = self.module.name
        
        row = mongo.db[moduleName].find_one({'_id':self.params['id'], 'isDeleted':notDeleted})
        
        if not row:
            self.sendMsg_NoData()
            
        action = self.params['action'] # detail页传read, edit页传edit
                
        if self.permit(row, 'read' if action == 'copy' else action): 
            row['canEdit'] = self.permit(row, "edit")
            row = self.parseValue(row, action == "read" and not self.fromMobile)
                
            row = self.outputProcessing(row)
            self.responseJson(row)  
        else:
            self.sendMsg_NoPermission()

class GetSharers(JsonRequestHandler):
    @authenticate
    def get(self):
        moduleName = self.module.name
        row = mongo.db[moduleName].find_one({'_id':self.params['id'], 'isDeleted': notDeleted},
                                    {'sysId':1, 'owner':1, 'sharers':1})
        
        allUsers = {}
        for user in mongo.user.find({'sysId':self.identity.sysId, 'isDeleted': notDeleted},
                                    {'deptIdPath':1}):
            allUsers[user['_id']] = user
            
        sharers = []
        for userId in row['sharers']:
            if allUsers.has_key(userId):
                sharers.append(allUsers[userId])
                
        self.sendMsg(sharers=sharers)
        
class GetOwner(JsonRequestHandler):
    @authenticate
    def get(self):
        moduleName = self.module.name
        row = mongo.db[moduleName].find_one({'_id':self.params['id'], 'isDeleted': notDeleted},
                                    {'sysId':1, 'owner':1, 'sharers':1})
        allUsers = {}
        owner = mongo.user.find_one({'_id':row['owner']['_id'], 'isDeleted': notDeleted},
                                        {'userName':1})
                        
        self.sendMsg(owner=owner)
                
            
class Share(EditRequestHandler, OrganizationRequestHandler):
    @authenticate
    def post(self):
        moduleName = self.module.name
        version = utility.getVersion()
         
             
        if self.params['id']:
            row = mongo.db[moduleName].find_one({'_id':self.params['id'], 'isDeleted': notDeleted},
                                                {'sysId':1, 'owner':1, 'sharers':1, 'type':1})
            if not self.permit(row, 'edit'):
                 self.sendMsg_NoPermission()
                 
            sharers = self.getUsersInfo(self.params['sharers'])         
            mongo.db[moduleName].update({'_id':self.params['id']}, {'$set':{'sharers': sharers, 'version':version}})
            #idividual customer      
            if row.get('type') == 1:
                if moduleName == 'contact': 
                    mongo.customer.update({'_id':self.params['id']}, {'$set':{'sharers': sharers, 'version':version}})
                elif  moduleName == 'customer':
                    mongo.contact.update({'_id':self.params['id']}, {'$set':{'sharers': sharers, 'version':version}})
                
            #日志 
            self.logDataChanges(vals1=dict(_id=self.params['id'], sharers=sharers))            
                          
            row['version'] = version
            self.sendMsgForQueue(row)  
            self.sendMsg(count=1)
        
        elif self.params['ids']:
            sharers = self.getUsersInfo(self.params['sharers'])     
            conditions = {'_id':{'$in':self.params['ids']}}
            conditions.update(self.editCondition)  
                  
            count = mongo.db[moduleName].update(conditions,
                    {'$addToSet': {'sharers': {'$each':sharers}}, '$set':{'version':version}}, multi=True, safe=True)['n']
            
            #idividual customer       
            if moduleName == 'contact':
                mongo.db['customer'].update(conditions,
                    {'$addToSet': {'sharers': {'$each':sharers}}, '$set':{'version':version}}, multi=True)
            elif  moduleName == 'customer':
                mongo.db['contact'].update(conditions,
                    {'$addToSet': {'sharers': {'$each':sharers}}, '$set':{'version':version}}, multi=True)
                                     
            #日志 
            if count:
                for id in self.params['ids']:
                    self.logDataChanges(vals1=dict(_id=id, sharers=[s['_id'] for s in sharers]))
                    
            self.sendMsg(count=count)  
            
                
class Transfer(EditRequestHandler):
    @authenticate
    def post(self):
        moduleName = self.module.name  
        version = utility.getVersion()              

        owner = mongo.user.find_one({'_id':tryParse(self.params['owner'], int), 'isDeleted': notDeleted},
                                    {'deptIdPath':1})
        if not owner:
            self.sendMsg_WrongParameter()
        
        ids = self.params['ids'] or [self.params['id']]
        conditions = {'_id':{'$in':ids}}
        conditions.update(self.editCondition)        
        count = mongo.db[moduleName].update(conditions,
                {'$set':{'owner': owner, 'version':version}}, multi=True, safe=True)['n'] 

        #idividual customer              
        if moduleName == 'contact':
            mongo.db['customer'].update(conditions,
                {'$set':{'owner': owner, 'version':version}}, multi=True, safe=True)['n'] 
        elif  moduleName == 'customer':
            mongo.db['contact'].update(conditions,
                {'$set':{'owner': owner, 'version':version}}, multi=True, safe=True)['n'] 
        
        self.logDataChanges(vals1=dict(_id=self.params['id'], owner=owner['_id']))    
        self.sendMsgForQueue({'version':version, 'owner':owner})        
        self.sendMsg(count=count)
        
                   
            
                
class Export(ExportRequestHandler):
    pass
    
class Import(ImportRequestHandler):
    pass

        
                
    
if __name__ == '__main__':  
    v = u'在中在e'
    print len(v.encode('utf8')) 
#    xx = [2]
#    xx.extend(None)
#    print 'sadf '.strip()
#    print (1, 2, 3) + (4, 5)
#    x = '/common/file/23423dfg34/xx.jpg'
#    y = 'http://192.168.19.185/common/uploadimage/select_bg.png'
#    regex = re.compile(ur'^/common/file/(?P<id>.+)/.+$', re.I)
#    print getFileIdFromPath(x)
#    for i in mongo.contact.find({'_id': 'ce7923e11d9e11e2b27100219b625915'}):
#            print i
#    print 'done.'
                                 
#    print mongo.user.update({'_id':-459}, {'$set':{'version':utility.getVersion()}}, safe=True)

#    print tryParse('0', bool)
#    print tryParse('1336552202337', long)
#    print u'\u767b\u5f55\u5931\u8d25'
#    print u'\u53c2\u6570\u9519\u8bef'
#    c = {'sdf':'asdf'}
#    c.update(None)
#    print c
    pass
