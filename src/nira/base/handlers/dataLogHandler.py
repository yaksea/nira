#encoding=utf-8
'''
Created on 2012-9-24

@author: Administrator
'''
from nira.base.handlers.formHandler import FormRequestHandler
from nira.form.formAdapter import getFieldOption
from nira.data.mongodbManager import mongo
from nira.data.sys import getCategoryDict
from nira.base.handlers.jsonHandler import JsonRequestHandler
from nira.common import utility
from nira.form import formAdapter
import decimal
import datetime
import pymongo
from nira.base.handlers.dataHandler import DataRequestHandler


_HANDLERS = dict(Create='创建', QuickCreate='快速添加', BatchCreate='手机通讯录导入', Edit='修改', 
                Transfer='转移', Share='共享', ChangeType="类型变更", ConnectCustomer='关联企业客户', 
                ConnectTags='修改',TaobaoImport='淘宝买家导入',Import='Excel导入',)
_TYPE = {'customer':{0:'企业客户', 1:'个人客户'}, 'contact':{0:'普通联系人', 1:'个人客户', 2:'企业联系人'}}

class DataLogRequestHandler(DataRequestHandler):    
    
    def __init__(self, *args, **kwargs):
        super(DataLogRequestHandler, self).__init__(*args, **kwargs)

    def getList(self):
        moduleName = self.params['module'] or self.module.name
        id = self.params['id']
        cursor = mongo.db['log'].find({'type':'data','module':moduleName, 'dataId':id}, 
                            {'dataChanges':1, 'handler':1, 'formattedDateTime':1, 'identity':1, 'params':1,'module':1})\
                            .sort([('dateTime', pymongo.ASCENDING)])
        results = []
                  
        for item in cursor:
            action = '修改'
            if item['params'].get('ids'):               
                action = '添加'  
                
            di = {'dateTime':item['formattedDateTime']}
            handler = item['handler']
            di['operation'] = _HANDLERS[handler]
            des = []
            fdcs = item['dataChanges'].get('form') or []
            sdcs = item['dataChanges'].get('sys') or []
            
            if handler in ('Create', 'QuickCreate','BatchCreate','TaobaoImport','Import'):
                for dc in fdcs:
                    if self.isVisibleField(dc['name']):
                        des.append('%s: %s'%(dc['label'], self.tryParseValue(dc)))
            elif handler == 'Edit':
                for dc in fdcs:
                    if self.isVisibleField(dc['name']):
                        des.append('修改了[%s]: 旧值为[%s], 新值为[%s]'%(dc['label'], 
                                                            self.tryParseValue(dc, '0'), 
                                                            self.tryParseValue(dc, '1')))
            elif handler == 'Transfer':
                id = self._pickupData(sdcs, 'owner', 'value1')
                if id:
                    name = mongo.user.find_one({'_id':id['_id']}, {'userName':1})['userName']
                    des.append('修改数据所有人为: [%s]'%name)
            elif handler == 'Share':
                ids = self._pickupData(sdcs, 'sharers', 'value1')
                if ids:
                    ids = [u['_id'] for u in ids]
                    userNames = []
                    for user in mongo.user.find({'_id':{'$in':ids}}, {'userName':1}):
                        userNames.append(user['userName'])
    
                    des.append('%s数据共享人: [%s]'%(action, ', '.join(userNames)))
            elif handler == 'ChangeType':
                type = self._pickupData(fdcs, 'type', 'value1')                
                des.append('变更类型为: [%s]'%_TYPE[item['module']][type])
            elif handler == 'ConnectCustomer':
                customer = self._pickupData(fdcs, 'customer', 'value1')                
                des.append('关联客户: [%s]'%customer['name'])
            elif handler == 'ConnectTags':
                tags = self._pickupData(sdcs, 'tags', 'value1')
                des.append('%s标签: [%s]'%(action, ', '.join(tags)))                
            
            if des:
                di['descriptions'] = des
                di['userName'] = item['identity']['userName']
                results.append(di)
            
        self.sendMsg(rows=results)

 
    def _pickupData(self, dcs, name, key):
        for dc in dcs:
            if dc['name'] == name:
                return dc[key]
            
    def tryParseValue(self, dc, key=''):
        try:
            text = self.parseSingleFieldValue(dc['name'], dc['value'+key])
        except:
            text = dc['text'+key] or '空'
        return text
            
















