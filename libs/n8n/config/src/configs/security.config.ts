import { Config, Env } from '../decorators';

/**
 * Security configuration
 */
@Config
export class SecurityConfig {
  /**
   * Restrict file system access to specific directories.
   * Comma-separated list of absolute paths.
   */
  @Env('N8N_RESTRICT_FILE_ACCESS_TO')
  restrictFileAccessTo: string = '';

  /**
   * Block file access to n8n internal files
   */
  @Env('N8N_BLOCK_FILE_ACCESS_TO_N8N_FILES')
  blockFileAccessToN8nFiles: boolean = true;

  /**
   * Number of days after which abandoned workflows are considered inactive
   */
  @Env('N8N_SECURITY_AUDIT_DAYS_ABANDONED_WORKFLOW')
  daysAbandonedWorkflow: number = 90;

  /**
   * Content Security Policy header value (JSON string)
   */
  @Env('N8N_CONTENT_SECURITY_POLICY')
  contentSecurityPolicy: string = '{}';

  /**
   * Use Content-Security-Policy-Report-Only header
   */
  @Env('N8N_CONTENT_SECURITY_POLICY_REPORT_ONLY')
  contentSecurityPolicyReportOnly: boolean = false;

  /**
   * Disable HTML sandboxing for webhook responses
   */
  @Env('N8N_DISABLE_WEBHOOK_HTML_SANDBOXING')
  disableWebhookHtmlSandboxing: boolean = false;

  /**
   * Disable bare git repository support
   */
  @Env('N8N_DISABLE_BARE_REPOS')
  disableBareRepos: boolean = false;

  /**
   * Allow AWS system credentials access
   */
  @Env('N8N_AWS_SYSTEM_CREDENTIALS_ACCESS')
  awsSystemCredentialsAccess: boolean = false;

  /**
   * Enable git node hooks
   */
  @Env('N8N_ENABLE_GIT_NODE_HOOKS')
  enableGitNodeHooks: boolean = false;
}
