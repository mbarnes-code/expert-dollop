# Phase 2 Implementation Plan: ML Infrastructure and Threat Hunting
## Security AI Layer - HELK Integration

**Status:** Ready to Begin  
**Timeline:** Weeks 5-10 (6 weeks)  
**Approach:** Strangler Fig Pattern with DDD Modular Monolith  
**Framework:** NX Monorepo  
**Dependencies:** Phase 1 libraries (prompt-manager, vector-db-clients/elasticsearch)

---

## Executive Summary

Phase 2 implements the **apps/ai/threat-hunting** service by extracting and integrating HELK's ML capabilities with the shared libraries from Phase 1. This creates a reusable threat hunting AI node that leverages Apache Spark, Jupyter notebooks, and graph analytics while maintaining the monorepo's DDD architecture.

**Key Objectives:**
1. Create `apps/ai/threat-hunting/` service with ML pipeline infrastructure
2. Integrate Apache Spark for distributed ML processing
3. Deploy Jupyter notebooks for security research
4. Implement GraphFrames for threat correlation
5. Connect to shared Elasticsearch via `libs/ai/vector-db-clients`
6. Build REST APIs for threat hunting operations

---

## Week 5-7: HELK Integration Foundation

### 1. Service Architecture Setup

**Target:** `apps/ai/threat-hunting/`  
**Source:** `features/HELK/`  
**Pattern:** Domain-Driven Design with ML Pipeline Architecture

**Service Structure:**
```
apps/ai/threat-hunting/
├── src/
│   ├── app/
│   │   ├── domain/              # DDD Domain Layer
│   │   │   ├── entities/
│   │   │   │   ├── threat-hunt.entity.ts
│   │   │   │   ├── hunting-session.entity.ts
│   │   │   │   ├── detection.entity.ts
│   │   │   │   └── anomaly.entity.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── threat-severity.vo.ts
│   │   │   │   ├── confidence-score.vo.ts
│   │   │   │   ├── hunting-hypothesis.vo.ts
│   │   │   │   └── graph-relationship.vo.ts
│   │   │   └── repositories/
│   │   │       ├── threat-hunt.repository.interface.ts
│   │   │       ├── detection.repository.interface.ts
│   │   │       └── anomaly.repository.interface.ts
│   │   ├── application/         # DDD Application Layer
│   │   │   ├── services/
│   │   │   │   ├── threat-hunting.service.ts
│   │   │   │   ├── anomaly-detection.service.ts
│   │   │   │   ├── graph-analytics.service.ts
│   │   │   │   └── ml-pipeline.service.ts
│   │   │   ├── dtos/
│   │   │   │   ├── create-hunt.dto.ts
│   │   │   │   ├── detection-result.dto.ts
│   │   │   │   ├── anomaly-score.dto.ts
│   │   │   │   └── graph-query.dto.ts
│   │   │   └── use-cases/
│   │   │       ├── execute-hunt.use-case.ts
│   │   │       ├── analyze-anomalies.use-case.ts
│   │   │       ├── correlate-threats.use-case.ts
│   │   │       └── train-ml-model.use-case.ts
│   │   ├── infrastructure/      # DDD Infrastructure Layer
│   │   │   ├── repositories/
│   │   │   │   ├── threat-hunt.repository.ts
│   │   │   │   └── detection.repository.ts
│   │   │   ├── ml/
│   │   │   │   ├── spark/
│   │   │   │   │   ├── spark-session.config.ts
│   │   │   │   │   ├── ml-pipeline.ts
│   │   │   │   │   └── streaming-analytics.ts
│   │   │   │   ├── jupyter/
│   │   │   │   │   ├── notebook-manager.ts
│   │   │   │   │   └── kernel-client.ts
│   │   │   │   └── graphframes/
│   │   │   │       ├── graph-builder.ts
│   │   │   │       └── pattern-matcher.ts
│   │   │   ├── elasticsearch/
│   │   │   │   ├── threat-data-source.ts
│   │   │   │   └── alert-consumer.ts
│   │   │   └── http/
│   │   │       ├── controllers/
│   │   │       │   ├── hunting.controller.ts
│   │   │       │   ├── detection.controller.ts
│   │   │       │   └── analytics.controller.ts
│   │   │       └── routes/
│   │   │           └── api.routes.ts
│   │   └── shared/
│   │       ├── sigma-rules/     # 30+ pre-built detection rules
│   │       ├── models/          # Trained ML models
│   │       └── utils/
│   ├── assets/
│   │   └── notebooks/           # Jupyter notebooks
│   │       ├── behavioral-analytics.ipynb
│   │       ├── graph-hunting.ipynb
│   │       └── model-training.ipynb
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── main.ts
├── docker/
│   ├── spark/
│   │   ├── Dockerfile
│   │   └── spark-defaults.conf
│   ├── jupyter/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── docker-compose.yml
├── README.md
├── project.json
├── tsconfig.json
└── tsconfig.app.json
```

