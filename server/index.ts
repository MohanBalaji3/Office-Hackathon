import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 4000;

// Groq Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_BASE = process.env.GROQ_API_BASE || 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';

if (!GROQ_API_KEY) {
  console.warn('⚠️  GROQ_API_KEY is not configured. Please set it in .env or environment variables.');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Types
interface TestCase {
  id: string;
  name: string;
  className: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  errorMessage?: string;
  stackTrace?: string;
  logs?: string[];
}

interface AnalysisRequest {
  testCases: TestCase[];
  rawContent: string;
}

interface JiraCredentials {
  baseUrl: string;
  email: string;
  apiKey: string;
  projectKey: string;
}

interface CreateJiraRequest {
  credentials: JiraCredentials;
  failure: any;
  summary: string;
  description: string;
  priority: string;
}

// API endpoint for report analysis
app.post('/api/analyze-report', async (req, res) => {
  try {
    const { testCases, rawContent } = req.body as AnalysisRequest;

    if (!rawContent && (!testCases || !Array.isArray(testCases))) {
      return res.status(400).json({ error: 'Report content is required' });
    }

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured');
      return res.status(500).json({ error: 'AI service not configured. Please set GROQ_API_KEY environment variable.' });
    }

    const parsedTests = testCases || [];
    const failedFromParsing = parsedTests.filter((t: TestCase) => t.status === 'fail');
    const skippedFromParsing = parsedTests.filter((t: TestCase) => t.status === 'skip');
    const passedFromParsing = parsedTests.filter((t: TestCase) => t.status === 'pass');

    console.log(
      `Parsed: ${parsedTests.length} tests (${failedFromParsing.length} failed, ${passedFromParsing.length} passed, ${skippedFromParsing.length} skipped)`
    );

    // Build comprehensive analysis prompt
    const systemPrompt = `You are an expert test automation engineer specializing in analyzing Spark Extent Reports and test execution results. Your task is to ACCURATELY extract and analyze test results from the provided report content.

CRITICAL INSTRUCTIONS:
1. FIRST, carefully extract ALL test cases from the raw content. Look for:
   - Test names, method names, or scenario names
   - Status indicators (pass/fail/skip/error)
   - Error messages, exceptions, and stack traces
   - Execution times and timestamps

2. For each FAILED test, determine:
   - Root cause category (MUST be one of: application_defect, automation_script_defect, test_data_issue, environment_issue, configuration_issue, flaky_test)
   - Confidence level (high/medium/low)
   - Specific evidence from the report
   - Actionable fix recommendation

3. Identify patterns across failures

4. Provide prioritized recommendations

ACCURACY IS CRITICAL. Extract the EXACT test names and error messages from the report. Do not make up test names or errors.

Respond with ONLY valid JSON in this exact structure:
{
  "extractedTests": [
    {
      "id": "unique-id",
      "name": "exact test name from report",
      "className": "test class or suite name",
      "status": "pass|fail|skip",
      "errorMessage": "exact error message if failed",
      "stackTrace": "stack trace if available"
    }
  ],
  "failures": [
    {
      "testId": "matching id from extractedTests",
      "testName": "exact test name",
      "rootCause": "detailed analysis of why this test failed",
      "category": "one of the valid categories",
      "confidence": "high|medium|low",
      "evidence": ["specific evidence from the report"],
      "suggestedFix": "specific actionable fix"
    }
  ],
  "patterns": [
    {
      "description": "pattern description",
      "occurrences": number,
      "affectedTests": ["test names"]
    }
  ],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "title": "short title",
      "description": "detailed description",
      "actionItems": ["specific actions"]
    }
  ],
  "summary": {
    "total": number,
    "passed": number,
    "failed": number,
    "skipped": number
  }
}`;

    let userPrompt = `Analyze this Spark Extent Report and provide 100% accurate results:

`;

    // Include parsed test data if available
    if (parsedTests.length > 0) {
      userPrompt += `=== PRE-PARSED TEST DATA ===
${JSON.stringify(parsedTests, null, 2)}

`;
    }

    // Include raw content for AI to extract additional info
    if (rawContent) {
      // Limit content size but keep as much as possible
      const contentLimit = 25000;
      const trimmedContent =
        rawContent.length > contentLimit
          ? rawContent.substring(0, contentLimit) + '\n...[content truncated]...'
          : rawContent;

      userPrompt += `=== RAW REPORT CONTENT ===
${trimmedContent}

`;
    }

    userPrompt += `
IMPORTANT: 
- Extract ALL test cases with their EXACT names and statuses
- For failed tests, analyze the root cause based on error messages and stack traces
- Be precise and accurate - do not invent or assume information not in the report
- If the report shows all tests passed, report that accurately`;

    console.log(`Calling Groq API (${GROQ_MODEL}) for comprehensive analysis...`);
    console.log(`API Base: ${GROQ_API_BASE}`);
    console.log(`Prompt size: ${userPrompt.length} characters`);

    let response;
    try {
      response = await axios.post(
        `${GROQ_API_BASE}/chat/completions`,
        {
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1, // Lower temperature for more accurate/deterministic output
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 second timeout
        }
      );
    } catch (axiosError: any) {
      console.error('Groq API Error:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
      
      if (axiosError.response?.status === 401) {
        return res.status(401).json({ error: 'Invalid Groq API key. Please check GROQ_API_KEY in .env' });
      }
      if (axiosError.response?.status === 429) {
        return res.status(429).json({ error: 'Groq rate limit exceeded. Please try again later.' });
      }
      if (axiosError.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'Groq API request timeout. Please try again.' });
      }
      
      throw axiosError;
    }

    const content = response.data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in Groq response:', response.data);
      return res.status(500).json({ error: 'Invalid response from Groq API: No content returned' });
    }

    console.log('AI response received, parsing...');

    let analysisResult;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      let jsonStr = content;
      const jsonMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        // Try to find JSON object directly
        const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          jsonStr = objectMatch[0];
        }
      }

      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return res.status(500).json({ error: 'Failed to parse analysis results' });
    }

    // Validate and enrich the response
    if (!analysisResult.summary) {
      analysisResult.summary = {
        total: parsedTests.length,
        passed: passedFromParsing.length,
        failed: failedFromParsing.length,
        skipped: skippedFromParsing.length,
      };
    }

    // Add calculated fields to summary
    const summary = analysisResult.summary;
    summary.passRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;
    summary.duration = parsedTests.length > 0 
      ? `${(parsedTests.reduce((sum: number, t: TestCase) => sum + (t.duration || 0), 0) / 1000).toFixed(2)}s`
      : '0.00s';

    // Process failures to include testCase data
    const enrichedFailures = (analysisResult.failures || []).map((failure: any) => {
      const testCase = parsedTests.find((t: TestCase) => t.id === failure.testId || t.name === failure.testName);
      return {
        ...failure,
        testCase: testCase || { id: failure.testId, name: failure.testName },
      };
    });

    res.json({
      ...analysisResult,
      failures: enrichedFailures,
      summary,
    });
  } catch (error) {
    console.error('Error in analyze-report:', error);
    let errorMessage = 'Failed to analyze report';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('429')) {
        statusCode = 429;
        errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      } else if (error.message.includes('402')) {
        statusCode = 402;
        errorMessage = 'AI credits exhausted. Please add credits to continue.';
      } else if (error.message.includes('401')) {
        statusCode = 401;
        errorMessage = 'Invalid API key. Please check your credentials.';
      } else if (error.message.includes('ECONNREFUSED')) {
        statusCode = 503;
        errorMessage = 'Groq API is unavailable. Please try again later.';
      }
    }
    
    res.status(statusCode).json({ error: errorMessage });
  }
});

