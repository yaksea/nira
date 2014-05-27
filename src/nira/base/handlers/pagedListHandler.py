#encoding=utf-8
'''
Created on 2012-9-24

@author: Administrator
'''
from nira.base.handlers.formHandler import FormRequestHandler
from nira.form.formAdapter import getFieldOption
from nira.data.mongodbManager import mongo, notDeleted
from nira.base.handlers.jsonHandler import JsonRequestHandler
from nira.common import utility
from nira.form import formAdapter
import decimal
import datetime
from nira.base.handlers.dataParseHandler import DataParseRequestHandler
from nira.base.wrapper import authenticate

CHINESE_CALENDAR = {'month': ('正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '腊'),
                    'day': ('初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                            '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '廿十',
                            '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '卅十')                        
                    }
decimal.getcontext().prec = 2

class PagedListRequestHandler(DataParseRequestHandler):    
#    数据输出处理
    def __init__(self, *args, **kwargs):
        super(PagedListRequestHandler, self).__init__(*args, **kwargs)
    
    @authenticate   
    def get(self):
        moduleName = self.module.name
        rows = mongo.db[moduleName].find({'isDeleted':notDeleted})
        results = []
        for row in rows:
            results.append(self.parseForDisplay(row))
        self.sendMsg(rows=results)
        
