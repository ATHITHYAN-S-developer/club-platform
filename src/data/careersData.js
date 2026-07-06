export const careerTree = {
  id: 'root',
  label: 'Choose Your Career Path',
  icon: 'fa-compass',
  color: '#ff5500',
  details: {
    type: 'root',
    overview: 'Explore the vast landscape of technology careers. Click any branch to dive deeper into what each path offers — from required skills and learning roadmaps to job prospects and salary expectations.',
  },
  children: [
    {
      id: 'software-dev',
      label: 'Software Development',
      icon: 'fa-code',
      color: '#3b82f6',
      details: {
        type: 'career',
        overview: 'Software Development is the foundation of the tech industry. It involves designing, building, testing, and maintaining applications and systems that power everything from mobile apps to enterprise platforms.',
        whyChoose: 'High demand worldwide, excellent salary potential, creative problem-solving, remote work opportunities, and endless learning paths.',
        skills: ['Programming', 'Problem Solving', 'Algorithms', 'Data Structures', 'System Design', 'Version Control', 'Testing', 'Debugging'],
        languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust'],
        frameworks: ['React', 'Angular', 'Vue', 'Django', 'Spring Boot', 'ASP.NET', 'Flask'],
        tools: ['Git', 'Docker', 'VS Code', 'Postman', 'Figma', 'Jira', 'Linux'],
        roadmap: {
          beginner: ['Programming Fundamentals', 'HTML/CSS Basics', 'JavaScript Basics', 'Git & GitHub', 'Responsive Design'],
          intermediate: ['Frontend Framework (React/Vue)', 'Backend Development', 'Databases (SQL/NoSQL)', 'REST APIs', 'Testing'],
          advanced: ['System Design', 'Microservices', 'Cloud Deployment', 'CI/CD', 'Performance Optimization'],
        },
        projects: ['Personal Portfolio', 'Task Manager App', 'E-commerce Platform', 'Social Media Dashboard', 'Real-time Chat Application'],
        certifications: ['Meta Front-End Developer', 'AWS Developer Associate', 'Oracle Java SE', 'Google Professional Developer'],
        companies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify'],
        salary: '$80K - $200K+',
        difficulty: 'Beginner-friendly',
        duration: '3-6 months to job-ready',
        resources: [
          { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', type: 'course' },
          { name: 'The Odin Project', url: 'https://www.theodinproject.com', type: 'course' },
          { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', type: 'docs' },
        ],
        books: ['Clean Code by Robert C. Martin', 'The Pragmatic Programmer', 'You Don\'t Know JS'],
        youtube: ['Traversy Media', 'Fireship', 'Web Dev Simplified', 'The Net Ninja'],
        practice: ['LeetCode', 'HackerRank', 'CodeSignal', 'Exercism'],
        jobRoles: ['Junior Developer', 'Software Engineer', 'Senior Engineer', 'Tech Lead', 'Engineering Manager', 'Architect'],
        futureScope: 'Software development continues to grow with AI-assisted coding, low-code platforms, and increasing demand across all industries.',
      },
      children: [
        {
          id: 'frontend-dev',
          label: 'Frontend Development',
          icon: 'fa-window-maximize',
          color: '#60a5fa',
          details: {
            type: 'career',
            overview: 'Frontend developers build the visual and interactive parts of websites and applications that users see and interact with directly.',
            skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React/Angular/Vue', 'Responsive Design', 'Web Accessibility', 'Performance Optimization'],
            languages: ['HTML', 'CSS', 'JavaScript', 'TypeScript'],
            frameworks: ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js'],
            tools: ['VS Code', 'Chrome DevTools', 'Figma', 'Webpack', 'Vite', 'Jest', 'Cypress'],
            roadmap: {
              beginner: ['HTML Semantics', 'CSS Flexbox/Grid', 'JavaScript DOM', 'Responsive Design', 'Git Basics'],
              intermediate: ['React/Vue/Angular', 'State Management', 'REST APIs', 'Testing', 'TypeScript'],
              advanced: ['SSR/SSG', 'Web Performance', 'Micro Frontends', 'Web Accessibility', 'Animations'],
            },
            projects: ['Personal Portfolio', 'Weather App', 'E-commerce UI', 'Dashboard Interface', 'Music Player'],
            certifications: ['Meta Front-End Developer', 'Google UX Design', 'freeCodeCamp Responsive Web Design'],
            companies: ['Google', 'Meta', 'Airbnb', 'Figma', 'Stripe', 'Shopify'],
            salary: '$75K - $180K',
            difficulty: 'Beginner-friendly',
            duration: '3-6 months',
            resources: [
              { name: 'Frontend Mentor', url: 'https://www.frontendmentor.io', type: 'practice' },
              { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', type: 'docs' },
              { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', type: 'course' },
            ],
            books: ['Eloquent JavaScript', 'CSS Secrets', 'Learning React'],
            youtube: ['Kevin Powell', 'Fireship', 'Traversy Media', 'Coder Coder'],
            practice: ['Frontend Mentor', 'Codewell', 'DevChallenges', 'CodePen'],
            jobRoles: ['Frontend Developer', 'UI Developer', 'React Developer', 'Senior Frontend Engineer', 'Frontend Architect'],
            futureScope: 'Frontend roles continue to grow with WebAssembly, edge computing, and increasingly sophisticated web applications.',
            salary: '$75K - $180K',
            difficulty: 'Beginner-friendly',
            duration: '3-6 months',
          },
        },
        {
          id: 'backend-dev',
          label: 'Backend Development',
          icon: 'fa-server',
          color: '#3b82f6',
          details: {
            type: 'career',
            overview: 'Backend developers build and maintain the server-side logic, databases, and APIs that power applications behind the scenes.',
            skills: ['Server-side Programming', 'API Design', 'Database Management', 'Authentication', 'Caching', 'Message Queues'],
            languages: ['Python', 'JavaScript/Node.js', 'Java', 'Go', 'C#', 'Ruby', 'PHP'],
            frameworks: ['Express.js', 'Django', 'Flask', 'Spring Boot', 'ASP.NET Core', 'Rails', 'Laravel'],
            tools: ['Docker', 'Kubernetes', 'Redis', 'PostgreSQL', 'MongoDB', 'NGINX', 'AWS'],
            roadmap: {
              beginner: ['Programming Language Basics', 'HTTP & REST', 'Basic CRUD API', 'SQL Databases', 'Git'],
              intermediate: ['Authentication & Authorization', 'Testing APIs', 'Caching', 'Docker', 'CI/CD'],
              advanced: ['Microservices', 'Message Queues', 'System Design', 'Cloud Architecture', 'Monitoring'],
            },
            projects: ['REST API Service', 'URL Shortener', 'Blog CMS Backend', 'Real-time Chat Server', 'E-commerce API'],
            certifications: ['AWS Certified Developer', 'MongoDB Associate Developer', 'Google Professional Cloud Developer'],
            companies: ['Google', 'Amazon', 'Netflix', 'Uber', 'Twitter', 'Stripe'],
            salary: '$85K - $200K',
            difficulty: 'Intermediate',
            duration: '4-8 months',
            resources: [
              { name: 'Node.js Docs', url: 'https://nodejs.org/docs', type: 'docs' },
              { name: 'Django Docs', url: 'https://docs.djangoproject.com', type: 'docs' },
              { name: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com', type: 'course' },
            ],
            books: ['Designing Data-Intensive Applications', 'Node.js Design Patterns', 'Clean Architecture'],
            youtube: ['Hussein Nasser', 'Web Dev Simplified', 'Tech With Tim'],
            practice: ['LeetCode', 'HackerRank', 'Codewars', 'System Design Primer'],
            jobRoles: ['Backend Developer', 'API Developer', 'Database Engineer', 'Systems Engineer', 'Backend Architect'],
            futureScope: 'Growing with serverless, edge computing, and real-time data processing demands.',
            salary: '$85K - $200K',
            difficulty: 'Intermediate',
            duration: '4-8 months',
          },
        },
        {
          id: 'fullstack-dev',
          label: 'Full Stack Development',
          icon: 'fa-layer-group',
          color: '#2563eb',
          details: {
            type: 'career',
            overview: 'Full Stack Developers work on both frontend and backend, building complete web applications from scratch. They understand the entire technology stack.',
            skills: ['Frontend Technologies', 'Backend Technologies', 'Database Design', 'DevOps Basics', 'System Design', 'Testing'],
            languages: ['JavaScript', 'TypeScript', 'Python', 'SQL'],
            frameworks: ['React + Express/Next.js', 'Vue + Django', 'Angular + Spring Boot'],
            tools: ['Git', 'Docker', 'VS Code', 'Postman', 'Figma', 'AWS/Azure/GCP'],
            roadmap: {
              beginner: ['HTML/CSS', 'JavaScript', 'Git', 'Basic Backend', 'Basic Database'],
              intermediate: ['Frontend Framework', 'Backend Framework', 'REST APIs', 'Authentication', 'Deployment'],
              advanced: ['System Design', 'Microservices', 'Testing', 'Performance', 'Security'],
            },
            projects: ['E-commerce Platform', 'Social Media App', 'Task Management System', 'Blog Platform', 'Portfolio Builder'],
            certifications: ['Meta Full-Stack Developer', 'IBM Full Stack Developer', 'AWS Developer Associate'],
            companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Startups'],
            salary: '$90K - $220K',
            difficulty: 'Intermediate',
            duration: '6-12 months',
            resources: [
              { name: 'The Odin Project', url: 'https://www.theodinproject.com', type: 'course' },
              { name: 'Full Stack Open', url: 'https://fullstackopen.com', type: 'course' },
              { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', type: 'course' },
            ],
            books: ['Full Stack Development Handbook', 'The Complete Developer', 'Web Development with Node and Express'],
            youtube: ['Traversy Media', 'Fireship', 'Web Dev Simplified', 'Academind'],
            practice: ['Frontend Mentor', 'DevChallenges', 'LeetCode', 'System Design Interview'],
            jobRoles: ['Full Stack Developer', 'Full Stack Engineer', 'Software Engineer', 'Tech Lead'],
            futureScope: 'High demand for full stack skills continues, especially with startups and scale-ups needing versatile engineers.',
            salary: '$90K - $220K',
            difficulty: 'Intermediate',
            duration: '6-12 months',
          },
          children: [
            {
              id: 'mern-stack', label: 'MERN Stack', icon: 'fa-cubes', color: '#22c55e',
              details: {
                type: 'career',
                overview: 'MERN (MongoDB, Express.js, React, Node.js) is one of the most popular full stack JavaScript frameworks. It uses JavaScript across the entire application stack.',
                skills: ['MongoDB', 'Express.js', 'React', 'Node.js', 'JavaScript', 'REST APIs', 'JWT Authentication'],
                languages: ['JavaScript', 'TypeScript', 'SQL (basic)'],
                frameworks: ['React', 'Express.js', 'Next.js', 'Mongoose'],
                tools: ['MongoDB Atlas', 'Postman', 'Git', 'Docker', 'Vercel', 'Netlify'],
                roadmap: {
                  beginner: ['JavaScript Fundamentals', 'HTML/CSS', 'Git', 'Node.js Basics', 'MongoDB Basics'],
                  intermediate: ['React', 'Express.js', 'REST API Design', 'Authentication', 'Deployment'],
                  advanced: ['State Management', 'Testing', 'Next.js', 'GraphQL', 'CI/CD'],
                },
                projects: ['Task Manager API', 'Blog Application', 'E-commerce Platform', 'Real-time Chat App', 'Portfolio CMS'],
                certifications: ['Meta Full-Stack Developer', 'MongoDB Associate Developer', 'AWS Developer Associate'],
                companies: ['Meta', 'Google', 'Netflix', 'Uber', 'Airbnb', 'Startups'],
                salary: '$85K - $200K',
                difficulty: 'Intermediate',
                duration: '4-8 months',
                resources: [
                  { name: 'MERN Stack Tutorial', url: 'https://www.mongodb.com/languages/mern-stack-tutorial', type: 'course' },
                  { name: 'FreeCodeCamp MERN', url: 'https://www.freecodecamp.org', type: 'course' },
                  { name: 'React Docs', url: 'https://react.dev', type: 'docs' },
                ],
                books: ['Fullstack React', 'Pro MERN Stack', 'Node.js Design Patterns'],
                youtube: ['Traversy Media MERN', 'Code with Mosh', 'Web Dev Simplified'],
                practice: ['Frontend Mentor', 'DevChallenges', 'LeetCode', 'HackerRank'],
                jobRoles: ['MERN Stack Developer', 'Full Stack Developer', 'React/Node Developer', 'JavaScript Engineer'],
                futureScope: 'MERN remains among the most in-demand stacks. New tools like tRPC, Prisma, and Next.js extend its capabilities.',
                salary: '$85K - $200K',
                difficulty: 'Intermediate',
                duration: '4-8 months',
              },
              children: [
                { id: 'html', label: 'HTML', icon: 'fa-code', color: '#e34c26', details: { type: 'tech', what: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages and web applications.', why: 'It is the foundation of every website. Every web developer must know HTML to structure content on the web.', prerequisites: ['Basic computer skills', 'Text editor'], concepts: ['Tags & Elements', 'Attributes', 'Forms & Inputs', 'Semantic HTML', 'SEO Basics', 'Accessibility'], projects: ['Personal Portfolio Page', 'Landing Page', 'Blog Layout', 'Survey Form'], docs: 'https://developer.mozilla.org/en-US/docs/Web/HTML', learningTime: '1-2 weeks', resources: [{ name: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', type: 'docs' }, { name: 'freeCodeCamp HTML', url: 'https://www.freecodecamp.org', type: 'course' }], youtube: ['Traversy Media HTML', 'Kevin Powell HTML'], practice: ['Frontend Mentor', 'CodePen'] } },
                { id: 'css', label: 'CSS', icon: 'fa-paint-brush', color: '#1572b6', details: { type: 'tech', what: 'CSS (Cascading Style Sheets) controls the visual presentation of web pages including layout, colors, and fonts.', why: 'CSS brings HTML to life with beautiful designs, responsive layouts, and engaging animations.', prerequisites: ['Basic HTML'], concepts: ['Selectors & Properties', 'Flexbox', 'CSS Grid', 'Responsive Design', 'Animations', 'Custom Properties'], projects: ['Responsive Landing Page', 'CSS Art', 'Dashboard UI', 'Portfolio Design'], docs: 'https://developer.mozilla.org/en-US/docs/Web/CSS', learningTime: '3-6 weeks', resources: [{ name: 'CSS Tricks', url: 'https://css-tricks.com', type: 'docs' }, { name: 'Frontend Mentor', url: 'https://www.frontendmentor.io', type: 'practice' }], youtube: ['Kevin Powell', 'CSS-Tricks', 'Jen Simmons'], practice: ['CSS Battle', 'Frontend Mentor', '100 Days of CSS'] } },
                { id: 'javascript', label: 'JavaScript', icon: 'fa-bolt', color: '#f7df1e', details: { type: 'tech', what: 'JavaScript is a high-level, interpreted programming language that enables dynamic behavior on web pages.', why: 'It powers interactive web experiences and is the most widely-used programming language in the world.', prerequisites: ['Basic HTML & CSS'], concepts: ['Variables & Types', 'Functions & Scope', 'DOM Manipulation', 'Async/Await', 'ES6+ Features', 'Modules'], projects: ['Interactive To-Do List', 'Weather App', 'Calculator', 'Quiz App', 'Memory Game'], docs: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', learningTime: '6-12 weeks', resources: [{ name: 'JavaScript.info', url: 'https://javascript.info', type: 'course' }, { name: 'freeCodeCamp JS', url: 'https://www.freecodecamp.org', type: 'course' }], youtube: ['Traversy Media JS', 'Fireship', 'The Net Ninja', 'Web Dev Simplified'], practice: ['LeetCode', 'Codewars', 'HackerRank', 'Edabit'] } },
                { id: 'react', label: 'React', icon: 'fa-atom', color: '#61dafb', details: { type: 'tech', what: 'React is a JavaScript library for building user interfaces with reusable components.', why: 'It is the most popular frontend library, used by companies like Facebook, Instagram, Netflix, and Airbnb.', prerequisites: ['JavaScript', 'ES6+', 'HTML/CSS'], concepts: ['JSX', 'Components & Props', 'State & Hooks', 'Effects & Refs', 'Context API', 'React Router', 'Testing'], projects: ['Portfolio Site', 'Dashboard App', 'E-commerce Store', 'Social Media Feed'], docs: 'https://react.dev', learningTime: '6-10 weeks', resources: [{ name: 'React Docs', url: 'https://react.dev', type: 'docs' }, { name: 'Full Stack Open', url: 'https://fullstackopen.com', type: 'course' }], youtube: ['Web Dev Simplified React', 'Code with Mosh', 'The Net Ninja'], practice: ['Frontend Mentor React', 'DevChallenges', 'LeetCode React'] } },
                { id: 'nodejs', label: 'Node.js', icon: 'fa-node', color: '#339933', details: { type: 'tech', what: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine for building server-side applications.', why: 'It enables JavaScript on the server, making full-stack development with a single language possible.', prerequisites: ['JavaScript', 'Basic Programming'], concepts: ['Event Loop', 'Modules & npm', 'File System', 'HTTP Server', 'Streams', 'Express.js'], projects: ['REST API Server', 'CLI Tool', 'Real-time Chat Server', 'File Upload Service'], docs: 'https://nodejs.org/docs', learningTime: '4-8 weeks', resources: [{ name: 'Node.js Docs', url: 'https://nodejs.org/docs', type: 'docs' }, { name: 'The Odin Project Node', url: 'https://www.theodinproject.com', type: 'course' }], youtube: ['Traversy Media Node', 'The Net Ninja Node'], practice: ['Codewars', 'HackerRank Node', 'Exercism'] } },
                { id: 'express', label: 'Express.js', icon: 'fa-server', color: '#000000', details: { type: 'tech', what: 'Express.js is a minimal and flexible Node.js web application framework for building APIs and web servers.', why: 'It is the de facto standard for Node.js backend development, used by millions of developers worldwide.', prerequisites: ['Node.js basics', 'JavaScript'], concepts: ['Routing', 'Middleware', 'Request/Response', 'Error Handling', 'Templating', 'RESTful APIs'], projects: ['Blog API', 'Authentication Service', 'E-commerce Backend', 'URL Shortener'], docs: 'https://expressjs.com', learningTime: '3-5 weeks', resources: [{ name: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html', type: 'docs' }, { name: 'MDN Express Tutorial', url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs', type: 'course' }], youtube: ['Traversy Media Express', 'Web Dev Simplified Express'], practice: ['HackerRank Node', 'Codewars'] } },
                { id: 'mongodb', label: 'MongoDB', icon: 'fa-database', color: '#47a248', details: { type: 'tech', what: 'MongoDB is a NoSQL document database that stores data in flexible, JSON-like documents.', why: 'It is the leading NoSQL database, ideal for modern applications with flexible schemas and horizontal scaling.', prerequisites: ['Basic programming', 'Understanding of data'], concepts: ['Documents & Collections', 'CRUD Operations', 'Aggregation Pipeline', 'Indexing', 'Replication', 'Sharding'], projects: ['Product Catalog DB', 'User Profile Store', 'Real-time Analytics'], docs: 'https://www.mongodb.com/docs/', learningTime: '3-5 weeks', resources: [{ name: 'MongoDB University', url: 'https://university.mongodb.com', type: 'course' }, { name: 'MongoDB Docs', url: 'https://www.mongodb.com/docs', type: 'docs' }], youtube: ['MongoDB Official', 'Traversy Media MongoDB'], practice: ['MongoDB Playground', 'Atlas Sample Datasets'] } },
              ]
            },
            {
              id: 'mean-stack', label: 'MEAN Stack', icon: 'fa-cubes', color: '#f5426c',
              details: {
                type: 'career',
                overview: 'MEAN (MongoDB, Express.js, Angular, Node.js) is a full-stack JavaScript framework using Angular for the frontend.',
                skills: ['MongoDB', 'Express.js', 'Angular', 'Node.js', 'TypeScript', 'RxJS'],
                languages: ['TypeScript', 'JavaScript', 'HTML', 'CSS'],
                frameworks: ['Angular', 'Express.js', 'Mongoose'],
                tools: ['Angular CLI', 'MongoDB Atlas', 'Postman', 'Git', 'Docker'],
                roadmap: {
                  beginner: ['TypeScript Basics', 'Angular Components', 'Node.js Basics', 'MongoDB Basics'],
                  intermediate: ['Angular Services & DI', 'Express APIs', 'Authentication', 'Reactive Forms', 'Deployment'],
                  advanced: ['Angular State Management', 'Testing', 'SSR with Angular Universal', 'CI/CD', 'Performance'],
                },
                projects: ['Task Manager', 'Employee Dashboard', 'Customer Portal', 'Real-time Data App'],
                certifications: ['Angular Certification', 'MongoDB Associate', 'AWS Developer'],
                companies: ['Google', 'Microsoft', 'Upwork', 'Enterprise Companies'],
                salary: '$85K - $190K',
                difficulty: 'Intermediate',
                duration: '6-10 months',
                resources: [
                  { name: 'Angular Docs', url: 'https://angular.dev', type: 'docs' },
                  { name: 'MEAN Stack Guide', url: 'https://www.mongodb.com/languages/mean-stack', type: 'course' },
                ],
                books: ['Angular Up & Running', 'Pro MEAN Stack', 'Node.js in Action'],
                youtube: ['Traversy Media MEAN', 'Academind', 'Fireship'],
                practice: ['Frontend Mentor', 'LeetCode', 'Codewars'],
                jobRoles: ['MEAN Stack Developer', 'Angular Developer', 'Full Stack Developer'],
                futureScope: 'Angular remains strong in enterprise applications. MEAN is particularly popular in corporate environments.',
                salary: '$85K - $190K',
                difficulty: 'Intermediate',
                duration: '6-10 months',
              },
            },
            { id: 'django-stack', label: 'Django Stack', icon: 'fa-cubes', color: '#092e20', details: { type: 'career', overview: 'Django Stack uses Python with Django framework for backend and typically integrates with modern frontend frameworks.', whyChoose: 'Python is the fastest-growing language. Django provides batteries-included development with built-in admin, auth, and ORM.', skills: ['Python', 'Django', 'REST APIs', 'PostgreSQL', 'Frontend Basics'], languages: ['Python', 'JavaScript', 'SQL'], frameworks: ['Django', 'Django REST Framework', 'React (optional)'], tools: ['VS Code', 'PostgreSQL', 'Docker', 'Git'], roadmap: { beginner: ['Python Basics', 'Django Models & Views', 'Templates', 'Basic CRUD'], intermediate: ['Django REST Framework', 'Authentication', 'PostgreSQL', 'Testing'], advanced: ['Celery & Async Tasks', 'Django Channels', 'Performance Tuning', 'Deployment'] }, projects: ['Blog Platform', 'E-commerce Site', 'API Backend', 'Content Management System'], certifications: ['Python Institute', 'Django Certification', 'AWS Developer'], companies: ['Instagram', 'Spotify', 'Pinterest', 'Disqus', 'Mozilla'], salary: '$80K - $180K', difficulty: 'Beginner-friendly', duration: '4-8 months', resources: [{ name: 'Django Docs', url: 'https://docs.djangoproject.com', type: 'docs' }, { name: 'MDN Django Tutorial', url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django', type: 'course' }], books: ['Django for Beginners', 'Two Scoops of Django', 'Python Crash Course'], youtube: ['Corey Schafer Django', 'Traversy Media Django', 'Dennis Ivy'], practice: ['Codewars Python', 'LeetCode', 'HackerRank'], jobRoles: ['Django Developer', 'Python Developer', 'Full Stack Developer'], futureScope: 'Python continues to dominate in data science and backend. Django is the go-to for rapid development.', salary: '$80K - $180K', difficulty: 'Beginner-friendly', duration: '4-8 months' } },
            { id: 'spring-boot', label: 'Spring Boot', icon: 'fa-cubes', color: '#6db33f', details: { type: 'career', overview: 'Spring Boot is the leading Java framework for building production-grade microservices and web applications.', whyChoose: 'Dominant in enterprise Java development. Used by banks, fintech, and large-scale systems for its reliability and performance.', skills: ['Java', 'Spring Framework', 'Microservices', 'REST APIs', 'SQL'], languages: ['Java', 'Kotlin', 'SQL'], frameworks: ['Spring Boot', 'Spring Cloud', 'Spring Security', 'Hibernate'], tools: ['IntelliJ IDEA', 'Maven/Gradle', 'PostgreSQL', 'Docker', 'Kubernetes'], roadmap: { beginner: ['Java Basics', 'OOP Concepts', 'Spring Core', 'Spring MVC'], intermediate: ['Spring Boot Auto-config', 'Spring Data JPA', 'Spring Security', 'REST APIs'], advanced: ['Microservices', 'Spring Cloud', 'Message Queues', 'Testing', 'DevOps'] }, projects: ['RESTful API Gateway', 'Banking Application', 'E-commerce Backend', 'Task Management System'], certifications: ['Spring Professional', 'Oracle Java SE', 'AWS Certified Developer'], companies: ['Goldman Sachs', 'JP Morgan', 'Uber', 'Netflix', 'VMware'], salary: '$90K - $200K', difficulty: 'Intermediate', duration: '6-12 months', resources: [{ name: 'Spring.io Guides', url: 'https://spring.io/guides', type: 'docs' }, { name: 'Baeldung', url: 'https://www.baeldung.com', type: 'course' }], books: ['Spring Boot in Action', 'Spring Microservices in Action', 'Effective Java'], youtube: ['Java Brains', 'Baeldung', 'Amigoscode'], practice: ['LeetCode Java', 'HackerRank Java', 'Codewars'], jobRoles: ['Java Developer', 'Spring Boot Developer', 'Microservices Engineer', 'Backend Engineer'], futureScope: 'Enterprise Java with Spring Boot continues to be in high demand, especially in finance, healthcare, and large enterprises.', salary: '$90K - $200K', difficulty: 'Intermediate', duration: '6-12 months' } },
            { id: 'dotnet-stack', label: '.NET Stack', icon: 'fa-cubes', color: '#512bd4', details: { type: 'career', overview: '.NET is Microsoft\'s cross-platform framework for building web, desktop, and cloud applications using C#.', whyChoose: 'Excellent for enterprise applications, strong integration with Azure, and a mature ecosystem with great tooling.', skills: ['C#', 'ASP.NET Core', 'SQL Server', 'Entity Framework', 'Azure'], languages: ['C#', 'F#', 'SQL', 'JavaScript'], frameworks: ['ASP.NET Core', 'Blazor', 'MAUI', 'Entity Framework Core'], tools: ['Visual Studio', 'SQL Server', 'Azure DevOps', 'Docker', 'Git'], roadmap: { beginner: ['C# Basics', 'OOP with C#', 'ASP.NET Core MVC', 'Razor Pages'], intermediate: ['Entity Framework Core', 'Web APIs', 'Authentication', 'Testing'], advanced: ['Blazor', 'Microservices', 'Azure Cloud', 'Performance Optimization'] }, projects: ['Employee Management System', 'Inventory Management', 'Hotel Booking API', 'E-commerce Platform'], certifications: ['Microsoft Certified Azure Developer', 'ASP.NET Certification', 'Azure Solutions Architect'], companies: ['Microsoft', 'Bank of America', 'Dell', 'IBM', 'Accenture'], salary: '$80K - $190K', difficulty: 'Intermediate', duration: '6-10 months', resources: [{ name: 'Microsoft Learn', url: 'https://learn.microsoft.com/dotnet', type: 'course' }, { name: 'ASP.NET Docs', url: 'https://learn.microsoft.com/aspnet', type: 'docs' }], books: ['C# in Depth', 'Pro ASP.NET Core', 'Entity Framework Core in Action'], youtube: ['IAmTimCorey', 'Nick Chapsas', 'Programming with Mosh'], practice: ['Codewars C#', 'LeetCode C#', 'HackerRank C#'], jobRoles: ['.NET Developer', 'C# Developer', 'Azure Developer', 'Software Engineer'], futureScope: '.NET is cross-platform and open-source with strong growth in cloud-native development with Azure.', salary: '$80K - $190K', difficulty: 'Intermediate', duration: '6-10 months' } },
          ]
        },
        {
          id: 'mobile-dev',
          label: 'Mobile App Development',
          icon: 'fa-mobile-screen',
          color: '#f472b6',
          details: {
            type: 'career',
            overview: 'Mobile developers create applications for smartphones and tablets, primarily iOS and Android platforms.',
            skills: ['Swift/Java/Kotlin', 'React Native/Flutter', 'Mobile UI Design', 'App Store Deployment', 'API Integration'],
            languages: ['Swift', 'Kotlin', 'Dart', 'JavaScript', 'TypeScript'],
            frameworks: ['React Native', 'Flutter', 'SwiftUI', 'Jetpack Compose', 'Xamarin'],
            tools: ['Xcode', 'Android Studio', 'Figma', 'Firebase', 'Expo', 'TestFlight'],
            roadmap: {
              beginner: ['Programming Fundamentals', 'Mobile UI Basics', 'Navigation', 'State Management'],
              intermediate: ['API Integration', 'Local Storage', 'Authentication', 'App Deployment'],
              advanced: ['Performance Optimization', 'Offline Support', 'Push Notifications', 'CI/CD'],
            },
            projects: ['Weather App', 'Fitness Tracker', 'Social Media App', 'Food Delivery App', 'Budget Manager'],
            certifications: ['Meta Android Developer', 'Meta iOS Developer', 'Google Associate Android Developer'],
            companies: ['Google', 'Apple', 'Meta', 'Uber', 'Snapchat', 'TikTok'],
            salary: '$85K - $200K',
            difficulty: 'Intermediate',
            duration: '4-8 months',
            resources: [
              { name: 'Apple Developer Documentation', url: 'https://developer.apple.com', type: 'docs' },
              { name: 'Android Developers', url: 'https://developer.android.com', type: 'docs' },
              { name: 'Flutter Docs', url: 'https://flutter.dev', type: 'docs' },
            ],
            books: ['iOS Programming: The Big Nerd Ranch Guide', 'Android Programming: The Big Nerd Ranch Guide', 'Flutter Complete Reference'],
            youtube: ['CodeWithChris', 'Philipp Lackner', 'The Net Ninja Flutter', 'Mitch Koko'],
            practice: ['LeetCode', 'HackerRank', 'Codewars'],
            jobRoles: ['iOS Developer', 'Android Developer', 'React Native Developer', 'Flutter Developer', 'Mobile Engineer'],
            futureScope: 'Mobile development continues strong with cross-platform tools like Flutter and React Native reducing development time.',
            salary: '$85K - $200K',
            difficulty: 'Intermediate',
            duration: '4-8 months',
          },
        },
      ]
    },
    {
      id: 'ai-ml',
      label: 'Artificial Intelligence',
      icon: 'fa-brain',
      color: '#a855f7',
      details: {
        type: 'career',
        overview: 'Artificial Intelligence is revolutionizing every industry. AI engineers build systems that can learn, reason, and make decisions.',
        whyChoose: 'AI is the most transformative technology of our era. Groundbreaking innovations, high salaries, intellectual challenges, and impact across every field.',
        skills: ['Programming', 'Mathematics', 'Statistics', 'Machine Learning', 'Deep Learning', 'Problem Solving', 'Research'],
        languages: ['Python', 'R', 'SQL', 'Julia'],
        frameworks: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'Hugging Face', 'LangChain'],
        tools: ['Jupyter', 'Docker', 'Kubernetes', 'MLflow', 'Weights & Biases', 'Git'],
        roadmap: {
          beginner: ['Python Programming', 'Mathematics & Statistics', 'Data Analysis', 'Basic ML Algorithms', 'Jupyter Notebooks'],
          intermediate: ['Deep Learning', 'Neural Networks', 'CNN/RNN', 'NLP Basics', 'Computer Vision'],
          advanced: ['Transformers', 'Generative AI', 'MLOps', 'Production ML', 'Research'],
        },
        projects: ['Image Classifier', 'Sentiment Analysis', 'Chatbot', 'Recommendation System', 'Object Detection'],
        certifications: ['AWS ML Specialty', 'Google TensorFlow Certificate', 'Azure AI Engineer', 'NVIDIA DLI'],
        companies: ['Google DeepMind', 'OpenAI', 'Meta AI', 'Microsoft Research', 'Anthropic', 'Scale AI'],
        salary: '$110K - $250K+',
        difficulty: 'Advanced',
        duration: '8-14 months',
        resources: [
          { name: 'Fast.ai', url: 'https://www.fast.ai', type: 'course' },
          { name: 'CS229 Stanford', url: 'https://cs229.stanford.edu', type: 'course' },
          { name: 'DeepLearning.AI', url: 'https://www.deeplearning.ai', type: 'course' },
        ],
        books: ['Hands-On ML with Scikit-Learn & TensorFlow', 'Deep Learning by Goodfellow', 'Pattern Recognition and ML'],
        youtube: ['3Blue1Brown', 'Sentdex', 'Two Minute Papers', 'Yannic Kilcher'],
        practice: ['Kaggle', 'LeetCode', 'DrivenData', 'Papers With Code'],
        jobRoles: ['AI Engineer', 'ML Engineer', 'AI Researcher', 'MLOps Engineer', 'AI Product Manager'],
        futureScope: 'AI is experiencing explosive growth. AGI research, generative AI, and AI safety are emerging frontiers.',
        salary: '$110K - $250K+',
        difficulty: 'Advanced',
        duration: '8-14 months',
      },
      children: [
        {
          id: 'ai-developer', label: 'AI Developer', icon: 'fa-robot', color: '#a855f7',
          details: { type: 'career', overview: 'AI Developers build intelligent applications that leverage machine learning models to solve real-world problems.', skills: ['Python', 'API Development', 'ML Integration', 'Prompt Engineering', 'RAG Systems'], languages: ['Python', 'JavaScript', 'TypeScript'], frameworks: ['LangChain', 'LlamaIndex', 'Hugging Face', 'OpenAI API'], tools: ['Docker', 'Vector DBs', 'Git', 'Weights & Biases'], roadmap: { beginner: ['Python', 'APIs', 'Basic ML Concepts'], intermediate: ['LLM Integration', 'Prompt Engineering', 'Vector Databases', 'RAG'], advanced: ['Fine-tuning', 'Agent Systems', 'Evaluation', 'Production AI'] }, projects: ['AI Chatbot', 'Document Q&A System', 'Code Assistant', 'Content Generator'], certifications: ['OpenAI Developer', 'Hugging Face Course', 'DeepLearning.AI'], companies: ['OpenAI', 'Anthropic', 'Cohere', 'Startups'], salary: '$100K - $220K', difficulty: 'Intermediate', duration: '6-10 months', resources: [{ name: 'OpenAI Docs', url: 'https://platform.openai.com/docs', type: 'docs' }, { name: 'LangChain Docs', url: 'https://python.langchain.com', type: 'docs' }], books: ['Generative AI with Python', 'AI Engineering'], youtube: ['AI Engineering Hub', 'Samuel Chan'], practice: ['Kaggle', 'GitHub AI Projects'], jobRoles: ['AI Developer', 'AI Application Engineer', 'LLM Engineer'], futureScope: 'Growing rapidly with enterprise AI adoption. AI developers bridge the gap between ML models and production applications.' } },
        {
          id: 'ml-engineer', label: 'Machine Learning Engineer', icon: 'fa-chart-line', color: '#9333ea',
          details: { type: 'career', overview: 'ML Engineers design, build, and deploy machine learning models at scale. They combine software engineering with data science.', skills: ['Python', 'Mathematics', 'Statistics', 'ML Algorithms', 'Model Deployment', 'MLOps'], languages: ['Python', 'R', 'SQL', 'C++'], frameworks: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'XGBoost', 'Keras'], tools: ['Docker', 'Kubernetes', 'MLflow', 'Airflow', 'AWS SageMaker', 'Git'], roadmap: { beginner: ['Python', 'Linear Algebra', 'Statistics', 'Pandas/NumPy', 'Basic ML Algorithms'], intermediate: ['Deep Learning', 'TensorFlow/PyTorch', 'Feature Engineering', 'Model Evaluation', 'Hyperparameter Tuning'], advanced: ['MLOps', 'CI/CD for ML', 'Model Monitoring', 'Distributed Training', 'Research'] }, projects: ['House Price Predictor', 'Image Classification', 'Customer Churn Model', 'Recommendation Engine', 'Fraud Detection'], certifications: ['AWS ML Specialty', 'Google TensorFlow', 'Azure AI Engineer', 'SAS ML Certification'], companies: ['Google', 'Meta', 'Amazon', 'Netflix', 'Spotify', 'Uber', 'Apple'], salary: '$120K - $230K', difficulty: 'Advanced', duration: '8-12 months', resources: [{ name: 'Andrew Ng ML Course', url: 'https://www.coursera.org/learn/machine-learning', type: 'course' }, { name: 'Fast.ai', url: 'https://www.fast.ai', type: 'course' }, { name: 'CS229 Stanford', url: 'https://cs229.stanford.edu', type: 'course' }], books: ['Hands-On ML with Scikit-Learn & TensorFlow', 'Pattern Recognition and ML by Bishop'], youtube: ['StatQuest', 'Sentdex', '3Blue1Brown', 'Yannic Kilcher'], practice: ['Kaggle', 'ML Olympiad', 'Papers With Code'], jobRoles: ['ML Engineer', 'Machine Learning Engineer', 'ML Infrastructure Engineer', 'ML Architect'], futureScope: 'Explosive growth expected. MLOps and production ML are becoming essential as more companies deploy AI systems.' } },
        {
          id: 'dl-engineer', label: 'Deep Learning Engineer', icon: 'fa-layer-group', color: '#7c3aed',
          details: { type: 'career', overview: 'Deep Learning Engineers specialize in neural networks with many layers, working on complex problems like image recognition and natural language processing.', skills: ['Neural Networks', 'Computer Vision', 'NLP', 'TensorFlow/PyTorch', 'GPU Programming'], languages: ['Python', 'C++', 'CUDA'], frameworks: ['PyTorch', 'TensorFlow', 'JAX', 'Keras', 'ONNX'], tools: ['CUDA', 'Docker', 'Weights & Biases', 'GCP/AWS'], roadmap: { beginner: ['Python', 'Linear Algebra', 'Calculus', 'Basic Neural Networks'], intermediate: ['CNN', 'RNN/LSTM', 'Transfer Learning', 'GANs', 'Attention'], advanced: ['Transformers', 'Diffusion Models', 'Distributed Training', 'Model Optimization', 'Research'] }, projects: ['Image Segmentation', 'Neural Style Transfer', 'Speech Recognition', 'Video Generation'], certifications: ['NVIDIA DLI', 'DeepLearning.AI Specialization', 'Google TensorFlow'], companies: ['NVIDIA', 'OpenAI', 'Google Brain', 'Meta AI', 'Tesla'], salary: '$130K - $260K', difficulty: 'Advanced', duration: '10-16 months', resources: [{ name: 'Deep Learning Specialization', url: 'https://www.deeplearning.ai', type: 'course' }, { name: 'CS231n Stanford', url: 'http://cs231n.stanford.edu', type: 'course' }], books: ['Deep Learning by Goodfellow', 'Neural Networks and Deep Learning'], youtube: ['Andrej Karpathy', 'Yannic Kilcher', 'Sentdex'], practice: ['Kaggle Deep Learning', 'Papers With Code', 'Research Papers'], jobRoles: ['Deep Learning Engineer', 'DL Researcher', 'AI Research Scientist'], futureScope: 'Cutting-edge field with ongoing breakthroughs. Foundation models, diffusion models, and multimodal AI are key frontiers.' } },
        { id: 'nlp-engineer', label: 'NLP Engineer', icon: 'fa-language', color: '#8b5cf6', details: { type: 'career', overview: 'NLP Engineers build systems that understand, interpret, and generate human language — from chatbots to translation systems.', skills: ['Linguistics', 'Transformer Models', 'Text Processing', 'Python', 'LLM Fine-tuning'], languages: ['Python', 'SQL'], frameworks: ['Hugging Face', 'spaCy', 'NLTK', 'Transformers', 'LangChain'], tools: ['Jupyter', 'Docker', 'Weights & Biases', 'Elasticsearch'], roadmap: { beginner: ['Python', 'Text Preprocessing', 'Regex', 'Basic NLP with NLTK'], intermediate: ['Word Embeddings', 'RNN/LSTM for Text', 'Transformers', 'Hugging Face'], advanced: ['LLM Fine-tuning', 'RAG Systems', 'Multilingual NLP', 'Model Evaluation'] }, projects: ['Sentiment Analyzer', 'Text Summarizer', 'Question Answering System', 'Chatbot', 'Language Translator'], certifications: ['NLP Specialization DeepLearning.AI', 'Hugging Face NLP Course'], companies: ['Google', 'Meta', 'OpenAI', 'Grammarly', 'Duolingo', 'Amazon Alexa'], salary: '$115K - $230K', difficulty: 'Advanced', duration: '8-12 months', resources: [{ name: 'Hugging Face NLP Course', url: 'https://huggingface.co/learn/nlp-course', type: 'course' }, { name: 'CS224n Stanford', url: 'https://web.stanford.edu/class/cs224n', type: 'course' }], books: ['Speech and Language Processing by Jurafsky', 'NLP with Python'], youtube: ['Hugging Face', 'Yannic Kilcher', 'StatQuest'], practice: ['Kaggle NLP', 'Papers With Code NLP'], jobRoles: ['NLP Engineer', 'NLU Engineer', 'AI Research Scientist NLP'], futureScope: 'Critical with the rise of LLMs and generative AI. NLP is at the heart of the current AI revolution.' } },
        { id: 'cv-engineer', label: 'Computer Vision Engineer', icon: 'fa-eye', color: '#d946ef', details: { type: 'career', overview: 'Computer Vision Engineers build systems that can interpret visual information from images and videos.', skills: ['Image Processing', 'Deep Learning', 'Object Detection', 'OpenCV', 'Feature Extraction'], languages: ['Python', 'C++', 'CUDA'], frameworks: ['OpenCV', 'PyTorch', 'TensorFlow', 'Detectron2', 'YOLO'], tools: ['LabelImg', 'FiftyOne', 'CUDA', 'ONNX'], roadmap: { beginner: ['Python', 'Image Processing Basics', 'OpenCV Fundamentals', 'Linear Algebra'], intermediate: ['CNN Architectures', 'Object Detection', 'Image Segmentation', 'Transfer Learning'], advanced: ['Video Analytics', '3D Vision', 'GANs', 'Multi-modal Models', 'Model Deployment'] }, projects: ['Face Detection System', 'License Plate Recognition', 'Medical Image Analysis', 'AR Filter Application'], certifications: ['NVIDIA Computer Vision', 'DeepLearning.AI CV', 'OpenCV Certification'], companies: ['Tesla', 'Waymo', 'OpenAI', 'Meta', 'Apple', 'NVIDIA', 'Canva'], salary: '$120K - $250K', difficulty: 'Advanced', duration: '10-14 months', resources: [{ name: 'CS231n Stanford', url: 'http://cs231n.stanford.edu', type: 'course' }, { name: 'OpenCV Docs', url: 'https://docs.opencv.org', type: 'docs' }], books: ['Computer Vision: Algorithms and Applications', 'Deep Learning for Computer Vision'], youtube: ['Computer Vision with Horea', 'First Principles of Computer Vision'], practice: ['Kaggle CV', 'Papers With Code CV', 'VisDrone'], jobRoles: ['CV Engineer', 'Computer Vision Engineer', 'Visual AI Engineer'], futureScope: 'Autonomous vehicles, medical imaging, AR/VR, and visual search are driving massive demand.' } },
        { id: 'gen-ai-engineer', label: 'Generative AI Engineer', icon: 'fa-wand-magic-sparkles', color: '#c026d3', details: { type: 'career', overview: 'Generative AI Engineers build applications using LLMs, image generators, and other generative models to create content.', skills: ['Prompt Engineering', 'RAG Systems', 'LLM Fine-tuning', 'Agent Frameworks', 'Evaluation'], languages: ['Python', 'TypeScript'], frameworks: ['LangChain', 'LlamaIndex', 'Autogen', 'CrewAI', 'Stable Diffusion'], tools: ['Vector DBs', 'Docker', 'Weights & Biases', 'OpenAI API'], roadmap: { beginner: ['Python', 'Prompt Engineering', 'API Integration', 'Git'], intermediate: ['RAG Architecture', 'Vector Databases', 'LangChain', 'Fine-tuning'], advanced: ['Multi-agent Systems', 'Evaluation', 'RLHF', 'Production AI', 'Security'] }, projects: ['AI Content Writer', 'Document Q&A', 'Code Assistant', 'Image Generator', 'AI Workflow Automation'], certifications: ['OpenAI Developer', 'LangChain Academy', 'Hugging Face Course'], companies: ['OpenAI', 'Anthropic', 'Midjourney', 'Runway', 'Stability AI', 'Startups'], salary: '$130K - $300K+', difficulty: 'Advanced', duration: '6-10 months', resources: [{ name: 'LangChain Docs', url: 'https://python.langchain.com', type: 'docs' }, { name: 'OpenAI Cookbook', url: 'https://cookbook.openai.com', type: 'docs' }], books: ['Generative AI with LangChain', 'AI Engineering'], youtube: ['AI Engineering Hub', 'Samuel Chan', 'Prompt Engineering'], practice: ['GitHub AI Projects', 'Kaggle LLMs'], jobRoles: ['Gen AI Engineer', 'AI Application Engineer', 'LLM Engineer', 'Prompt Engineer'], futureScope: 'Fastest-growing area in AI. Enterprise adoption of generative AI is accelerating rapidly.' } },
        { id: 'prompt-engineer', label: 'Prompt Engineer', icon: 'fa-keyboard', color: '#e879f9', details: { type: 'career', overview: 'Prompt Engineers design and optimize prompts to get the best outputs from large language models and AI systems.', skills: ['Prompt Design', 'LLM Behavior', 'Context Management', 'Evaluation', 'Problem Decomposition'], languages: ['Python', 'Markdown'], frameworks: ['LangChain', 'OpenAI API', 'Anthropic API'], tools: ['Prompt Templates', 'Vector DBs', 'A/B Testing Tools'], roadmap: { beginner: ['Understand LLM Capabilities', 'Basic Prompt Patterns', 'Markdown'], intermediate: ['Advanced Prompting', 'Chain-of-Thought', 'Few-shot Learning', 'Testing'], advanced: ['System Prompts', 'ReAct Patterns', 'Automated Prompt Optimization', 'Evaluation'] }, projects: ['Customer Support Bot', 'Content Generator', 'Code Assistant Prompt', 'Educational Tutor'], certifications: ['OpenAI Prompt Engineering', 'DeepLearning.AI Prompt Engineering'], companies: ['OpenAI', 'Anthropic', 'Google', 'Microsoft', 'Consulting Firms'], salary: '$80K - $200K', difficulty: 'Beginner-friendly', duration: '1-3 months', resources: [{ name: 'OpenAI Prompt Engineering Guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering', type: 'docs' }, { name: 'Learn Prompting', url: 'https://learnprompting.org', type: 'course' }], books: ['The Art of Prompt Engineering'], youtube: ['Prompt Engineering Hub', 'Matt Wolfe'], practice: ['GitHub Prompt Engineering', 'Anthropic Cookbook'], jobRoles: ['Prompt Engineer', 'AI Interaction Designer', 'LLM Prompt Specialist'], futureScope: 'Evolving field. As AI agents and complex workflows emerge, prompt engineering is becoming a core AI skill.' } },
      ]
    },
    {
      id: 'data-science',
      label: 'Data Science',
      icon: 'fa-chart-bar',
      color: '#22c55e',
      details: {
        type: 'career',
        overview: 'Data Science combines statistics, programming, and domain expertise to extract insights from data and drive decision-making.',
        whyChoose: 'High demand across all industries, excellent salaries, intellectually rewarding work, and the ability to drive business impact through data.', skills: ['Statistics', 'Programming', 'Data Visualization', 'Machine Learning', 'SQL', 'Storytelling'], languages: ['Python', 'R', 'SQL'], frameworks: ['Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'Seaborn', 'Plotly'], tools: ['Jupyter', 'Tableau', 'Power BI', 'Excel', 'SQL', 'Airflow'], roadmap: { beginner: ['Python for Data Analysis', 'Statistics Fundamentals', 'SQL', 'Data Cleaning', 'Data Visualization'], intermediate: ['Machine Learning', 'Feature Engineering', 'A/B Testing', 'Big Data Tools'], advanced: ['Deep Learning', 'MLOps', 'Experiment Design', 'Data Architecture'] }, projects: ['Exploratory Data Analysis', 'Customer Segmentation', 'Sales Forecasting', 'A/B Test Analysis', 'Dashboard Building'], certifications: ['Google Data Analytics', 'IBM Data Science', 'Azure Data Scientist', 'Tableau Desktop Specialist'], companies: ['Google', 'Amazon', 'Meta', 'Netflix', 'Spotify', 'Airbnb', 'LinkedIn'], salary: '$90K - $200K', difficulty: 'Intermediate', duration: '6-12 months', resources: [{ name: 'DataCamp', url: 'https://www.datacamp.com', type: 'course' }, { name: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', type: 'course' }, { name: 'StatQuest', url: 'https://www.youtube.com/user/joshstarmer', type: 'youtube' }], books: ['Python for Data Analysis', 'Storytelling with Data', 'Naked Statistics'], youtube: ['StatQuest', 'Data School', 'Alex The Analyst', 'Ken Jee'], practice: ['Kaggle', 'DrivenData', 'StrataScratch'], jobRoles: ['Data Analyst', 'Data Scientist', 'Senior Data Scientist', 'Data Science Manager'], futureScope: 'Continued high growth as more companies become data-driven. AutoML and causal inference are emerging specialties.' },
      children: [
        { id: 'data-analyst', label: 'Data Analyst', icon: 'fa-magnifying-glass-chart', color: '#4ade80', details: { type: 'career', overview: 'Data Analysts collect, process, and analyze data to help organizations make informed decisions.', skills: ['SQL', 'Excel', 'Data Visualization', 'Statistics', 'Python/R', 'Reporting'], languages: ['SQL', 'Python', 'R'], frameworks: ['Pandas', 'NumPy', 'Matplotlib', 'Tableau', 'Power BI'], tools: ['Excel', 'Tableau', 'Power BI', 'Looker', 'Google Analytics'], roadmap: { beginner: ['SQL Basics', 'Excel Advanced', 'Basic Statistics', 'Data Cleaning'], intermediate: ['Python Pandas', 'Tableau', 'Statistical Analysis', 'Dashboard Creation'], advanced: ['Automation', 'Big Data', 'Machine Learning Basics', 'Data Storytelling'] }, projects: ['Sales Dashboard', 'Customer Analytics', 'Marketing ROI Analysis', 'Financial Reporting System'], certifications: ['Google Data Analytics', 'Microsoft Power BI', 'Tableau Desktop Specialist'], companies: ['Google', 'Amazon', 'Microsoft', 'Deloitte', 'PwC', 'JPMorgan'], salary: '$60K - $130K', difficulty: 'Beginner-friendly', duration: '3-6 months', resources: [{ name: 'Google Data Analytics Course', url: 'https://www.coursera.org/professional-certificates/google-data-analytics', type: 'course' }, { name: 'DataCamp', url: 'https://www.datacamp.com', type: 'course' }], books: ['Storytelling with Data', 'Python for Data Analysis'], youtube: ['Alex The Analyst', 'Luke Barousse', 'Data with Zach'], practice: ['StrataScratch', 'Mode Analytics SQL', 'Kaggle'], jobRoles: ['Data Analyst', 'Business Analyst', 'BI Analyst', 'Reporting Analyst'], futureScope: 'Entry-level gateway into data field. Automation is shifting focus toward insight generation and communication.' } },
        { id: 'data-scientist', label: 'Data Scientist', icon: 'fa-flask', color: '#22c55e', details: { type: 'career', overview: 'Data Scientists build predictive models, design experiments, and uncover insights from complex datasets.', skills: ['Machine Learning', 'Statistics', 'Python/R', 'SQL', 'Deep Learning', 'Experimental Design'], languages: ['Python', 'R', 'SQL'], frameworks: ['Scikit-learn', 'TensorFlow', 'PyTorch', 'Pandas', 'XGBoost'], tools: ['Jupyter', 'Docker', 'Airflow', 'MLflow', 'AWS/GCP'], roadmap: { beginner: ['Python', 'Statistics', 'SQL', 'Data Manipulation', 'Basic ML'], intermediate: ['Advanced ML', 'Deep Learning', 'Feature Engineering', 'Model Evaluation'], advanced: ['MLOps', 'Experiment Design', 'Research', 'Domain Expertise'] }, projects: ['Churn Prediction', 'Fraud Detection', 'Recommendation System', 'Demand Forecasting'], certifications: ['IBM Data Science', 'AWS ML Specialty', 'Google Professional Data Scientist'], companies: ['Google', 'Meta', 'Netflix', 'Airbnb', 'Uber', 'LinkedIn'], salary: '$100K - $200K', difficulty: 'Advanced', duration: '8-14 months', resources: [{ name: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', type: 'course' }, { name: 'DataCamp DS Track', url: 'https://www.datacamp.com', type: 'course' }], books: ['Introduction to Statistical Learning', 'Python for Data Science Handbook'], youtube: ['StatQuest', 'Ken Jee', 'Data School'], practice: ['Kaggle', 'DrivenData'], jobRoles: ['Data Scientist', 'Senior Data Scientist', 'Principal Data Scientist'], futureScope: 'Growing with AutoML handling routine modeling, shifting focus to problem framing and business impact.' } },
        { id: 'data-engineer', label: 'Data Engineer', icon: 'fa-database', color: '#16a34a', details: { type: 'career', overview: 'Data Engineers build and maintain the infrastructure that enables data collection, storage, and analysis at scale.', skills: ['SQL', 'Python', 'ETL Pipelines', 'Big Data Tools', 'Cloud Platforms', 'Data Warehousing'], languages: ['Python', 'SQL', 'Java', 'Scala'], frameworks: ['Apache Spark', 'Apache Airflow', 'dbt', 'Kafka', 'Flink'], tools: ['Snowflake', 'BigQuery', 'Redshift', 'Databricks', 'Docker'], roadmap: { beginner: ['SQL Advanced', 'Python', 'PostgreSQL', 'Linux', 'Git'], intermediate: ['ETL Pipelines', 'Apache Spark', 'Airflow', 'Cloud Data Services', 'Dbt'], advanced: ['Stream Processing', 'Data Lake Architecture', 'Kubernetes', 'Data Governance'] }, projects: ['Data Pipeline from API to Warehouse', 'Real-time Streaming Pipeline', 'Data Lake Implementation', 'Dashboard Backend'], certifications: ['Google Professional Data Engineer', 'AWS Data Analytics', 'Azure Data Engineer', 'Databricks Certification'], companies: ['Google', 'Amazon', 'Netflix', 'Snowflake', 'Databricks', 'Uber'], salary: '$100K - $200K', difficulty: 'Intermediate', duration: '6-12 months', resources: [{ name: 'Data Engineering Cookbook', url: 'https://github.com/andkret/Cookbook', type: 'course' }, { name: 'DataTalksClub DE Zoomcamp', url: 'https://github.com/DataTalksClub/data-engineering-zoomcamp', type: 'course' }], books: ['The Data Warehouse Toolkit', 'Designing Data-Intensive Applications'], youtube: ['Seattle Data Guy', 'Data Engineering Show', 'Andreas Kretz'], practice: ['LeetCode SQL', 'HackerRank SQL', 'GitHub Data Engineering Projects'], jobRoles: ['Data Engineer', 'Big Data Engineer', 'Data Infrastructure Engineer', 'Analytics Engineer'], futureScope: 'Critical infrastructure role. Growing with data mesh, data lakehouse, and real-time analytics trends.' } },
        { id: 'bi-developer', label: 'Business Intelligence', icon: 'fa-chart-simple', color: '#4ade80', details: { type: 'career', overview: 'BI Developers design and build dashboards, reports, and analytics solutions that help organizations track performance.', skills: ['SQL', 'Data Visualization', 'ETL', 'Dashboard Design', 'Data Modeling'], languages: ['SQL', 'Python'], frameworks: ['Tableau', 'Power BI', 'Looker', 'dbt'], tools: ['Snowflake', 'BigQuery', 'Excel', 'DAX', 'MDX'], roadmap: { beginner: ['SQL', 'Excel Advanced', 'Basic Visualization', 'Data Modeling'], intermediate: ['Tableau/Power BI', 'ETL', 'DAX', 'Dashboard Design'], advanced: ['Data Warehousing', 'Performance Tuning', 'Governance', 'Executive Dashboards'] }, projects: ['Executive Dashboard', 'Sales Analytics Platform', 'HR Metrics Dashboard', 'Financial Reports'], certifications: ['Tableau Desktop Specialist', 'Power BI Data Analyst', 'LookML Developer'], companies: ['Amazon', 'Microsoft', 'Deloitte', 'KPMG', 'Walmart', 'Uber'], salary: '$70K - $150K', difficulty: 'Beginner-friendly', duration: '3-6 months', resources: [{ name: 'Power BI Learning', url: 'https://learn.microsoft.com/power-bi', type: 'course' }, { name: 'Tableau Training', url: 'https://www.tableau.com/learn', type: 'course' }], books: ['The Big Book of Dashboards', 'Storytelling with Data'], youtube: ['SQLBI', 'Enterprise DNA', 'Tableau Tim'], practice: ['MakeOverMonday', 'Workout Wednesday'], jobRoles: ['BI Developer', 'BI Analyst', 'Tableau Developer', 'Power BI Developer'], futureScope: 'BI evolving with embedded analytics, natural language querying, and AI-powered insights.' } },
      ]
    },
    {
      id: 'cloud-computing',
      label: 'Cloud Computing',
      icon: 'fa-cloud',
      color: '#06b6d4',
      details: {
        type: 'career',
        overview: 'Cloud Computing delivers computing services over the internet, enabling on-demand access to servers, storage, databases, and applications.',
        whyChoose: 'Every company is moving to the cloud. Cloud skills are among the most in-demand with excellent compensation.',
        skills: ['Cloud Platforms', 'Infrastructure as Code', 'Containerization', 'Networking', 'Security', 'Automation'],
        languages: ['Python', 'Go', 'JavaScript', 'YAML', 'HCL'],
        frameworks: ['Terraform', 'CloudFormation', 'Kubernetes', 'Helm'],
        tools: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI'],
        roadmap: {
          beginner: ['Cloud Fundamentals', 'Linux Basics', 'Networking Basics', 'One Cloud Platform (AWS/Azure/GCP)'],
          intermediate: ['Compute Services', 'Storage & Databases', 'Networking & CDN', 'Security & IAM', 'Containers'],
          advanced: ['Multi-cloud Architecture', 'Microservices', 'CI/CD Pipelines', 'Cost Optimization', 'Compliance'],
        },
        projects: ['Scalable Web App on Cloud', 'Serverless API', 'CI/CD Pipeline', 'Kubernetes Cluster', 'Cloud Migration'],
        certifications: ['AWS Solutions Architect', 'Azure Solutions Architect', 'Google Cloud Architect', 'Kubernetes CKA'],
        companies: ['AWS', 'Microsoft', 'Google', 'Netflix', 'Spotify', 'Capital One'],
        salary: '$100K - $220K',
        difficulty: 'Intermediate',
        duration: '6-10 months',
        resources: [
          { name: 'AWS Free Tier', url: 'https://aws.amazon.com/free', type: 'practice' },
          { name: 'Google Cloud Skills Boost', url: 'https://www.cloudskillsboost.google', type: 'course' },
          { name: 'Azure Learn', url: 'https://learn.microsoft.com/azure', type: 'course' },
        ],
        books: ['AWS Well-Architected Framework', 'The Phoenix Project', 'Site Reliability Engineering'],
        youtube: ['TechWorld with Nana', 'Fireship Cloud', 'Cloud Advocate', 'Be A Better Dev'],
        practice: ['AWS Cloud Quest', 'Cloud Academy Labs', 'Qwiklabs', 'Katacoda'],
        jobRoles: ['Cloud Engineer', 'Solutions Architect', 'DevOps Engineer', 'Cloud Architect', 'SRE'],
        futureScope: 'Cloud adoption continues accelerating. Edge computing, serverless, and multi-cloud are major trends.',
        salary: '$100K - $220K',
        difficulty: 'Intermediate',
        duration: '6-10 months',
      },
      children: [
        { id: 'aws', label: 'AWS', icon: 'fa-cloud', color: '#ff9900', details: { type: 'career', overview: 'Amazon Web Services is the leading cloud platform with over 200 services for computing, storage, databases, and machine learning.', skills: ['EC2', 'S3', 'Lambda', 'RDS', 'VPC', 'IAM', 'CloudFormation'], languages: ['Python', 'TypeScript', 'YAML'], frameworks: ['AWS CDK', 'Terraform', 'Serverless Framework', 'SST'], tools: ['AWS CLI', 'CloudWatch', 'Docker', 'Kubernetes'], roadmap: { beginner: ['AWS Free Tier', 'EC2', 'S3', 'IAM', 'VPC Basics'], intermediate: ['Lambda', 'RDS', 'DynamoDB', 'CloudFormation', 'CI/CD'], advanced: ['Microservices', 'Event-driven Architecture', 'Cost Optimization', 'Security'], projects: ['Static Website Hosting', 'Serverless API', 'Scalable WordPress', 'Cloud Migration'] }, certifications: ['AWS Cloud Practitioner', 'AWS Solutions Architect Associate', 'AWS DevOps Professional'], companies: ['Netflix', 'Airbnb', 'Lyft', 'Slack', 'Capital One'], salary: '$90K - $200K', difficulty: 'Intermediate', duration: '4-8 months', resources: [{ name: 'AWS Docs', url: 'https://docs.aws.amazon.com', type: 'docs' }, { name: 'AWS Skill Builder', url: 'https://explore.skillbuilder.aws', type: 'course' }], books: ['AWS in Action', 'Terraform Up & Running'], youtube: ['TechWorld with Nana AWS', 'Be A Better Dev', 'FreeCodeCamp AWS'], practice: ['AWS Cloud Quest', 'Qwiklabs', 'A Cloud Guru'], jobRoles: ['AWS Engineer', 'Cloud Engineer', 'Solutions Architect'], futureScope: 'AWS continues market leadership. Growing with AI/ML services, serverless, and edge computing.' } },
        { id: 'azure', label: 'Azure', icon: 'fa-cloud', color: '#0078d4', details: { type: 'career', overview: 'Microsoft Azure is a comprehensive cloud platform with deep integration with Microsoft enterprise tools.', skills: ['Azure VMs', 'Azure Functions', 'Active Directory', 'SQL Database', 'DevOps'], languages: ['C#', 'Python', 'YAML', 'PowerShell'], frameworks: ['ARM Templates', 'Terraform', 'Bicep'], tools: ['Azure Portal', 'Azure CLI', 'Visual Studio', 'Docker'], roadmap: { beginner: ['Azure Fundamentals', 'Virtual Machines', 'Storage', 'Networking'], intermediate: ['Azure Functions', 'Azure DevOps', 'CosmosDB', 'Security'], advanced: ['Azure Architecture', 'Hybrid Cloud', 'Governance', 'Cost Management'], projects: ['Web App Deployment', 'Serverless API', 'Data Pipeline', 'Hybrid Infrastructure'] }, certifications: ['Azure Fundamentals', 'Azure Administrator', 'Azure Solutions Architect'], companies: ['Microsoft', 'Accenture', 'Deloitte', 'JP Morgan', 'Enterprise Companies'], salary: '$90K - $200K', difficulty: 'Intermediate', duration: '4-8 months', resources: [{ name: 'Microsoft Learn', url: 'https://learn.microsoft.com/azure', type: 'course' }, { name: 'Azure Docs', url: 'https://docs.microsoft.com/azure', type: 'docs' }], books: ['Azure for Architects', 'Exam Ref Azure Administrator'], youtube: ['John Savill', 'TechWorld with Nana Azure'], practice: ['Microsoft Learn Sandbox', 'Azure Free Account'], jobRoles: ['Azure Engineer', 'Cloud Engineer', 'Azure Architect'], futureScope: 'Strong in enterprise and hybrid cloud scenarios. Azure has deep integration with Microsoft 365 and business tools.' } },
        { id: 'gcp', label: 'Google Cloud', icon: 'fa-cloud', color: '#4285f4', details: { type: 'career', overview: 'Google Cloud Platform offers powerful infrastructure, data analytics, and machine learning services.', skills: ['Compute Engine', 'GKE', 'BigQuery', 'Cloud Functions', 'Dataflow'], languages: ['Python', 'Go', 'YAML'], frameworks: ['Terraform', 'Deployment Manager', 'Kubernetes'], tools: ['Cloud Console', 'gcloud CLI', 'Docker', 'kubectl'], roadmap: { beginner: ['GCP Fundamentals', 'Compute Engine', 'Cloud Storage', 'VPC'], intermediate: ['GKE', 'Cloud Functions', 'BigQuery', 'Cloud SQL', 'IAM'], advanced: ['Data Engineering', 'AI/ML on GCP', 'Service Mesh', 'Multi-cloud'], projects: ['App Engine Deployment', 'BigQuery Analytics', 'Kubernetes Cluster', 'ML Pipeline'] }, certifications: ['Cloud Digital Leader', 'Associate Cloud Engineer', 'Professional Cloud Architect'], companies: ['Google', 'Spotify', 'PayPal', 'Evernote', 'Twitter'], salary: '$90K - $200K', difficulty: 'Intermediate', duration: '4-8 months', resources: [{ name: 'Google Cloud Skills Boost', url: 'https://www.cloudskillsboost.google', type: 'course' }, { name: 'GCP Docs', url: 'https://cloud.google.com/docs', type: 'docs' }], books: ['Google Cloud Platform in Action', 'Data Engineering with Google Cloud'], youtube: ['Google Cloud Tech', 'DoINerd', 'Sathish Vanga'], practice: ['Google Cloud Free Tier', 'Qwiklabs'], jobRoles: ['GCP Engineer', 'Cloud Engineer', 'Data Engineer GCP'], futureScope: 'Strong in data analytics and ML workloads. BigQuery and GKE lead in their categories.' } },
        { id: 'devops', label: 'DevOps', icon: 'fa-arrows-rotate', color: '#e11d48', details: { type: 'career', overview: 'DevOps bridges development and operations, automating infrastructure, deployment pipelines, and monitoring.', skills: ['CI/CD', 'Containerization', 'Infrastructure as Code', 'Monitoring', 'Automation'], languages: ['Python', 'YAML', 'HCL', 'Bash', 'Go'], frameworks: ['Terraform', 'Ansible', 'Chef', 'Pulumi'], tools: ['Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'Prometheus', 'Grafana'], roadmap: { beginner: ['Linux', 'Git', 'Basic Scripting', 'Networking Basics'], intermediate: ['Docker', 'CI/CD Pipelines', 'Configuration Management', 'Cloud Basics'], advanced: ['Kubernetes', 'Service Mesh', 'Monitoring', 'Security', 'SRE Practices'], projects: ['CI/CD Pipeline Setup', 'Dockerized Application', 'Kubernetes Deployment', 'Monitoring Stack'] }, certifications: ['AWS DevOps Engineer', 'Azure DevOps Expert', 'Kubernetes CKA', 'HashiCorp Terraform'], companies: ['Google', 'Netflix', 'Etsy', 'Shopify', 'Target', 'Adobe'], salary: '$100K - $220K', difficulty: 'Intermediate', duration: '6-10 months', resources: [{ name: 'DevOps Roadmap', url: 'https://roadmap.sh/devops', type: 'course' }, { name: 'Docker Docs', url: 'https://docs.docker.com', type: 'docs' }], books: ['The DevOps Handbook', 'The Phoenix Project', 'Site Reliability Engineering'], youtube: ['TechWorld with Nana', 'DevOps Toolkit', 'Bret Fisher'], practice: ['Killercoda', 'Instruqt', 'Play with Docker'], jobRoles: ['DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer', 'Infrastructure Engineer'], futureScope: 'DevOps is becoming standard practice. Platform engineering and GitOps are emerging trends.' } },
        { id: 'sre', label: 'Site Reliability Engineering', icon: 'fa-shield', color: '#be123c', details: { type: 'career', overview: 'SRE engineers ensure that production systems are reliable, scalable, and performant through automation and monitoring.', skills: ['System Design', 'Programming', 'Incident Response', 'Capacity Planning', 'Performance Tuning'], languages: ['Python', 'Go', 'Java', 'Bash'], frameworks: ['Kubernetes', 'Terraform', 'Prometheus'], tools: ['Docker', 'Grafana', 'ELK Stack', 'PagerDuty', 'OpenTelemetry'], roadmap: { beginner: ['Linux', 'Networking', 'Basic Scripting', 'Cloud Basics'], intermediate: ['Monitoring & Alerting', 'Incident Management', 'Automation', 'Container Orchestration'], advanced: ['Capacity Planning', 'SLO/SLI Design', 'Chaos Engineering', 'Distributed Systems'], projects: ['Monitoring Stack Setup', 'Incident Response Runbook', 'Automated Remediation', 'Load Testing Framework'] }, certifications: ['Google Cloud Professional SRE', 'AWS DevOps Engineer', 'Kubernetes CKA'], companies: ['Google', 'Amazon', 'Microsoft', 'Apple', 'Uber', 'LinkedIn'], salary: '$120K - $250K', difficulty: 'Advanced', duration: '8-14 months', resources: [{ name: 'Google SRE Book', url: 'https://sre.google/books', type: 'book' }, { name: 'SRE School', url: 'https://sre.google/school', type: 'course' }], books: ['Site Reliability Engineering (Google)', 'The SRE Workbook', 'Chaos Engineering'], youtube: ['Google SRE Talks', 'InfoQ SRE', 'DevOps Toolkit'], practice: ['Killercoda', 'HackTheBox', 'GitHub Production Projects'], jobRoles: ['SRE', 'Site Reliability Engineer', 'Production Engineer', 'Platform Engineer'], futureScope: 'Increasingly critical as systems grow more complex. Platform engineering and SRE are converging.' } },
      ]
    },
    {
      id: 'cybersecurity',
      label: 'Cybersecurity',
      icon: 'fa-shield-halved',
      color: '#ef4444',
      details: {
        type: 'career',
        overview: 'Cybersecurity professionals protect organizations from digital threats, attacks, and unauthorized access to systems and data.',
        whyChoose: 'Critical need across all industries, rapidly growing field, challenging work, excellent job security, and competitive salaries.',
        skills: ['Network Security', 'Ethical Hacking', 'Security Operations', 'Compliance', 'Risk Assessment', 'Incident Response'],
        languages: ['Python', 'Bash', 'PowerShell', 'SQL', 'C'],
        frameworks: ['NIST', 'ISO 27001', 'MITRE ATT&CK', 'OWASP Top 10'],
        tools: ['Wireshark', 'Metasploit', 'Burp Suite', 'Nmap', 'Kali Linux', 'Splunk', 'Nessus'],
        roadmap: {
          beginner: ['Networking Fundamentals', 'Linux Basics', 'Security Basics', 'Operating Systems'],
          intermediate: ['Network Security', 'Ethical Hacking', 'Web Security', 'SOC Operations'],
          advanced: ['Incident Response', 'Threat Hunting', 'Penetration Testing', 'Security Architecture', 'Compliance'],
        },
        projects: ['Security Audit Report', 'Penetration Testing Lab', 'SOC Dashboard', 'Malware Analysis Sandbox', 'CTF Challenges'],
        certifications: ['CompTIA Security+', 'CISSP', 'CEH', 'OSCP', 'CISM', 'SANS GIAC'],
        companies: ['CrowdStrike', 'Palo Alto Networks', 'Mandiant', 'Cisco', 'Cloudflare', 'All Major Banks'],
        salary: '$80K - $200K+',
        difficulty: 'Intermediate',
        duration: '6-12 months',
        resources: [
          { name: 'Cybrary', url: 'https://www.cybrary.it', type: 'course' },
          { name: 'TryHackMe', url: 'https://tryhackme.com', type: 'practice' },
          { name: 'HackTheBox', url: 'https://www.hackthebox.com', type: 'practice' },
        ],
        books: ['The Web Application Hacker\'s Handbook', 'Hacking: The Art of Exploitation', 'Ghost in the Wires'],
        youtube: ['John Hammond', 'NetworkChuck', 'IppSec', 'Professor Messer', 'STÖK'],
        practice: ['TryHackMe', 'HackTheBox', 'CTFtime', 'PentesterLab', 'PortSwigger Academy'],
        jobRoles: ['Security Analyst', 'Penetration Tester', 'SOC Analyst', 'Security Engineer', 'CISO'],
        futureScope: 'Cyber threats growing exponentially. Zero Trust, cloud security, AI security, and ransomware defense are key trends.',
        salary: '$80K - $200K+',
        difficulty: 'Intermediate',
        duration: '6-12 months',
      },
      children: [
        {
          id: 'ethical-hacking', label: 'Ethical Hacking', icon: 'fa-skull', color: '#dc2626',
          details: { type: 'career', overview: 'Ethical hackers legally break into systems to find vulnerabilities before malicious actors can exploit them.', skills: ['Penetration Testing', 'Vulnerability Assessment', 'Exploit Development', 'Social Engineering', 'Reporting'], languages: ['Python', 'Bash', 'PowerShell', 'Ruby', 'C'], frameworks: ['Metasploit', 'Burp Suite', 'Nmap', 'OWASP ZAP', 'BloodHound'], tools: ['Kali Linux', 'Wireshark', 'Nessus', 'John the Ripper', 'Hashcat', 'Hydra'], roadmap: { beginner: ['Networking Basics', 'Linux Fundamentals', 'Python Scripting', 'Web Technologies'], intermediate: ['OWASP Top 10', 'Web App Pentesting', 'Network Pentesting', 'Social Engineering', 'Report Writing'], advanced: ['Exploit Development', 'Reverse Engineering', 'Red Teaming', 'Zero Day Research', 'Compliance'] }, projects: ['CTF Challenge', 'Vulnerability Scanner', 'Exploit PoC', 'Pentest Report', 'Bug Bounty Submission'], certifications: ['OSCP', 'CEH', 'PNPT', 'GPEN', 'Pentest+'], companies: ['CrowdStrike', 'Mandiant', 'FireEye', 'Rapid7', 'Cisco', 'All Major Banks'], salary: '$90K - $200K+', difficulty: 'Advanced', duration: '6-12 months', resources: [{ name: 'TryHackMe', url: 'https://tryhackme.com', type: 'practice' }, { name: 'PortSwigger Academy', url: 'https://portswigger.net/web-security', type: 'course' }], books: ['The Web Application Hacker\'s Handbook', 'Penetration Testing: A Hands-On Introduction'], youtube: ['IppSec', 'John Hammond', 'STÖK', 'The Cyber Mentor'], practice: ['HackTheBox', 'Bugcrowd', 'HackerOne', 'PentesterLab'], jobRoles: ['Penetration Tester', 'Ethical Hacker', 'Red Team Engineer'], futureScope: 'Growing with AI-powered security testing, cloud pentesting, and expansion of bug bounty programs.' } },
        {
          id: 'security-analyst', label: 'Security Analyst', icon: 'fa-shield', color: '#ef4444',
          details: { type: 'career', overview: 'Security Analysts monitor networks, detect threats, and respond to security incidents in real-time.', skills: ['SIEM', 'Incident Detection', 'Log Analysis', 'Threat Intelligence', 'Forensics'], languages: ['Python', 'PowerShell', 'SQL', 'Bash'], frameworks: ['MITRE ATT&CK', 'NIST CSF', 'Cyber Kill Chain', 'Diamond Model'], tools: ['Splunk', 'Elastic Stack', 'Wireshark', 'TheHive', 'MISP', 'Cortex'], roadmap: { beginner: ['Networking Fundamentals', 'OS Basics', 'Security Fundamentals', 'SIEM Basics'], intermediate: ['SOC Operations', 'Incident Triage', 'Threat Hunting', 'Forensics', 'Malware Analysis'], advanced: ['Threat Intelligence', 'Detection Engineering', 'Automation', 'Incident Commander', 'Purple Teaming'] }, projects: ['SOC Dashboard', 'Incident Playbook', 'Threat Feed Aggregator', 'Phishing Analysis Lab'], certifications: ['Security+', 'CySA+', 'GCIA', 'SANS SEC504', 'CCNA Cyber Ops'], companies: ['Mandiant', 'CrowdStrike', 'AT&T Security', 'Verizon', 'Booz Allen', 'Government'], salary: '$70K - $150K', difficulty: 'Beginner-friendly', duration: '4-8 months', resources: [{ name: 'SANS Reading Room', url: 'https://www.sans.org/white-papers', type: 'docs' }, { name: 'Cybrary SOC', url: 'https://www.cybrary.it', type: 'course' }], books: ['Blue Team Handbook', 'Intelligence-Driven Incident Response'], youtube: ['Professor Messer', 'CyberDefenseTV', 'Gerald Auger'], practice: ['Blue Team Labs', 'TryHackMe SOC', 'CyberDefenders'], jobRoles: ['Security Analyst', 'SOC Analyst', 'Cybersecurity Analyst'], futureScope: 'Increasing demand as threats become more sophisticated and regulations tighten.' } },
        {
          id: 'cloud-security', label: 'Cloud Security', icon: 'fa-cloud-shield', color: '#f87171',
          details: { type: 'career', overview: 'Cloud Security professionals protect cloud infrastructure and workloads across AWS, Azure, and GCP.', skills: ['Cloud Platforms', 'Identity & Access', 'Encryption', 'Compliance', 'Container Security'], languages: ['Python', 'HCL', 'YAML', 'Bash', 'Go'], frameworks: ['CIS Benchmarks', 'NIST SP 800-53', 'FedRAMP', 'SOC 2'], tools: ['AWS GuardDuty', 'Azure Security Center', 'Prisma Cloud', 'Terraform', 'Docker', 'Kubernetes'], roadmap: { beginner: ['Cloud Fundamentals', 'IAM Basics', 'Networking', 'Linux'], intermediate: ['Cloud Security Tools', 'Logging & Monitoring', 'Compliance', 'Container Security'], advanced: ['Zero Trust Architecture', 'Automation', 'Incident Response in Cloud', 'Red Team Cloud'] }, projects: ['Cloud Security Audit', 'IAM Policy Framework', 'Container Security Scan', 'Compliance Dashboard'], certifications: ['AWS Security Specialty', 'Azure Security Engineer', 'CCSP', 'CISSP'], companies: ['AWS', 'Cloudflare', 'CrowdStrike', 'Zscaler', 'Google Cloud', 'Palo Alto'], salary: '$100K - $210K', difficulty: 'Intermediate', duration: '6-12 months', resources: [{ name: 'AWS Security Docs', url: 'https://docs.aws.amazon.com/security', type: 'docs' }, { name: 'Cloud Security Alliance', url: 'https://cloudsecurityalliance.org', type: 'course' }], books: ['AWS Security Best Practices', 'Zero Trust Networks'], youtube: ['Cloud Security Podcast', 'F5 Cloud Security', 'Christophe Tafani-Dereeper'], practice: ['CloudGoat', 'Flaws.cloud', 'AWS Security Workshop'], jobRoles: ['Cloud Security Engineer', 'Cloud Security Architect', 'DevSecOps Engineer'], futureScope: 'Every cloud migration creates demand. Serverless security and AI workloads are emerging specialties.' } },
        {
          id: 'digital-forensics', label: 'Digital Forensics', icon: 'fa-magnifying-glass', color: '#fca5a5',
          details: { type: 'career', overview: 'Digital Forensics investigators recover and analyze data from devices to support legal cases and incident response.', skills: ['Disk Forensics', 'Memory Analysis', 'Network Forensics', 'Chain of Custody', 'Reporting'], languages: ['Python', 'PowerShell', 'Bash', 'SQL'], frameworks: ['NIST SP 800-86', 'ACPO Principles', 'SANS Forensic Methodology'], tools: ['FTK Imager', 'Autopsy', 'Volatility', 'EnCase', 'Sleuth Kit', 'WireShark'], roadmap: { beginner: ['Computer Architecture', 'File Systems', 'OS Fundamentals', 'Legal Process'], intermediate: ['Disk Forensics', 'Memory Forensics', 'Network Forensics', 'Mobile Forensics', 'Tool Usage'], advanced: ['Malware Forensics', 'Cloud Forensics', 'Timeline Analysis', 'Expert Witness', 'Advanced Steganography'] }, projects: ['Disk Image Analysis', 'Memory Dump Investigation', 'Phishing Email Forensics', 'Mobile Data Extraction'], certifications: ['GCFE', 'GCFA', 'EnCE', 'CHFI', 'ACE'], companies: ['Kroll', 'Stroz Friedberg', 'Cellebrite', 'GUIDANCE', 'Government Agencies'], salary: '$75K - $160K', difficulty: 'Intermediate', duration: '8-14 months', resources: [{ name: 'SANS Forensics', url: 'https://www.sans.org/cyber-security-courses/advanced-forensics', type: 'course' }, { name: 'Forensic Focus', url: 'https://www.forensicfocus.com', type: 'practice' }], books: ['File System Forensic Analysis', 'Practical Malware Analysis'], youtube: ['13Cubed', 'Forensic Control', 'SANS DFIR'], practice: ['Forensic Toolkit', 'NIST CFReDS', 'SANS DFIR Challenges'], jobRoles: ['Forensic Analyst', 'DFIR Consultant', 'Incident Responder'], futureScope: 'Growing with ransomware investigations, cloud forensics, and incident response demand.' } },
        {
          id: 'crypto-cyber', label: 'Cryptography Engineer', icon: 'fa-key', color: '#fecaca',
          details: { type: 'career', overview: 'Cryptography engineers design and implement encryption systems that protect data in transit and at rest.', skills: ['Encryption Algorithms', 'Key Management', 'PKI', 'Security Protocols', 'Cryptanalysis'], languages: ['C', 'C++', 'Python', 'Rust', 'Go'], frameworks: ['OpenSSL', 'Libsodium', 'TLS', 'GnuPG', 'JWT'], tools: ['Hardware Security Modules', 'Vault', 'Cert-manager', 'Cryptography Libraries'], roadmap: { beginner: ['Discrete Math', 'Number Theory', 'Basic Cryptography', 'Probability'], intermediate: ['Symmetric/Asymmetric Crypto', 'Hash Functions', 'Digital Signatures', 'Protocol Design', 'PKI'], advanced: ['Zero-Knowledge Proofs', 'Homomorphic Encryption', 'Post-Quantum Crypto', 'Side-Channel Attacks'] }, projects: ['Encrypted Chat App', 'File Encryption Tool', 'CA Certificate Generator', 'Blockchain Wallet'], certifications: ['CompTIA Security+', 'CISSP', 'SANS SEC575'], companies: ['Google', 'Apple', 'Amazon', 'Cloudflare', 'Signal', 'NVIDIA'], salary: '$110K - $230K', difficulty: 'Advanced', duration: '12-18 months', resources: [{ name: 'CryptoPals', url: 'https://cryptopals.com', type: 'practice' }, { name: 'Stanford Crypto Course', url: 'https://www.coursera.org/learn/crypto', type: 'course' }], books: ['Applied Cryptography', 'Cryptography Engineering', 'Understanding Cryptography'], youtube: ['Christof Paar Crypto Lectures', 'Computerphile Crypto'], practice: ['CryptoPals', 'Cryptohack', 'MysteryTwister'], jobRoles: ['Cryptography Engineer', 'Security Cryptographer', 'Protocol Engineer'], futureScope: 'Post-quantum cryptography, zero-knowledge proofs, and secure multi-party computation are key frontiers.' } },
      ]
    },
    {
      id: 'blockchain',
      label: 'Blockchain',
      icon: 'fa-link',
      color: '#f59e0b',
      details: {
        type: 'career',
        overview: 'Blockchain technology enables decentralized, transparent, and secure digital transactions and applications.',
        whyChoose: 'Revolutionary technology transforming finance, supply chain, and digital ownership. Strong demand for blockchain developers.',
        skills: ['Blockchain Fundamentals', 'Smart Contracts', 'DApps', 'Web3.js', 'Cryptography', 'Solidity'],
        languages: ['Solidity', 'JavaScript/TypeScript', 'Python', 'Rust', 'Go'],
        frameworks: ['Ethereum', 'Hardhat', 'Truffle', 'Web3.js', 'Ethers.js'],
        tools: ['MetaMask', 'Remix IDE', 'Ganache', 'IPFS', 'OpenZeppelin'],
        roadmap: {
          beginner: ['Blockchain Fundamentals', 'Cryptography Basics', 'Ethereum Basics', 'Smart Contract Basics'],
          intermediate: ['Solidity', 'DApp Development', 'Web3.js', 'Testing Smart Contracts'],
          advanced: ['Layer 2 Solutions', 'DeFi Protocols', 'NFT Standards', 'Security Auditing'],
        },
        projects: ['Crypto Wallet', 'NFT Marketplace', 'DeFi Lending Platform', 'Decentralized Voting System', 'Token Generator'],
        certifications: ['Blockchain Developer Cert', 'Ethereum Developer', 'Corda Developer'],
        companies: ['Coinbase', 'Binance', 'OpenSea', 'Chainlink', 'Polygon', 'Ripple'],
        salary: '$100K - $250K+',
        difficulty: 'Intermediate',
        duration: '6-12 months',
        resources: [
          { name: 'CryptoZombies', url: 'https://cryptozombies.io', type: 'course' },
          { name: 'Solidity Docs', url: 'https://docs.soliditylang.org', type: 'docs' },
          { name: 'Ethereum Developer Portal', url: 'https://ethereum.org/developers', type: 'docs' },
        ],
        books: ['Mastering Ethereum', 'The Bitcoin Standard', 'Blockchain Basics'],
        youtube: ['Dapp University', 'Patrick Collins', 'EatTheBlocks', 'Finematics'],
        practice: ['Ethernaut', 'Capture the Ether', 'HackTheBox Blockchain', 'GitHub Web3 Projects'],
        jobRoles: ['Blockchain Developer', 'Smart Contract Developer', 'Solidity Engineer', 'DeFi Developer', 'Blockchain Architect'],
        futureScope: 'Enterprise blockchain adoption growing. DeFi, NFTs, DAOs, and tokenization creating new opportunities.',
        salary: '$100K - $250K+',
        difficulty: 'Intermediate',
        duration: '6-12 months',
      },
      children: [
        {
          id: 'blockchain-dev', label: 'Blockchain Developer', icon: 'fa-cube', color: '#f59e0b',
          details: { type: 'career', overview: 'Blockchain developers design and build decentralized applications and blockchain infrastructure.', skills: ['Distributed Systems', 'Smart Contracts', 'Consensus Algorithms', 'DApp Development', 'Tokenomics'], languages: ['Solidity', 'JavaScript', 'TypeScript', 'Rust', 'Go'], frameworks: ['Hardhat', 'Truffle', 'Foundry', 'Ethers.js', 'Web3.js'], tools: ['MetaMask', 'IPFS', 'The Graph', 'Ganache', 'Remix', 'OpenZeppelin'], roadmap: { beginner: ['Blockchain Fundamentals', 'Cryptography Basics', 'JavaScript', 'Web Basics'], intermediate: ['Smart Contract Development', 'Solidity', 'Frameworks', 'Testing'], advanced: ['Advanced Solidity', 'Security Auditing', 'Token Engineering', 'Layer 2', 'Cross-Chain'] }, projects: ['Token Launch', 'NFT Marketplace', 'Voting DApp', 'DeFi Dashboard', 'DEX Clone'], certifications: ['Blockchain Specialization (Coursera)', 'ConsenSys Academy', 'Alchemy University', 'Chainlink Developer'], companies: ['Ethereum Foundation', 'ConsenSys', 'Chainlink', 'Alchemy', 'Polygon', 'OpenSea'], salary: '$100K - $250K+', difficulty: 'Intermediate', duration: '6-12 months', resources: [{ name: 'CryptoZombies', url: 'https://cryptozombies.io', type: 'course' }, { name: 'Ethereum Docs', url: 'https://ethereum.org/developers', type: 'docs' }], books: ['Mastering Ethereum', 'The Bitcoin Standard', 'Blockchain Basics'], youtube: ['Patrick Collins', 'Dapp University', 'Finematics', 'Whiteboard Crypto'], practice: ['Ethernaut', 'Capture the Ether', 'Damn Vulnerable DeFi'], jobRoles: ['Blockchain Developer', 'Protocol Engineer', 'Blockchain Architect'], futureScope: 'Massive growth in DeFi, tokenization of real-world assets, and enterprise blockchain adoption.' } },
        {
          id: 'smart-contract', label: 'Smart Contract Engineer', icon: 'fa-file-code', color: '#d97706',
          details: { type: 'career', overview: 'Smart contract engineers write and audit self-executing contracts on blockchain networks.', skills: ['Smart Contract Design', 'Security Auditing', 'Gas Optimization', 'Upgrade Patterns', 'Formal Verification'], languages: ['Solidity', 'Vyper', 'Rust', 'Yul', 'TypeScript'], frameworks: ['Hardhat', 'Foundry', 'OpenZeppelin', 'Waffle', 'Remix'], tools: ['Slither', 'Mythril', 'Echidna', 'Etherscan', 'Tenderly', 'Hardhat'], roadmap: { beginner: ['Solidity Basics', 'EVM Architecture', 'Remix IDE', 'Test Networks'], intermediate: ['Advanced Solidity', 'Security Patterns', 'Gas Optimization', 'Testing', 'Scripting'], advanced: ['Auditing', 'Formal Verification', 'MEV', 'Layer 2', 'EIPs'] }, projects: ['ERC-20 Token', 'ERC-721 NFT', 'DAO Smart Contract', 'Escrow Contract', 'Dutch Auction'], certifications: ['ConsenSys Academy', 'Certified Smart Contract Developer', 'SC Auditing (Secureum)'], companies: ['OpenZeppelin', 'Trail of Bits', 'ConsenSys', 'Chainlink', 'Compound', 'Uniswap'], salary: '$120K - $300K+', difficulty: 'Advanced', duration: '8-12 months', resources: [{ name: 'Solidity Docs', url: 'https://docs.soliditylang.org', type: 'docs' }, { name: 'Ethereum Security', url: 'https://ethereum.org/developers/docs/smart-contracts/security', type: 'docs' }], books: ['Solidity Programming Essentials', 'Blockchain Security', 'Ethereum Smart Contract Development'], youtube: ['Smart Contract Programmer', 'Patrick Collins', 'Nader Dabit', 'EatTheBlocks'], practice: ['Ethernaut', 'Damn Vulnerable DeFi', 'Paradigm CTF'], jobRoles: ['Smart Contract Engineer', 'Blockchain Security Engineer', 'Protocol Developer'], futureScope: 'DeFi, tokenization, and enterprise blockchain drive demand for secure contract development.' } },
        {
          id: 'web3-dev', label: 'Web3 Developer', icon: 'fa-globe', color: '#b45309',
          details: { type: 'career', overview: 'Web3 developers build full-stack decentralized applications that connect to blockchain networks and smart contracts.', skills: ['DApp Architecture', 'Wallet Integration', 'Indexing', 'IPFS', 'Full-Stack Dev'], languages: ['TypeScript', 'JavaScript', 'Rust', 'Solidity', 'Python'], frameworks: ['Next.js', 'React', 'Ethers.js', 'Wagmi', 'Viem', 'The Graph'], tools: ['IPFS', 'MetaMask', 'WalletConnect', 'Pinata', 'Alchemy', 'Moralis'], roadmap: { beginner: ['JavaScript/TypeScript', 'React', 'Blockchain Fundamentals', 'Web Basics'], intermediate: ['Smart Contract Interaction', 'Ethers.js', 'Wallet Integration', 'The Graph'], advanced: ['Full-Stack DApp', 'Security', 'Gas Management', 'Scaling', 'Multi-Chain'] }, projects: ['DApp Frontend', 'NFT Gallery', 'Web3 Dashboard', 'Multi-Sig Wallet UI', 'Staking Dashboard'], certifications: ['Alchemy University', 'Buildspace', 'Web3 Developer Program (Chainlink)'], companies: ['Uniswap', 'OpenSea', 'Alchemy', 'Rainbow', 'WalletConnect', 'Zora'], salary: '$100K - $220K+', difficulty: 'Intermediate', duration: '6-10 months', resources: [{ name: 'Buildspace', url: 'https://buildspace.so', type: 'course' }, { name: 'Web3 University', url: 'https://web3.university', type: 'course' }], books: ['Building DApps', 'The DApp Developer Handbook'], youtube: ['Nader Dabit', 'EatTheBlocks', 'HashLips', 'Drake'], practice: ['Buildspace Projects', 'Scaffold-ETH', 'Speedrun Ethereum'], jobRoles: ['Web3 Developer', 'DApp Developer', 'Full-Stack Web3 Engineer'], futureScope: 'Wallet UX, DAO tooling, and on-chain identity are expanding Web3 roles.' } },
        {
          id: 'defi-dev', label: 'DeFi Protocol Developer', icon: 'fa-chart-line', color: '#92400e',
          details: { type: 'career', overview: 'DeFi developers build financial protocols on blockchain: lending, borrowing, swaps, derivatives, and yield protocols.', skills: ['Financial Modeling', 'Protocol Design', 'Liquidity Mechanics', 'Oracle Integration', 'Risk Management'], languages: ['Solidity', 'Vyper', 'Rust', 'TypeScript', 'Python'], frameworks: ['Hardhat', 'Foundry', 'Aave V3 Core', 'Compound Protocol', 'Uniswap V3'], tools: ['Slither', 'Echidna', 'Dune Analytics', 'DefiLlama', 'Tenderly', 'The Graph'], roadmap: { beginner: ['DeFi Fundamentals', 'Solidity Basics', 'EVM', 'Financial Math'], intermediate: ['Lending/Borrowing', 'AMMs', 'Yield Aggregation', 'Stablecoins', 'Oracles'], advanced: ['Protocol Design', 'MEV', 'Cross-Chain DeFi', 'Security Auditing', 'Governance'] }, projects: ['Simple AMM', 'Lending Protocol Clone', 'Yield Aggregator', 'DeFi Dashboard', 'Token Swap DApp'], certifications: ['DeFi Certification (Fintech)', 'Uniswap Developer Program', 'Aave Grants'], companies: ['Uniswap Labs', 'Aave', 'Compound', 'MakerDAO', 'Curve', 'Lido'], salary: '$130K - $350K+', difficulty: 'Advanced', duration: '10-16 months', resources: [{ name: 'DeFi 101', url: 'https://finematics.com', type: 'course' }, { name: 'Uniswap Docs', url: 'https://docs.uniswap.org', type: 'docs' }], books: ['DeFi and the Future of Finance', 'The Infinite Machine'], youtube: ['Finematics', 'DeFi Academy', 'Blockchain Hacker', 'The Defiant'], practice: ['Damn Vulnerable DeFi', 'DeFi Hack Labs', 'Paradigm CTF'], jobRoles: ['DeFi Developer', 'Protocol Engineer', 'Smart Contract Engineer'], futureScope: 'Institutional DeFi, RWA tokenization, and decentralized derivatives are high-growth areas.' } },
      ]
    },
    {
      id: 'ui-ux',
      label: 'UI/UX Design',
      icon: 'fa-pen-ruler',
      color: '#ec4899',
      details: {
        type: 'career',
        overview: 'UI/UX Designers create intuitive, accessible, and visually appealing digital experiences for web and mobile applications.',
        whyChoose: 'Essential role in product development. Blend of creativity and user psychology. High demand with great compensation.',
        skills: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'Interaction Design', 'Usability Testing'],
        languages: ['HTML', 'CSS'],
        frameworks: ['Design Systems', 'Tailwind CSS', 'Bootstrap', 'Material Design'],
        tools: ['Figma', 'Adobe XD', 'Sketch', 'Miro', 'Zeplin', 'Framer', 'Principle'],
        roadmap: {
          beginner: ['Design Principles', 'Color Theory', 'Typography', 'Figma Basics', 'Wireframing'],
          intermediate: ['User Research', 'Prototyping', 'Interaction Design', 'Usability Testing', 'Design Systems'],
          advanced: ['UX Strategy', 'Design Leadership', 'Motion Design', 'Accessibility', 'Design Ops'],
        },
        projects: ['Mobile App Design', 'Website Redesign', 'Dashboard UI', 'Design System', 'Case Study Portfolio'],
        certifications: ['Google UX Design', 'Interaction Design Foundation', 'Nielsen Norman Group UX'],
        companies: ['Apple', 'Google', 'Airbnb', 'Figma', 'Spotify', 'Instagram', 'Dropbox'],
        salary: '$70K - $180K',
        difficulty: 'Beginner-friendly',
        duration: '3-8 months',
        resources: [
          { name: 'Google UX Design Certificate', url: 'https://www.coursera.org/professional-certificates/google-ux-design', type: 'course' },
          { name: 'Figma Learn', url: 'https://help.figma.com', type: 'docs' },
          { name: 'Laws of UX', url: 'https://lawsofux.com', type: 'docs' },
        ],
        books: ['Don\'t Make Me Think', 'The Design of Everyday Things', 'Refactoring UI'],
        youtube: ['Satori Graphics', 'Maex', 'Flux Academy', 'DesignCourse', 'Figma Academy'],
        practice: ['Daily UI', 'Frontend Mentor', 'Dribbble', 'UX Challenge'],
        jobRoles: ['UI Designer', 'UX Designer', 'Product Designer', 'UX Researcher', 'Design Lead'],
        futureScope: 'Growing with AI design tools, AR/VR interfaces, and increasing emphasis on inclusive design.',
        salary: '$70K - $180K',
        difficulty: 'Beginner-friendly',
        duration: '3-8 months',
      },
      children: [
        {
          id: 'ui-designer', label: 'UI Designer', icon: 'fa-palette', color: '#f472b6',
          details: { type: 'career', overview: 'UI designers create visually appealing and consistent interfaces that guide users through digital products.', skills: ['Visual Design', 'Typography', 'Color Theory', 'Layout', 'Design Systems', 'Iconography'], languages: ['HTML', 'CSS', 'JavaScript (basic)'], frameworks: ['Figma', 'Sketch', 'Adobe XD', 'Framer', 'Webflow'], tools: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Zeplin', 'Storybook', 'Framer'], roadmap: { beginner: ['Design Principles', 'Typography', 'Color Theory', 'Figma Basics'], intermediate: ['Advanced Figma', 'Design Systems', 'Prototyping', 'Responsive Design', 'User Flows'], advanced: ['Design Strategy', 'Motion Design', 'Accessibility', 'Design Ops', 'Leadership'] }, projects: ['Mobile App Redesign', 'Dashboard UI Kit', 'Component Library', 'Marketing Site'], certifications: ['Google UX Design', 'UI Design (Interaction Design Foundation)', 'Figma Certification'], companies: ['Apple', 'Airbnb', 'Stripe', 'Shopify', 'Spotify', 'Google'], salary: '$70K - $160K', difficulty: 'Beginner-friendly', duration: '3-6 months', resources: [{ name: 'Figma Learn', url: 'https://help.figma.com', type: 'docs' }, { name: 'DesignCode', url: 'https://designcode.io', type: 'course' }], books: ['Don\'t Make Me Think', 'The Design of Everyday Things', 'Refactoring UI'], youtube: ['Flux Academy', 'DesignCourse', 'Figma Tutorials', 'Jesse Showalter'], practice: ['Daily UI', 'Dribbble', 'Behance', 'Figma Community'], jobRoles: ['UI Designer', 'Visual Designer', 'Product Designer'], futureScope: 'AI-assisted design, voice interfaces, and design tokens drive UI innovation.' } },
        {
          id: 'ux-researcher', label: 'UX Researcher', icon: 'fa-people', color: '#ec4899',
          details: { type: 'career', overview: 'UX researchers study user behavior and needs through qualitative and quantitative methods to inform product decisions.', skills: ['User Interviews', 'Survey Design', 'Usability Testing', 'Data Analysis', 'Personas', 'Journey Mapping'], languages: ['None required (tools-based)'], frameworks: ['Double Diamond', 'Design Thinking', 'Nielsen\'s Usability Heuristics', 'Jobs-To-Be-Done'], tools: ['Maze', 'UserTesting', 'Hotjar', 'Lookback', 'Notion', 'Dovetail'], roadmap: { beginner: ['Research Methods', 'Interview Techniques', 'Survey Design', 'Analytics Basics'], intermediate: ['Usability Testing', 'Statistical Analysis', 'Persona Creation', 'Journey Mapping', 'Report Writing'], advanced: ['Research Ops', 'Advanced Quant Research', 'Strategic Research', 'Team Leadership'] }, projects: ['Usability Test Report', 'User Persona Set', 'Competitive Analysis', 'Research Repository'], certifications: ['NN/g UX Certification', 'IDF UX Research', 'Qualtrics Research Certification'], companies: ['Google', 'Meta', 'Microsoft', 'Amazon', 'IDEO', 'Frog'], salary: '$80K - $170K', difficulty: 'Intermediate', duration: '4-8 months', resources: [{ name: 'NN/g Articles', url: 'https://www.nngroup.com/articles', type: 'docs' }, { name: 'IDF Courses', url: 'https://www.interaction-design.org/courses', type: 'course' }], books: ['Rocket Surgery Made Easy', 'Just Enough Research', 'Interviewing Users'], youtube: ['NN/g Videos', 'UX Salon', 'AJ&Smart'], practice: ['User Interviews (Real)', 'Maze Templates', 'Lookback Research'], jobRoles: ['UX Researcher', 'User Researcher', 'Research Lead'], futureScope: 'AI-driven analytics, remote UX research tools, and inclusive research are growing fields.' } },
        {
          id: 'product-designer', label: 'Product Designer', icon: 'fa-cubes', color: '#db2777',
          details: { type: 'career', overview: 'Product designers own the end-to-end design process from discovery to ship, balancing user needs with business goals.', skills: ['UX Design', 'UI Design', 'Design Strategy', 'Stakeholder Management', 'Prototyping', 'User Research'], languages: ['HTML', 'CSS', 'JavaScript (basic)'], frameworks: ['Design Thinking', 'Lean UX', 'Agile/Scrum', 'Jobs-To-Be-Done'], tools: ['Figma', 'Framer', 'Principle', 'Notion', 'Linear', 'Miro'], roadmap: { beginner: ['UX Fundamentals', 'UI Basics', 'User Research 101', 'Prototyping'], intermediate: ['Interaction Design', 'Design Systems', 'Usability Testing', 'Stakeholder Management'], advanced: ['Design Strategy', 'Team Leadership', 'Design Ops', 'Product Strategy'] }, projects: ['Product Redesign', 'Feature Ship', 'Design System Contribution', 'User Research Study'], certifications: ['Google UX Design Certificate', 'IDF Courses', 'Designlab'], companies: ['Stripe', 'Airbnb', 'Notion', 'Figma', 'Linear', 'Superhuman'], salary: '$90K - $200K', difficulty: 'Intermediate', duration: '6-12 months', resources: [{ name: 'LearnUX.io', url: 'https://learnux.io', type: 'course' }, { name: 'UX Collective', url: 'https://uxdesign.cc', type: 'practice' }], books: ['The Design Sprint', 'Lean UX', 'Articulating Design Decisions'], youtube: ['Spencer Barry', 'Chunbuns', 'Claudiu Cotea'], practice: ['Figma Community', 'Design Sprint Challenges', 'Dribbble'], jobRoles: ['Product Designer', 'Senior Product Designer', 'Design Lead'], futureScope: 'Design systems, AI design tools, and product-led growth increase demand for strong product designers.' } },
        {
          id: 'design-systems', label: 'Design Systems Architect', icon: 'fa-layer-group', color: '#be185d',
          details: { type: 'career', overview: 'Design systems architects build and maintain reusable component libraries, design tokens, and guidelines that ensure product consistency.', skills: ['Component Design', 'Design Tokens', 'Documentation', 'Accessibility', 'Cross-Team Collaboration'], languages: ['HTML', 'CSS', 'JavaScript', 'TypeScript'], frameworks: ['React', 'Storybook', 'Style Dictionary', 'Figma API'], tools: ['Storybook', 'Figma', 'Zeroheight', 'Supernova', 'Theo', 'Token Studio'], roadmap: { beginner: ['Design Principles', 'CSS Fundamentals', 'Component Thinking', 'Figma'], intermediate: ['Design Tokens', 'Storybook', 'Component API', 'Documentation', 'Accessibility'], advanced: ['Multi-Platform Design', 'Automation', 'Governance', 'Enterprise Scale', 'Community Management'] }, projects: ['Component Library', 'Design Token System', 'Documentation Site', 'Migration Guide'], certifications: ['Design System (IDF)', 'Storybook Certification', 'CSS-My-Ass'], companies: ['Google (Material)', 'Shopify (Polaris)', 'Microsoft (Fluent)', 'IBM (Carbon)', 'GitHub (Primer)'], salary: '$110K - $200K', difficulty: 'Advanced', duration: '8-14 months', resources: [{ name: 'Design Systems Repo', url: 'https://designsystemsrepo.com', type: 'practice' }, { name: 'Storybook Docs', url: 'https://storybook.js.org/docs', type: 'docs' }], books: ['Design Systems (Alla Kholmatova)', 'Atomic Design', 'Frontend Architecture'], youtube: ['Design System Series', 'Figma Design Systems', 'Storybook Tutorials'], practice: ['Clone a Design System', 'Build a Component Library', 'Open Source Contribution'], jobRoles: ['Design Systems Engineer', 'Design Ops', 'Frontend Architect'], futureScope: 'Design tokens, multi-brand systems, and automated design-dev handoff are key trends.' } },
        {
          id: 'design-ops', label: 'Design Ops', icon: 'fa-gears', color: '#9d174d',
          details: { type: 'career', overview: 'Design Ops optimizes design processes, tools, and workflows to enable design teams to work more effectively at scale.', skills: ['Process Design', 'Tool Administration', 'Team Strategy', 'Metrics', 'Design Workflows'], languages: ['None required (tools-based)'], frameworks: ['Design Operations Framework', 'Agile', 'Continuous Improvement'], tools: ['Figma Admin', 'Notion', 'Linear', 'Miro', 'Abstract', 'ProductBoard'], roadmap: { beginner: ['Design Basics', 'Project Management', 'Tool Familiarity', 'Communication'], intermediate: ['Process Design', 'Tool Administration', 'Metrics & OKRs', 'Team Onboarding'], advanced: ['Org-Wide Strategy', 'Design Maturity', 'Budgeting', 'Cross-Functional Strategy'] }, projects: ['Tool Stack Audit', 'Design Process Document', 'Onboarding Guide', 'Metrics Dashboard'], certifications: ['D-Ops Certification (DesignOps Assembly)', 'PMI-ACP', 'SAFe'], companies: ['Google', 'Airbnb', 'Meta', 'Shopify', 'IBM', 'Salesforce'], salary: '$85K - $180K', difficulty: 'Intermediate', duration: '4-10 months', resources: [{ name: 'DesignOps Assembly', url: 'https://designopsassembly.org', type: 'practice' }, { name: 'NN/g DesignOps', url: 'https://www.nngroup.com/topic/design-operations', type: 'docs' }], books: ['DesignOps Handbook', 'Orchestrating Experiences', 'The Design Management Handbook'], youtube: ['DesignOps Assembly Talks', 'UXTalk Design Ops'], practice: ['Figma Workshop', 'Process Mapping Projects', 'Tool Migration Plans'], jobRoles: ['Design Operations Manager', 'Design Program Manager', 'Design Tools Manager'], futureScope: 'Growing as design teams scale; focus on efficiency, AI integration, and ROI measurement.' } },
      ]
    },
    {
      id: 'game-dev',
      label: 'Game Development',
      icon: 'fa-gamepad',
      color: '#14b8a6',
      details: {
        type: 'career',
        overview: 'Game Development combines programming, art, and design to create interactive entertainment experiences.',
        whyChoose: 'Passion-driven industry with creativity and technical challenges. Growing market with opportunities in gaming, simulation, and metaverse.',
        skills: ['Programming', 'Game Engines', '3D Modeling', 'Animation', 'Physics', 'Problem Solving'],
        languages: ['C#', 'C++', 'Python', 'JavaScript', 'HLSL/GLSL'],
        frameworks: ['Unity', 'Unreal Engine', 'Godot', 'Phaser.js', 'Three.js'],
        tools: ['Blender', 'Maya', 'Photoshop', 'FMOD', 'Git', 'Perforce'],
        roadmap: {
          beginner: ['Programming Fundamentals', 'C# for Unity', 'Game Objects & Components', 'Basic Physics'],
          intermediate: ['Unity/Unreal Workflows', '3D Assets', 'Animation', 'Audio', 'UI Systems'],
          advanced: ['Shader Programming', 'Optimization', 'Multiplayer Networking', 'Procedural Generation'],
        },
        projects: ['2D Platformer', '3D FPS Prototype', 'Mobile Puzzle Game', 'Racing Game', 'RPG Dialogue System'],
        certifications: ['Unity Certified Developer', 'Unreal Engine Certification', 'Maya Certification'],
        companies: ['Epic Games', 'Unity', 'Ubisoft', 'Rockstar', 'Blizzard', 'Riot Games', 'Nintendo'],
        salary: '$60K - $150K',
        difficulty: 'Intermediate',
        duration: '8-16 months',
        resources: [
          { name: 'Unity Learn', url: 'https://learn.unity.com', type: 'course' },
          { name: 'Unreal Engine Learning', url: 'https://www.unrealengine.com/en-US/learn', type: 'course' },
          { name: 'Brackeys YouTube', url: 'https://www.youtube.com/user/Brackeys', type: 'youtube' },
        ],
        books: ['Game Programming Patterns', 'Unity in Action', 'The Art of Game Design'],
        youtube: ['Brackeys', 'Sebastian Lague', 'Game Maker\'s Toolkit', 'Mix and Jam'],
        practice: ['Unity Learn', 'Unreal Learning', 'Game Jams (itch.io)', 'Ludum Dare'],
        jobRoles: ['Game Developer', 'Unity Developer', 'Unreal Developer', 'Technical Artist', 'Gameplay Engineer'],
        futureScope: 'Metaverse, VR/AR gaming, cloud gaming, and AI-driven game content are major growth areas.',
        salary: '$60K - $150K',
        difficulty: 'Intermediate',
        duration: '8-16 months',
      },
      children: [
        {
          id: 'unity-dev', label: 'Unity Developer', icon: 'fa-cube', color: '#0d9488',
          details: { type: 'career', overview: 'Unity developers build 2D and 3D games, AR/VR experiences, and interactive applications using the Unity engine.', skills: ['C# Programming', 'Game Physics', 'Animation', 'UI/UX in Unity', 'Optimization', 'Editor Scripting'], languages: ['C#', 'Unity ShaderLab/HLSL', 'Visual Scripting'], frameworks: ['Unity Engine', 'DOTS', 'URP/HDRP', 'Unity XR', 'Photon'], tools: ['Unity Editor', 'Blender', 'Photoshop', 'ProBuilder', 'Unity Asset Store', 'Plastic SCM'], roadmap: { beginner: ['C# Basics', 'Unity Interface', '2D Game Development', 'Game Objects & Components'], intermediate: ['3D Development', 'Animation', 'Physics', 'UI Systems', 'Audio'], advanced: ['Shader Programming', 'ECS/DOTS', 'Multiplayer', 'VR/AR', 'Performance Optimization'] }, projects: ['2D Platformer', '3D First-Person Game', 'Mobile Endless Runner', 'AR Filter App'], certifications: ['Unity Certified Developer', 'Unity Certified 3D Artist', 'C# Certification'], companies: ['Unity Technologies', 'Electronic Arts', 'Nintendo', 'Niantic', 'Blizzard', 'Ubisoft'], salary: '$60K - $140K', difficulty: 'Intermediate', duration: '6-12 months', resources: [{ name: 'Unity Learn', url: 'https://learn.unity.com', type: 'course' }, { name: 'Unity Documentation', url: 'https://docs.unity3d.com', type: 'docs' }], books: ['Unity in Action', 'C# Game Programming', 'Unity Game Development Cookbook'], youtube: ['Brackeys', 'GameDev.tv', 'Jason Weimann', 'Code Monkey'], practice: ['Unity Playground', 'Game Jams (Ludum Dare)', 'Personal Projects'], jobRoles: ['Unity Developer', 'Unity Game Developer', 'XR Developer', 'Gameplay Programmer'], futureScope: 'Growing with mobile gaming, AR (Apple Vision Pro), and metaverse development.' } },
        {
          id: 'unreal-dev', label: 'Unreal Engine Developer', icon: 'fa-crown', color: '#14b8a6',
          details: { type: 'career', overview: 'Unreal Engine developers create high-fidelity games, architectural visualizations, and cinematic experiences.', skills: ['CPP Programming', 'Blueprints', 'Rendering', 'Animation', 'Level Design', 'Optimization'], languages: ['C++', 'Blueprint Visual Scripting', 'Python', 'HLSL'], frameworks: ['Unreal Engine 5', 'Nanite', 'Lumen', 'Chaos Physics', 'MetaHuman'], tools: ['Unreal Editor', 'Blender', 'Substance Painter', 'Quixel Bridge', 'Perforce', 'RenderDoc'], roadmap: { beginner: ['C++ Basics', 'Unreal Interface', 'Blueprints', 'Basic Actors & Pawns'], intermediate: ['Animation Systems', 'Materials', 'Level Design', 'AI Systems', 'UI with UMG'], advanced: ['Rendering Pipeline', 'Multiplayer Networking', 'Niagara VFX', 'Sound Design', 'Performance Tuning'] }, projects: ['First-Person Shooter', 'Open World Prototype', 'ArchViz Walkthrough', 'Cinematic Short'], certifications: ['Unreal Authorized Training', 'Unreal Eng. Certifications (Epic)'], companies: ['Epic Games', 'Naughty Dog', 'Rockstar', 'CD Projekt Red', 'ILM', 'Architectural Studios'], salary: '$70K - $180K', difficulty: 'Advanced', duration: '10-18 months', resources: [{ name: 'Unreal Online Learning', url: 'https://www.unrealengine.com/en-US/onlinelearning', type: 'course' }, { name: 'UE Documentation', url: 'https://docs.unrealengine.com', type: 'docs' }], books: ['Unreal Engine 5 Game Development', 'Unreal Engine VR Cookbook', 'Blueprints Visual Scripting'], youtube: ['Unreal Sensei', 'Mathew Wadstein', 'Virtus Learning Hub', 'Ben Cloward'], practice: ['Unreal Marketplace', 'Game Jams', 'Open Source UE Projects'], jobRoles: ['Unreal Developer', 'UE Gameplay Engineer', 'Technical Artist', 'Graphics Engineer'], futureScope: 'UE5 adoption in film, automotive, architecture, and AAA game development is growing rapidly.' } },
        {
          id: 'gameplay-engineer', label: 'Gameplay Engineer', icon: 'fa-joystick', color: '#0f766e',
          details: { type: 'career', overview: 'Gameplay engineers program player mechanics, enemy AI, physics interactions, and game systems that define the player experience.', skills: ['Gameplay Programming', 'AI Systems', 'Physics', 'Animation', 'Input Systems', 'Optimization'], languages: ['C++', 'C#', 'Python', 'Lua'], frameworks: ['Unity', 'Unreal Engine', 'CryEngine', 'Godot', 'Custom Engines'], tools: ['Visual Studio', 'RenderDoc', 'Perforce', 'Git', 'Trello', 'Jira'], roadmap: { beginner: ['Programming Fundamentals', 'OOP', 'Basic Game Loop', 'Math for Games'], intermediate: ['Physics Systems', 'Character Controllers', 'AI Behaviors', 'Weapon Systems', 'Save Systems'], advanced: ['Multiplayer Sync', 'Advanced AI', 'Procedural Generation', 'Netcode', 'Systems Architecture'] }, projects: ['Character Controller', 'AI Enemy System', 'Inventory System', 'Multiplayer Mechanic'], certifications: ['Unity Certifications', 'Unreal Certifications', 'Game Dev Bootcamp'], companies: ['Blizzard', 'Bungie', 'Epic Games', 'Riot Games', 'Ubisoft', 'Mojang'], salary: '$75K - $170K', difficulty: 'Intermediate', duration: '8-14 months', resources: [{ name: 'Game Programming Patterns', url: 'https://gameprogrammingpatterns.com', type: 'docs' }, { name: 'The Cherno', url: 'https://www.youtube.com/c/TheChernoProject', type: 'course' }], books: ['Game Coding Complete', 'Artificial Intelligence for Games', 'Game Programming Patterns'], youtube: ['The Cherno', 'Game Maker\'s Toolkit', 'ThinMatrix'], practice: ['Game Jams', 'Open Source Games', 'Modding Communities'], jobRoles: ['Gameplay Engineer', 'Game Programmer', 'Gameplay Designer'], futureScope: 'Growing with indie game market, procedural generation, and AI-driven game testing.' } },
        {
          id: 'technical-artist', label: 'Technical Artist', icon: 'fa-paintbrush', color: '#115e59',
          details: { type: 'career', overview: 'Technical artists bridge the gap between artists and engineers, creating tools, shaders, and pipelines that streamline content creation.', skills: ['Shaders', 'Scripting', 'Automation', 'Asset Pipeline', 'Rigging', 'Optimization'], languages: ['Python', 'HLSL/GLSL', 'Mel', 'MaxScript', 'C#', 'Blueprints'], frameworks: ['Unity', 'Unreal Engine', 'Maya', 'Blender Python API', 'Substance'], tools: ['Maya', 'Blender', 'Substance Designer', 'Houdini', 'Photoshop', 'Perforce'], roadmap: { beginner: ['Art Principles', 'Basic Scripting', 'DCC Tools', 'Asset Pipeline Basics'], intermediate: ['Shader Development', 'Rigging', 'Tool Development', 'Pipeline Automation', 'Performance Analysis'], advanced: ['Advanced Shaders', 'Critical Path', 'R&D', 'Technical Direction', 'Team Leadership'] }, projects: ['Custom Shader Library', 'Asset Pipeline Tool', 'Rigging Automation Script', 'Material Atlas'], certifications: ['Unity Technical Artist', 'Houdini Cert.', 'Foundry Nuke Cert.'], companies: ['Epic Games', 'Blizzard', 'Naughty Dog', 'Industrial Light & Magic', 'Framestore'], salary: '$80K - $175K', difficulty: 'Intermediate', duration: '8-14 months', resources: [{ name: 'LearnOpenGL', url: 'https://learnopengl.com', type: 'course' }, { name: 'Substance Academy', url: 'https://academy.substance3d.com', type: 'course' }], books: ['The Technical Artist Handbook', 'GPU Gems', 'Real-Time Rendering'], youtube: ['Ben Cloward', 'Simon Fuchs', 'Unreal Sensei'], practice: ['ShaderLab Challenges', 'Houdini Side FX', 'Open Source DCC Scripts'], jobRoles: ['Technical Artist', 'Pipeline TD', 'Shader Writer', 'VFX TD'], futureScope: 'Real-time rendering in film, automotive, and architecture create growing demand.' } },
        {
          id: 'game-designer', label: 'Game Designer', icon: 'fa-dice', color: '#134e4a',
          details: { type: 'career', overview: 'Game designers create the core vision, mechanics, narrative, and player experience of a game through documentation and prototyping.', skills: ['Level Design', 'System Design', 'Narrative Design', 'Balancing', 'Prototyping', 'Documentation'], languages: ['Lua', 'Blueprint Visual Scripting', 'Python (basic)'], frameworks: ['Unity', 'Unreal Engine', 'Game Maker', 'RPG Maker', 'Godot'], tools: ['Figma', 'Miro', 'Notion', 'Excel', 'Twine', 'Trello'], roadmap: { beginner: ['Game Design Fundamentals', 'Documentation', 'Level Design Basics', 'Player Psychology'], intermediate: ['System Design', 'Narrative Design', 'Balancing', 'Prototyping', 'User Testing'], advanced: ['Creative Direction', 'Live Ops', 'Monetization', 'Team Leadership', 'Pitching'] }, projects: ['Tabletop Prototype', 'Level Design Portfolio', 'Game Design Document', 'Vertical Slice'], certifications: ['Game Design Specialization (Coursera)', 'Narrative Design Cert.'], companies: ['Blizzard', 'Riot Games', 'Epic Games', 'Nintendo', 'Bungie', 'Ubisoft'], salary: '$60K - $150K', difficulty: 'Beginner-friendly', duration: '4-10 months', resources: [{ name: 'Game Design Patterns', url: 'https://game-design-patterns.com', type: 'docs' }, { name: 'Extra Credits', url: 'https://www.youtube.com/user/ExtraCreditz', type: 'course' }], books: ['The Art of Game Design', 'Rules of Play', 'A Theory of Fun'], youtube: ['Game Maker\'s Toolkit', 'Extra Credits', 'GDC Talks', 'Design Doc'], practice: ['Game Jams', 'Modding', 'TTRPG Design'], jobRoles: ['Game Designer', 'Level Designer', 'Narrative Designer', 'System Designer'], futureScope: 'Growing with indie games, VR/AR experiences, and interactive storytelling.' } },
      ]
    },
    {
      id: 'iot',
      label: 'IoT (Internet of Things)',
      icon: 'fa-wifi',
      color: '#8b5cf6',
      details: {
        type: 'career',
        overview: 'IoT connects physical devices to the internet, enabling smart systems for homes, cities, factories, and healthcare.',
        whyChoose: 'Explosive growth in connected devices. Cross-disciplinary field combining hardware, software, and data.',
        skills: ['Electronics', 'Embedded Programming', 'Networking', 'Cloud Integration', 'Sensor Data Processing'],
        languages: ['Python', 'C', 'C++', 'JavaScript', 'Arduino'],
        frameworks: ['Arduino', 'ESP-IDF', 'PlatformIO', 'Node-RED', 'AWS IoT Core'],
        tools: ['Raspberry Pi', 'Arduino', 'MQTT', 'LoRa', 'Wireshark', 'Oscilloscope'],
        roadmap: {
          beginner: ['Electronics Basics', 'Arduino Programming', 'Sensor Interfacing', 'Basic Networking'],
          intermediate: ['Raspberry Pi', 'MQTT Protocols', 'Cloud IoT Platforms', 'Data Collection'],
          advanced: ['Edge Computing', 'Real-time Systems', 'Security', 'Scalable Architecture'],
        },
        projects: ['Smart Home System', 'Weather Station', 'Plant Monitor', 'Smart Parking System', 'Wearable Health Tracker'],
        certifications: ['AWS IoT Specialty', 'Cisco IoT', 'Microsoft Azure IoT Developer'],
        companies: ['Amazon', 'Google Nest', 'Siemens', 'Bosch', 'Honeywell', 'Tesla'],
        salary: '$80K - $180K',
        difficulty: 'Intermediate',
        duration: '6-12 months',
        resources: [
          { name: 'Arduino Project Hub', url: 'https://projecthub.arduino.cc', type: 'practice' },
          { name: 'Raspberry Pi Docs', url: 'https://www.raspberrypi.com/documentation', type: 'docs' },
          { name: 'AWS IoT Documentation', url: 'https://docs.aws.amazon.com/iot', type: 'docs' },
        ],
        books: ['Building Wireless Sensor Networks', 'IoT Fundamentals', 'Hands-On IoT with Raspberry Pi'],
        youtube: ['GreatScott!', 'Andreas Spiess', 'ElectroBOOM', 'Raspberry Pi Official'],
        practice: ['Hackster.io', 'Instructables', 'Arduino Project Hub', 'Adafruit Learning'],
        jobRoles: ['IoT Engineer', 'Embedded IoT Developer', 'IoT Solutions Architect', 'Firmware Engineer'],
        futureScope: 'Smart cities, industrial IoT (IIoT), connected healthcare, and autonomous systems driving massive growth.',
        salary: '$80K - $180K',
        difficulty: 'Intermediate',
        duration: '6-12 months',
      },
      children: [
        {
          id: 'iot-firmware', label: 'IoT Firmware Developer', icon: 'fa-microchip', color: '#a78bfa',
          details: { type: 'career', overview: 'IoT firmware developers write low-level software that runs on IoT devices, managing sensors, connectivity, and power.', skills: ['Embedded C/C++', 'RTOS', 'Sensor Integration', 'Low-Power Design', 'Wireless Protocols', 'Memory Mgmt'], languages: ['C', 'C++', 'Rust', 'MicroPython', 'Assembly (basic)'], frameworks: ['FreeRTOS', 'Zephyr', 'Arduino Core', 'ESP-IDF', 'Mbed OS'], tools: ['STM32Cube', 'PlatformIO', 'Oscilloscope', 'Logic Analyzer', 'JTAG Debugger'], roadmap: { beginner: ['Embedded C', 'Microcontroller Basics', 'GPIO/UART', 'Arduino/ESP32'], intermediate: ['RTOS Concepts', 'I2C/SPI', 'Sensor Drivers', 'WiFi/Bluetooth', 'Power Management'], advanced: ['Bare Metal Optimization', 'Security', 'FOTA Updates', 'Custom Drivers', 'Board Bring-up'] }, projects: ['Weather Station', 'Smart Light Controller', 'Sensor Hub', 'MQTT Gateway'], certifications: ['ARM Cert.', 'FreeRTOS Cert.', 'Embedded Systems Cert. (UTE)'], companies: ['Texas Instruments', 'NXP', 'Espressif', 'Bosch', 'Siemens', 'Honeywell'], salary: '$75K - $160K', difficulty: 'Intermediate', duration: '8-14 months', resources: [{ name: 'Espressif Docs', url: 'https://docs.espressif.com', type: 'docs' }, { name: 'DigiKey Embedded', url: 'https://www.digikey.com/en/blog/embedded', type: 'practice' }], books: ['Making Embedded Systems', 'The Designer\'s Guide to the Cortex-M', 'Embedded C Programming'], youtube: ['Phil\'s Lab', 'Shawn Hymel', 'GreatScott!', 'Andreas Spiess'], practice: ['Hackster.io', 'ESP32 Projects', 'STM32 Cube Projects'], jobRoles: ['IoT Firmware Engineer', 'Embedded Software Engineer', 'Firmware Developer'], futureScope: 'Growing with smart homes, industrial IoT, and wearable devices.' } },
        {
          id: 'iot-architect', label: 'IoT Solutions Architect', icon: 'fa-network-wired', color: '#8b5cf6',
          skills: ['System Architecture', 'Cloud IoT', 'Device Management', 'Data Pipeline', 'Security', 'Protocols'], languages: ['Python', 'Node.js', 'Java', 'C#', 'Go'], frameworks: ['AWS IoT Core', 'Azure IoT Hub', 'Google Cloud IoT', 'Kubernetes', 'MQTT'], tools: ['Docker', 'Kubernetes', 'Grafana', 'InfluxDB', 'Node-RED', 'Postman'], roadmap: { beginner: ['IoT Protocols', 'Cloud Basics', 'Networking', 'Python'], intermediate: ['Cloud IoT Platforms', 'Device Provisioning', 'Data Pipeline', 'Security'], advanced: ['Scale Architecture', 'Edge Computing', 'AI at Edge', 'Multi-Cloud IoT', 'Compliance'] }, projects: ['Smart Building Dashboard', 'IoT Data Pipeline', 'Device Fleet Manager', 'Edge Analytics'], certifications: ['AWS IoT Specialty', 'Azure IoT Developer', 'GCP IoT Engineer'], companies: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Cisco', 'Bosch', 'PTC'], salary: '$110K - $210K', difficulty: 'Advanced', duration: '8-14 months', resources: [{ name: 'AWS IoT Docs', url: 'https://docs.aws.amazon.com/iot', type: 'docs' }, { name: 'MQTT.org', url: 'https://mqtt.org', type: 'docs' }], books: ['Building the Internet of Things', 'IoT and Edge Computing for Architects'], youtube: ['IoT For All', 'Home Automation Guy', 'The Voltlog'], practice: ['Hackster.io Projects', 'AWS IoT Workshops', 'Personal Smart Home'], jobRoles: ['IoT Architect', 'IoT Solutions Architect', 'Systems Architect'], futureScope: 'Smart cities, Industry 4.0, and healthcare IoT are expanding roles dramatically.', salary: '$110K - $210K', difficulty: 'Advanced', duration: '8-14 months' },
        {
          id: 'edge-computing', label: 'Edge Computing Engineer', icon: 'fa-server', color: '#7c3aed',
          skills: ['Edge Architecture', 'Containerization', 'ML at Edge', 'Network Edge', 'Latency Optimization'], languages: ['Python', 'Rust', 'Go', 'C++', 'JavaScript'], frameworks: ['EdgeX Foundry', 'AWS Greengrass', 'KubeEdge', 'OpenYurt', 'LF Edge'], tools: ['Docker', 'Kubernetes', 'Prometheus', 'Grafana', 'TensorFlow Lite'], roadmap: { beginner: ['Linux', 'Networking', 'Python', 'Containers'], intermediate: ['Edge Architectures', 'EdgeX Foundry', 'Greengrass', 'CI/CD for Edge'], advanced: ['Distributed ML', 'Edge Orchestration', 'Security at Edge', '5G Edge'] }, projects: ['Edge Video Analytics', 'IoT Edge AI', 'Edge Node Monitor', '5G Edge App'], certifications: ['AWS Edge Cert.', 'LF Edge Certification', 'NVIDIA Edge AI'], companies: ['AWS (Wavelength)', 'Azure (Edge Zones)', 'Cloudflare', 'Fastly', 'NVIDIA', 'HPE'], salary: '$100K - $200K', difficulty: 'Advanced', duration: '10-16 months', resources: [{ name: 'EdgeX Foundry', url: 'https://www.edgexfoundry.org', type: 'docs' }, { name: 'KubeEdge Docs', url: 'https://kubeedge.io/en/docs', type: 'docs' }], books: ['Edge Computing', 'IoT Edge Computing Cookbook'], youtube: ['Edge Computing World', 'CNCF Edge Day'], practice: ['EdgeX Demo', 'Personal Edge Server', 'AWS Free Tier Edge'], jobRoles: ['Edge Computing Engineer', 'Edge Architect', 'Edge AI Engineer'], futureScope: '5G, real-time AI inference, and autonomous systems make edge computing a key growth area.', salary: '$100K - $200K', difficulty: 'Advanced', duration: '10-16 months' },
        {
          id: 'embedded-iot-dev', label: 'Embedded IoT Developer', icon: 'fa-plug', color: '#6d28d9',
          details: { type: 'career', overview: 'Embedded IoT developers combine hardware skills with IoT connectivity to build end-to-end smart devices.', skills: ['Embedded Systems', 'Wireless Protocols', 'PCB Basics', 'IoT Cloud', 'Low-Power Design', 'Prototyping'], languages: ['C', 'C++', 'Python', 'MicroPython', 'Arduino'], frameworks: ['ESP-IDF', 'Arduino', 'Zephyr', 'FreeRTOS', 'Mongoose OS'], tools: ['PlatformIO', 'KiCad', 'Altium', 'Logic Analyzer', 'Wireshark', 'MQTT Broker'], roadmap: { beginner: ['Arduino/ESP32', 'Sensor Basics', 'Breadboarding', 'C Programming'], intermediate: ['RTOS', 'WiFi/BLE', 'Cloud Connectivity', 'PCB Design', 'Custom Protocols'], advanced: ['Production Firmware', 'OTA Updates', 'Security', 'Low-Power Optimization', 'FCC/CE Cert'] }, projects: ['Smart Plant Monitor', 'IoT Relay Controller', 'Environmental Sensor', 'Battery-Powered Tracker'], certifications: ['Embedded Systems Cert. (UTE)', 'ARM Cortex M Cert.', 'IoT Security Cert.'], companies: ['Particle', 'Espressif', 'Bosch', 'Siemens', 'Adafruit', 'SparkFun'], salary: '$75K - $155K', difficulty: 'Intermediate', duration: '6-12 months', resources: [{ name: 'PlatformIO Docs', url: 'https://docs.platformio.org', type: 'docs' }, { name: 'IoT For All', url: 'https://www.iotforall.com', type: 'practice' }], books: ['IoT Projects with ESP32', 'Arduino IoT Cloud Cookbook', 'Embedded Systems for IoT'], youtube: ['Random Nerd Tutorials', 'DroneBot Workshop', 'GreatScott!'], practice: ['Hackster.io', 'Instructables', 'Arduino Project Hub'], jobRoles: ['Embedded IoT Developer', 'IoT Firmware Engineer', 'Embedded Systems Engineer'], futureScope: 'Smart agriculture, healthcare wearables, and connected infrastructure drive IoT growth.' } },
      ]
    },
    {
      id: 'embedded-systems',
      label: 'Embedded Systems',
      icon: 'fa-microchip',
      color: '#64748b',
      details: {
        type: 'career',
        overview: 'Embedded Systems engineers develop software and hardware for devices with dedicated functions — from microcontrollers to medical devices.',
        whyChoose: 'Critical infrastructure role. Work at the intersection of hardware and software. High stability and demand across industries.',
        skills: ['C/C++', 'Microcontrollers', 'RTOS', 'Hardware Interfacing', 'Circuit Design', 'Debugging'],
        languages: ['C', 'C++', 'Assembly', 'Python', 'Rust'],
        frameworks: ['Embedded Linux', 'FreeRTOS', 'ARM mbed', 'PlatformIO'],
        tools: ['STM32', 'Arduino', 'Raspberry Pi', 'JTAG/SWD', 'Oscilloscope', 'KiCad'],
        roadmap: {
          beginner: ['C Programming', 'Digital Electronics', 'Microcontroller Basics', 'GPIO & Timers'],
          intermediate: ['RTOS Concepts', 'Linux Embedded', 'Protocols (I2C, SPI, UART)', 'Debugging Tools'],
          advanced: ['SoC Design', 'FPGA Basics', 'Real-time Systems', 'Security', 'Power Management'],
        },
        projects: ['LED Matrix Display', 'Sensor Data Logger', 'Motor Control System', 'IoT Gateway', 'Digital Clock'],
        certifications: ['ARM Accredited Engineer', 'Embedded Systems Cert (UC Irvine)', 'RTOS Certification'],
        companies: ['Intel', 'NVIDIA', 'Qualcomm', 'Texas Instruments', 'Bosch', 'Siemens', 'Tesla'],
        salary: '$80K - $180K',
        difficulty: 'Intermediate',
        duration: '8-14 months',
        resources: [
          { name: 'Embedded Systems Course', url: 'https://www.edx.org/course/embedded-systems', type: 'course' },
          { name: 'ARM Developer Docs', url: 'https://developer.arm.com', type: 'docs' },
          { name: 'STM32Cube Docs', url: 'https://www.st.com/en/development-tools/stm32cubeide.html', type: 'docs' },
        ],
        books: ['Making Embedded Systems', 'Embedded C Coding Standard', 'The Designer\'s Guide to the Cortex-M'],
        youtube: ['PhilsLab', 'DigiKey', 'GreatScott!', 'Mikeselectricstuff'],
        practice: ['Embedded Lab', 'Adafruit Learning', 'SparkFun Tutorials', 'Hackster.io Embedded'],
        jobRoles: ['Embedded Engineer', 'Firmware Engineer', 'Hardware Engineer', 'Embedded Systems Architect'],
        futureScope: 'Growing with IoT, autonomous vehicles, medical devices, and edge computing requiring embedded expertise.',
        salary: '$80K - $180K',
        difficulty: 'Intermediate',
        duration: '8-14 months',
      },
      children: [
        {
          id: 'firmware-engineer', label: 'Firmware Engineer', icon: 'fa-floppy-disk', color: '#64748b',
          details: { type: 'career', overview: 'Firmware engineers write low-level software that directly controls hardware, from boot loaders to device drivers.', skills: ['Embedded C/C++', 'RTOS', 'Driver Development', 'Bootloader', 'Memory Mgmt', 'Debugging'], languages: ['C', 'C++', 'Rust', 'Assembly', 'Python'], frameworks: ['FreeRTOS', 'Zephyr', 'CMSIS', 'ARM Mbed', 'RT-Thread'], tools: ['GCC/GDB', 'JTAG/SWD', 'Logic Analyzer', 'Segger J-Link', 'Tracealyzer', 'Valgrind'], roadmap: { beginner: ['C Programming', 'Microcontroller Basics', 'Datasheet Reading', 'GPIO/Timers/Interrupts'], intermediate: ['RTOS Concepts', 'Peripheral Drivers', 'I2C/SPI/UART', 'Memory Management', 'DMA'], advanced: ['Bare Metal', 'BSP Development', 'Security', 'Power Optimization', 'Bootloader Design'] }, projects: ['Custom Bootloader', 'USB Device Driver', 'RTOS Scheduler', 'Sensor Fusion Driver'], certifications: ['ARM Accredited Engineer', 'RTOS Certification (FreeRTOS)', 'Embedded Systems Cert.'], companies: ['ARM', 'NXP', 'STMicroelectronics', 'Texas Instruments', 'Microchip', 'Intel'], salary: '$80K - $170K', difficulty: 'Intermediate', duration: '8-14 months', resources: [{ name: 'Embedded.fm', url: 'https://embedded.fm', type: 'practice' }, { name: 'Beningo Embedded', url: 'https://www.beningo.com', type: 'docs' }], books: ['Embedded C', 'The Art of Designing Embedded Systems', 'Making Embedded Systems'], youtube: ['Phil\'s Lab', 'Mikeselectricstuff', 'Doug Mercer\'s Embedded', 'MicroType Engineering'], practice: ['STM32 Projects', 'Raspberry Pi Pico', 'Teensy Projects'], jobRoles: ['Firmware Engineer', 'Embedded Software Engineer', 'BSP Engineer'], futureScope: 'Growing with IoT, automotive (EVs), medical devices, and edge computing.' } },
        {
          id: 'embedded-linux', label: 'Embedded Linux Engineer', icon: 'fa-terminal', color: '#475569',
          details: { type: 'career', overview: 'Embedded Linux engineers port, configure, and optimize Linux for embedded devices like routers, smart displays, and industrial controls.', skills: ['Linux Kernel', 'Yocto/Buildroot', 'Device Tree', 'Kernel Modules', 'BSP', 'Boot Optimization'], languages: ['C', 'C++', 'Python', 'Bash', 'Yocto BitBake'], frameworks: ['Yocto Project', 'Buildroot', 'OpenEmbedded', 'Bash', 'Systemd'], tools: ['Buildroot', 'Yocto', 'U-Boot', 'Device Tree Compiler', 'Linux Tracing', 'Git'], roadmap: { beginner: ['Linux Fundamentals', 'C Programming', 'Shell Scripting', 'Git'], intermediate: ['Yocto/Buildroot', 'Device Tree', 'Kernel Config', 'U-Boot', 'Filesystems'], advanced: ['Kernel Module Development', 'Custom BSP', 'Realtime Linux', 'Performance Tuning', 'Security Hardening'] }, projects: ['Custom Yocto Image', 'Kernel Module', 'Embedded Web Server', 'Device Tree Overlay'], certifications: ['Linux Foundation Cert.', 'Yocto Project Training', 'ARM Linux Cert.'], companies: ['Texas Instruments', 'NXP', 'Qualcomm', 'Samsung', 'Intel', 'AMD/Xilinx'], salary: '$90K - $180K', difficulty: 'Advanced', duration: '10-16 months', resources: [{ name: 'Yocto Docs', url: 'https://docs.yoctoproject.org', type: 'docs' }, { name: 'Bootlin Embedded Linux', url: 'https://bootlin.com/docs', type: 'course' }], books: ['Mastering Embedded Linux Programming', 'Linux Device Drivers', 'Yocto for Embedded Linux'], youtube: ['Bootlin', 'Kernel Recipes', 'Embedded Linux Talks'], practice: ['Raspberry Pi Linux Build', 'BeagleBone Projects', 'QEMU Emulation'], jobRoles: ['Embedded Linux Engineer', 'BSP Engineer', 'Platform Software Engineer'], futureScope: 'Linux runs most non-trivial embedded devices — medical, automotive, industrial, and consumer.' } },
        {
          id: 'hardware-engineer', label: 'Hardware Engineer', icon: 'fa-bolt', color: '#334155',
          details: { type: 'career', overview: 'Hardware engineers design and test the physical electronic circuits and PCBAs that power embedded systems.', skills: ['Circuit Design', 'PCB Layout', 'Signal Integrity', 'Power Electronics', 'FPGA', 'Testing'], languages: ['Verilog', 'VHDL', 'SPICE', 'Python (for automation)'], frameworks: ['RISC-V', 'ARM Cortex', 'FPGA (Xilinx/Intel)'], tools: ['Altium Designer', 'KiCad', 'Eagle', 'LTspice', 'Oscilloscope', 'Spectrum Analyzer'], roadmap: { beginner: ['Electronics Basics', 'Circuit Analysis', 'PCB Design', 'Soldering'], intermediate: ['Multi-Layer PCB', 'High-Speed Design', 'Signal Integrity', 'EMI/EMC', 'Simulation'], advanced: ['FPGA Design', 'Custom Silicon/ASIC', 'RF Design', 'Power Management', 'FCC/CE Pre-Compliance'] }, projects: ['Custom PCB Breakout Board', 'Sensor Module', 'Power Supply', 'FPGA Game'], certifications: ['IPC CID+', 'ARM Accredited', 'Altium Certification'], companies: ['Apple', 'Samsung', 'Intel', 'NVIDIA', 'AMD', 'Tesla'], salary: '$80K - $190K', difficulty: 'Advanced', duration: '10-18 months', resources: [{ name: 'KiCad Docs', url: 'https://docs.kicad.org', type: 'docs' }, { name: 'Altium Academy', url: 'https://www.altium.com/academy', type: 'course' }], books: ['The Art of Electronics', 'High-Speed Digital Design', 'PCB Design for Real-World EMI Control'], youtube: ['EEVblog', 'The Signal Path', 'MicroType Engineering', 'Robert Feranec'], practice: ['PCB Design Projects', 'Open Source HW', 'Hackaday.io'], jobRoles: ['Hardware Engineer', 'PCB Designer', 'Electrical Design Engineer', 'FPGA Engineer'], futureScope: 'Hardware is essential for IoT, EVs, aerospace, consumer electronics, and 5G infrastructure.' } },
        {
          id: 'rtos-dev', label: 'RTOS Developer', icon: 'fa-clock', color: '#1e293b',
          details: { type: 'career', overview: 'RTOS developers build deterministic real-time systems for mission-critical applications like medical devices, automotive ECUs, and industrial controllers.', skills: ['Real-Time Scheduling', 'Task Management', 'IPC', 'Timer Services', 'Resource Mgmt', 'Hardware Abstraction'], languages: ['C', 'C++', 'Rust', 'Assembly (ARM/AVR)'], frameworks: ['FreeRTOS', 'Zephyr', 'uC/OS-III', 'RT-Thread', 'Azure RTOS'], tools: ['FreeRTOS Kernel', 'Tracealyzer', 'Percepio', 'Segger SystemView', 'Wind River Workbench'], roadmap: { beginner: ['C Programming', 'OS Basics', 'Process/Thread', 'Mutex/Semaphore'], intermediate: ['RTOS Concepts', 'FreeRTOS', 'Task Priorities', 'Queue Management', 'ISR Handling'], advanced: ['Multi-Core RTOS', 'Safety Critical (ISO 26262)', 'Certification', 'Hypervisor', 'QNX'] }, projects: ['RTOS Task Scheduler Demo', 'Real-Time Sensor Log', 'Motor Controller', 'Multithreaded Data Logger'], certifications: ['FREE-RTOS Certificate', 'Wind River VxWorks', 'Embedded RTOS Cert.'], companies: ['NXP', 'Texas Instruments', 'STMicro', 'Bosch', 'Denso', 'Wind River'], salary: '$85K - $175K', difficulty: 'Intermediate', duration: '8-14 months', resources: [{ name: 'FreeRTOS Docs', url: 'https://www.freertos.org/RTOS.html', type: 'docs' }, { name: 'Zephyr Docs', url: 'https://docs.zephyrproject.org', type: 'docs' }], books: ['Real-Time Systems (Liu)', 'Embedded RTOS Design', 'FreeRTOS Kernel Guide'], youtube: ['FreeRTOS Tutorials', 'Zephyr Talks', 'STMicro RTOS Seminars'], practice: ['STM32 + FreeRTOS', 'ESP32 + FreeRTOS', 'Raspberry Pi Pico'], jobRoles: ['RTOS Developer', 'Embedded Software Engineer', 'Firmware Engineer (Real-Time)'], futureScope: 'ADAS, medical devices, industrial automation, and aerospace all require RTOS expertise.' } },
      ]
    },
  ]
};

export function findNode(tree, targetId) {
  if (tree.id === targetId) return tree;
  if (!tree.children) return null;
  for (const child of tree.children) {
    const found = findNode(child, targetId);
    if (found) return found;
  }
  return null;
}

export function getAncestors(tree, targetId, path = []) {
  path.push({ id: tree.id, label: tree.label, icon: tree.icon, color: tree.color });
  if (tree.id === targetId) return path;
  if (!tree.children) return null;
  for (const child of tree.children) {
    const found = getAncestors(child, targetId, [...path]);
    if (found) return found;
  }
  return null;
}

export function searchTree(tree, query) {
  const results = [];
  const lower = query.toLowerCase();
  function search(node) {
    if (node.label.toLowerCase().includes(lower)) results.push(node.id);
    if (node.children) node.children.forEach(search);
  }
  search(tree);
  return results;
}

export function getMatchingAncestors(tree, targetId, ancestors = []) {
  ancestors.push(tree.id);
  if (tree.id === targetId) return ancestors;
  if (!tree.children) return null;
  for (const child of tree.children) {
    const found = getMatchingAncestors(child, targetId, [...ancestors]);
    if (found) return found;
  }
  return null;
}
