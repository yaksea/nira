#encoding=utf-8
'''
Created on 2012-9-24

@author: Administrator
'''
from nira.data.mongodbManager import mongo
import json
from nira.base.handlers.baseEditHandler import BaseEditRequestHandler
from nira.base.wrapper import authenticate
from nira.common import utility, pinyin
import time
from nira.form import formAdapter
from nira.base.handlers.dataHandler import DataRequestHandler
from nira.form.webFields import nameFields
from nira.base.handlers.pageHandler import PageRequestHandler

class CreateRequestHandler(BaseEditRequestHandler, DataRequestHandler, PageRequestHandler):
    
    def logDataChanges(self, vals):
        fieldDef = self.fieldsDef
        changes = {'form':[], 'sys':[]}
        for k, v in vals.items():
            if fieldDef.has_key(k):
                f = fieldDef[k]
                ops = f.get('ops')
                if ops:
                    text = formAdapter.getFieldOption(ops, v)
                else:
                    text = v                    
                changes['form'].append(dict(name=k, label=f['label'], value=v, text=text))
            else:
                changes['sys'].append(dict(name=k, value=v))
        
        self.log_data(vals['_id'], changes)
             
        
    
    @authenticate
    def get(self):          
        self.render("molds/edit.html", forms=self.formTempalte)
    
    @authenticate    
    def post(self):
        self.log_debug("text")
        moduleName = self.module.name
        
        #数据验证，预处理
        vals = self.verifyValues()
#        vals = self.makeRelated(vals)
        
        #系统字段
        vals['sysId'] = self.identity.sysId
        vals['version'] = utility.getVersion()
        vals['createTime'] = time.time()#时间戳 

        if moduleName in ('version', 'build', 'version_user'):
            vals['project'] = self.projectDict[self.navPath.projectId]
            
        if moduleName in ('build', 'version_user'):
            vals['version'] = self.versionDict[self.navPath.versionId]
            

#        vals['owner'] = {'_id':self.identity.userId, 'deptIdPath':self.identity.deptIdPath or []}
        
        vals['_id'] = utility.getUUID()
        
        #特殊处理
        self.dataReprocessing(vals)
        
        #持久化
        mongo.db[moduleName].insert(vals)
        
        #后期处理
        self.logDataChanges(vals)#写日志        
        
#        self.sendMsgForQueue(vals)  
        
        #结果输出                
        reVals = {}
        for ff in self.returnFields(vals):
            reVals[ff] = vals[ff]
        reVals['canEdit'] = 1
        
        self.outputProcessing(reVals)     
                
        self.sendMsg(**self.parseForDisplay(reVals))
            
            
            
            