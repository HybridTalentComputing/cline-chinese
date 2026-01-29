---
title: "MCP 市场"
sidebarTitle: "MCP 市场"
description: "通过一键配置从 Cline 市场部署预构建的企业 MCP 服务器"
---

MCP 市场提供经过策划的、企业就绪的集成，包含流行的开发工具和服务。所有市场服务器都考虑了企业安全性、合规性和可扩展性。

## 企业市场优势

<CardGroup cols={2}>
  <Card title="一键部署" icon="rocket">
    使用预配置的企业设置即时部署复杂的集成。
  </Card>
  
  <Card title="安全加固" icon="shield-check">
    所有服务器都包括企业安全功能、审计日志和合规控制。
  </Card>
  
  <Card title="维护和更新" icon="sync">
    由 Cline 企业版团队定期安全更新和功能增强。
  </Card>
  
  <Card title="企业支持" icon="headset">
    为市场集成问题和自定义提供专门的支持渠道。
  </Card>
</CardGroup>

## 可用的集成

### 开发工具

<CardGroup cols={3}>
  <Card title="GitHub 企业版" icon="github">
    仓库管理、问题跟踪、PR 工作流和代码分析
  </Card>
  
  <Card title="GitLab 企业版" icon="gitlab">
    项目管理、CI/CD 管道、合并请求和安全扫描
  </Card>
  
  <Card title="Bitbucket 企业版" icon="bitbucket">  
    源代码管理、构建管道和部署自动化
  </Card>
</CardGroup>

### 项目管理

<CardGroup cols={3}>
  <Card title="Jira 企业版" icon="jira">
    问题跟踪、冲刺管理、自定义字段和工作流自动化
  </Card>
  
  <Card title="Azure DevOps" icon="microsoft">
    工作项、看板、仓库、管道和测试管理
  </Card>
  
  <Card title="Linear" icon="linear">
    问题跟踪、项目规划和开发工作流集成
  </Card>
</CardGroup>

### 通信与协作

<CardGroup cols={3}>
  <Card title="Slack 企业版 Grid" icon="slack">
    通知、机器人交互、文件共享和工作流自动化
  </Card>
  
  <Card title="Microsoft Teams" icon="microsoft-teams">
    聊天通知、会议集成和协作工作流
  </Card>
  
  <Card title="Discord" icon="discord">
    社区管理、机器人交互和开发者通知
  </Card>
</CardGroup>

### 云服务

<CardGroup cols={3}>
  <Card title="AWS 服务" icon="aws">
    EC2、S3、Lambda、RDS、CloudWatch 和其他 AWS 服务集成
  </Card>
  
  <Card title="Google Cloud" icon="google-cloud">
    Compute Engine、Cloud Storage、BigQuery 和 GCP 服务管理
  </Card>
  
  <Card title="Azure 服务" icon="azure">
    虚拟机、存储账户、Functions 和 Azure 资源管理
  </Card>
</CardGroup>

## 安装市场服务器

### 通过 Cline 企业版仪表板

1. **访问市场**：导航到 `设置 > 企业版 > MCP 市场`
2. **浏览集成**：按类别、流行度或名称筛选
3. **查看详细信息**：检查兼容性、权限和配置要求
4. **安装**：点击"安装"并配置所需设置
5. **部署**：批准部署到你选择的环境

### 通过配置文件

通过企业配置安装市场服务器：

```yaml
# enterprise-mcp-config.yaml
mcp:
  marketplace_servers:
    - name: "github-enterprise"
      package: "@cline/mcp-github-enterprise"
      version: "2.1.0"
      environment: "production"
      
      config:
        github:
          base_url: "https://github.company.com/api/v3"
          token: "${GITHUB_ENTERPRISE_TOKEN}"
          organization: "company"
          
        features:
          issue_management: true
          pull_request_automation: true
          code_analysis: true
          security_scanning: true
          
        permissions:
          repositories: "read-write"
          issues: "write"
          pull_requests: "write"
          
        compliance:
          audit_logging: true
          data_retention_days: 365
          encryption_at_rest: true
          
    - name: "jira-enterprise"
      package: "@cline/mcp-jira-enterprise"
      version: "1.8.3"
      environment: "production"
      
      config:
        jira:
          base_url: "https://company.atlassian.net"
          username: "${JIRA_USERNAME}"
          api_token: "${JIRA_API_TOKEN}"
          
        projects:
          - key: "DEV"
            permissions: ["read", "write", "transition"]
          - key: "OPS"
            permissions: ["read", "comment"]
            
        compliance:
          field_encryption: ["description", "comments"]
          audit_trail: true
```

### 通过 CLI

使用 Cline 企业版 CLI 部署：

