const PROFILE = {
  MAZEN_BAHGAT: 'Mazen Bahgat',
  JOB_TITLE: 'Full Stack Developer',
  BRIEF: [
    'I\'m a software engineer building secure, reliable enterprise software across the full development lifecycle. I combine hands-on development with system-level thinking, focusing on sound architecture, maintainable code, and systems that hold up in production.',
    'My experience at Microsoft and NCR spans enterprise workflow automation, banking applications, and cloud services. I\'ve worked across frontend and backend engineering, cloud infrastructure, CI/CD, security, observability, and enterprise governance, collaborating with customers and cross-functional teams to build systems that evolve with real-world needs.'
  ],
  RESUME_BUTTON: 'Download Resume'
};
const NAVIGATION = [
  { name: 'GitHub', href: 'https://github.com/mbahgatTech' },
  { name: 'Linkedin', href: 'https://www.linkedin.com/in/mazen-bahgat/' }
];
// Search-engine and link-preview metadata (rendered by components/Seo.jsx).
// SITE_URL is the canonical production origin: the bare domain redirects to www.
const SEO = {
  SITE_URL: 'https://www.mazenbahgat.com',
  SITE_NAME: PROFILE.MAZEN_BAHGAT,
  HOME_TITLE: `${PROFILE.MAZEN_BAHGAT} | Software Engineer`,
  // Keep the search and link-preview summary concise, separate from the page intro.
  HOME_DESCRIPTION: `${PROFILE.MAZEN_BAHGAT} is a software engineer with Microsoft and NCR experience, building secure, reliable enterprise software across the full development lifecycle.`,
  IMAGE: { PATH: '/images/profile.jpg', WIDTH: 1245, HEIGHT: 1552, ALT: 'Photo of Mazen Bahgat' },
};
const MODAL = {
  MESSAGE_SUCCESS: 'Success: Your message has been sent!',
  MESSAGE_FAILURE: 'Failure: We could not send your message, please try again at a later time.',
  CLOSE_MODAL: 'Close Modal',
  CONFIRMATION_PROMPT: 'Are you sure you want to send this message?',
  CANCEL_OPERATION: 'No, cancel',
  CONFIRM_OPERATION: 'Yes, I am sure'
};

export { PROFILE, NAVIGATION, SEO, MODAL };