### 2. Elasticsearch Integration (Week 5)

**Goal:** Connect to shared Elasticsearch cluster using Phase 1 vector-db-clients library

**Tasks:**
- [ ] Configure Elasticsearch connection using `libs/ai/vector-db-clients/elasticsearch`
- [ ] Create threat data source adapters
- [ ] Implement alert consumption pipeline
- [ ] Set up index mappings for threat data
- [ ] Configure data retention policies

**Elasticsearch Indexes:**
```typescript
// Security event indexes from SecurityOnion
- securityonion-alerts-*
- securityonion-logs-*
- securityonion-metrics-*

// Threat hunting indexes (new)
- threat-hunting-sessions-*
- threat-hunting-detections-*
- threat-hunting-anomalies-*
- threat-hunting-models-*
```

**Implementation:**
```typescript
// apps/ai/threat-hunting/src/app/infrastructure/elasticsearch/threat-data-source.ts

import { ElasticsearchService, IndexName, QueryDSL } from '@expert-dollop/ai/vector-db-clients/elasticsearch';

export class ThreatDataSource {
  constructor(private readonly esService: ElasticsearchService) {}

  async querySecurityEvents(query: ThreatQuery): Promise<SecurityEvent[]> {
    const indexName = IndexName.create('securityonion-alerts-*');
    const queryDSL = QueryDSL.matchAll(); // Or build complex query
    
    const results = await this.esService.search({
      index: indexName.getValue(),
      query: queryDSL.toJSON(),
      size: query.limit,
      from: query.offset
    });
    
    return results.hits.map(hit => this.mapToSecurityEvent(hit));
  }
  
  async storeDetection(detection: Detection): Promise<void> {
    const indexName = IndexName.create('threat-hunting-detections-current');
    
    await this.esService.indexDocument({
      index: indexName.getValue(),
      document: {
        id: detection.id,
        timestamp: detection.timestamp,
        severity: detection.severity,
        confidence: detection.confidence,
        hypothesis: detection.hypothesis,
        evidence: detection.evidence
      }
    });
  }
}
```

**Acceptance Criteria:**
- ✅ Successfully connects to Elasticsearch cluster
- ✅ Uses Phase 1 vector-db-clients library (no direct @elastic/elasticsearch imports)
- ✅ Implements circuit breaker and retry patterns
- ✅ Handles errors gracefully
- ✅ Includes comprehensive logging
- ✅ All Elasticsearch operations use IndexName and QueryDSL value objects

### 3. Apache Spark Integration (Week 6)

**Goal:** Set up Apache Spark for distributed ML processing

**Components:**
1. **Spark Session Configuration**
2. **ML Pipeline Infrastructure**
3. **Structured Streaming**
4. **Model Training & Deployment**

