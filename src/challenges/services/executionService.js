import db from '../../db';
import { calculateScore } from './scoringService';
import { DIFFICULTY } from '../config/challengeConfig';

const CLOUD_FN_BASE = import.meta.env.VITE_CLOUD_FUNCTIONS_URL || '';

async function callFunction(name, data) {
  const url = `${CLOUD_FN_BASE}/${name}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return await res.json();
}

// Browser-based Pyodide loader for Python execution
let pyodidePromise = null;
async function loadPyodide() {
  if (pyodidePromise) return pyodidePromise;
  
  pyodidePromise = (async () => {
    if (typeof window.loadPyodide === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    const py = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
    });
    return py;
  })();
  
  return pyodidePromise;
}

async function runPythonPyodide(code, input) {
  try {
    const py = await loadPyodide();
    // Prepare redirected input stream
    py.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
sys.stdin = io.StringIO(${JSON.stringify(input || '')})
    `);
    
    // Execute python code asynchronously
    await py.runPythonAsync(code);
    
    const stdout = py.runPython('sys.stdout.getvalue()');
    const stderr = py.runPython('sys.stderr.getvalue()');
    return { stdout, stderr };
  } catch (err) {
    return { stdout: '', stderr: err.message };
  }
}

// Local JavaScript/TypeScript execution
function evalJSCode(code, input) {
  const lines = (input || '').toString().split('\n');
  let lineIndex = 0;
  const readline = () => lines[lineIndex++] ?? '';

  let output = '';
  const consoleLog = (...args) => {
    output += args.join(' ') + '\n';
  };

  const context = {
    readline,
    console: { log: consoleLog }
  };

  try {
    const runner = new Function('readline', 'console', `${code}`);
    runner(readline, context.console);
    return { stdout: output.trim(), stderr: null };
  } catch (err) {
    return { stdout: '', stderr: err.message };
  }
}

export async function runCode({ code, language, input }) {
  if (CLOUD_FN_BASE) {
    return await callFunction('runCode', { code, language, input });
  }

  // Python execution in Pyodide browser sandbox
  if (language === 'python') {
    const result = await runPythonPyodide(code, input);
    return {
      status: result.stderr ? 'failed' : 'passed',
      stdout: result.stdout,
      stderr: result.stderr,
      time: 0.12,
      memory: 24.5
    };
  }

  // JS/TS local execution
  if (language === 'javascript' || language === 'typescript') {
    const result = evalJSCode(code, input);
    return {
      status: result.stderr ? 'failed' : 'passed',
      stdout: result.stdout,
      stderr: result.stderr,
      time: 0.02,
      memory: 8.2
    };
  }

  // Fallback for other languages (C++, Java, Go, Rust)
  return {
    status: 'passed',
    stdout: `[Local Sandbox Mock output for ${language}]\nInput received: ${input}`,
    stderr: null,
    time: 0.01,
    memory: 4.5
  };
}

export async function gradeSolution({ challengeId, code, language, timeTaken }) {
  if (CLOUD_FN_BASE) {
    return await callFunction('gradeCode', { challengeId, code, language, timeTaken });
  }

  // Client-Side Fallback:
  // 1. Fetch full challenge details (including hidden test cases) directly
  const challenge = await db.findOne('Challenges', { id: challengeId });
  if (!challenge) {
    throw new Error('Challenge not found in local catalog.');
  }

  // 2. Load User details
  const sessionUser = JSON.parse(localStorage.getItem('aether_user_session'));
  if (!sessionUser) {
    throw new Error('You must be signed in to submit solutions.');
  }

  const sampleCases = challenge.sampleTestCases || [];
  const hiddenCases = challenge.hiddenTestCases || [];
  const allCases = [...sampleCases, ...hiddenCases];

  let totalPassed = 0;
  let hasCompilationError = false;
  let errorMsg = null;
  const testCaseResults = [];

  // Run validation
  for (let i = 0; i < allCases.length; i++) {
    const tc = allCases[i];
    const isHidden = i >= sampleCases.length;
    let actualOutput = '';
    let passed = false;

    const runResult = await runCode({ code, language, input: tc.input });
    if (runResult.stderr) {
      hasCompilationError = true;
      errorMsg = runResult.stderr;
      actualOutput = runResult.stderr;
    } else {
      actualOutput = runResult.stdout;
      const expectedClean = (tc.output || tc.expectedOutput || '').toString().trim();
      passed = actualOutput.trim() === expectedClean;
    }

    if (passed) totalPassed++;
    testCaseResults.push({
      passed,
      input: tc.input,
      expectedOutput: tc.output || tc.expectedOutput || '',
      actualOutput,
      isHidden
    });
  }

  // 3. Query history to determine scoring bonuses/penalties
  const allSubs = await db.find('ChallengeSubmissions');
  const userSubs = allSubs.filter(s => s.userId === sessionUser.id && s.challengeId === challengeId);
  const correctSubs = allSubs.filter(s => s.challengeId === challengeId && s.status === 'passed');
  
  const isFirstCorrect = correctSubs.length === 0 && totalPassed === allCases.length;
  const isFirstAttempt = userSubs.length === 0;
  const wrongSubmissions = userSubs.filter(s => s.status !== 'passed').length;

  const diffLimit = DIFFICULTY[challenge.difficulty]?.timeLimit || 10;
  const maxTime = diffLimit * 60; // in seconds

  const scoreData = calculateScore({
    passedTests: totalPassed,
    totalTests: allCases.length,
    timeTaken,
    maxTime,
    isFirstCorrect,
    isFirstAttempt,
    hasCompilationError,
    wrongSubmissions
  });

  const xpEarned = totalPassed === allCases.length ? (challenge.xpReward || 100) : 0;
  const status = totalPassed === allCases.length ? 'passed' : 'failed';

  return {
    status,
    results: testCaseResults,
    score: scoreData,
    xpEarned,
    runtime: 0.04,
    memory: 9.6,
    attemptNumber: userSubs.length + 1
  };
}

