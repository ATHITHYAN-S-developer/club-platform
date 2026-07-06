const randomNames = [
  'Aarav Sharma', 'Vivaan Singh', 'Aditya Patel', 'Vihaan Verma', 'Arjun Gupta',
  'Sai Reddy', 'Dhruv Kumar', 'Reyansh Joshi', 'Ayaan Chatterjee', 'Ishaan Banerjee',
  'Ananya Nair', 'Diya Menon', 'Ishita Desai', 'Kavya Iyer', 'Myra Rajan',
  'Riya Pillai', 'Sara Suresh', 'Tanvi Kulkarni', 'Anika Bhat', 'Priya Naidu',
  'Rohan Pillai', 'Karthik Subramanian', 'Nikhil Agarwal', 'Pranav Deshmukh', 'Siddharth Jain',
  'Rahul Mehta', 'Vikram Rathore', 'Harsh Tiwari', 'Manav Chandra', 'Kunal Saxena',
  'Meera Joshi', 'Neha Kapoor', 'Divya Saxena', 'Aishwarya Rajan', 'Sneha Reddy',
  'Manisha Singh', 'Ashwini Nair', 'Shreya Gupta', 'Ritu Jain', 'Anjali Menon',
  'Vivek Naik', 'Chetan Prasad', 'Manoj Shetty', 'Akash Sinha', 'Surya Prakash',
  'Deepesh Rao', 'Naveen Kumar', 'Gaurav Joshi', 'Pankaj Tripathi', 'Ravi Rathod',
  'Priyanka Sharma', 'Kirti Desai', 'Sonali Mishra', 'Parul Agarwal', 'Sakshi Bhat',
  'Ritika Valmiki', 'Swapna Reddy', 'Bhavana Suresh', 'Amitabh Ghosh', 'Preeti Jain',
  'Harish Babu', 'Anil Kumar', 'Sandeep Nair', 'Mohan Das', 'Umesh Prabhu',
  'Lakshmi Devi', 'Geetha Krishnan', 'Padma Rajan', 'Rani Pillai', 'Kala Varma',
  'Varun Dhawan', 'Arjun Kapoor', 'Siddharth Malhotra', 'Abhishek Raj', 'Suresh Ram',
  'Kiran Acharya', 'Arvind Hegde', 'Pavan Kulkarni', 'Ramesh Bhat', 'Shashank Shenoy',
  'Nandini Rao', 'Deepika Singh', 'Shweta Pandey', 'Kavita Dubey', 'Rajesh Khanna',
  'Mahesh Bhatt', 'Sunil Shetty', 'Akshay Verma', 'Vijay Devarakonda', 'Ram Charan',
  'Shashi Tharoor', 'Amol Palekar', 'Naseer Khan', 'Om Puri', 'Pankaj Kapoor',
  'Rekha Devi', 'Jaya Prada', 'Hema Malini', 'Vani Jairam', 'S Janaki'
];

const colleges = [
  'Indian Institute of Technology Madras', 'Indian Institute of Technology Delhi',
  'Indian Institute of Technology Bombay', 'Indian Institute of Technology Kanpur',
  'Indian Institute of Technology Kharagpur', 'Indian Institute of Technology Roorkee',
  'National Institute of Technology Trichy', 'National Institute of Technology Surathkal',
  'National Institute of Technology Warangal', 'National Institute of Technology Calicut',
  'Vellore Institute of Technology', 'SRM Institute of Technology',
  'BITS Pilani', 'Delhi Technological University',
  'Anna University', 'University of Madras',
  'PSG College of Technology', 'Coimbatore Institute of Technology',
  'Government College of Technology Coimbatore', 'Thiagarajar College of Engineering',
  'Sardar Vallabhbhai National Institute of Technology', 'Visvesvaraya National Institute of Technology',
  'Motilal Nehru National Institute of Technology', 'College of Engineering Guindy',
  'National Institute of Technology Durgapur', 'National Institute of Technology Rourkela',
  'National Institute of Technology Silchar', 'National Institute of Technology Nagaland',
  'National Institute of Technology Goa', 'Pondicherry Engineering College',
];