**Spark Configuration:**
```typescript
// apps/ai/threat-hunting/src/app/infrastructure/ml/spark/spark-session.config.ts

export interface SparkConfig {
  master: string;           // spark://spark-master:7077
  appName: string;          // threat-hunting-ml
  executorMemory: string;   // 4g
  executorCores: number;    // 2
  driverMemory: string;     // 2g
}

export class SparkSessionManager {
  private static instance: SparkSessionManager;
  private sparkSession: any; // Will use @apache/spark-node or REST API

  async initialize(config: SparkConfig): Promise<void> {
    // Initialize Spark session with ML libraries
    // Configure GraphFrames extension
    // Set up streaming context
  }

  async submitMLJob(job: MLJob): Promise<JobResult> {
    // Submit ML pipeline job to Spark cluster
  }

  async createStreamingQuery(query: StreamingQuery): Promise<void> {
    // Create real-time streaming analytics
  }
}
```

**ML Pipeline Types:**
```typescript
export enum MLPipelineType {
  BEHAVIORAL_ANOMALY = 'behavioral_anomaly',
  GRAPH_ANALYSIS = 'graph_analysis',
  SEQUENCE_PREDICTION = 'sequence_prediction',
  CLUSTERING = 'clustering',
  CLASSIFICATION = 'classification'
}

export interface MLPipeline {
  id: string;
  type: MLPipelineType;
  stages: PipelineStage[];
  model: TrainedModel | null;
  metrics: ModelMetrics;
}

export interface PipelineStage {
  name: string;
  type: 'transformer' | 'estimator';
  params: Record<string, any>;
}
```

**Behavioral Anomaly Detection:**
```typescript
// apps/ai/threat-hunting/src/app/infrastructure/ml/spark/ml-pipeline.ts

export class BehavioralAnomalyDetector {
  async trainModel(trainingData: SecurityEvent[]): Promise<TrainedModel> {
    // 1. Feature extraction
    const features = this.extractFeatures(trainingData);
    
    // 2. Create pipeline: Scaler -> IsolationForest
    const pipeline = new MLPipeline({
      stages: [
        { name: 'scaler', type: 'transformer', params: { method: 'standard' } },
        { name: 'detector', type: 'estimator', params: { contamination: 0.1 } }
      ]
    });
    
    // 3. Train on Spark
    const model = await this.sparkSession.train(pipeline, features);
    
    // 4. Evaluate model
    const metrics = await this.evaluate(model, testData);
    
    return model;
  }
  
  async detectAnomalies(events: SecurityEvent[]): Promise<Anomaly[]> {
    const features = this.extractFeatures(events);
    const predictions = await this.model.predict(features);
    
    return predictions
      .filter(p => p.isAnomaly)
      .map(p => this.createAnomaly(p, events[p.index]));
  }
}
```

**Acceptance Criteria:**
- ✅ Spark cluster deployed and accessible
- ✅ ML pipelines execute successfully
- ✅ Behavioral anomaly detection working
- ✅ Model training and persistence implemented
- ✅ Real-time streaming analytics operational
- ✅ Performance metrics tracked

### 4. GraphFrames Integration (Week 7)

**Goal:** Implement graph analytics for threat correlation and APT hunting

**Graph Model:**
```typescript
// apps/ai/threat-hunting/src/app/infrastructure/ml/graphframes/graph-builder.ts

export interface ThreatGraphNode {
  id: string;
  type: 'host' | 'user' | 'process' | 'file' | 'network' | 'alert';
  properties: Record<string, any>;
  risk_score: number;
}

export interface ThreatGraphEdge {
  src: string;  // source node id
  dst: string;  // destination node id
  relationship: string; // 'executed', 'accessed', 'communicated', etc.
  timestamp: Date;
  properties: Record<string, any>;
}

export class ThreatGraphBuilder {
  async buildGraph(events: SecurityEvent[]): Promise<ThreatGraph> {
    const nodes: ThreatGraphNode[] = [];
    const edges: ThreatGraphEdge[] = [];
    
    // Extract entities and relationships from security events
    for (const event of events) {
      const entities = this.extractEntities(event);
      const relationships = this.extractRelationships(event);
      
      nodes.push(...entities);
      edges.push(...relationships);
    }
    
    // Create GraphFrame
    return new ThreatGraph(nodes, edges);
  }
  
  async findAPTPatterns(graph: ThreatGraph): Promise<APTPattern[]> {
    // Use GraphFrames motif finding
    // Pattern: Reconnaissance -> Initial Access -> Execution -> Persistence
    const motif = "(recon)-[r1]->(access)-[r2]->(exec)-[r3]->(persist)";
    
    const patterns = await graph.find(motif);
    return patterns.map(p => this.analyzePattern(p));
  }
}
```

