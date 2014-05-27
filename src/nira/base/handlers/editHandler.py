#encoding=utf-8
'''
Created on 2012-9-24

@author: Administrator
'''
from nira.data.mongodbManager import mongo
from nira.base.handlers.formHandler import FormRequestHandler
import json
from nira import settings
from tornado import template
from nira.base.handlers.permissionHandler import PermissionRequestHandler
from nira.base.handlers.baseEditHandler import BaseEditRequestHandler
from nira.base.wrapper import authenticate
from nira.common import utility, pinyin
from nira.common.utility import tryParse
from nira import data as dh
from nira.form import formAdapter
from nira.base.handlers.dataHandler import DataRequestHandler
from nira.form.webFields import nameFields
from nira.base.handlers.pageHandler import PageRequestHandler

class EditRequestHandler(BaseEditRequestHandler, DataRequestHandler, PermissionRequestHandler, PageRequestHandler):
                   
    def getOriginalData(self):
        moduleName = self.module.name  
        return mongo.db[moduleName].find_one({'_id':self.params['id']})
       
    def logDataChanges(self, vals0={}, vals1={}, truncatedFields={}):
        fieldDef = self.fieldsDef
        changes = {'form':[], 'sys':[]}
        for k, v in vals1.items():
            v0 = vals0.get(k) or ''
            if v0==v:
                continue
            
            if fieldDef.has_key(k):
                f = fieldDef[k]
                ops = f.get('ops')
                if ops:
                    text0 = formAdapter.getFieldOption(ops, v0)
                    text1 = formAdapter.getFieldOption(ops, v)
                else:
                    text0 = v0                    
                    text1 = v  
                                      
                changes['form'].append(dict(name=k, label=f['label'], value0=v0, text0=text0, value1=v, text1=text1))
            else:
                changes['sys'].append(dict(name=k, value0=v0, value1=v))
        
        for k in truncatedFields:
            v0 = vals0.get(k) or ''
            if fieldDef.has_key(k):
                f = fieldDef[k]
                ops = f.get('ops')
                if ops:
                    text0 = formAdapter.getFieldOption(ops, v0)
                else:
                    text0 = v0           
            changes['form'].append(dict(name=k, label=f['label'], value0=v0, text0=text0, value1='', text1=''))
        
        self.log_data(vals0.get('_id') or vals1.get('_id'), changes)
            
    
    @authenticate
    def get(self):          
        formTempalte = self.formTempalte
        self.render("molds/edit.html", tabs='', forms=formTempalte['forms'])

    def dataReprocessing(self, originalData, vals):
        pass
        

        
    @authenticate    
    def post(self):
        self.log_debug("text")
        moduleName = self.module.name        
        originalData = self.getOriginalData()
        
        #权限
        if not self.permit(originalData, "edit"):
            self.sendMsg_NoPermission()
        
        #数据验证，预处理        
        vals = self.verifyValues()
        vals = self.makeRelated(vals, originalData)
        
        #系统字段
        vals['version']=utility.getVersion()
        
        #特殊处理
        self.dataReprocessing(originalData, vals)        
        
        #持久化
        truncatedFields = self.getTruncatedFields(originalData, vals)                       
        mongo.db[moduleName].update({'_id':self.params['id']}, {'$set':vals, '$unset':truncatedFields})
        
        #后期处理
        self.logDataChanges(originalData, vals, truncatedFields)  #写日志
        
        originalData['version'] = vals['version']
        self.sendMsgForQueue(originalData) 
        
        #结果输出             
        tempReVals = dict(originalData)
        tempReVals.update(vals)
       
        reVals = {}
                            
        for ff in self.returnFields(tempReVals):
            if ff not in truncatedFields: 
                reVals[ff] = tempReVals[ff]
        reVals['canEdit'] = 1
        self.outputProcessing(reVals)       
        
        self.sendMsg(**self.parseValue(reVals, parseMobile=self.fromMobile))

                
    def getTruncatedFields(self, originalData, newData):  # 获取被除值的字段，原先有，现在没有值的字段
            
        tf = set(originalData.keys()) & set(self.editableFields) - set(newData.keys()) 
        return mongo.getFieldsDict(tf)       
            