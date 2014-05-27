#encoding=utf-8
'''
Created on 2012-2-8

@author: Administrator
'''
import base64
from tornado.web import HTTPError
import functools
import urlparse
import urllib
from nira.common.cache.sessionManager import Session
from nira.common.cache.sysCacheManager import SysCache
from nira.common.exception import  StopOnPurpose, SysUnInit,\
    InvalidSessionId
from nira.common.utility import EmptyClass
from nira.data.mongodbManager import mongo, notDeleted
import time
import traceback
from nira import settings

class Identity(EmptyClass):

                    
    def __init__(self, sessionId, allowPersonal=True):  
        self.userId = '123'
        self.userName = 'admin'
        self.sysId = 1       
        self.sessionId = sessionId
        self.roles = ['admin']
            




       

   
    
    
if __name__ == '__main__':
    ii = 0
    print urlparse.urlsplit(settings.UAP['loginUrl']).scheme
    try:
        ii = Identity()
        ii.test()
    except Exception as ex:
        print ex
        traceback.print_exc()
        pass
    
    print ii.abc
