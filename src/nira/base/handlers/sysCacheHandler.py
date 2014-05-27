#encoding=utf-8
'''
Created on 2012-9-23

@author: Administrator
'''
import json
from nira.form import formAdapter
from nira.base.handlers.jsonHandler import JsonRequestHandler
from nira.common.cache.sysCacheManager import SysCache
from nira.data.mongodbManager import mongo



class SysCacheRequestHandler(JsonRequestHandler):
    def __init__(self, *args, **kwargs):
        super(SysCacheRequestHandler, self).__init__(*args, **kwargs)
        self._sysCache = None
        self._projectDict = None
        self._versionDict = None
        self._userDict = None
     
    
                        
    @property
    def sysCache(self):
        if not self._sysCache:
            self._sysCache = SysCache(self.identity.sysId)
                        
        return self._sysCache
    
    @property
    def projectDict(self):
        if not self._projectDict:
            self._projectDict = self.sysCache[SysCache.Keys.ProjectDict]
            if self._projectDict == None:
                self._projectDict = {}
                rows = mongo.db['project'].find({'sysId':self.identity.sysId})
                for row in rows:                    
                    self._projectDict[row.pop('_id')] = row 
                self.sysCache[SysCache.Keys.ProjectDict] = self._projectDict
        return self._projectDict
    
    @property    
    def versionDict(self):
        if not self._versionDict:
            self._versionDict = self.sysCache[SysCache.Keys.VersionDict]
            if self._versionDict == None:
                self._versionDict = {}
                rows = mongo.db['version'].find({'sysId':self.identity.sysId})
                for row in rows:                    
                    self._versionDict[row.pop('_id')] = row 
                self.sysCache[SysCache.Keys.VersionDict] = self._versionDict            
        return self._versionDict
    

    @property    
    def userDict(self): 
        if not self._userDict:
            self._userDict = self.sysCache[SysCache.Keys.UserDict]
            if self._userDict == None:
                self._userDict = {}
                rows = mongo.db['sys_user'].find({'sysId':self.identity.sysId, 'status':1},{'email':1, 'realName':1})
                for row in rows:                    
                    self._userDict[row.pop('_id')] = row 
                self.sysCache[SysCache.Keys.UserDict] = self._userDict            
        return self._userDict
             
         