```bash
# 安装 GitHub 企业版集成
cline-enterprise mcp install github-enterprise \
  --version 2.1.0 \
  --config-file github-config.yaml \
  --environment production

# 安装 Slack 企业版 Grid 集成  
cline-enterprise mcp install slack-enterprise-grid \
  --version 1.5.2 \
  --config workspace_id=T1234567890 \
  --config bot_token=${SLACK_BOT_TOKEN} \
  --environment production

# 列出已安装的市场服务器
cline-enterprise mcp list --environment production

# 检查服务器状态
cline-enterprise mcp status github-enterprise --environment production
```

## 配置示例

### GitHub 企业版集成

```yaml
# github-enterprise-config.yaml
github:
  base_url: "https://github.company.com/api/v3"
  token: "${GITHUB_ENTERPRISE_TOKEN}"
  organization: "company"
  
  # 仓库访问控制
  repositories:
    allowed_patterns:
      - "company/*"
      - "internal/*"
    blocked_patterns:
      - "*/secrets"
      - "*/private-keys"
      
  # 功能配置
  features:
    issue_management:
      enabled: true
      auto_assign: true
      labels:
        - "ai-generated"
        - "cline-task"
        
    pull_requests:
      enabled: true
      auto_review_request: true
      required_approvals: 2
      enforce_branch_protection: true
      
    code_analysis:
      enabled: true
      languages: ["typescript", "python", "go", "rust"]
      security_scan: true
      
  # 安全和合规
  security:
    webhook_secret: "${GITHUB_WEBHOOK_SECRET}"
    rate_limiting:
      requests_per_hour: 5000
      burst_limit: 100
    ip_whitelist:
      - "10.0.0.0/8"
      - "192.168.0.0/16"
      
  audit:
    log_level: "INFO"
    include_payloads: false
    retention_days: 365
    destinations: ["datadog", "splunk"]
```

### Jira 企业版集成

```yaml
# jira-enterprise-config.yaml
jira:
  base_url: "https://company.atlassian.net"
  username: "${JIRA_USERNAME}"
  api_token: "${JIRA_API_TOKEN}"
  
  # 项目访问配置
  projects:
    - key: "DEV"
      name: "Development"
      permissions: ["read", "write", "transition", "assign"]
      issue_types: ["Story", "Bug", "Task", "Subtask"]
      
    - key: "OPS"
      name: "Operations"  
      permissions: ["read", "comment", "watch"]
      
  # 自定义字段映射
  custom_fields:
    story_points: "customfield_10002"
    epic_link: "customfield_10014"
    sprint: "customfield_10020"
    
  # 工作流自动化
  automation:
    auto_transition:
      enabled: true
      rules:
        - from_status: "To Do"
          to_status: "In Progress"
          condition: "assignee_changed"
          
    auto_assign:
      enabled: true
      rules:
        - issue_type: "Bug"
          component: "Frontend"
          assignee: "frontend-team-lead"
          
  # 安全和合规
  security:
    encrypt_fields: ["description", "comment"]
    mask_sensitive_data: true
    audit_changes: true
    
  compliance:
    gdpr_compliant: true
    data_retention_policy: "365_days"
    audit_log_retention: "7_years"
```

### Slack 企业版 Grid 集成

```yaml
# slack-enterprise-config.yaml
slack:
  workspace_id: "T1234567890"
  bot_token: "${SLACK_BOT_TOKEN}"
  signing_secret: "${SLACK_SIGNING_SECRET}"
  
  # 频道管理
  channels:
    notifications:
      - name: "#dev-alerts"
        types: ["deployments", "errors", "security"]
      - name: "#ai-activity"
        types: ["cline-tasks", "completions"]
        
    private_channels:
      - name: "#security-incidents"
        members: ["security-team"]
        types: ["security-alerts", "compliance-issues"]
        
  # 机器人行为
  bot:
    display_name: "Cline Enterprise"
    default_channel: "#general"
    response_delay_ms: 1000
    
    commands:
      - command: "/cline-status"
        description: "Check Cline Enterprise status"
        permission: "all"
        
      - command: "/cline-deploy"
        description: "Trigger deployment"
        permission: "admin"
        
  # 企业版功能
  enterprise:
    app_approval_required: true
    data_residency: "US"
    compliance_export: true
    
    dlp:
      enabled: true
      scan_messages: true
      block_sensitive_data: true
      
  # 安全设置
  security:
    require_app_approval: true
    audit_api_calls: true
    encrypt_messages: true
    retain_audit_logs_days: 2555  # 7 years
```

## 企业管理

### 多环境部署

跨环境部署市场服务器：