**Graph Analytics Use Cases:**
1. **Lateral Movement Detection**
```typescript
async detectLateralMovement(graph: ThreatGraph): Promise<LateralMovement[]> {
  // Find paths where a user accesses multiple hosts in short time
  const query = `
    MATCH (u:user)-[a:accessed]->(h1:host),
          (u)-[b:accessed]->(h2:host)
    WHERE h1 <> h2 AND b.timestamp - a.timestamp < 300
    RETURN u, h1, h2, a, b
  `;
  
  return await graph.query(query);
}
```

2. **Privilege Escalation Chains**
```typescript
async findPrivilegeEscalation(graph: ThreatGraph): Promise<EscalationChain[]> {
  // Find sequences of actions leading to admin access
  return await graph.findPathsBetween({
    startLabel: 'user',
    startFilter: { privilege: 'low' },
    endLabel: 'user',
    endFilter: { privilege: 'admin' },
    maxHops: 5
  });
}
```

3. **Data Exfiltration Paths**
```typescript
async findExfiltrationPaths(graph: ThreatGraph): Promise<ExfiltrationPath[]> {
  // Trace data from sensitive sources to external network
  const sensitiveSources = await graph.nodes({ label: 'file', properties: { classification: 'confidential' }});
  const externalDests = await graph.nodes({ label: 'network', properties: { zone: 'external' }});
  
  const paths = [];
  for (const source of sensitiveSources) {
    for (const dest of externalDests) {
      const path = await graph.shortestPath(source.id, dest.id);
      if (path) paths.push(path);
    }
  }
  
  return paths;
}
```

**Acceptance Criteria:**
- ✅ GraphFrames integrated with Spark
- ✅ Graph construction from security events
- ✅ Pattern matching algorithms implemented
- ✅ APT hunting queries working
- ✅ Visualization data exported
- ✅ Performance optimized for large graphs

### 5. Jupyter Integration (Week 7)

**Goal:** Deploy Jupyter notebooks for interactive threat hunting and model development

**Notebook Categories:**
1. **Exploratory Data Analysis**
   - Security event exploration
   - Threat intelligence enrichment
   - Attack pattern analysis

2. **Model Development**
   - Custom ML model training
   - Feature engineering
   - Model evaluation

3. **Threat Hunting Playbooks**
   - Guided hunting workflows
   - Hypothesis testing
   - Evidence collection

**Notebook Manager:**
```typescript
// apps/ai/threat-hunting/src/app/infrastructure/ml/jupyter/notebook-manager.ts

export class JupyterNotebookManager {
  private readonly jupyterClient: JupyterClient;
  
  async listNotebooks(): Promise<Notebook[]> {
    return await this.jupyterClient.listNotebooks();
  }
  
  async executeNotebook(
    notebookId: string,
    params: Record<string, any>
  ): Promise<NotebookResult> {
    // Parameterized notebook execution
    const kernel = await this.jupyterClient.startKernel('python3');
    const result = await kernel.execute(notebookId, params);
    await kernel.shutdown();
    
    return result;
  }
  
  async scheduleNotebook(
    notebookId: string,
    schedule: CronSchedule
  ): Promise<ScheduledJob> {
    // Schedule periodic execution (e.g., daily threat reports)
    return await this.scheduler.schedule({
      notebookId,
      cron: schedule,
      params: {}
    });
  }
}
```

