export const TASK_TYPES = {
  coding: {
    label: 'Coding Challenge',
    icon: 'fa-code',
    color: '#6366f1',
    fields: [
      { key: 'githubRepo', label: 'GitHub Repository URL', placeholder: 'https://github.com/your-username/repo', type: 'url', required: true },
      { key: 'liveDemo', label: 'Live Demo URL', placeholder: 'https://your-app.vercel.app', type: 'url', required: false },
      { key: 'technologies', label: 'Technologies Used', placeholder: 'React, Node.js, MongoDB', type: 'text', required: true },
      { key: 'projectDescription', label: 'Project Description', placeholder: 'Brief description of your implementation', type: 'textarea', required: false },
      { key: 'additionalNotes', label: 'Additional Notes', placeholder: 'Any additional information about your implementation', type: 'textarea', required: false },
    ],
    scoring: [
      { key: 'functionality', label: 'Functionality', maxScore: 25 },
      { key: 'codeQuality', label: 'Code Quality', maxScore: 25 },
      { key: 'uiux', label: 'UI/UX', maxScore: 25 },
      { key: 'documentation', label: 'Documentation', maxScore: 25 },
    ],
  },
  idea: {
    label: 'Idea Submission',
    icon: 'fa-lightbulb',
    color: '#f59e0b',
    fields: [
      { key: 'projectTitle', label: 'Project Title', placeholder: 'Enter your project title', type: 'text', required: true },
      { key: 'problemStatement', label: 'Problem Statement', placeholder: 'Describe the problem you want to solve', type: 'textarea', required: true },
      { key: 'proposedSolution', label: 'Proposed Solution', placeholder: 'Describe your solution approach', type: 'textarea', required: true },
      { key: 'keyFeatures', label: 'Key Features', placeholder: 'List the main features of your idea', type: 'textarea', required: false },
      { key: 'expectedImpact', label: 'Expected Impact', placeholder: 'What impact will this idea have?', type: 'textarea', required: false },
      { key: 'futureScope', label: 'Future Scope', placeholder: 'Future possibilities for this project', type: 'textarea', required: false },
      { key: 'references', label: 'References', placeholder: 'List any references or inspirations', type: 'textarea', required: false },
    ],
    scoring: [
      { key: 'innovation', label: 'Innovation', maxScore: 25 },
      { key: 'creativity', label: 'Creativity', maxScore: 25 },
      { key: 'feasibility', label: 'Feasibility', maxScore: 25 },
      { key: 'presentation', label: 'Presentation', maxScore: 25 },
    ],
  },
  ai: {
    label: 'AI Project',
    icon: 'fa-robot',
    color: '#06b6d4',
    fields: [
      { key: 'githubRepo', label: 'GitHub Repository URL', placeholder: 'https://github.com/your-username/repo', type: 'url', required: false },
      { key: 'liveDemo', label: 'Live Demo / Colab URL', placeholder: 'https://colab.research.google.com/...', type: 'url', required: false },
      { key: 'modelDescription', label: 'Model Description', placeholder: 'Describe your model architecture and approach', type: 'textarea', required: true },
      { key: 'datasetUsed', label: 'Dataset Used', placeholder: 'Describe the dataset and its source', type: 'textarea', required: true },
      { key: 'technologies', label: 'Technologies / Frameworks', placeholder: 'TensorFlow, PyTorch, Scikit-learn', type: 'text', required: false },
      { key: 'additionalNotes', label: 'Additional Notes', placeholder: 'Any additional technical details or observations', type: 'textarea', required: false },
    ],
    scoring: [
      { key: 'technicalDepth', label: 'Technical Depth', maxScore: 25 },
      { key: 'implementation', label: 'Implementation', maxScore: 25 },
      { key: 'datasetQuality', label: 'Dataset Quality', maxScore: 25 },
      { key: 'documentation', label: 'Documentation', maxScore: 25 },
    ],
  },
  uiux: {
    label: 'UI/UX Design',
    icon: 'fa-palette',
    color: '#ec4899',
    fields: [
      { key: 'figmaLink', label: 'Figma Design Link', placeholder: 'https://www.figma.com/file/...', type: 'url', required: true },
      { key: 'prototypeLink', label: 'Prototype Link (optional)', placeholder: 'https://www.figma.com/proto/...', type: 'url', required: false },
      { key: 'designDescription', label: 'Design Description', placeholder: 'Describe your design choices, colors, typography', type: 'textarea', required: true },
      { key: 'designDecisions', label: 'Design Decisions', placeholder: 'Explain key design decisions and trade-offs', type: 'textarea', required: false },
    ],
    scoring: [
      { key: 'creativity', label: 'Creativity', maxScore: 25 },
      { key: 'visualDesign', label: 'Visual Design', maxScore: 25 },
      { key: 'ux', label: 'UX', maxScore: 25 },
      { key: 'accessibility', label: 'Accessibility', maxScore: 25 },
    ],
  },
  datascience: {
    label: 'Data Science',
    icon: 'fa-chart-bar',
    color: '#10b981',
    fields: [
      { key: 'githubRepo', label: 'GitHub / Notebook URL', placeholder: 'https://github.com/... or https://kaggle.com/...', type: 'url', required: false },
      { key: 'datasetUsed', label: 'Dataset Used', placeholder: 'Describe the dataset, source, and size', type: 'textarea', required: true },
      { key: 'technologies', label: 'Tools & Libraries', placeholder: 'Pandas, NumPy, Matplotlib, Seaborn', type: 'text', required: false },
      { key: 'projectDescription', label: 'Analysis Description', placeholder: 'Describe your analysis approach and findings', type: 'textarea', required: false },
      { key: 'additionalNotes', label: 'Additional Notes', placeholder: 'Any additional analysis details or observations', type: 'textarea', required: false },
    ],
    scoring: [
      { key: 'dataQuality', label: 'Data Quality', maxScore: 25 },
      { key: 'analysisDepth', label: 'Analysis Depth', maxScore: 25 },
      { key: 'visualization', label: 'Visualization', maxScore: 25 },
      { key: 'documentation', label: 'Documentation', maxScore: 25 },
    ],
  },
  research: {
    label: 'Research Paper',
    icon: 'fa-scroll',
    color: '#8b5cf6',
    fields: [
      { key: 'googleDocsLink', label: 'Google Doc / Paper URL', placeholder: 'https://docs.google.com/document/d/...', type: 'url', required: true },
      { key: 'abstract', label: 'Abstract', placeholder: 'Write a brief abstract of your research', type: 'textarea', required: true },
      { key: 'references', label: 'References', placeholder: 'List your references and citations', type: 'textarea', required: false },
      { key: 'methodology', label: 'Methodology', placeholder: 'Describe your research methodology and approach', type: 'textarea', required: false },
    ],
    scoring: [
      { key: 'contentQuality', label: 'Content Quality', maxScore: 25 },
      { key: 'analysisDepth', label: 'Analysis Depth', maxScore: 25 },
      { key: 'references', label: 'References', maxScore: 25 },
      { key: 'presentation', label: 'Presentation', maxScore: 25 },
    ],
  },
  presentation: {
    label: 'Presentation',
    icon: 'fa-presentation-screen',
    color: '#f97316',
    fields: [
      { key: 'youtubeLink', label: 'YouTube Video URL', placeholder: 'https://youtu.be/...', type: 'url', required: true },
      { key: 'canvaLink', label: 'Canva / Slides URL', placeholder: 'https://www.canva.com/design/...', type: 'url', required: false },
      { key: 'presentationSummary', label: 'Presentation Summary', placeholder: 'Brief summary of your presentation', type: 'textarea', required: false },
      { key: 'additionalNotes', label: 'Additional Notes', placeholder: 'Any additional context or notes about your presentation', type: 'textarea', required: false },
    ],
    scoring: [
      { key: 'contentQuality', label: 'Content Quality', maxScore: 25 },
      { key: 'delivery', label: 'Delivery', maxScore: 25 },
      { key: 'visuals', label: 'Visuals', maxScore: 25 },
      { key: 'engagement', label: 'Engagement', maxScore: 25 },
    ],
  },
  poster: {
    label: 'Poster Design',
    icon: 'fa-image',
    color: '#a855f7',
    fields: [
      { key: 'googleDocsLink', label: 'Poster Image / Google Drive URL', placeholder: 'https://drive.google.com/file/d/...', type: 'url', required: false },
      { key: 'designDescription', label: 'Design Description', placeholder: 'Describe your poster design concept', type: 'textarea', required: true },
      { key: 'designDecisions', label: 'Design Decisions', placeholder: 'Explain your design choices and visual approach', type: 'textarea', required: false },
    ],
    scoring: [
      { key: 'creativity', label: 'Creativity', maxScore: 25 },
      { key: 'visualDesign', label: 'Visual Design', maxScore: 25 },
      { key: 'contentClarity', label: 'Content Clarity', maxScore: 25 },
      { key: 'impact', label: 'Impact', maxScore: 25 },
    ],
  },
  innovation: {
    label: 'Innovation Challenge',
    icon: 'fa-rocket',
    color: '#ef4444',
    fields: [
      { key: 'problemStatement', label: 'Problem Statement', placeholder: 'Define the problem you are solving', type: 'textarea', required: true },
      { key: 'proposedSolution', label: 'Proposed Solution', placeholder: 'Describe your innovative solution', type: 'textarea', required: true },
      { key: 'keyFeatures', label: 'Key Features', placeholder: 'List the innovative features', type: 'textarea', required: false },
      { key: 'expectedImpact', label: 'Expected Impact', placeholder: 'What is the potential impact?', type: 'textarea', required: false },
      { key: 'additionalNotes', label: 'Additional Notes', placeholder: 'Any additional context or supporting information', type: 'textarea', required: false },
    ],
    scoring: [
      { key: 'innovation', label: 'Innovation', maxScore: 25 },
      { key: 'feasibility', label: 'Feasibility', maxScore: 25 },
      { key: 'impact', label: 'Impact', maxScore: 25 },
      { key: 'presentation', label: 'Presentation', maxScore: 25 },
    ],
  },
};

