#encoding=utf-8
'''
Created on 2012-2-8

@author: Administrator
'''
from nira import settings
from redis.client import Redis
import json

class RedisQueue(): 
    def __init__(self):    
        self.redis = Redis(host=settings.REDIS['host'], port=settings.REDIS['port'])
    
    def pop(self, queueName):
        item = self.redis.rpop(queueName)
        try:
            item = json.loads(item)
        except:
            pass
        return item
         
    def push(self, queueName, item):  
        try:
            item = json.dumps(item)
        except:
            pass
        self.redis.lpush(queueName, item)
        
    def isEmpty(self, queueName):
        if self.redis.llen(queueName):
            return False
        else:
            return True
         
        

        
        
        