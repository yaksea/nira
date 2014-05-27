#encoding=utf-8
'''
Created on 2012-2-8

@author: Administrator
'''
import uuid
from memcachedManager import MemcachedManager
from nira.settings import CACHE
from nira.common.cache.memcachedManager import memcachedClient
from nira import settings

class SysCache(): 
    class Keys():
        #form
        FormDef = 'FormDef_%s'
        EditTemplate= 'EditTemplate_%s'
        DetailTemplate= 'DetailTemplate_%s'
        #html
        TopMenuHtml = 'TopMenuHtml'
        AdminMenuHtml = 'AdminMenuHtml'
        #dict data
        ProjectDict = "ProjectDict"
        VersionDict = 'VersionDict'
        UserDict = 'UserDict'
        
        
    
    def __init__(self, sysId):        
        self.sysId = sysId 
        self.mmgt = memcachedClient
    
    def __getitem__(self, key):
        return self.mmgt.get(MemcachedManager.Prefix.SysCache, self.sysId, key)
         
    def __missing__(self, key):  
        return None  
  
    def __delitem__(self, key):  
        try:
            self.mmgt.delete(MemcachedManager.Prefix.SysCache, self.sysId, key)
        except:
            pass  

        
    def __setitem__(self, key, value):  
        self.mmgt.set(value, 0, MemcachedManager.Prefix.SysCache, self.sysId, key)
        
    def clean(self):
        keys = dir(SysCache.Keys)
        for key in keys:
            if not key.startswith('_'):
                kv = getattr(SysCache.Keys, key)
                for module in settings.APP['modules']:                        
                    self.__delitem__(kv%module)
         
        

        
        
        