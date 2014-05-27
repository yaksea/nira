#encoding=utf-8
'''
Created on 2012-12-26

@author: Administrator
'''
from nira.base.handlers.sessionHandler import SessionRequestHandler
from nira.common.tnd.params import Params
from nira.common.utility import EmptyClass
import datetime
from nira.common import utility, log
from nira.data.mongodbManager import mongo
import time
from nira import settings

#type: info, error, debug, data, sign #数组，
#error是必须收集,在最外层收集，其它是自选收集, info收集普通的请求信息，data则涵盖info
#sign,用户登录，签到
#text:
#params: 请求参数
#module: customer
#handler: edit
#dataChanges:{'form':[{'name':'', 'label':'', 'value0':'','value1':'','text0':'', 'text1':''}], 
#                'sys':[{'name':'', 'value0':'','value1':'']}
#dataId:
#mobileInfo:     #手机端请求
#identity: userId, userName, sysId, deptName
#dateTime:
#ip:                 #web请求
#request: {header:'',body:'',url:''}            #error情况下收集


class LogRequestHandler(SessionRequestHandler):
    def __init__(self, *args, **kwargs):
        super(LogRequestHandler, self).__init__(*args, **kwargs)
        self._type = set()    
        self._text = ''       
        self._data = []       
        
    def log_info(self, text=''):
        self._type.add('info')
        self._text= text
        
    def log_debug(self, text=''):
        if settings.ENVIRONMENT['production']:
            return
        
        self._type.add('debug')
        self._text= text
    
    def log_error(self, text=''):
        self._type.add('error')
        self._text= text
        
    def log_sign(self, text=''):
        self._type.add('sign')
        self._text= text
    
    def log_data(self, id, changes=[]):
        self._type.add('data')
        self._data.append({'dataId': id, 'dataChanges': changes})
        
        
    def log_flush(self):
        if self._type:
            try:
                ld = {}
                ld['params'] = self.params
                ld['module'] = self.module.name
                ld['handler'] = self.module.handler
                
                ld['ip'] = self.request.remote_ip
                    
                if not self._type.isdisjoint(['error', 'debug', 'sign']):
                    ld['request'] = {'header':self.request.headers, 'body':self.request.body, 
                                     'url':self.request.uri, 'method':self.request.method}
                
                if self.identity:
                    ld['identity'] = self.identity.toJson()
                    
                ld['dateTime'] = time.time()
                ld['formattedDateTime'] = utility.getFormattedTime(ld['dateTime'])
                ld['text'] = self._text
                ld['type'] = list(self._type)
                ld['_id'] = utility.getUUID()
            
                if self._data:  
                    for data in self._data:
                        data.update(ld) 
                        data.update({'_id':utility.getUUID()})                   
                    mongo.db['log'].insert(self._data)
                else:                                        
                    mongo.db['log'].insert(ld)
            except:
                log.error()
            
            










if __name__ == '__main__':
#    aa = [{'sd':2},{'er':5}]
#    for a in aa:
#        a.update({'gv':4})
#    print aa
    
    ss = set()
    ss.add('fg')
    ss.add('hj')
    ss.add('kh')
    
    print ss.isdisjoint(['hej','we'])
#    print len(ss)
#    if ss:
#        print 'xx'
#    p = dict()
#    p.update({'id':23})
#    print p
#    print datetime.datetime.now
#    dt = datetime.datetime.now()
#    for i in range(100000):
#        ec = EmptyClass()
#        ec.xx = {'sdf':"sdf"}
#        print ec.toJson()
#    print datetime.datetime.now()-dt














