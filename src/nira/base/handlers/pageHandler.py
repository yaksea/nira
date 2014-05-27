#encoding=utf-8
'''
Created on 2012-9-24

@author: Administrator
'''
from nira.data.mongodbManager import mongo, notDeleted
from nira.base.handlers.formHandler import FormRequestHandler
import json
from nira.common.cache.sysCacheManager import SysCache
from nira import settings
from tornado import template
from nira import data as dh
from nira.common import utility
from nira.base.handlers.sessionHandler import SessionRequestHandler
from nira.base.handlers.logHandler import LogRequestHandler
import urllib
from nira.common.exception import StopOnPurpose
from collections import OrderedDict
import os
from nira.base.handlers.menuHandler import MenuRequestHandler



class PageRequestHandler(MenuRequestHandler):
    def gotoPage(self, url):
        self.write('<script>parent.location.href="%s"</script>'%url)
        raise StopOnPurpose
    
    def gotoHome(self):
        self.gotoPage('/')
        
    
    def gotoError(self):
        return
        url = '/prompt?' + urllib.urlencode(dict(statusCode=500))
        self.gotoPage(url)

            
    def gotoLogin(self):
        url = '/login?'+ urllib.urlencode({'returnUrl':self.referer})
        self.gotoPage(url)
            
class cc():
    def kk(self):
        print __name__


if __name__ == "__main__":
#    print  os.path.abspath(os.curdir)
#    print os.path.dirname(__file__)
#    c = cc()
#    c.kk()
#    od = OrderedDict()    
##    od = dict()    
#    od['e'] = 'we'
#    od['b'] = 'wqe'
#    od['6'] = '66'
#    od['y'] = 'yy'
#    print json.dumps(od)
##    od = OrderedDict(json.loads('{"e": "we", "b": "wqe", "6": "66", "y": "yy"}'))
#    od = OrderedDict((('1',('c','wer')),('e',1)))
##    od.s
#
#    for o,v in od.items():
#        print v      
        
    pass