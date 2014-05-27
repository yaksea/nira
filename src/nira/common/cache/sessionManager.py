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


class Session(): 
    class Keys():
        Identity = 'Identity'
        Context = 'Context'
    
    @staticmethod
    def generateSessionId():  
        return str(uuid.uuid1()).replace('-','')
    
    def __init__(self, sessionId, newCreated=False):        
        self.sessionId = sessionId   
        self.newCreated = newCreated  
        self.mmgt = memcachedClient
    
    def __getitem__(self, key):
        if not self.newCreated:
            return self.mmgt.get(MemcachedManager.Prefix.Session, self.sessionId, key)
        else:
            return None
         
    def __missing__(self, key):  
        return None  
  
    def __delitem__(self, key):  
        if not self.newCreated:
            try:
                self.mmgt.delete(MemcachedManager.Prefix.Session, self.sessionId, key)
            except:
                pass  
        else:
            return None
        
    def __setitem__(self, key, value):  
        self.mmgt.set(value, CACHE['session_expires'], MemcachedManager.Prefix.Session, self.sessionId, key)
        
    def clean(self):
        keys = dir(Session.Keys)
        for key in keys:
            if not key.startswith('_'):
                kv = getattr(Session.Keys, key)
                self.__delitem__(kv)
         
        

        
        
        