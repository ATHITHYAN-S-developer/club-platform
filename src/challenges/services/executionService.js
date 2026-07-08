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

const PISTON_LANG_MAP = {
  python: { lang: 'python', version: '3.10.0', ext: 'main.py' },
  javascript: { lang: 'javascript', version: '18.15.0', ext: 'main.js' },
  typescript: { lang: 'typescript', version: '5.0.3', ext: 'main.ts' },
  cpp: { lang: 'c++', version: '10.2.0', ext: 'main.cpp' },
  c: { lang: 'c', version: '10.2.0', ext: 'main.c' },
  java: { lang: 'java', version: '15.0.2', ext: 'main.java' },
  go: { lang: 'go', version: '1.16.2', ext: 'main.go' },
  rust: { lang: 'rust', version: '1.68.2', ext: 'main.rs' }
};

async function executePistonCode(code, language, input) {
  const mapped = PISTON_LANG_MAP[language] || { lang: language, version: '*', ext: 'main' };
  try {
    const res = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: mapped.lang,
        version: mapped.version,
        files: [
          {
            name: mapped.ext,
            content: code
          }
        ],
        stdin: input || ''
      })
    });
    if (!res.ok) {
      throw new Error(`Piston compiler error: ${res.status}`);
    }
    const data = await res.json();
    const stdout = data.run?.stdout ?? '';
    const stderr = data.run?.stderr ?? '';
    return { stdout, stderr };
  } catch (err) {
    console.error('Piston execution failed:', err);
    return { stdout: '', stderr: err.message };
  }
}

export async function runCode({ code, language, input }) {
  if (CLOUD_FN_BASE) {
    return await callFunction('runCode', { code, language, input });
  }

  // Real code compilation using Piston API
  const result = await executePistonCode(code, language, input);
  return {
    status: result.stderr ? 'failed' : 'passed',
    stdout: result.stdout,
    stderr: result.stderr,
    time: 0.05,
    memory: 12.4
  };
}

export async function submitSolution({ challengeId, code, language, timeTaken }) {
  if (CLOUD_FN_BASE) {
    return await callFunction('submitCode', { challengeId, code, language, timeTaken });
  }

  // Client-Side Fallback
  await new Promise(r => setTimeout(r, 1000)); // Simulate execution lag

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

    const res = await executePistonCode(code, language, tc.input);
    if (res.stderr) {
      hasCompilationError = true;
      errorMsg = res.stderr;
      actualOutput = res.stderr;
    } else {
      actualOutput = res.stdout;
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

  // 4. Save submission record
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
      testCaseResults,
      totalPassed,
      totalFailed: allCases.length - totalPassed
    },
    score: scoreData,
    timeTaken,
    runtime: 0.04,
    memory: 9.6,
    attemptNumber: userSubs.length + 1,
    submittedAt: new Date().toISOString()
  };

  await db.insert('ChallengeSubmissions', submissionRecord);

  // 5. Update student achievements and XP
  if (status === 'passed') {
    // 5.1 Streak incrementation
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

    // 5.2 Badge checks
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
    if (isFirstAttempt && badges.indexOf('first_attempt') === -1) {
      badges.push('first_attempt');
    }
    if (challenge.difficulty === 'hard' && badges.indexOf('perfect_score') === -1) {
      badges.push('perfect_score');
    }

    // 5.3 Write updates back to user doc
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
    
    // Sync local storage session
    localStorage.setItem('aether_user_session', JSON.stringify({
      ...sessionUser,
      ...userUpdates
    }));

    // Create a local notification
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
    status,
    results: testCaseResults,
    score: scoreData,
    xpEarned,
    runtime: 0.04,
    memory: 9.6
  };
}

export async function reviewManualSubmission({ submissionId, approved, feedback, xpAward }) {
  if (CLOUD_FN_BASE) {
    return await callFunction('reviewManualSubmission', { submissionId, approved, feedback, xpAward });
  }

  // Local fallback is handled in the ChallengeManagement.jsx Admin Panel directly.
  return { success: true };
}
