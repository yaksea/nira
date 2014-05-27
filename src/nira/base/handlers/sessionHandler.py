#encoding=utf-8
'''
Created on 2012-9-22

@author: Administrator
'''
from nira.common.cache.sessionManager import Session
import base64

from nira import settings
from nira.common.exception import SysUnInit, InvalidSessionId
from nira.common.cache.sysCacheManager import SysCache
from nira.base.handlers.moduleHandler import ModuleRequestHandler
from nira.base.identity import Identity

class SessionRequestHandler(ModuleRequestHandler):    
    def __init__(self, *args, **kwargs):
        super(SessionRequestHandler, self).__init__(*args, **kwargs)
        self._identity = None
        self.sessionId = None
        self._session = None
        self._context = None
        self._projectId= None
        self._planId= None
        self._sysInfo = None
        self.initializeSession()

    def initializeSession(self):                   
        self.sessionId = 'fake_sessionId'#self.get_cookie('sid')  
              
                    
    @property
    def session(self):
        if not self._session:
            try:
                sessionId = self.sessionId
                
                if sessionId:
                    self._session = Session(sessionId)
            except:
                pass
                        
        return self._session
      
            
    @property
    def identity(self):
        if not self._identity:               
            if not self.sessionId:
                return
            
            self._identity = self.session[Session.Keys.Identity]

            if not self._identity:
                try:
                    self._identity = Identity(self.sessionId)                                      
                    self.session[Session.Keys.Identity] = self._identity
                except InvalidSessionId:
                    self.log_sign("InvalidSessionId") 
                    return
        
                                 
        return self._identity
            
    
    def clearCookie(self):
        self.clear_cookie('sid')
    
    def clearSession(self):
        if self.session:
            self.session.clean()

    @property
    def projectId(self):
        self._projectId = self.params['projectId']
        if self._projectId:
            self.context['projectId'] = self._projectId
            self.context = self._context
        
        self._projectId = self.context.get('projectId')
        return self._projectId
    
    @projectId.setter
    def projectId(self,val):
        self._context['projectId'] = self._projectId = val
        self.context = self._context
        
    @property
    def planId(self):
        self._planId = self.params['planId']
        if self._planId:
            self.context['planId'] = self._planId
            self.context = self._context
        
        self._planId = self.context.get('planId')
        return self._planId
    
    @planId.setter
    def planId(self,val):
        self._context['planId'] = self._planId = val
        self.context = self._context
    
    @property
    def context(self):
        if not self._context:
            self._context = self.session[Session.Keys.Context] or {}
        
        return self._context
    
    @context.setter
    def context(self, val):
        self.session[Session.Keys.Context] = self._context
        
                
    @property
    def accessible(self):
        moduleName = self.module.name
        if not moduleName:
            return True
        
        if self.identity.isAdmin and moduleName not in ('orderAudit', 'contractAudit'):
            return True
        
        op = self.module.operation
        myRoles = self.identity.roles
        
        if moduleName in ('customer','customer_care', 'contact', 'anniversary', 
                          'follow', 'opportunity'):
            if 'sales' in myRoles:
                return True
        elif moduleName in ('order', 'contract'):
            if set(('sales', 'contract')) & set(myRoles):
                return True

        elif moduleName in ('product', 'productCategory'):
            if 'product' in myRoles:
                return True
            elif moduleName == 'product' and op in ('view', 'detail') and 'sales' in myRoles:
                return True
            elif moduleName == 'productCategory' and self.module.path=='/productcategory/tree' and 'sales' in myRoles:
                return True                        
        elif moduleName in ('orderAudit', 'contractAudit'):
            if self.identity.isManager:
                return True
        
        return False

if __name__ == '__main__':
#    print u'\u60a8\u7684\u5ba2\u6237\u6709\u53d8\u52a8'
#    print urllib.unquote('c2lkPXVhbXZjZWtnMWh0MHNkNzJkMXAwcWNwbGQzJnVpZD0yMDA1MDc1ODU2JnRpZD0mYmlkPSZleHBpcmU9MA==')
    uapc = 'dWlkPTI1MjA4ODQ0OCZzaWQ9cGJmMjEyY2xzNGplcmVoNjhmZGc3YmtrdTEmdGlkPThhZmQ2NWE1MDEzYTBhZDk5M2JkNGE1MzY0NTA0NDkzJmJpZD1hYmM5N2U1ODVjMGNiY2Y2Y2FiMjY1Yzk3OTMwZmU2YiZleHBpcmU9MTM3NDM3NDQ2NQ=='
    uapc = base64.b64decode(uapc)
    print uapc
    print uapc.split('&')[0].split('=')[1]
#    
#    print u'\u8bf7\u68c0\u67e5\u662f\u5426\u6b63\u786e\u9009\u62e9\u76f8\u5173\u8054\u7cfb\u4eba\u3002'

     
    