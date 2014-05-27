#encoding=utf-8
'''
Created on 2012-2-3

@author: Administrator
'''
#from nira.gtornado import patch_all; patch_all()
import tornado.ioloop
import tornado.httpserver
import tornado.web
from tornado import autoreload
import os
from nira.handlers import home
from nira import settings
from tornado.options import options, define
from nira.common.tnd.application import Application
from nira.base.handlers.baseHandler import BaseRequestHandler
import sys
reload(sys)
sys.setdefaultencoding('utf8') 

def getHandlers():    
    handlers = []
    __buildHandlers(handlers, "")
    handlers.extend([
                         (r'^/$', home.Default),
                     ])
    return handlers 


def __buildHandlers(handlers, path):
    curDir = os.path.join(settings.PATH['handlers'], path).replace('\\', '/')
    innerPath = path
    for item in os.listdir(curDir):
        itemPath = os.path.join(curDir, item)
        if os.path.isfile(itemPath):
            info = os.path.splitext(item)
            if info[1] == '.py' and not info[0].startswith('_'):
                innerPath = os.path.join(path, info[0]).replace('\\', '/')
                moduleName = ('handlers.'+innerPath).replace('/','.')
                module = __import__(moduleName)
                module = sys.modules[moduleName]
                
                for attritude in dir(module):
                    cls = getattr(module, attritude)
                    # 如果 attritude是class且是tornado.web.RequestHandler
                    # 的子类则把该类当作 action,文件名当作controller
                    if isinstance(cls, type) and issubclass(cls, BaseRequestHandler):
                        classPath = (innerPath+'/'+attritude).lower()#.replace('_', '/')
                        if classPath.endswith('/default'):
                            classPath = classPath[:-8]
#                        elif classPath.endswith('_j'):
#                            classPath = classPath[:-2]+".json"
                            
                        handlers.append((r'^/'+classPath+'/?$', cls))
#                        print classPath
#                        print cls
                        
                        
        elif os.path.isdir(itemPath):
            innerPath = os.path.join(path, item)
            __buildHandlers(handlers, innerPath)
    
 



application = Application(getHandlers(), 
                                      debug=False, **settings.TND)

define("port", default=8080, help="Run server on a specific port", type=int) 

if __name__ == "__main__":
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(application, xheaders=True)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
