/**
 * Job posts for the Careers page (#/careers).
 *
 * To post a job, copy one of the entries below, change the details and deploy.
 * To take a job down, delete its entry, or give it a `deadline`: it disappears by itself the day after.
 *
 * - `id` becomes the job's own link, e.g. medifast.../#/careers/sales-executive. Lowercase letters,
 *   numbers and dashes only, and keep it unique.
 * - Dates are written as 'YYYY-MM-DD'. Newest `posted` shows first.
 * - `salary` and `niceToHave` are optional; leave them out and they simply don't show.
 *
 * The posts below are EXAMPLES that show the format. Replace them with your real openings
 * (or delete them all: the page then says there are no open roles and still takes general applications).
 */

export type Job = {
  id: string
  title: string
  team: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  location: string
  workplace: 'On-site' | 'Remote' | 'Hybrid'
  salary?: string
  posted: string
  deadline?: string
  summary: string
  responsibilities: string[]
  requirements: string[]
  niceToHave?: string[]
}

export const jobs: Job[] = [
  {
    id: 'sales-executive',
    title: 'Sales Executive, Pharmacy Accounts',
    team: 'Sales',
    type: 'Full-time',
    location: 'Dhaka',
    workplace: 'On-site',
    posted: '2026-10-04',
    deadline: '2026-10-31',
    summary:
      'Bring pharmacies and clinics onto MediFast and keep them ordering. You will spend most of your week in the field, meeting owners where they work.',
    responsibilities: [
      'Visit pharmacies and clinics in your area and sign them up to MediFast',
      'Help new accounts through licence verification and their first orders',
      'Stay in touch with your accounts and solve problems before they become complaints',
      'Report what you hear in the field: prices, competitors and what customers ask for',
    ],
    requirements: [
      '1+ year in field sales, ideally pharmaceutical or FMCG',
      'Clear, confident Bangla; working English',
      'Comfortable with a smartphone and simple reporting apps',
      'Your own motorbike and a valid licence',
    ],
  },
  {
    id: 'delivery-operations-associate',
    title: 'Delivery Operations Associate',
    team: 'Operations',
    type: 'Full-time',
    location: 'Dhaka',
    workplace: 'On-site',
    posted: '2026-10-02',
    summary:
      'Make sure every order leaves the warehouse correct and arrives on time. You will plan routes, check orders and keep customers informed.',
    responsibilities: [
      'Plan daily delivery routes and assign orders to riders',
      'Check orders against invoices, batch numbers and expiry dates before dispatch',
      'Track deliveries and update customers when something changes',
      'Handle returns and keep stock records accurate',
    ],
    requirements: [
      'Experience in delivery, logistics or warehouse work',
      'Organised and calm when the day gets busy',
      'Good knowledge of Dhaka roads and areas',
      'Basic spreadsheet skills',
    ],
    niceToHave: ['Experience handling medicine or other regulated stock'],
  },
]
