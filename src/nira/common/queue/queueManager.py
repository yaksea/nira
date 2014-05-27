#encoding=utf-8
'''
Created on 2012-2-8

@author: Administrator
'''
import uuid
from nira.settings import CACHE
from nira.common.cache.memcachedManager import memcachedClient
from nira import settings
import Queue
from redis.client import Redis
from nira.common.queue import redisQueue

queues = {}

class QueueManager(): 
    class Keys():
        #form
        SendEmails = 'SendEmails'
    
    def __init__(self):
        global queues    
        self.queues = queues
    
    def pop(self, queueName):
        if not self.queues.has_key(queueName):
            return None
            
        return self.queues[queueName].get()
         
    def push(self, queueName, item):  
        if not self.queues.has_key(queueName):
            self.queues[queueName] = Queue.Queue()
        self.queues[queueName].put(item)  
  
    def isEmpty(self, queueName):
        if not self.queues.has_key(queueName):
            return True
        return self.queues[queueName].empty()
    
queue = redisQueue.RedisQueue()
#queue = QueueManager()
        

        
        
        