'''
Created on 2013-4-30

@author: Alex
'''
from nira.base.handlers.sessionHandler import SessionRequestHandler
import os
import json
from nira import settings
from nira.base.handlers.sysCacheHandler import SysCacheRequestHandler
from nira.common.cache.sysCacheManager import SysCache


MENU_DEF = json.loads(file(os.path.join(settings.PATH['root'], "modules/menu.json").replace('\\', '/')).read())

class MenuRequestHandler(SysCacheRequestHandler):  
    @property
    def topMenuHtml(self):
        html = self.sysCache[SysCache.Keys.TopMenuHtml]
        if not html:
            ms = ['<ul class="level0">']
            for li1 in MENU_DEF['front']:
                if type(li1)==list:
                    moduleName = li1[0]
                    ms.append('<li><a href="/%s">%s</a><ul class="level1">'%(moduleName, self.modulesDef[moduleName]['title']))
                    for li2 in li1[1]:
                        ms.append('<li><a href="/%s">%s</a></li>'%(li2, self.modulesDef[li2]['title']))  
                    ms.append('</ul></li>')
                                      
                else:
                    ms.append('<li><a href="/%s">%s</a></li>'%(li1, self.modulesDef[li1]['title']))  
            ms.append('</ul>')
            self.sysCache[SysCache.Keys.TopMenuHtml] = html = ''.join(ms)
            
        return html
    
    @property
    def adminMenuHtml(self):
        html = self.sysCache[SysCache.Keys.AdminMenuHtml]
        if not html:
            ms = ['<ul class="level0">']
            for li1 in MENU_DEF['admin']:
                if type(li1)==list:
                    moduleName = li1[0]
                    ms.append('<li><a href="/admin/%s">%s</a><ul class="level1">'%(moduleName, self.modulesDef[moduleName]['title']))
                    for li2 in li1[1]:
                        ms.append('<li><a href="/admin/%s">%s</a></li>'%(li2, self.modulesDef[li2]['title']))  
                    ms.append('</ul></li>')
                                      
                else:
                    ms.append('<li><a href="/admin/%s">%s</a></li>'%(li1, self.modulesDef[li1]['title']))  
            ms.append('</ul>')
            self.sysCache[SysCache.Keys.AdminMenuHtml] = html = ''.join(ms)
            
        return html
        
    
if __name__ == '__main__':
    pass