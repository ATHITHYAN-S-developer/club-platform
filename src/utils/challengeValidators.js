export function validateChallenge(form) {
  const errors = {};
  if (!form.title?.trim()) errors.title = 'Title is required';
  if (!form.description?.trim()) errors.description = 'Description is required';
  if (!form.constraints?.trim()) errors.constraints = 'Constraints are required';
  if (!form.inputFormat?.trim()) errors.inputFormat = 'Input format is required';
  if (!form.outputFormat?.trim()) errors.outputFormat = 'Output format is required';
  if (!form.hiddenTestCases?.length) errors.hiddenTestCases = 'At least one hidden test case is required';
  if (!form.supportedLanguages?.length) errors.supportedLanguages = 'At least one language must be supported';
  const missingStarter = form.supportedLanguages?.filter(l => !form.starterCode?.[l]?.trim());
  if (missingStarter?.length) errors.starterCode = `Missing starter code for: ${missingStarter.join(', ')}`;
  // Solution code is optional — grading uses test case output comparison, not solution matching
  // Sample explanations are recommended but not required to publish
  if (!form.sampleTestCases?.length) errors.sampleTestCases = 'At least one sample test case is required';
  if (!form.timeLimit || Number(form.timeLimit) < 1) errors.timeLimit = 'Time limit must be at least 1 minute';
  if (!form.memoryLimit || Number(form.memoryLimit) < 16) errors.memoryLimit = 'Memory limit must be at least 16 MB';
  if (!form.xpReward || Number(form.xpReward) < 0) errors.xpReward = 'XP reward must be a non-negative number';
  if (!form.security) errors.security = 'Security configuration is required';
  return errors;
}