**Pre-built Notebooks:**
```
assets/notebooks/
├── behavioral-analytics.ipynb     # User behavior anomalies
├── graph-hunting.ipynb            # APT pattern hunting
├── model-training.ipynb           # ML model development
├── threat-intel-enrichment.ipynb  # IOC correlation
├── sigma-rule-testing.ipynb       # Detection rule validation
└── incident-investigation.ipynb   # Post-breach analysis
```

**Acceptance Criteria:**
- ✅ Jupyter server deployed
- ✅ Pre-built notebooks created
- ✅ Notebook execution API working
- ✅ Parameterized execution supported
- ✅ Results stored in Elasticsearch
- ✅ Scheduling infrastructure in place

---

## Week 8-10: ML Pipelines and API Development

### 6. Application Services (Week 8)

**Goal:** Implement application layer services for threat hunting operations

**Core Services:**

**1. Threat Hunting Service**
```typescript
// apps/ai/threat-hunting/src/app/application/services/threat-hunting.service.ts

export class ThreatHuntingService {
  constructor(
    private readonly huntRepository: IThreatHuntRepository,
    private readonly esService: ElasticsearchService,
    private readonly mlPipeline: MLPipelineService,
    private readonly graphAnalytics: GraphAnalyticsService
  ) {}
  
  async createHunt(dto: CreateHuntDto): Promise<ThreatHunt> {
    // 1. Validate hypothesis
    const hypothesis = HuntingHypothesis.create(dto.hypothesis);
    
    // 2. Create hunting session
    const hunt = ThreatHunt.create({
      hypothesis,
      timeRange: dto.timeRange,
      targetEntities: dto.entities,
      severity: ThreatSeverity.create(dto.severity)
    });
    
    // 3. Execute initial query
    const events = await this.esService.search({
      index: 'securityonion-alerts-*',
      query: this.buildQuery(hunt),
      timeRange: dto.timeRange
    });
    
    // 4. Apply ML analysis
    const anomalies = await this.mlPipeline.detectAnomalies(events);
    
    // 5. Build threat graph
    const graph = await this.graphAnalytics.buildGraph(events);
    const patterns = await this.graphAnalytics.findPatterns(graph);
    
    // 6. Generate detections
    hunt.addDetections(anomalies, patterns);
    
    // 7. Persist session
    await this.huntRepository.save(hunt);
    
    return hunt;
  }
  
  async continueHunt(huntId: string, refinement: HuntRefinement): Promise<ThreatHunt> {
    const hunt = await this.huntRepository.findById(huntId);
    
    // Interactive hunting - refine based on findings
    hunt.refineHypothesis(refinement);
    const newEvents = await this.queryWithRefinement(hunt, refinement);
    const newDetections = await this.analyze(newEvents);
    
    hunt.addDetections(newDetections);
    await this.huntRepository.save(hunt);
    
    return hunt;
  }
}
```

**2. Anomaly Detection Service**
```typescript
export class AnomalyDetectionService {
  async detectBehavioralAnomalies(
    dto: DetectAnomaliesDto
  ): Promise<Anomaly[]> {
    // 1. Fetch security events
    const events = await this.fetchEvents(dto.timeRange, dto.entityType);
    
    // 2. Extract features
    const features = this.featureExtractor.extract(events);
    
    // 3. Load or train model
    const model = await this.getModel('behavioral_anomaly_v1');
    
    // 4. Predict anomalies
    const predictions = await model.predict(features);
    
    // 5. Score and rank
    const anomalies = predictions
      .filter(p => p.score > dto.threshold)
      .map(p => Anomaly.create({
        event: events[p.index],
        score: ConfidenceScore.create(p.score),
        reason: p.explanation,
        severity: this.calculateSeverity(p.score)
      }));
    
    return anomalies;
  }
}
```

