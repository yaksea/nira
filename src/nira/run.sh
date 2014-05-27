ps -ef|grep main_product|grep 8081|grep -v grep|cut -c 9-15|xargs kill -9
ps -ef|grep main_product|grep 8082|grep -v grep|cut -c 9-15|xargs kill -9
ps -ef|grep main_product|grep 8083|grep -v grep|cut -c 9-15|xargs kill -9
ps -ef|grep main_product|grep 8084|grep -v grep|cut -c 9-15|xargs kill -9
ps -ef|grep main_product|grep 8085|grep -v grep|cut -c 9-15|xargs kill -9
ps -ef|grep main_product|grep 8086|grep -v grep|cut -c 9-15|xargs kill -9
ps -ef|grep main_product|grep 8087|grep -v grep|cut -c 9-15|xargs kill -9
ps -ef|grep main_product|grep 8088|grep -v grep|cut -c 9-15|xargs kill -9

svn update


nohup python main_product.py -port=8081>/data/wwwroot/nira/static/log/access.txt 2>&1 & 
nohup python main_product.py -port=8082>/data/wwwroot/nira/static/log/access.txt 2>&1 &  
nohup python main_product.py -port=8083>/data/wwwroot/nira/static/log/access.txt 2>&1 & 
nohup python main_product.py -port=8084>/data/wwwroot/nira/static/log/access.txt 2>&1 & 
nohup python main_product.py -port=8085>/data/wwwroot/nira/static/log/access.txt 2>&1 & 
nohup python main_product.py -port=8086>/data/wwwroot/nira/static/log/access.txt 2>&1 & 
nohup python main_product.py -port=8087>/data/wwwroot/nira/static/log/access.txt 2>&1 & 
nohup python main_product.py -port=8088>/data/wwwroot/nira/static/log/access.txt 2>&1 & 
