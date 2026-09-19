export const PROFILE = {
  name: 'Owaiz Shaikh',
  role: 'Backend Developer',
  email: 'sheikhuwai@gmail.com',
  github: 'https://github.com/Shaikhuwaiz',
} as const

export const NAV_DESTS = [
  { key: 'home', label: 'Home', index: '01' },
  { key: 'about', label: 'About', index: '02' },
  { key: 'projects', label: 'Projects', index: '03' },
  { key: 'contact', label: 'Contact', index: '04' },
] as const

export type DestKey = (typeof NAV_DESTS)[number]['key']

export const ABOUT_LINES = [
  "I'm a backend-focused developer working primarily with Python. I build scalable APIs, design clean system architectures, and focus on performance and reliability.",
  'My work revolves around Django, PostgreSQL, and building systems that are simple, efficient, and maintainable.',
] as const

export const FOCUS_AREAS = [
  'Python',
  'Django',
  'PostgreSQL',
  'REST APIs',
  'System Design',
  'Reliability',
] as const

export const FEATURED_PROJECT = {
  name: 'Talaria',
  tag: 'Freight tracking platform',
  desc: 'Freight tracking platform.',
  tags: ['Logistics', 'Tracking', 'Freight'],
} as const

export const OTHER_PROJECTS = [
  { title: 'OpenClaw Gateway', desc: 'Terminal-based system with real-time logs.' },
  { title: 'Django API', desc: 'Scalable backend APIs with auth.' },
  { title: 'Automation Tool', desc: 'Python scripts to reduce manual work.' },
] as const