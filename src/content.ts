// Every visible word on the page comes from this file (MediFast copy).
import home from './assets/home.webp'
import search from './assets/search.webp'
import product from './assets/product.webp'
import cart from './assets/cart.webp'

export const links = {
  live: 'https://live.medifastbd.com',
  googlePlay: 'https://play.google.com/store',
  linkedin: 'https://www.linkedin.com/',
  github: 'https://github.com/',
}

export const screens = {
  home: { src: home, alt: 'MediFast app home screen with search, offers, top brands and medicines' },
  search: { src: search, alt: 'MediFast app search screen listing pharmaceutical companies' },
  product: { src: product, alt: 'MediFast app product page showing the wholesale price and saving' },
  cart: { src: cart, alt: 'MediFast app bag with items, subtotal and Proceed to Checkout' },
}

export const brand = { name: 'MediFast', tagline: 'B2B medicine wholesale, made simple.' }

export const nav = {
  // dock order: Home, the sections, About; the primary action sits after a divider
  home: { label: 'Home', href: '#top' },
  about: { label: 'About', href: '#about' },
  links: [
    { label: 'How it works', href: '#how' },
    { label: 'Platform', href: '#platform' },
    { label: 'The app', href: '#app' },
    { label: 'Customers', href: '#customers' },
    { label: 'FAQ', href: '#faq' },
  ],
  cta: 'Start ordering',
}

export const buttons = {
  live: 'Visit live platform',
  playSmall: 'GET IT ON',
  play: 'Google Play',
  appSmall: 'Coming soon on the',
  app: 'App Store',
}

export const hero = {
  lines: ['Wholesale prices', 'no one dared to try.', 'Sorry, competitors.'],
  subline:
    'MediFast connects pharmacies, clinics and hospitals directly with verified suppliers — transparent wholesale pricing, live stock and dependable delivery on one platform.',
  ticks: ['Licensed suppliers only', 'Batch & expiry tracked', 'Invoice-ready orders'],
  // shown one at a time beside the phone, in step with the screen cycle
  statuses: ['Account approved', 'Licence verified', 'Order dispatched', 'Tracking live'],
}

export const categories = [
  'Antibiotics', 'Cardiovascular', 'Diabetes care', 'Gastro & digestive', 'Pain & fever',
  'Respiratory', 'Vitamins & supplements', 'Dermatology', 'Surgical & consumables',
]

export const how = {
  label: 'HOW IT WORKS',
  heading: 'From licence to delivery in three steps.',
  steps: [
    { step: 'STEP 01', title: 'Register your business', body: 'Sign up with your trade and drug licence. Every pharmacy, clinic and hospital is verified before the first order.' },
    { step: 'STEP 02', title: 'Order at wholesale rates', body: 'Search by generic, brand or pharmaceutical company, compare prices and place bulk orders in a few taps.' },
    { step: 'STEP 03', title: 'Track and receive', body: 'Follow every shipment in real time and receive stock with batch numbers, expiry dates and a VAT-ready invoice.' },
  ],
}

export const platform = {
  label: 'THE PLATFORM',
  heading: 'Everything procurement needs, in one place.',
  intro: 'Built for the way medicine is really bought: in bulk, on delivery, with compliance at every step.',
  // shown as alternating rows, each beside a phone screen
  rows: [
    {
      title: 'Every supplier is licence-checked',
      body: 'Manufacturers and distributors are verified before they can list, so everything you buy is genuine and traceable — right down to the batch on the box.',
      screen: 'search' as const,
    },
    {
      title: 'Tiered wholesale pricing',
      body: 'Transparent slab pricing that rewards volume — see your exact rate and saving before you check out.',
      screen: 'product' as const,
    },
    {
      title: 'Cash on delivery',
      body: 'Pay when the order reaches your counter — no advance payment and no card details, so your money moves only once the stock does.',
      screen: 'cart' as const,
    },
  ],
  // shown as tiles
  tiles: [
    { title: 'Real-time stock', body: 'Live availability across suppliers, with alternatives suggested when an item runs short.' },
    { title: 'Batch & expiry visibility', body: 'See batch numbers and expiry dates before ordering, and keep near-expiry stock off your shelves.' },
    { title: 'Tracked delivery', body: 'Careful handling and live order tracking from the supplier’s warehouse to your counter.' },
  ],
}

export const app = {
  label: 'INSIDE THE APP',
  heading: 'Your wholesale counter, in your pocket.',
  body: 'Search thousands of products by company or generic, check the exact wholesale rate, and send the order — from the shop floor.',
  getApp: 'Get the MediFast app',
  features: ['One-tap reorder', 'Scan to find a product', 'Delivery notifications'],
}

export const customers = {
  label: 'WHO WE SERVE',
  heading: 'One platform for the whole supply chain.',
  items: [
    { tag: 'RETAIL', title: 'Pharmacies', body: 'Restock daily essentials at wholesale rates without chasing multiple distributors on the phone.' },
    { tag: 'INSTITUTIONAL', title: 'Hospitals & clinics', body: 'Consolidated purchasing, approval workflows and scheduled deliveries for every department.' },
    { tag: 'SUPPLY', title: 'Suppliers & distributors', body: 'Reach verified buyers nationwide and manage orders, stock and payouts from a single dashboard.' },
  ],
}