**3. Graph Analytics Service**
```typescript
export class GraphAnalyticsService {
  async correlateThreat(dto: CorrelateThreatsDto): Promise<ThreatCorrelation> {
    // 1. Build graph from time window
    const events = await this.esService.search(dto.query);
    const graph = await this.graphBuilder.buildGraph(events);
    
    // 2. Find patterns
    const aptPatterns = await this.findAPTPatterns(graph);
    const lateralMovement = await this.detectLateralMovement(graph);
    const privilegeEscalation = await this.findPrivilegeEscalation(graph);
    
    // 3. Calculate risk scores
    const riskScores = this.calculateRiskScores(graph, {
      apt: aptPatterns,
      lateral: lateralMovement,
      escalation: privilegeEscalation
    });
    
    // 4. Return correlation
    return ThreatCorrelation.create({
      graph,
      patterns: [...aptPatterns, ...lateralMovement, ...privilegeEscalation],
      riskScores,
      recommendations: this.generateRecommendations(riskScores)
    });
  }
}
```

**Acceptance Criteria:**
- ✅ All service methods implemented
- ✅ DTO validation in place
- ✅ Domain entities properly used
- ✅ Error handling comprehensive
- ✅ Logging integrated
- ✅ Unit tests written

### 7. REST API Development (Week 9)

**Goal:** Create REST APIs for threat hunting operations

**API Endpoints:**

```typescript
// apps/ai/threat-hunting/src/app/infrastructure/http/controllers/hunting.controller.ts

@Controller('/api/threat-hunting')
export class HuntingController {
  constructor(private readonly huntingService: ThreatHuntingService) {}
  
  @Post('/hunts')
  async createHunt(@Body() dto: CreateHuntDto): Promise<ThreatHuntResponse> {
    const hunt = await this.huntingService.createHunt(dto);
    return ThreatHuntResponse.fromEntity(hunt);
  }
  
  @Get('/hunts/:id')
  async getHunt(@Param('id') id: string): Promise<ThreatHuntResponse> {
    const hunt = await this.huntingService.getHunt(id);
    return ThreatHuntResponse.fromEntity(hunt);
  }
  
  @Post('/hunts/:id/continue')
  async continueHunt(
    @Param('id') id: string,
    @Body() refinement: HuntRefinementDto
  ): Promise<ThreatHuntResponse> {
    const hunt = await this.huntingService.continueHunt(id, refinement);
    return ThreatHuntResponse.fromEntity(hunt);
  }
  
  @Get('/hunts')
  async listHunts(@Query() query: ListHuntsQuery): Promise<PaginatedResponse<ThreatHuntResponse>> {
    const hunts = await this.huntingService.listHunts(query);
    return PaginatedResponse.create(hunts);
  }
}

@Controller('/api/detection')
export class DetectionController {
  @Post('/anomalies/detect')
  async detectAnomalies(@Body() dto: DetectAnomaliesDto): Promise<Anomaly[]> {
    return await this.anomalyService.detectBehavioralAnomalies(dto);
  }
  
  @Post('/graph/correlate')
  async correlateTh reats(@Body() dto: CorrelateThreatsDto): Promise<ThreatCorrelation> {
    return await this.graphService.correlateThreat(dto);
  }
  
  @Get('/detections')
  async listDetections(@Query() query: ListDetectionsQuery): Promise<Detection[]> {
    return await this.detectionService.list(query);
  }
}

@Controller('/api/analytics')
export class AnalyticsController {
  @Post('/notebooks/:id/execute')
  async executeNotebook(
    @Param('id') id: string,
    @Body() params: Record<string, any>
  ): Promise<NotebookResult> {
    return await this.notebookManager.executeNotebook(id, params);
  }
  
  @Get('/models')
  async listModels(): Promise<MLModel[]> {
    return await this.mlPipeline.listModels();
  }
  
  @Post('/models/:id/train')
  async trainModel(
    @Param('id') id: string,
    @Body() trainingConfig: TrainingConfig
  ): Promise<TrainingJob> {
    return await this.mlPipeline.trainModel(id, trainingConfig);
  }
}
```

