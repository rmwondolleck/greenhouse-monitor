#!/usr/bin/env ts-node

/**
 * Interactive Issue Creator with Sub-Issues Support
 * 
 * This script creates a tracking issue with sub-issues, with an interactive mode
 * to gather additional information from the user.
 * 
 * Usage:
 *   npm run create-issues:interactive [--dry-run] [--tracking]
 * 
 * Environment Variables:
 *   GITHUB_TOKEN - GitHub Personal Access Token with repo scope
 *   GITHUB_OWNER - Repository owner (default: rmwondolleck)
 *   GITHUB_REPO - Repository name (default: greenhouse-monitor)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

// Load environment variables
dotenv.config();

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'rmwondolleck';
const GITHUB_REPO = process.env.GITHUB_REPO || 'greenhouse-monitor';
const GITHUB_API_BASE = 'https://api.github.com';
const ISSUES_DIR = path.join(process.cwd(), 'docs', 'github-issues');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const createTracking = args.includes('--tracking');

interface IssueData {
  title: string;
  body: string;
  labels: string[];
  milestone?: string;
  filename: string;
  priority?: string;
  timeEstimate?: string;
  phase?: string;
}

interface GitHubIssueResponse {
  number: number;
  html_url: string;
  title: string;
  state: string;
}

interface GitHubIssue {
  title: string;
  number: number;
  state: string;
}

interface UserPreferences {
  startDate?: string;
  notes?: string;
  assignee?: string;
}

/**
 * Create readline interface for interactive prompts
 */
function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask a question and wait for user input
 */
function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Parse a markdown issue template file
 */