export const TASK_STATUSES = [
  { value: 'draft', label: 'Draft', color: '#6b7280' },
  { value: 'published', label: 'Published', color: '#3b82f6' },
  { value: 'open', label: 'Open', color: '#10b981' },
  { value: 'closed', label: 'Closed', color: '#f59e0b' },
  { value: 'reviewing', label: 'Reviewing', color: '#8b5cf6' },
  { value: 'completed', label: 'Completed', color: '#16a34a' },
  { value: 'archived', label: 'Archived', color: '#9ca3af' },
];

export const VISIBILITY_OPTIONS = [
  { value: 'all', label: 'All Members' },
  { value: 'first_year', label: 'First Year' },
  { value: 'second_year', label: 'Second Year' },
  { value: 'third_year', label: 'Third Year' },
  { value: 'fourth_year', label: 'Fourth Year' },
  { value: 'core', label: 'Core Team Only' },
  { value: 'departments', label: 'Selected Departments' },
];

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Artificial Intelligence & ML',
  'Data Science',
  'Cyber Security',
  'CSE (IoT)',
  'CSE (BS&CS)',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical',
  'Civil',
];

export const SYSTEM_BADGES = [
  { id: 'first_submission', name: 'First Submission', icon: '🥇', color: '#ffd700', description: 'Submit your first task ever' },
  { id: 'coding_champion', name: 'Coding Champion', icon: '💻', color: '#6366f1', description: 'Score ≥90 on a coding task' },
  { id: 'innovation_master', name: 'Innovation Master', icon: '💡', color: '#f59e0b', description: 'Score ≥90 on an idea/innovation task' },
  { id: 'ai_explorer', name: 'AI Explorer', icon: '🤖', color: '#06b6d4', description: 'Score ≥90 on an AI task' },
  { id: 'design_wizard', name: 'Design Wizard', icon: '🎨', color: '#ec4899', description: 'Score ≥90 on a UI/UX or poster task' },
  { id: 'data_scientist', name: 'Data Scientist', icon: '📊', color: '#10b981', description: 'Score ≥90 on a data science task' },
  { id: 'research_scholar', name: 'Research Scholar', icon: '📄', color: '#8b5cf6', description: 'Score ≥90 on a research task' },
  { id: 'fast_finisher', name: 'Fast Finisher', icon: '🚀', color: '#f97316', description: 'Submit 3+ tasks before deadline' },
  { id: 'task_legend', name: 'Task Legend', icon: '👑', color: '#ffd700', description: 'Complete 10+ tasks with ≥80 avg score' },
  { id: 'streak_master', name: 'Streak Master', icon: '🔥', color: '#ef4444', description: 'Approved submission 10 weeks in a row' },
];

