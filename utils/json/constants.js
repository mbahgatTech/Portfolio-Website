const PROFILE = {
  MAZEN_BAHGAT: 'Mazen Bahgat',
  JOB_TITLE: 'Full Stack Developer',
  BRIEF: [ 
    'An adept software engineer dedicated to creating impactful and seamless user experiences.', 
    'I specialize in the development of robust and innovative solutions across web, mobile, and desktop platforms.',
    'With a proven track record in delivering high-quality applications, I bring a wealth of experience in architecting efficient and scalable software.'
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
  HOME_TITLE: `${PROFILE.MAZEN_BAHGAT} | ${PROFILE.JOB_TITLE}`,
  // Shown under the title in search results; keep it under ~160 characters.
  HOME_DESCRIPTION: 'Portfolio of Mazen Bahgat, a full stack developer who has built software at Microsoft and NCR using React, Node.js, .NET, Azure, and Kubernetes.',
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