function parseIssueTemplate(filePath: string): IssueData {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let title = '';
  let labels: string[] = [];
  let milestone: string | undefined;
  let bodyStartIndex = 0;
  
  // Extract metadata
  let priority: string | undefined;
  let timeEstimate: string | undefined;
  let phase: string | undefined;
  
  // Parse header sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Extract title from first H1
    if (line.startsWith('# ') && !title) {
      title = line.substring(2).trim();
      bodyStartIndex = i + 1;
    }
    
    // Extract labels
    if (line.startsWith('## Labels')) {
      const labelsLine = lines[i + 1];
      if (labelsLine) {
        labels = labelsLine
          .split(',')
          .map(l => l.trim().replace(/`/g, ''))
          .filter(l => l.length > 0);
        
        // Extract priority from labels
        const priorityLabel = labels.find(l => l.startsWith('priority-'));
        if (priorityLabel) {
          priority = priorityLabel.replace('priority-', '');
        }
        
        // Extract phase from labels
        const phaseLabel = labels.find(l => l.startsWith('phase-'));
        if (phaseLabel) {
          phase = phaseLabel;
        }
      }
      bodyStartIndex = Math.max(bodyStartIndex, i + 3);
    }
    
    // Extract milestone
    if (line.startsWith('## Milestone')) {
      milestone = lines[i + 1]?.trim();
      bodyStartIndex = Math.max(bodyStartIndex, i + 3);
    }
    
    // Stop parsing headers after Description
    if (line.startsWith('## Description')) {
      break;
    }
  }
  
  // Try to extract time estimate from content
  const timeMatch = content.match(/(\d+[-–]\d+)\s*(?:hours?|h)/i);
  if (timeMatch) {
    timeEstimate = timeMatch[1] + 'h';
  }
  
  // Extract body (everything after the metadata)
  const body = lines.slice(bodyStartIndex).join('\n').trim();
  
  return {
    title,
    body,
    labels,
    milestone,
    filename: path.basename(filePath),
    priority,
    timeEstimate,
    phase
  };
}

/**
 * Create a GitHub issue using the REST API
 */
async function createGitHubIssue(issueData: IssueData): Promise<GitHubIssueResponse> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }
  
  const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`;
  
  const payload = {
    title: issueData.title,
    body: issueData.body,
    labels: issueData.labels
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
  }
  
  return await response.json() as GitHubIssueResponse;
}

/**
 * Get all issue template files
 */
function getIssueTemplateFiles(): string[] {
  if (!fs.existsSync(ISSUES_DIR)) {
    console.error(`❌ Issues directory not found: ${ISSUES_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(ISSUES_DIR)
    .filter(f => f.startsWith('ISSUE_') && f.endsWith('.md'))
    .map(f => path.join(ISSUES_DIR, f));
  
  return files.sort();
}

/**
 * Check if an issue already exists
 */
async function issueExists(title: string): Promise<boolean> {
  if (!GITHUB_TOKEN) {
    return false;
  }
  
  const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=all&per_page=100`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      console.warn(`⚠️  Could not check existing issues: ${response.status}`);
      return false;
    }
    
    const issues = await response.json() as GitHubIssue[];
    return issues.some((existingIssue) => existingIssue.title === title);
  } catch (error) {
    console.warn(`⚠️  Error checking existing issues:`, error);
    return false;
  }
}

/**
 * Display issue summary
 */
function displayIssueSummary(issues: IssueData[]) {
  console.log('\n📋 Issue Templates Found:\n');
  console.log('═══════════════════════════════════════════════════════════════');
  
  issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.title}`);
    console.log(`   📄 File: ${issue.filename}`);
    if (issue.priority) {
      console.log(`   🔥 Priority: ${issue.priority}`);
    }
    if (issue.timeEstimate) {
      console.log(`   ⏱️  Time: ${issue.timeEstimate}`);
    }
    if (issue.phase) {
      console.log(`   📍 Phase: ${issue.phase}`);
    }
    console.log(`   🏷️  Labels: ${issue.labels.join(', ')}`);
  });
  
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

/**
 * Gather additional information from user
 */
async function gatherAdditionalInfo(rl: readline.Interface): Promise<UserPreferences> {
  console.log('\n🤔 Let\'s gather some additional information:\n');
  
  const startDate = await askQuestion(
    rl,
    '📅 When would you like to start this project? (e.g., "next week", "Feb 1", or press Enter to skip): '
  );
  
  const assignee = await askQuestion(
    rl,
    '👤 Who should be assigned to these issues? (GitHub username or press Enter to skip): '
  );
  
  const notes = await askQuestion(
    rl,
    '📝 Any additional notes or context for these issues? (press Enter to skip): '
  );
  
  return {
    startDate: startDate || undefined,
    assignee: assignee || undefined,
    notes: notes || undefined
  };
}

/**
 * Update tracking issue body with sub-issue numbers
 */
function updateTrackingIssueBody(
  trackingBody: string,
  subIssues: Array<{ filename: string; number: number; title: string }>
): string {
  let updatedBody = trackingBody;
  
  // Replace #TBD placeholders with actual issue numbers
  subIssues.forEach((subIssue) => {
    // Match the filename pattern (e.g., ISSUE_01)
    const issueNum = subIssue.filename.match(/ISSUE_(\d+)/)?.[1];
    if (issueNum) {
      // Find and replace #TBD for this issue
      const pattern = new RegExp(`(- \\[ \\] )#TBD( - .*?${issueNum.replace(/^0+/, '')}.*?)`, 'm');
      updatedBody = updatedBody.replace(pattern, `$1#${subIssue.number}$2`);
    }
  });
  
  return updatedBody;
}

/**
 * Create tracking issue with sub-issues
 */
