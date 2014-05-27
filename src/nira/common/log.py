'''
Created on 2012-10-31

@author: Administrator
'''
import sys
import traceback
from nira import settings
import os
from nira.common import utility
import time


def out(message):
    print message
    sys.stdout.flush()


error_log_file = file(os.path.join(settings.PATH['log_path'], 'error_log.txt'), 'a')

def error():
    traceback.print_exc()
    if not settings.ENVIRONMENT['dev']:
        error_log_file.write('\r\n\r\n=====%s=========================================\r\n\r\n'%utility.getFormattedTime(time.time()))
        traceback.print_exc(file=error_log_file)
        error_log_file.flush()


def ut_error():
    try:
        x = 1/0
    except:
        error()




if __name__ == '__main__':
    ut_error()




