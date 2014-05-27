'''
Created on 2012-2-15

@author: Administrator
'''
from nira.common.cache.memcachedManager import MemcachedManager

if __name__ == '__main__':
#    print u'\u798f\u5dde\u5e02'
    mm = MemcachedManager()
    mm.conn.flush_all()
    print 'done.'