#coding=utf-8
'''
Created on 2012-2-23

@author: Administrator
'''

#class OAPError(Exception):
#    """An exception that will turn into an HTTP error response."""
#    def __init__(self, url, statusCode):
#        self.message = "oap exception with status[%d]: %s" % (statusCode, url)
#
#    def __str__(self):        
#        return self.message
    
class ExternalAPIException(Exception):
    """An exception that will turn into an HTTP error response."""
    def __init__(self, statusCode, url=None):
        self.statusCode = statusCode
        self.url = url
        self.apiType = "External API"
        self.message =  "%s Exception[%s]:%s" %(self.apiType, self.statusCode, self.url)
        
    
    def setType(self, apiType, *args, **kwargs):
        self.apiType = apiType
        self.message =  "%s Exception[%s]:%s" %(self.apiType, self.statusCode, self.url)
        if args:
            self.message += '\r\nargs:%s' % str(args)
        if kwargs:
            self.message += '\r\nkwargs:%s'% str(kwargs)
            
        
    
    def __str__(self):        
        return self.message
    
class ExternalAPIError(Exception):
    """An exception that will turn into an HTTP error response."""
    def __init__(self, url):
        self.message = "External API Error: %s" % url

    def __str__(self):        
        return self.message
    
class InvalidSessionId(Exception):
    """An exception that will turn into an HTTP error response."""
    def __init__(self):
        self.message = "Invalid SessionId"

    def __str__(self):        
        return self.message
    

class StopOnPurpose(Exception):
    """An exception that will turn into an HTTP error response."""
    def __init__(self, message="stop on purpose"):
        self.message = message

    def __str__(self):
        return self.message
    
class SysUnInit(Exception):
    """系统未开通、初始化"""
    def __init__(self, sysId=None, uapId=None):
        self.message = '系统未开通{"sysId":%s, "uapId":%s}'

    def __str__(self):
        return self.message
    
#class UnknownException(Exception):
#    def __init__(self, identity=None):
#        self.message = '未知错误：%s'%identity
#
#    def __str__(self):
#        return self.message
    
    
class ImportExportException(Exception):
    """An exception that will turn into an HTTP error response."""
    def __init__(self, message):
        self.message = message

    def __str__(self):
        return self.message

if __name__ == '__main__':
    x = {'sdf':'dfg','wer':'vbdf'}
    print 'asdf%s'% str(x)
    
    print '系统未开通{"sysId":%s,"uapId":%s}'% (1,2)

