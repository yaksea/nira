#encoding=utf-8
'''
Created on 2012-9-23

@author: Administrator
'''
import json
from nira.form import formAdapter
from nira.base.handlers.jsonHandler import JsonRequestHandler
from nira.common.cache.sysCacheManager import SysCache
from nira.base.handlers.sysCacheHandler import SysCacheRequestHandler



class FormRequestHandler(SysCacheRequestHandler):
    def __init__(self, *args, **kwargs):
        super(FormRequestHandler, self).__init__(*args, **kwargs)
        self._fieldsDef = None
        self._formDef = None
        self._switchedModuleName = None  #同一次请求，模块名称应该只是同一个
        self._editableFields = None
    
    def getFieldsDef(self, moduleName):
        return self.getFormDef(moduleName)['fields']
    
    @property    
    def __moduleName(self):
        return self._switchedModuleName or self.module.name
    
    def switchModuleName(self, moduleName):
        self._switchedModuleName = moduleName
    
    @property    
    def fieldsDef(self):
        if not self._fieldsDef:
            self._fieldsDef = self.formDef['fields']
        return self._fieldsDef
    

    def getSysFormDef(self, moduleName): 
        return {}  #各系统自定义表单
             
         
    def getFormDef(self, moduleName): 
        cacheKey = SysCache.Keys.FormDef%self.__moduleName
        self._formDef = self.sysCache[cacheKey]
            
        if not self._formDef:  
            self._formDef = formAdapter.getFormDef(moduleName)   
            ufd = self.getSysFormDef(moduleName)   
            if ufd:    
                self._formDef['sequence'].extend(ufd['sequence'])
                self._formDef['blocks'].update(ufd['blocks'])
                self._formDef['fields'].update(ufd['fields'])
            self.sysCache[cacheKey] = self._formDef
            
        return self._formDef
         
    @property
    def formDef(self):   
        if not self._formDef:
            return self.getFormDef(self.__moduleName)
        return self._formDef
    
    @property
    def editableFields(self):   
        if self._editableFields == None:
            self._editableFields = formAdapter.getEditableFields(self.__moduleName)   
        return self._editableFields
    
    @property
    def visibleFields(self):   
        return formAdapter.getVisibleFields(self.__moduleName)   
    
    def isVisibleField(self, key): 
        if key in formAdapter.getVisibleFields(self.__moduleName):
            return True
        else:
            return False

        
      