#encoding=utf-8
'''
Created on 2012-9-22

@author: Administrator
'''
import urlparse
from nira.common.utility import tryParse, subDict, EmptyClass
from nira.common import log, utility
from nira.base.handlers.baseHandler import BaseRequestHandler
import json
from nira import settings
import os

MODULES_DEF = json.loads(file(os.path.join(settings.PATH['root'], "modules/modules.json").replace('\\', '/')).read())



class ModuleRequestHandler(BaseRequestHandler):    
    def __init__(self, *args, **kwargs):
        self._module = None
        self._navPath = None
        super(ModuleRequestHandler, self).__init__(*args, **kwargs)

    @property
    def modulesDef(self):
        return dict(MODULES_DEF)
        
    @property
    def module(self):
        if not self._module:
            self._module = self.initializeModule()
        return self._module
    
    @property
    def navPath(self):
        if not self._navPath:
            for idType in ('projectId', 'versionId', 'buildId'):
                _id = self.params[idType]
                if _id:
                    self.set_cookie(idType, _id, expires_days=60);                    

            self._navPath = NavPath()
            self._navPath.projectId = self.get_cookie('projectId')
            self._navPath.versionId = self.get_cookie('versionId')
            self._navPath.buildId = self.get_cookie('buildId')
            
        return self._navPath
            
    def initializeModule(self, currentUri=None):
        _module = EmptyClass()
        _module.name = self.__module__.replace('handlers.','').replace('admin.','')
        _module.handler = self.__class__.__name__
        if self.modulesDef.get(_module.name):
            _module.title = self.modulesDef[_module.name]['title']
        else:
            _module.title = 'nira'
        return _module
    
       
class NavPath():
    def __init__(self):        
        self.projectId = None 
        self.versionId = None        
        self.buildId = None 

if __name__ == '__main__':
    c = utility.EmptyClass()
    c.dd = 'wer'
    print c.dd
    pass

     
    