async function createTrackingIssue(
  subIssues: Array<{ filename: string; number: number; title: string }>,
  preferences: UserPreferences
): Promise<GitHubIssueResponse | null> {
  const trackingFile = path.join(ISSUES_DIR, 'ISSUE_00_tracking_long_term_storage.md');
  
  if (!fs.existsSync(trackingFile)) {
    console.error('❌ Tracking issue template not found');
    return null;
  }
  
  const trackingData = parseIssueTemplate(trackingFile);
  
  // Update body with actual sub-issue numbers
  let body = updateTrackingIssueBody(trackingData.body, subIssues);
  
  // Add user preferences to the body
  if (preferences.startDate || preferences.notes) {
    body += '\n\n## Additional Information\n\n';
    
    if (preferences.startDate) {
      body += `**Planned Start Date**: ${preferences.startDate}\n\n`;
    }
    
    if (preferences.notes) {
      body += `**Notes**: ${preferences.notes}\n\n`;
    }
  }
  
  trackingData.body = body;
  
  console.log('\n📋 Creating tracking issue...');
  
  if (isDryRun) {
    console.log('   ✅ Would create tracking issue (dry run)');
    console.log(`   Title: ${trackingData.title}`);
    console.log(`   Sub-issues: ${subIssues.map(i => `#${i.number}`).join(', ')}`);
    return null;
  }
  
  const result = await createGitHubIssue(trackingData);
  console.log(`   ✅ Created tracking issue: #${result.number} - ${result.html_url}`);
  
  return result;
}

/**
 * Main interactive function
 */
async function mainInteractive() {
  console.log('🤖 Interactive GitHub Issue Creator\n');
  console.log(`📁 Repository: ${GITHUB_OWNER}/${GITHUB_REPO}`);
  console.log(`📂 Issues directory: ${ISSUES_DIR}`);
  console.log(`🔐 Token: ${GITHUB_TOKEN ? '✅ Provided' : '❌ Missing'}\n`);
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No issues will be created\n');
  }
  
  // Get issue template files (excluding tracking issue)
  const files = getIssueTemplateFiles().filter(
    f => !path.basename(f).startsWith('ISSUE_00')
  );
  
  if (files.length === 0) {
    console.error('❌ No issue templates found');
    process.exit(1);
  }
  
  // Parse all issues
  const issues = files.map(f => parseIssueTemplate(f));
  
  // Display summary
  displayIssueSummary(issues);
  
  // Create readline interface
  const rl = createReadlineInterface();
  
  try {
    // Gather additional information
    const preferences = await gatherAdditionalInfo(rl);
    
    // Confirm creation
    console.log('\n');
    const confirm = await askQuestion(
      rl,
      `\n✅ Ready to create ${issues.length} issues${createTracking ? ' + 1 tracking issue' : ''}. Continue? (yes/no): `
    );
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('\n❌ Cancelled by user');
      rl.close();
      process.exit(0);
    }
    
    console.log('\n📝 Creating issues...\n');
    
    // Create sub-issues
    const createdIssues: Array<{ filename: string; number: number; title: string }> = [];
    let created = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const issue of issues) {
      try {
        console.log(`\n📄 Processing: ${issue.filename}`);
        console.log(`   Title: ${issue.title}`);
        
        // Check if issue already exists
        if (!isDryRun && await issueExists(issue.title)) {
          console.log(`   ⏭️  Skipped: Issue already exists`);
          skipped++;
          continue;
        }
        
        let issueBody = issue.body;
        
        // Add user preferences to each issue
        if (preferences.assignee || preferences.notes) {
          issueBody += '\n\n---\n\n';
          
          if (preferences.assignee) {
            issueBody += `**Assigned to**: @${preferences.assignee}\n\n`;
          }
          
          if (preferences.notes) {
            issueBody += `**Additional Context**: ${preferences.notes}\n\n`;
          }
        }
        
        if (isDryRun) {
          console.log(`   ✅ Would create issue (dry run)`);
          created++;
          createdIssues.push({
            filename: issue.filename,
            number: 999, // Placeholder for dry run
            title: issue.title
          });
        } else {
          const result = await createGitHubIssue({ ...issue, body: issueBody });
          console.log(`   ✅ Created: #${result.number} - ${result.html_url}`);
          created++;
          createdIssues.push({
            filename: issue.filename,
            number: result.number,
            title: result.title
          });
          
          // Rate limiting: wait 1 second between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`   ❌ Failed:`, error);
        failed++;
      }
    }
    
    // Create tracking issue if requested
    let trackingIssue: GitHubIssueResponse | null = null;
    if (createTracking && createdIssues.length > 0) {
      trackingIssue = await createTrackingIssue(createdIssues, preferences);
    }
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('📊 Summary:');
    console.log(`   ✅ Created: ${created} issue${created !== 1 ? 's' : ''}`);
    console.log(`   ⏭️  Skipped: ${skipped} issue${skipped !== 1 ? 's' : ''}`);
    console.log(`   ❌ Failed: ${failed} issue${failed !== 1 ? 's' : ''}`);
    if (trackingIssue) {
      console.log(`   📋 Tracking issue: #${trackingIssue.number}`);
    }
    console.log('═'.repeat(70) + '\n');
    
    if (!isDryRun && created > 0) {
      console.log('🎉 Issues created successfully!');
      console.log(`\n🔗 View them at: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues\n`);
    }
    
    rl.close();
    
    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    rl.close();
    throw error;
  }
}

// Run the script
mainInteractive().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
