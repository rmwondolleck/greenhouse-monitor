#!/usr/bin/env ts-node

/**
 * Issue Creator Agent
 * 
 * This script reviews issue templates in docs/github-issues/ and creates
 * GitHub issues from them using the GitHub API.
 * 
 * Usage:
 *   npm run create-issues [--dry-run] [--file ISSUE_01.md]
 *   npm run create-issues [--dry-run] [--file=ISSUE_01.md]
 * 
 * Environment Variables:
 *   GITHUB_TOKEN - GitHub Personal Access Token with repo scope
 *   GITHUB_OWNER - Repository owner (default: rmwondolleck)
 *   GITHUB_REPO - Repository name (default: greenhouse-monitor)
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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
// Support both --file=FILENAME and --file FILENAME formats
const specificFile = (() => {
  const fileArgWithEquals = args.find(arg => arg.startsWith('--file='));
  if (fileArgWithEquals) {
    return fileArgWithEquals.split('=')[1];
  }
  const fileArgIndex = args.indexOf('--file');
  if (fileArgIndex !== -1 && args[fileArgIndex + 1]) {
    return args[fileArgIndex + 1];
  }
  return undefined;
})();

interface IssueData {
  title: string;
  body: string;
  labels: string[];
  milestone?: string;
  filename: string;
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
        // Parse labels like: `enhancement`, `mqtt`, `priority-high`
        labels = labelsLine
          .split(',')
          .map(l => l.trim().replace(/`/g, ''))
          .filter(l => l.length > 0);
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
  
  // Extract body (everything after the metadata)
  const body = lines.slice(bodyStartIndex).join('\n').trim();
  
  return {
    title,
    body,
    labels,
    milestone,
    filename: path.basename(filePath)
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
    // Note: milestone would need milestone number, not name
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
    return issues.some((issue) => issue.title === title);
  } catch (error) {
    console.warn(`⚠️  Error checking existing issues:`, error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🤖 GitHub Issue Creator Agent\n');
  console.log(`📁 Repository: ${GITHUB_OWNER}/${GITHUB_REPO}`);
  console.log(`📂 Issues directory: ${ISSUES_DIR}`);
  console.log(`🔐 Token: ${GITHUB_TOKEN ? '✅ Provided' : '❌ Missing'}\n`);
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No issues will be created\n');
  }
  
  // Get issue template files
  let files = getIssueTemplateFiles();
  
  // Filter to specific file if requested
  if (specificFile) {
    files = files.filter(f => path.basename(f) === specificFile);
    if (files.length === 0) {
      console.error(`❌ File not found: ${specificFile}`);
      process.exit(1);
    }
  }
  
  console.log(`📋 Found ${files.length} issue template(s)\n`);
  
  // Process each file
  let created = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const file of files) {
    try {
      const issueData = parseIssueTemplate(file);
      
      console.log(`\n📄 Processing: ${issueData.filename}`);
      console.log(`   Title: ${issueData.title}`);
      console.log(`   Labels: ${issueData.labels.join(', ')}`);
      if (issueData.milestone) {
        console.log(`   Milestone: ${issueData.milestone}`);
      }
      
      // Check if issue already exists
      if (!isDryRun && await issueExists(issueData.title)) {
        console.log(`   ⏭️  Skipped: Issue already exists`);
        skipped++;
        continue;
      }
      
      if (isDryRun) {
        console.log(`   ✅ Would create issue (dry run)`);
        created++;
      } else {
        const result = await createGitHubIssue(issueData);
        console.log(`   ✅ Created: #${result.number} - ${result.html_url}`);
        created++;
        
        // Rate limiting: wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`   ❌ Failed:`, error);
      failed++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('='.repeat(60) + '\n');
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