export const BADGE_BONUS_XP = 50;

export function calculateLevel(totalXP) {
  return Math.floor(Math.sqrt(totalXP / 100));
}

export function checkSystemBadgeEligibility(userSubmissions, taskType, taskId) {
  const approvedSubs = userSubmissions.filter(s => s.status === 'approved');
  const totalApproved = approvedSubs.length;

  if (totalApproved === 1) return SYSTEM_BADGES.find(b => b.id === 'first_submission');

  const task = TASK_TYPES[taskType];
  if (!task) return null;

  if (taskType === 'coding') return SYSTEM_BADGES.find(b => b.id === 'coding_champion');
  if (taskType === 'idea' || taskType === 'innovation') return SYSTEM_BADGES.find(b => b.id === 'innovation_master');
  if (taskType === 'ai') return SYSTEM_BADGES.find(b => b.id === 'ai_explorer');
  if (taskType === 'uiux' || taskType === 'poster') return SYSTEM_BADGES.find(b => b.id === 'design_wizard');
  if (taskType === 'datascience') return SYSTEM_BADGES.find(b => b.id === 'data_scientist');
  if (taskType === 'research') return SYSTEM_BADGES.find(b => b.id === 'research_scholar');
  if (totalApproved >= 3) return SYSTEM_BADGES.find(b => b.id === 'fast_finisher');
  if (totalApproved >= 10) return SYSTEM_BADGES.find(b => b.id === 'task_legend');

  return null;
}

export function getFieldDefinitions(taskType) {
  const config = TASK_TYPES[taskType];
  if (!config) return [];
  return config.fields.map(f => ({
    ...f,
    required: f.required || false,
  }));
}

export function getScoringCriteria(taskType) {
  const config = TASK_TYPES[taskType];
  if (!config) return [];
  return config.scoring;
}