// API endpoint for creating JIRA issues
app.post('/api/create-jira-issue', async (req, res) => {
  try {
    const { credentials, failure, summary, description, priority } = req.body as CreateJiraRequest;

    // Validate required fields
    if (!credentials || !credentials.baseUrl || !credentials.email || !credentials.apiKey || !credentials.projectKey) {
      return res.status(400).json({ error: 'JIRA credentials are required' });
    }

    if (!failure || !summary) {
      return res.status(400).json({ error: 'Failure details and summary are required' });
    }

    const { baseUrl, email, apiKey, projectKey } = credentials;
    const authHeader = `Basic ${Buffer.from(`${email}:${apiKey}`).toString('base64')}`;

    // Clean base URL (remove trailing slash)
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    console.log(`Creating JIRA issue in project ${projectKey}...`);

    // Map priority string to JIRA priority
    const priorityMapping: Record<string, string> = {
      Highest: '1',
      High: '2',
      Medium: '3',
      Low: '4',
      Lowest: '5',
    };

    // Create the issue
    const issuePayload = {
      fields: {
        project: {
          key: projectKey,
        },
        summary: summary,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: description || 'No description provided',
                },
              ],
            },
          ],
        },
        issuetype: {
          name: 'Bug',
        },
        priority: {
          name: priority || 'Medium',
        },
        labels: ['automated-test-failure', 'defect-analyzer'],
      },
    };

    const createResponse = await axios.post(`${cleanBaseUrl}/rest/api/3/issue`, issuePayload, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const issueData = createResponse.data;
    const issueKey = issueData.key;
    const issueId = issueData.id;

    console.log(`JIRA issue created: ${issueKey}`);

    // Handle screenshots if available
    const screenshots = failure?.testCase?.screenshots || [];
    const attachmentResults: string[] = [];

    for (const screenshot of screenshots) {
      try {
        // Convert base64 to buffer for attachment
        const binaryData = Buffer.from(screenshot.base64Data, 'base64');

        const attachResponse = await axios.post(
          `${cleanBaseUrl}/rest/api/3/issue/${issueKey}/attachments`,
          binaryData,
          {
            headers: {
              Authorization: authHeader,
              'X-Atlassian-Token': 'no-check',
              'Content-Type': screenshot.mimeType || 'image/png',
            },
          }
        );

        console.log(`Attached screenshot: ${screenshot.name}`);
        attachmentResults.push(screenshot.name);
      } catch (attachError) {
        console.error(`Error attaching screenshot:`, attachError);
      }
    }

    res.json({
      success: true,
      issueKey: issueKey,
      issueId: issueId,
      issueUrl: `${cleanBaseUrl}/browse/${issueKey}`,
      attachments: attachmentResults,
    });
  } catch (error) {
    console.error('Error in create-jira-issue:', error);
    let errorMessage = 'Failed to create JIRA issue';

    if (axios.isAxiosError(error)) {
      if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).join(', ');
      } else if (error.response?.data?.errorMessages) {
        errorMessage = error.response.data.errorMessages.join(', ');
      } else {
        errorMessage = error.response?.statusText || error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: errorMessage });
  }
});