```yaml
# environments-config.yaml
environments:
  development:
    marketplace_servers:
      - github-enterprise:
          version: "2.1.0-beta"
          config_override:
            github:
              base_url: "https://github-dev.company.com/api/v3"
              organization: "company-dev"
              
  staging:
    marketplace_servers:
      - github-enterprise:
          version: "2.1.0-rc1"  
          config_override:
            github:
              base_url: "https://github-staging.company.com/api/v3"
              organization: "company-staging"
              
  production:
    marketplace_servers:
      - github-enterprise:
          version: "2.1.0"
          config_override:
            github:
              base_url: "https://github.company.com/api/v3"
              organization: "company"
```

### 版本管理

控制市场服务器版本：

```bash
# 列出可用版本
cline-enterprise mcp versions github-enterprise

# 升级到最新版本
cline-enterprise mcp upgrade github-enterprise --version 2.2.0 --environment staging

# 回滚到以前的版本
cline-enterprise mcp rollback github-enterprise --version 2.1.0 --environment staging

# 固定到特定版本（禁用自动更新）
cline-enterprise mcp pin github-enterprise --version 2.1.0
```

### 健康监控

监控市场服务器健康：

```yaml
# monitoring-config.yaml
monitoring:
  marketplace_servers:
    health_checks:
      interval_seconds: 30
      timeout_seconds: 10
      
    metrics:
      - server_status
      - request_latency
      - error_rate
      - resource_usage
      
    alerts:
      - name: "marketplace-server-down"
        condition: "server_status != 1"
        severity: "critical"
        
      - name: "high-error-rate"
        condition: "error_rate > 0.05"  
        severity: "warning"
        
      - name: "performance-degradation"
        condition: "request_latency > 5s"
        severity: "warning"
```

## 安全与合规

### 企业安全功能

所有市场服务器都包括：

- **身份验证集成**：SSO、SAML、OAuth2 支持
- **授权控制**：RBAC 和细粒度权限
- **审计日志**：全面的活动跟踪
- **数据加密**：静态和传输中的加密
- **网络安全**：VPN、IP 白名单、私有端点
- **合规性**：SOC2、GDPR、HIPAA 合规框架

### 数据治理

配置数据处理策略：

```yaml
# data-governance-config.yaml
data_governance:
  classification:
    public:
      retention_days: 90
      backup_required: false
      
    internal:
      retention_days: 365
      backup_required: true
      encryption_required: false
      
    confidential:
      retention_days: 2555  # 7 years
      backup_required: true
      encryption_required: true
      audit_access: true
      
    restricted:
      retention_days: 2555
      backup_required: true  
      encryption_required: true
      audit_access: true
      approval_required: true
      
  privacy:
    pii_detection: true
    pii_masking: true
    gdpr_compliance: true
    data_subject_requests: true
    
  compliance:
    frameworks: ["SOC2", "GDPR", "CCPA", "HIPAA"]
    audit_frequency: "quarterly"
    certification_renewal: "annual"
```

## 最佳实践

### 安装
1. **审查权限**：安装前始终审查所需权限
2. **在暂存中测试**：首先部署到暂存环境
3. **配置验证**：部署前验证配置文件
4. **备份当前状态**：更改前创建配置备份
5. **监控部署**：在推出期间观察健康指标

### 配置  
1. **环境隔离**：每个环境使用不同的配置
2. **密钥管理**：将敏感数据存储在安全的密钥存储中
3. **版本固定**：为生产部署固定版本
4. **访问控制**：实施最小权限访问策略
5. **定期更新**：安排定期的安全和功能更新

### 监控
1. **健康检查**：持续监控服务器健康
2. **性能指标**：跟踪延迟和吞吐量
3. **错误跟踪**：警报错误率和故障模式
4. **资源使用**：监控 CPU、内存和网络使用
5. **审计审查**：定期审查审计日志和访问模式

## 故障排除

### 常见问题

**安装失败**：
```bash
# 检查市场连接
cline-enterprise mcp marketplace-status

# 验证身份验证
cline-enterprise auth verify --service marketplace

# 检查安装日志
cline-enterprise logs mcp-installer --lines 100
```

**配置错误**：
```bash
# 验证配置
cline-enterprise mcp validate-config --file config.yaml

# 测试连接
cline-enterprise mcp test-connection github-enterprise --environment staging

# 检查服务器状态
cline-enterprise mcp status --all
```

**性能问题**：
```bash
# 检查服务器指标
cline-enterprise mcp metrics github-enterprise --duration 1h

# 查看最近的错误日志
cline-enterprise logs github-enterprise --level error --lines 50
```

## 支持

有关市场服务器问题：

- **文档**：在仪表板中查看服务器特定文档
- **社区**：加入 Cline 企业版社区论坛
- **支持工单**：为关键问题创建支持工单
- **专业服务**：为自定义配置聘请专业服务

企业客户有权访问具有 SLA 保证的专门支持渠道。
