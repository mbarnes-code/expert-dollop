# HELK Jupyter Configuration

c.ServerApp.ip = '0.0.0.0'
c.ServerApp.port = 8888
c.ServerApp.allow_origin = '*'
c.ServerApp.token = ''
c.ServerApp.password = ''
c.ServerApp.notebook_dir = '/opt/helk/notebooks'
c.ServerApp.allow_root = True

# Spark integration
import os
os.environ['PYSPARK_SUBMIT_ARGS'] = '--packages org.elasticsearch:elasticsearch-spark-30_2.12:8.0.0,graphframes:graphframes:0.8.2-spark3.2-s_2.12 --repositories https://repos.spark-packages.org pyspark-shell'
