#encoding=utf-8
'''
Created on 2012-2-15

@author: Administrator
'''
import tornado.web



class TopMenu(tornado.web.UIModule):
    def render(self, context):
        return self.render_string("modules/topMenu.html", context=context)
    