**API Documentation:**
- OpenAPI/Swagger spec
- Request/response examples
- Authentication/authorization
- Rate limiting
- Error codes

**Acceptance Criteria:**
- ✅ All endpoints implemented
- ✅ OpenAPI documentation complete
- ✅ Authentication integrated
- ✅ Input validation working
- ✅ Error handling standardized
- ✅ Integration tests passing

### 8. Real-time Streaming Analytics (Week 10)

**Goal:** Implement real-time threat detection using Spark Structured Streaming

**Streaming Pipeline:**
```typescript
// apps/ai/threat-hunting/src/app/infrastructure/ml/spark/streaming-analytics.ts

export class StreamingAnalytics {
  async startRealtimeDetection(): Promise<StreamingQuery> {
    // 1. Create streaming source from Elasticsearch
    const stream = this.sparkSession.readStream()
      .format('elasticsearch')
      .option('es.nodes', config.elasticsearch.nodes)
      .option('es.index.read.metadata', 'true')
      .load('securityonion-alerts-*');
    
    // 2. Apply ML model for real-time scoring
    const predictions = stream
      .select('*')
      .transform(event => this.featureExtractor.extract(event))
      .transform(features => this.model.predict(features));
    
    // 3. Filter high-risk detections
    const alerts = predictions
      .filter(p => p.anomaly_score > 0.8)
      .select('*', lit(current_timestamp()).as('detected_at'));
    
    // 4. Write to detections index
    const query = alerts.writeStream()
      .format('elasticsearch')
      .option('checkpointLocation', '/tmp/checkpoint')
      .option('es.index.auto.create', 'true')
      .start('threat-hunting-detections-realtime');
    
    return query;
  }
  
  async startGraphStreamProcessing(): Promise<StreamingQuery> {
    // Real-time graph updates for continuous pattern matching
    const stream = this.sparkSession.readStream()
      .format('elasticsearch')
      .load('securityonion-alerts-*');
    
    const graphUpdates = stream
      .groupBy(window('timestamp', '5 minutes'))
      .apply(events => this.buildIncrementalGraph(events))
      .apply(graph => this.findPatterns(graph));
    
    return graphUpdates.writeStream()
      .foreachBatch((batch, epoch) => this.processGraphBatch(batch, epoch))
      .start();
  }
}
```

**Acceptance Criteria:**
- ✅ Streaming pipeline operational
- ✅ Real-time anomaly detection working
- ✅ Graph updates streaming
- ✅ Checkpoint/recovery implemented
- ✅ Performance acceptable (<5s latency)
- ✅ Monitoring in place

---

## Integration with Phase 1 Libraries

### Using libs/ai/vector-db-clients/elasticsearch

**All Elasticsearch operations must use the Phase 1 library:**

```typescript
import { 
  ElasticsearchService,
  IndexName,
  QueryDSL,
  SearchRequestDto
} from '@expert-dollop/ai/vector-db-clients/elasticsearch';

// ✅ CORRECT - Using Phase 1 library
const indexName = IndexName.create('securityonion-alerts-current');
const query = QueryDSL.bool({
  must: [
    QueryDSL.range('timestamp', { gte: 'now-1h' }),
    QueryDSL.wildcard('alert.signature', '*lateral*movement*')
  ]
});

const results = await esService.search({
  index: indexName.getValue(),
  query: query.toJSON(),
  size: 100
});

// ❌ INCORRECT - Direct import
import { Client } from '@elastic/elasticsearch';  // Don't do this!
```

### Using libs/ai/prompt-manager

**Threat hunting prompts should be versioned:**

```typescript
import { PromptService, PromptType } from '@expert-dollop/ai/prompt-manager';

// Store threat hunting prompts
await promptService.create({
  name: 'behavioral_anomaly_explanation',
  type: PromptType.COMPLETION,
  content: `Explain the following security anomaly:
    Event: {{event}}
    Anomaly Score: {{score}}
    Context: {{context}}
    
    Provide:
    1. Likely attack technique
    2. Potential impact
    3. Recommended actions`,
  projectId: 'threat-hunting',
  isEnabled: true
});
```

