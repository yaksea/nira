'''
Created on 2012-2-8

@author: Administrator
'''
import os,sys

VERSION = {
           'web': '1.2.3',
           'android': {'version':'1.2.3', 'url':'http://nira.91.com/static/phone/91nira_android_V1_2_3_278781_2.apk'},
           'iphone': {'version':'1.2.300', 'url':'http://nira.91.com/static/phone/91nira(iPhone)v1.2.300.Beta.278521.ipa'},
           }


ENVIRONMENT = {
               'production' : False,
               'test' : True,
               'dev' : False               
               }


APP = {
            'host': 'http://dev.nira.91.com',
            'modules' : ('project', )
       }

EMAIL = {
#            'host': 'smtp.gmail.com:465',
            'host': 'smtp.gmail.com:587',
#            'host': 'smtp.gmail.com:25',
            'user' : 'yaksea@gmail.com',
            'password':'weirh123456'
       }



SESSION = {  
    'cookie_name': 'session_id',
    'cookie_domain': None,
    'cookie_expires': 86400, #24 * 60 * 60, # 24 hours in seconds  
    'ignore_expiry': True,
    'ignore_change_ip': True,
    'expired_message': 'Session expired',
    'httponly': True  
}

CACHE = {
                  'unit_expires': 0,
                  'session_expires': 20 * 60, #20 minutes
#                  '_expires': 20 * 60, #20 minutes
                  'clients' : ['127.0.0.1:11211'],
                  }

REDIS = {
         'host': '127.0.0.1',
         'port':6379
         }


PATH = {
        'root' : os.path.dirname(__file__),
        'upload' : os.path.join(os.path.dirname(__file__), "static/upload").replace('\\', '/'),
        'handlers' : os.path.join(os.path.dirname(__file__), "handlers").replace('\\', '/'),
        'log_path': os.path.join(os.path.dirname(__file__), "static/log").replace('\\', '/'),
        }


DB = {
        'host' : '203.195.205.213',
        'port': 27017,
        'db_name' : 'nira',
        'user_name' : 'alex',
        'passwords' : 'alkdjiueaj'
      }

TND = {
    'template_path': os.path.join(os.path.dirname(__file__), 'templates'),
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
    "cookie_secret": "61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo="

}

  
