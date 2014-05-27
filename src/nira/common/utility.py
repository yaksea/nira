#encoding=utf-8
'''
Created on 2012-2-9

@author: Administrator
'''
import socket
import time
import traceback
import os
import string
import urlparse
import re
import json
import datetime
import inspect

#方法一
def getLocalIP():
    localIP = socket.gethostbyname(socket.gethostname())#得到本地ip
    print "local ip:%s " % localIP
     
    ipList = socket.gethostbyname_ex(socket.gethostname())
    for i in ipList:
        if i != localIP:
            print "external IP:%s" % i
           
    #方法二
    myname = socket.getfqdn(socket.gethostname())
    print socket.gethostbyname(myname)

#上面的方法在Linux下也可以使用，除此之外，Linux下还可以用下面的方法得到本机IP地址。
#
#Uses the Linux SIOCGIFADDR ioctl to find the IP address associated with a network interface, given the name of that interface, e.g. “eth0”. The address is returned as a string containing a dotted quad.

#import fcntl
#import struct
# 
#def get_ip_address(ifname):
#    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
#    return socket.inet_ntoa(fcntl.ioctl(
#        s.fileno(),
#        0x8915,  # SIOCGIFADDR
#        struct.pack('256s', ifname[:15])
#    )[20:24])

def subDict(somedict, somekeys, default=None):
    return dict([ (k, somedict.get(k, default)) for k in somekeys ])

#def sub_dict_remove(somedict, somekeys, default=None):
#    return dict([ (k, somedict.pop(k, default)) for k in somekeys ])


DATETIME_FORMAT = ('%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M', '%Y-%m-%d', '%m-%d')

#unix时间戳->时间字符串
def getFormattedTime(floatTime, type=0):  #type:0：时间(精确到秒), 1：时间(精确到分), 2: 日期， 3:月-日
    return time.strftime(DATETIME_FORMAT[type], time.localtime(floatTime))

#日期字符串->unix时间戳  
def getTimeFromStr(dateStr, type=0):   #type:0：时间(精确到秒), 1：时间(精确到分), 2: 日期，
    d = datetime.datetime.strptime(dateStr, DATETIME_FORMAT[type])
    return time.mktime(d.timetuple())


def getDateCode():
    return time.strftime('%Y%m%d', time.localtime(time.time()))

def getMinuteCode():
    return time.strftime('%Y%m%d%H%M', time.localtime(time.time()))

def getSecondCode():
    return time.strftime('%Y%m%d%H%M%S', time.localtime(time.time()))

def addDays(baseDatetime, days):
    #return timestamp
    if type(baseDatetime) in (int, float):
        baseDatetime = datetime.date.fromtimestamp(baseDatetime)
    return time.mktime((baseDatetime+datetime.timedelta(days=days)).timetuple())


def unionListKeepOrder(list1, list2):
    #有序合集，保持list1的顺序
    list1.extend(set(list2)-set(list1))
    return list1

import uuid

def getVersion():
    return int(time.time() * 1000)

def getUUID():
    return str(uuid.uuid1()).replace('-', '');

def tryParse(value, type, defaultValue=None):
    try:
        return type(value)
    except:
        return defaultValue

def parseUrlParams(url):
    result = urlparse.urlparse(url) 
    params = urlparse.parse_qs(result.query)
    for k, v in params.items():
        if len(v) == 1:
            params[k] = v[0]
    return params

comment_re = re.compile(
    '(^)?[^\S\n]*/(?:\*(.*?)\*/[^\S\n]*|/[^\n]*)($)?',
    re.DOTALL | re.MULTILINE
)

def parse_json(filename):
    """ Parse a JSON file
        First remove comments and then use the json module package
        Comments look like :
            // ...
        or
            /*
            ...
            */
    """
    with open(filename) as f:
        content = ''.join(f.readlines())

        ## Looking for comments
        match = comment_re.search(content)
        while match:
            # single line comment
            content = content[:match.start()] + content[match.end():]
            match = comment_re.search(content)
        


        # Return json file
        return json.loads(content)

#transTable = string.maketrans('','')
#
#def stringPickout(str1, str2):
#    return str1.translate(transTable, str2)

not_letters_or_digits = u'!"#$%^&\'()*+,./:;<=>?@[\]^`{|}~'
translate_table = dict((ord(char), u'') for char in not_letters_or_digits)

def pickout_non_alphanumerics(rawStr):
    return rawStr.translate(translate_table)

def parseVersion(versionStr):     
    if versionStr.find('.')>0:
        verArr = versionStr.split('.')
        verTemp = verArr[0]
        for ver in verArr[1:]:
            verTemp += '%04d' % int(ver)
    else:
        verTemp = versionStr
    try:
        return int(verTemp)
    except:
        traceback.print_exc()
        return 0

def versionCompare(version1, version2): #-1:小于 0：相等 1：大于
    version1 = parseVersion(version1)
    version2 = parseVersion(version2)
    if version1>version2:
        return 1
    elif version1<version2:
        return -1
    else:
        return 0

def urlJoin(url1, url2):
    return url1.strip('/') +'/'+ url2.strip('/')
    

def getObjFromFile(path):
    #nira 根路径起始 , "data/demo/anniversary.json"
    return parse_json('%s/../%s'%(os.path.dirname(__file__), path))
#    jsonStr = f.read()
#    return json.loads(jsonStr)    
    

class EmptyClass(object):    
    def __str__(self):
        return str(self.toJson())
    
    def toJson(self):
        s = {}
        for p in dir(self):
            if not p.startswith('_') and not inspect.ismethod(getattr(self, p)):
                s[p] = getattr(self, p)
        return s





if __name__ == '__main__':
#    print getObjFromFile("data/demo/anniversary.json")
#    dd = {'a':1,'b':2,'c':3}
#    cc = subDict(dd,('a','b','x'))
#    print -cc['a']
#    s = u'\u2006'
#    s = s.encode('gbk','ignore')
#    print len(s)
##    ds = list('fdgerwtwert')
#    ds1 = list('cvbdfsgdfsg')
#    print unionListKeepOrder(ds, ds1)
#    url1 = "http://192.168.94.19/uaps"
#    url2 = "/bbs/"
#    print urlJoin(url1, url2) 
#    print u'\u5f20\u51e1'   
#    
    print getFormattedTime(1357627402)
#    print getFormattedTime(1362036446)

#    cc = ['sadf', 'weqr']
#    for c in cc:
#        c.replace('ad', 'xx')
#    print cc
#    cc = {'sadf':'wedqr', 'weqr':3}
#
#    print set(cc)
    
#    print urlJoin()
#    print versionCompare('1.3.0', '1.2.4')

#    print datetime.date(1997, 03, 31)
#    tempPath = 'D:/Work/tnd_nira/src/nira/schedule/../static/vv'
#    os.rmdir(tempPath)  
#    print datetime.date.today().timetuple()
#    print u'\u60a8\u7684\u5ba2\u6237\u6709\u53d8\u52a8'
#    url="/test.py?a=hello&b=world "  
#    result=parseUrlParams(url)
#    print result
    
#    print tryParse('123e', float)
#    print int('001')
#    print getDateCode()
    pass