---

## Deliverables

### Week 5
- [x] Service architecture designed
- [ ] Elasticsearch integration complete
- [ ] Domain models created
- [ ] Initial tests written

### Week 6
- [ ] Apache Spark deployed
- [ ] ML pipeline infrastructure operational
- [ ] Behavioral anomaly detection working
- [ ] Model training capability in place

### Week 7
- [ ] GraphFrames integrated
- [ ] Graph analytics implemented
- [ ] Jupyter notebooks deployed
- [ ] Pre-built hunting playbooks created

### Week 8
- [ ] Application services complete
- [ ] Use cases implemented
- [ ] Service layer tests passing
- [ ] Documentation updated

### Week 9
- [ ] REST API endpoints implemented
- [ ] OpenAPI documentation complete
- [ ] Authentication/authorization working
- [ ] API tests passing

### Week 10
- [ ] Real-time streaming operational
- [ ] Performance optimized
- [ ] Monitoring dashboards created
- [ ] End-to-end testing complete

---

## Testing Strategy

### Unit Tests
- Domain entities and value objects
- Application services
- ML pipeline components
- Repository implementations

### Integration Tests
- Elasticsearch connectivity
- Spark job execution
- Jupyter notebook execution
- API endpoints

### E2E Tests
- Complete threat hunting workflows
- Model training and deployment
- Real-time detection pipeline
- Graph analytics scenarios

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Query Response Time | <2s | 95th percentile for ES queries |
| ML Inference Latency | <1s | Single event anomaly detection |
| Streaming Latency | <5s | Event → Detection time |
| Graph Construction | <30s | 10K events → graph |
| API Response Time | <500ms | 95th percentile |
| Notebook Execution | <5min | Standard playbook |

---

## Dependencies

### Phase 1 Libraries (Required)
- ✅ `libs/ai/vector-db-clients/elasticsearch` - 90% complete
- ✅ `libs/ai/prompt-manager` - 80% complete

### External Technologies
- Apache Spark 3.5+
- Jupyter Notebook 7.0+
- GraphFrames 0.8+
- Elasticsearch 8.11+ (shared cluster)

### New Dependencies
- `@apache/spark-node` or Spark REST API client
- `@jupyterlab/services` - Jupyter API client
- GraphFrames Spark package
- Sigma rule parser

---

## Risk Mitigation

### Technical Risks
1. **Spark Performance** - Mitigate with proper partitioning and caching
2. **Graph Scalability** - Implement pagination and time-windowing
3. **Streaming Backpressure** - Use checkpointing and rate limiting
4. **ML Model Drift** - Implement monitoring and retraining pipelines

### Integration Risks
1. **Elasticsearch Compatibility** - Use Phase 1 library abstractions
2. **SecurityOnion Data Format** - Create robust adapters
3. **Version Conflicts** - Pin dependency versions

---

## Next Steps After Phase 2

### Phase 3: Pattern Matching AI (YARA-X Integration)
- LLM-based YARA rule generation
- Pattern optimization
- Integration with threat-hunting service

### Phase 4: Cross-Service Integration
- Connect Dispatch incidents
- SecurityOnion alert ingestion
- Automated response workflows

---

## Documentation Requirements

- [ ] Architecture diagrams
- [ ] API documentation (OpenAPI)
- [ ] ML model documentation
- [ ] Jupyter notebook guides
- [ ] Deployment guide
- [ ] Operations runbook
- [ ] Security considerations
- [ ] Performance tuning guide

---

## Success Criteria

Phase 2 is complete when:
- ✅ All deliverables checked off
- ✅ All tests passing (>80% coverage)
- ✅ Performance targets met
- ✅ Documentation complete
- ✅ Security review passed
- ✅ Successfully hunts threats in test environment
- ✅ Ready for Phase 3 integration