export const faq = {
  label: 'QUESTIONS',
  heading: 'Before you register.',
  items: [
    {
      q: 'Who can buy on MediFast?',
      a: 'MediFast sells to licensed businesses only — pharmacies, clinics, hospitals and institutional buyers. You will need a valid trade licence and drug licence to open an account. We do not sell to individuals.',
    },
    {
      q: 'How does account approval work?',
      a: 'Submit your licence details when you register. Our team checks them against the issuing records and activates your account once everything is verified. You will be notified as soon as it is approved. [Add your typical review time here.]',
    },
    {
      q: 'How is wholesale pricing calculated?',
      a: 'Pricing is tiered by volume, so the rate improves as the quantity goes up. Your exact rate and the saving against the printed price are shown on the product page and in the cart before you confirm the order — there is nothing to negotiate by phone.',
    },
    {
      q: 'Which payment methods do you accept?',
      a: 'For now we accept cash on delivery only. You pay when the order reaches your counter, so nothing leaves your account before the stock is in your hands.',
    },
    {
      q: 'Where do you deliver, and is there a minimum order?',
      a: "We deliver inside Dhaka and outside Dhaka. Inside Dhaka there is no minimum order value. Outside Dhaka the minimum order is ৳10,000. Every order can be tracked in the app from the supplier's warehouse to your counter.",
    },
  ],
}

export const about = {
  label: 'BEHIND THE PRODUCT',
  heading: 'The person behind MediFast.',
  name: 'Rishu Mondal',
  role: 'CO-FOUNDER & TECH HEAD',
  quote: 'In a world where cheap things are overrated, I would rather be underrated.',
  skills: ['Brand & identity', 'System design', 'Mobile app', 'Web platform', 'POS system', 'Inventory'],
  portfolio: 'About me',
}

// The "About me" page (opens at #/about-me from the About me button)
export const aboutMe = {
  kicker: 'Rishu Mondal · Co-founder & tech head',
  big: ['F', 'you.'],
  line: "I don't need to prove my qualifications.",
  cue: 'Just drop what you actually need',
  strikeLabel: "What you won't get from me",
  strikes: ['Degrees', 'Certificates', 'A polished CV', 'References', 'Fancy titles'],
  // ...and then the receipts, since people ask anyway
  receipts: {
    label: "Since you'll ask anyway",
    heading: ['The', 'receipts.'],
    items: [
      { icon: 'shield', tag: 'Certified', big: 'OSCP', title: 'OffSec Certified Professional', meta: 'Offensive security · OffSec' },
      { icon: 'code', tag: 'Certified', big: 'Java', title: 'Oracle Java certification', meta: 'Programming · Oracle' },
      { icon: 'trophy', tag: 'Ranked', big: '#7', rank: { of: 22000, place: 7 }, title: 'out of 22,000 students', meta: 'Hunt the Coder competition' },
    ],
  },
  resolve: "The work speaks for itself. Tell me what you need and I'll build it.",
  buildsLabel: 'What I build',
  form: {
    label: "The only form you'll fill",
    heading: ['Drop it', 'here.'],
    intro: "Skip the small talk. Say what you actually need and how to reach you. I'll take it from there.",
    needsLabel: 'What do you need?',
    needs: ['Website', 'Mobile app', 'Brand & identity', 'System design', 'POS / inventory', 'Something else'],
    name: 'Your name',
    contact: 'Email or WhatsApp number',
    message: 'What do you actually need?',
    timelineLabel: 'When do you need it?',
    timeline: ['ASAP', 'This month', 'No rush'],
    email: 'Send by email',
    whatsapp: 'Send on WhatsApp',
    errors: {
      message: 'Tell me a little about what you need.',
      contact: 'Add an email or phone number so I can reply.',
    },
    sent: {
      heading: 'Ready to go.',
      email: 'Your mail app has opened with everything filled in. Just press send.',
      whatsapp: 'WhatsApp has opened with your message filled in. Just press send.',
      fallback: "Nothing opened? Copy your message and send it to",
      copy: 'Copy message',
      copied: 'Copied',
      again: 'Write another',
    },
  },
  // where requests go: MediFast's support inbox and office number for now
  contact: { email: 'getsupport@medifastbd.com', whatsapp: '8801952677396' },
  back: 'Back to MediFast',
  closing: 'No credentials. Just the work.',
}

export const cta = {
  heading: 'Ready to order at wholesale rates?',
  line: 'Register with your trade and drug licence, and start ordering once your account is verified.',
}

export const footer = {
  explore: {
    heading: 'EXPLORE',
    links: [
      { label: 'How it works', href: '#how' },
      { label: 'Platform', href: '#platform' },
      { label: 'The app', href: '#app' },
      { label: 'FAQ', href: '#faq' },
      { label: 'About', href: '#about' },
    ],
  },
  office: {
    heading: 'OFFICE',
    phone: { label: '+880 1952 677396', href: 'tel:+8801952677396' },
    email: { label: 'getsupport@medifastbd.com', href: 'mailto:getsupport@medifastbd.com' },
    address: ['House-38, Road-03, Block-E', 'Banashree, Rampura, Dhaka'],
  },
  copyright: '© 2026 MediFast. All rights reserved.',
  note: 'Sales to licensed businesses only.',
}
