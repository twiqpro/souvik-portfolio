/**
 * Desktop layout: three explicit columns (top → bottom within each column).
 * Optional `avatar` path under /public/testimonials/.
 */
export const TESTIMONIALS_BY_ID = {
  viprav: {
    id: 'viprav',
    name: 'Viprav Anand',
    role: 'Staff ML Engineer, ZUMA',
    initials: 'VA',
    quote:
      'Souvik has been a great asset to our organization. His ability to understand complex problems and deliver solutions using no-code tools has significantly accelerated our product development. He brings clarity to ambiguous requirements and consistently ships work that moves the team forward.',
  },
  shiv: {
    id: 'shiv',
    name: 'Shiv Gettu',
    role: 'CEO, ZUMA',
    initials: 'SG',
    badge: 'HIRING',
    quote:
      'Souvik is one of the most dedicated and creative people I have worked with. His can-do mindset, attention to detail, and willingness to go beyond traditional product design boundaries make him an invaluable member of any team. He consistently delivers high-quality work under tight deadlines.',
  },
  niketan: {
    id: 'niketan',
    name: 'Niketan',
    role: 'Senior Product Manager, ZUMA',
    initials: 'N',
    quote:
      'Working with Souvik has been an absolute pleasure. He consistently went above and beyond his role as a product designer — contributing to video production, motion design, and low-code front-end implementation whenever the team needed it.\n\nHis ability to translate complex product requirements into intuitive, user-friendly designs is exceptional. Souvik brings a rare combination of design sensibility and technical fluency that made collaboration with engineering seamless.\n\nHe is proactive, receptive to feedback, and always focused on delivering outcomes that matter to users. Any team would be lucky to have him. Rock on Souvik!',
  },
  aish: {
    id: 'aish',
    name: 'Aish',
    role: 'SDE II, ZUMA',
    initials: 'A',
    quote:
      'Souvik is a passionate designer and an amazing guy to work with. He brings energy to every project and always puts the user first. His designs are thoughtful, polished, and grounded in real customer needs.',
  },
  riley: {
    id: 'riley',
    name: 'Riley Jameson',
    role: 'Sr. Product Manager, ZUMA',
    initials: 'RJ',
    quote:
      'Souvik is a resourceful product designer and low-code developer. His deep expertise in Retool and ability to build efficient UI solutions for early-stage products significantly streamlined our front-end development process.',
  },
  chetan: {
    id: 'chetan',
    name: 'Chetan Giri',
    role: 'SDE III, ZUMA',
    initials: 'CG',
    quote:
      'Souvik was a crucial team member at Zuma, bringing strong skills as a product designer and low-code developer. His ability to develop efficient UI solutions for early-stage products, combined with his deep knowledge of Retool, significantly streamlined our front-end development process. He worked swiftly and was always open to feedback, which made collaboration and iteration much smoother. Souvik\'s clear passion for design and his focus on delivering practical, effective solutions had a noticeable positive impact on our projects.',
  },
  aditya: {
    id: 'aditya',
    name: 'Aditya Chakraborty',
    role: 'SDE I, ZUMA',
    initials: 'AC',
    quote:
      'I had the pleasure of working with Souvik at Zuma, where he was a Product Designer 3 on our team. He was great at delivering user-centric designs while being mindful of technical constraints, making collaboration with frontend engineers seamless. Souvik was always supportive, open to feedback, and quick to iterate, making him a key asset to our team.',
  },
};

/** Column 1 → column 2 → column 3 on desktop */
export const TESTIMONIAL_COLUMNS = [
  ['riley', 'viprav', 'aish'],
  ['shiv', 'aditya'],
  ['niketan', 'chetan'],
];

export const TESTIMONIALS = TESTIMONIAL_COLUMNS.flat().map((id) => TESTIMONIALS_BY_ID[id]);