// API endpoint for testing JIRA connection
app.post('/api/test-jira-connection', async (req, res) => {
  try {
    const { baseUrl, email, apiKey } = req.body;

    // Validate required fields
    if (!baseUrl || !email || !apiKey) {
      return res.status(400).json({ error: 'JIRA credentials are required' });
    }

    const authHeader = `Basic ${Buffer.from(`${email}:${apiKey}`).toString('base64')}`;
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    console.log(`Testing JIRA connection to ${cleanBaseUrl}...`);

    const response = await axios.get(`${cleanBaseUrl}/rest/api/3/myself`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });

    if (response.status === 200) {
      console.log('JIRA connection successful');
      res.json({
        success: true,
        message: 'JIRA connection successful',
        user: response.data.displayName || response.data.name,
      });
    }
  } catch (error) {
    console.error('JIRA connection test failed:', error);
    let errorMessage = 'Failed to connect to JIRA';

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Invalid JIRA credentials. Please check your email and API key.';
      } else if (error.response?.status === 404) {
        errorMessage = 'JIRA instance not found. Please check your base URL.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to JIRA. Please check the URL and try again.';
      } else {
        errorMessage = error.response?.statusText || error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Defect Analyzer Server running on http://localhost:${PORT}`);
  console.log(`📦 AI Model: ${GROQ_MODEL}`);
  console.log(`🔌 API Base: ${GROQ_API_BASE}`);
  if (!GROQ_API_KEY) {
    console.warn(`\n⚠️  GROQ_API_KEY not set! Analysis will fail.\nSet it in .env or environment variables.\n`);
  }
});
