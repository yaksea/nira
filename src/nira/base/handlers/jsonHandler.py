#encoding=utf-8
import json
from nira.common.exception import StopOnPurpose
from nira.base.handlers.logHandler import LogRequestHandler

class JsonRequestHandler(LogRequestHandler):    
    def __init__(self, *args, **kwargs):
        super(JsonRequestHandler, self).__init__(*args, **kwargs)
        self._jsonp = self.params['jsonpcallback']
        
    def responseJson(self, data):
        self.add_header('Cache-Control', 'no-cache')
#        self.add_header("Content-Type", "application/json; charset=UTF-8")
        self.add_header("Content-Type", "text/html; charset=UTF-8")
        if data != None:
            rd = json.dumps(data)#,ensure_ascii=False)
        else:
            rd = ''
        
        if self._jsonp:
            self.write('%s(%s)'%(self._jsonp,rd))
        else:
            self.write(rd)
        self.finish()
           


    def sendMsg(self, message='success', statusCode=200, **kwargs):
        msg = dict(message=message,statusCode=statusCode)
        msg.update(kwargs)
        self.responseJson(msg)
        raise StopOnPurpose()
    
    def sendMsg_WrongParameter(self, message='参数错误'):
        self.sendMsg(message, 400)
        
    def sendMsg_NoIdentity(self, message='无法获取身份'):
        self.sendMsg(message, 401) #需重登录
        
    def sendMsg_SysUnInit(self, message='系统未开通'):
        self.sendMsg(message, 402)
        
    def sendMsg_NoPermission(self, message='无操作权限'):
        self.sendMsg(message, 403)
        
    def sendMsg_NoData(self, message='该数据资源已被删除'):
        self.sendMsg(message, 404)
        
    def sendMsg_Duplicated(self, message='重复的数据'):
        self.sendMsg(message, 409)
        
    def sendMsg_Unknown(self, message='未知错误'):
        self.sendMsg(message, 500)
        
    def sendMsg_VersionTooLow(self, message='版本过低，请升级'):
        self.sendMsg(message, 505)
        
        
        
        
    