const departments = [
  'Computer Science Engineering', 'Information Technology',
  'Electronics & Communication', 'Electrical & Electronics',
  'Mechanical Engineering', 'Civil Engineering',
  'Artificial Intelligence & Data Science', 'Computer Applications',
  'Electronics & Instrumentation', 'Aerospace Engineering',
];

const badgesList = [
  { id: 'champion', label: 'Champion', icon: '🏆', desc: 'Achieved the highest overall rank' },
  { id: 'fast_solver', label: 'Fast Solver', icon: '⚡', desc: 'Completed quiz in the shortest time' },
  { id: 'accuracy_100', label: '100% Accuracy', icon: '🎯', desc: 'Answered all questions correctly' },
  { id: 'streak_10', label: '10 Win Streak', icon: '🔥', desc: 'Won 10 quizzes in a row' },
  { id: 'ai_master', label: 'AI Master', icon: '🧠', desc: 'Top scorer in AI & ML quizzes' },
  { id: 'coding_expert', label: 'Coding Expert', icon: '💻', desc: 'Highest score in programming quizzes' },
  { id: 'first_place', label: 'First Place', icon: '🥇', desc: 'Secured 1st place in a quiz event' },
  { id: 'runner_up', label: 'Runner Up', icon: '🥈', desc: 'Secured 2nd place in a quiz event' },
  { id: 'third_place', label: 'Third Place', icon: '🥉', desc: 'Secured 3rd place in a quiz event' },
  { id: 'quiz_whiz', label: 'Quiz Whiz', icon: '📚', desc: 'Participated in 20+ quizzes' },
];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateParticipant(id) {
  const name = randomNames[id % randomNames.length];
  const score = randomInt(40, 100);
  const totalQuestions = 10;
  const correctAnswers = Math.round((score / 100) * totalQuestions);
  const wrongAnswers = randomInt(0, totalQuestions - correctAnswers);
  const skippedQuestions = totalQuestions - correctAnswers - wrongAnswers;
  const accuracy = correctAnswers > 0 ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100) : 0;
  const timeTaken = randomInt(30, 600);

  const earnedBadges = [];
  if (score >= 90) earnedBadges.push('champion', 'first_place');
  if (score >= 100) earnedBadges.push('accuracy_100');
  if (timeTaken <= 60) earnedBadges.push('fast_solver');
  if (score >= 85) earnedBadges.push('quiz_whiz');
  if (id % 5 === 0) earnedBadges.push('streak_10');
  if (id % 3 === 0) earnedBadges.push('ai_master');
  if (id % 4 === 0) earnedBadges.push('coding_expert');
  if (score >= 80 && score < 90) earnedBadges.push('runner_up');
  if (score >= 70 && score < 80) earnedBadges.push('third_place');

  return {
    id: `p_${id + 1}`,
    name,
    email: name.toLowerCase().replace(/\s+/g, '.') + '@college.edu.in',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${['ff5500','3b82f6','10b981','8b5cf6','ec4899'][id % 5]}&color=fff&size=200`,
    college: randomFrom(colleges),
    department: randomFrom(departments),
    year: randomInt(1, 4),
    score,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    skippedQuestions,
    accuracy,
    timeTaken,
    badges: [...new Set(earnedBadges)],
    streak: randomInt(0, 15),
    status: Math.random() > 0.3 ? 'online' : 'offline',
    completedAt: new Date(Date.now() - randomInt(0, 86400000 * 30)).toISOString(),
  };
}

function generateMockData(count = 100) {
  const participants = Array.from({ length: count }, (_, i) => generateParticipant(i));

  participants.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
    return new Date(a.completedAt) - new Date(b.completedAt);
  });

  return participants.map((p, i) => ({ ...p, rank: i + 1 }));
}

const mockData = generateMockData(100);

const eventInfo = {
  name: 'AI Masterclass Grand Quiz 2026',
  totalParticipants: mockData.length,
  totalQuestions: 10,
  highestScore: Math.max(...mockData.map(p => p.score)),
  averageAccuracy: Math.round(mockData.reduce((sum, p) => sum + p.accuracy, 0) / mockData.length),
  fastestTime: Math.min(...mockData.map(p => p.timeTaken)),
};

export { mockData, eventInfo, badgesList };
