#encoding=utf-8
'''
Created on 2012-9-23

@author: Administrator
'''

import functools
from nira.common.exception import StopOnPurpose
from nira.base.handlers.sessionHandler import SessionRequestHandler
from nira.base.handlers.jsonHandler import JsonRequestHandler
import traceback
from nira.base.handlers.pageHandler import PageRequestHandler
from nira.common import log
from nira.base.handlers.logHandler import LogRequestHandler

        
#def authenticate(method):
#    """Decorate methods with this to require that the user be logged in."""
#    @functools.wraps(method)
#    def wrapper(self, *args, **kwargs):  
#        mr = None    
#        if not isinstance(self, SessionRequestHandler):
#            mr = method(self, *args, **kwargs) 
#        try:
#            CompatibleRequestHandler.compatibleLowestVersion(self)  #客户端最低兼容版本
#            
#            if not self.identity:                       
#                if isinstance(self, PageRequestHandler) and method.func_name=='get':
#                    self.gotoLogin()
#                elif isinstance(self, JsonRequestHandler):
#                    self.sendMsg_NoIdentity('验证过期')            
#            
#            if not self.accessible:
#                if isinstance(self, PageRequestHandler) and method.func_name=='get':
#                    self.gotoHome()
#                elif isinstance(self, JsonRequestHandler):
#                    self.sendMsg_NoPermission()
#                if not self._finished:
#                    self.finish()
#                return
#            
#            mr = method(self, *args, **kwargs)
#                        
#        except StopOnPurpose:
#            if not self._finished:
#                self.finish()
#        except:
#            if isinstance(self, LogRequestHandler):
#                self.log_error(traceback.format_exc())
#                         
#            log.error()
#            try:
#                if isinstance(self, PageRequestHandler) and method.func_name=='get':
#                    self.gotoError()
#                elif isinstance(self, JsonRequestHandler):
#                    self.sendMsg_Unknown()
#            except StopOnPurpose:
#                if not self._finished:
#                    self.finish()
#                    
#        if isinstance(self, LogRequestHandler):
#            self.log_flush()
#        return mr            
#
#            
#    return wrapper  
  
def authenticate(method):
    """Decorate methods with this to require that the user be logged in."""
    @functools.wraps(method)
    def wrapper(self, *args, **kwargs):  
        mr = None
        try:                         
            mr = method(self, *args, **kwargs)
                        
        except StopOnPurpose:
            if not self._finished:
                self.finish()
        except:                  
            if isinstance(self, LogRequestHandler):
                self.log_error(traceback.format_exc())
                                        
            log.error()
            
            try:
                if isinstance(self, PageRequestHandler) and method.func_name=='get':
                    self.gotoError()
                elif isinstance(self, JsonRequestHandler):
                    self.sendMsg_Unknown()
            except StopOnPurpose:
                if not self._finished:
                    self.finish()
                    
        if isinstance(self, LogRequestHandler):
            self.log_flush()
        return mr
            
    return wrapper   

def wrapError(method):
    """Decorate methods with this to require that the user be logged in."""
    @functools.wraps(method)
    def wrapper(self, *args, **kwargs):  
        mr = None
        try:                         
            mr = method(self, *args, **kwargs)
                        
        except StopOnPurpose:
            if not self._finished:
                self.finish()
        except:                  
            if isinstance(self, LogRequestHandler):
                self.log_error(traceback.format_exc())
                                        
            log.error()
            
            try:
                if isinstance(self, PageRequestHandler) and method.func_name=='get':
                    self.gotoError()
                elif isinstance(self, JsonRequestHandler):
                    self.sendMsg_Unknown()
            except StopOnPurpose:
                if not self._finished:
                    self.finish()
                    
        if isinstance(self, LogRequestHandler):
            self.log_flush()
        return mr
            
    return wrapper   

#def  

