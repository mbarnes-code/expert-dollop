/**
 * Jupyter and Spark Configuration Service
 * Manages Jupyter notebooks and Spark integration for advanced analytics
 */

import { JupyterConfig, SparkConfig, NotebookMetadata } from '../domain/jupyter-config.interface';

export abstract class JupyterConfigService {
  abstract getJupyterConfig(): JupyterConfig;
  abstract getSparkConfig(): SparkConfig;
  abstract getNotebooks(): NotebookMetadata[];
}

export class JupyterConfigServiceImpl extends JupyterConfigService {
  getJupyterConfig(): JupyterConfig {
    return {
      ip: '0.0.0.0',
      port: 8888,
      allow_origin: '*',
      notebook_dir: '/opt/helk/notebooks',
      ServerApp: {
        token: '',
        password: '',
        allow_origin: '*',
      },
    };
  }

  getSparkConfig(): SparkConfig {
    return {
      master: 'spark://helk-spark-master:7077',
      app_name: 'HELK',
      executor: {
        memory: '4g',
        cores: 4,
      },
      driver: {
        memory: '6g',
        maxResultSize: '4g',
      },
      jars: {
        packages: [
          'org.elasticsearch:elasticsearch-spark-30_2.12:8.0.0',
          'graphframes:graphframes:0.8.2-spark3.2-s_2.12',
        ],
        repositories: [
          'https://repos.spark-packages.org',
        ],
      },
    };
  }

  getNotebooks(): NotebookMetadata[] {
    return [
      // Tutorial notebooks
      {
        name: 'intro-to-python',
        path: 'resources/jupyter/tutorials/01-intro-to-python.ipynb',
        category: 'tutorial',
        description: 'Introduction to Python for security analysis',
      },
      {
        name: 'intro-to-numpy-arrays',
        path: 'resources/jupyter/tutorials/02-intro-to-numpy-arrays.ipynb',
        category: 'tutorial',
        description: 'NumPy arrays for data manipulation',
      },
      {
        name: 'intro-to-pandas',
        path: 'resources/jupyter/tutorials/03-intro-to-pandas.ipynb',
        category: 'tutorial',
        description: 'Pandas for data analysis',
      },
      {
        name: 'intro-pyspark-sparkSQL',
        path: 'resources/jupyter/tutorials/04-Intro_pyspark_sparkSQL.ipynb',
        category: 'tutorial',
        description: 'PySpark and Spark SQL basics',
        requires: ['apache-spark', 'elasticsearch-spark'],
      },
      {
        name: 'intro-pyspark-sparkSQL-sysmon',
        path: 'resources/jupyter/tutorials/05-Intro_pyspark_sparkSQL_sysmon.ipynb',
        category: 'tutorial',
        description: 'Sysmon data analysis with Spark SQL',
        requires: ['apache-spark', 'elasticsearch-spark'],
      },
      {
        name: 'intro-pyspark-graphframes-sysmon',
        path: 'resources/jupyter/tutorials/06-Intro_pyspark_graphframes_sysmon.ipynb',
        category: 'tutorial',
        description: 'GraphFrames analysis for process relationships',
        requires: ['apache-spark', 'graphframes', 'elasticsearch-spark'],
      },
      {
        name: 'pyspark-sparkSQL-tables',
        path: 'resources/jupyter/tutorials/07-pyspark-sparkSQL_tables.ipynb',
        category: 'tutorial',
        description: 'Working with Spark SQL tables',
        requires: ['apache-spark', 'elasticsearch-spark'],
      },
      // Demo notebooks
      {
        name: 'read-elasticsearch-via-spark',
        path: 'resources/jupyter/demos/read_elasticsearch_via_spark.ipynb',
        category: 'demo',
        description: 'Reading Elasticsearch data using Spark',
        requires: ['apache-spark', 'elasticsearch-spark'],
      },
      // Sigma rule notebooks (examples)
      {
        name: 'win-susp-security-eventlog-cleared',
        path: 'resources/jupyter/sigma/win_susp_security_eventlog_cleared.ipynb',
        category: 'sigma',
        description: 'Detection for security event log clearing',
      },
      {
        name: 'sysmon-wmi-event-subscription',
        path: 'resources/jupyter/sigma/sysmon_wmi_event_subscription.ipynb',
        category: 'sigma',
        description: 'WMI event subscription detection',
      },
      {
        name: 'win-susp-psexec',
        path: 'resources/jupyter/sigma/win_susp_psexec.ipynb',
        category: 'sigma',
        description: 'PSExec usage detection',
      },
    ];
  }
}