export async function saveSubmissionRecord({ challengeId, code, language, timeTaken, gradeResult, securityLog, violationCount, autoSubmitted, startedAt }) {
  if (CLOUD_FN_BASE) {
    return await callFunction('saveSubmission', { challengeId, code, language, timeTaken, gradeResult, securityLog, violationCount, autoSubmitted, startedAt });
  }

  const sessionUser = JSON.parse(localStorage.getItem('aether_user_session'));
  if (!sessionUser) {
    throw new Error('You must be signed in to finalize submissions.');
  }

  const challenge = await db.findOne('Challenges', { id: challengeId });
  if (!challenge) {
    throw new Error('Challenge not found in local catalog.');
  }

  const status = gradeResult.status;
  const xpEarned = gradeResult.xpEarned || 0;

  // 1. Save submission record
  const subId = 'sub_' + Date.now();
  const submissionRecord = {
    id: subId,
    challengeId,
    taskTitle: challenge.title,
    userId: sessionUser.id,
    userName: sessionUser.name,
    userEmail: sessionUser.email,
    language,
    code,
    status,
    results: {
      testCaseResults: gradeResult.results,
      totalPassed: gradeResult.results.filter(r => r.passed).length,
      totalFailed: gradeResult.results.filter(r => !r.passed).length
    },
    score: gradeResult.score,
    timeTaken,
    runtime: gradeResult.runtime || 0.04,
    memory: gradeResult.memory || 9.6,
    attemptNumber: gradeResult.attemptNumber || 1,
    submittedAt: new Date().toISOString(),
    securityLog: securityLog || [],
    violationCount: violationCount || 0,
    autoSubmitted: autoSubmitted || false,
    startedAt: startedAt || new Date().toISOString()
  };

  await db.insert('ChallengeSubmissions', submissionRecord);

  // 2. Update student achievements, XP, streak, badges
  if (status === 'passed') {
    const todayStr = new Date().toDateString();
    const lastChallengeDate = sessionUser.lastChallengeDate;
    let streak = sessionUser.currentStreak || 0;
    
    if (!lastChallengeDate) {
      streak = 1;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastChallengeDate === yesterday.toDateString()) {
        streak += 1;
      } else if (lastChallengeDate !== todayStr) {
        streak = 1;
      }
    }

    const badges = [...(sessionUser.badges || [])];
    if (badges.indexOf('first_challenge') === -1) {
      badges.push('first_challenge');
    }
    if (streak >= 7 && badges.indexOf('streak_7') === -1) {
      badges.push('streak_7');
    }
    if (streak >= 30 && badges.indexOf('streak_30') === -1) {
      badges.push('streak_30');
    }
    if (gradeResult.attemptNumber === 1 && badges.indexOf('first_attempt') === -1) {
      badges.push('first_attempt');
    }
    if (challenge.difficulty === 'hard' && badges.indexOf('perfect_score') === -1) {
      badges.push('perfect_score');
    }

    const updatedXP = (sessionUser.xp || 0) + xpEarned;
    const updatedChallengeXP = (sessionUser.challengeXp || 0) + xpEarned;
    
    const userUpdates = {
      xp: updatedXP,
      challengeXp: updatedChallengeXP,
      currentStreak: streak,
      lastChallengeDate: todayStr,
      badges
    };

    await db.update('Users', sessionUser.id, userUpdates);
    
    localStorage.setItem('aether_user_session', JSON.stringify({
      ...sessionUser,
      ...userUpdates
    }));

    await db.insert('Notifications', {
      id: 'nt_sub_' + Date.now(),
      userId: sessionUser.id,
      title: '🎉 Code Passed Successfully!',
      message: `Your code for "${challenge.title}" passed all test cases! Earned ${xpEarned} XP.`,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  return {
    success: true,
    submissionId: subId,
    status,
    xpEarned
  };
}

export async function submitAndFinalize({ challengeId, code, language, timeTaken, securityLog, violationCount, autoSubmitted, startedAt }) {
  const gradeResult = await gradeSolution({ challengeId, code, language, timeTaken });
  return await saveSubmissionRecord({
    challengeId, code, language, timeTaken, gradeResult, securityLog, violationCount, autoSubmitted, startedAt
  });
}

export const submitSolution = submitAndFinalize;

export async function reviewManualSubmission({ submissionId, approved, feedback, xpAward }) {
  if (CLOUD_FN_BASE) {
    return await callFunction('reviewManualSubmission', { submissionId, approved, feedback, xpAward });
  }

  return { success: true };
}
