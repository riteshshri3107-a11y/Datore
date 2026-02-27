// lib/demoData.ts — Single source of truth for all demo data

export const DEMO_WORKERS = [
  { id:'1', full_name:'Maria Santos', skills:['Babysitting','Tutoring'], hourly_rate:22, fixed_rate:100, rating:4.9, review_count:47, completed_jobs:52, availability:'available', city:'Toronto', trust_score:92, is_police_verified:true, background_check:'clear', bio:'Experienced babysitter and tutor with 5+ years. First aid certified, CPR trained.', experience_years:5, certifications:['First Aid','CPR','Child Care Level 2'], email:'m****@test.com', phone:'+1 (4**) ***-**32', address:'*** Dundas St W, Toronto', joined:'Jan 2024', lat:43.6532, lng:-79.3832 },
  { id:'2', full_name:"James O'Brien", skills:['Plumbing','Electrical'], hourly_rate:45, fixed_rate:200, rating:4.7, review_count:31, completed_jobs:38, availability:'available', city:'Mississauga', trust_score:88, is_police_verified:true, background_check:'clear', bio:'Licensed plumber and electrician. 10+ years in residential and commercial work.', experience_years:10, certifications:['Licensed Plumber','Electrical Safety'], email:'j****@test.com', phone:'+1 (9**) ***-**45', address:'*** Hurontario St, Mississauga', joined:'Mar 2024', lat:43.6611, lng:-79.3957 },
  { id:'3', full_name:'Priya Sharma', skills:['House Cleaning','Cooking'], hourly_rate:28, fixed_rate:150, rating:4.8, review_count:63, completed_jobs:71, availability:'busy', city:'Brampton', trust_score:95, is_police_verified:true, background_check:'clear', bio:'Professional cleaner and home cook specializing in South Asian and international cuisine.', experience_years:7, certifications:['Food Safety'], email:'p****@test.com', phone:'+1 (6**) ***-**18', address:'*** Queen St, Brampton', joined:'Feb 2024', lat:43.6405, lng:-79.3711 },
  { id:'4', full_name:'David Chen', skills:['Tutoring','Tech Support'], hourly_rate:40, fixed_rate:120, rating:4.6, review_count:22, completed_jobs:28, availability:'available', city:'Toronto', trust_score:85, is_police_verified:false, background_check:'pending', bio:'Computer science grad, tutors math, science and provides tech support.', experience_years:3, certifications:['BSc Computer Science'], email:'d****@test.com', phone:'+1 (4**) ***-**67', address:'*** College St, Toronto', joined:'Apr 2024', lat:43.6702, lng:-79.4003 },
  { id:'5', full_name:'Aisha Hassan', skills:['Pet Care','Gardening'], hourly_rate:20, fixed_rate:80, rating:4.9, review_count:55, completed_jobs:60, availability:'available', city:'Scarborough', trust_score:94, is_police_verified:true, background_check:'clear', bio:'Animal lover with 4 years experience. Certified pet first aid. Your pets are safe with me!', experience_years:4, certifications:['Pet First Aid'], email:'a****@test.com', phone:'+1 (4**) ***-**55', address:'*** Lawrence Ave, Scarborough', joined:'Jan 2024', lat:43.6480, lng:-79.3550 },
  { id:'6', full_name:'Mike Johnson', skills:['Moving','General Labor'], hourly_rate:30, fixed_rate:180, rating:4.5, review_count:17, completed_jobs:22, availability:'scheduled', city:'Etobicoke', trust_score:78, is_police_verified:false, background_check:'pending', bio:'Strong and reliable mover. Can handle apartments, offices, and heavy items.', experience_years:2, certifications:[], email:'m****@test.com', phone:'+1 (4**) ***-**91', address:'*** Lake Shore Blvd, Etobicoke', joined:'May 2024', lat:43.6560, lng:-79.4150 },
  { id:'7', full_name:'Rosa Martinez', skills:['Cooking','Event Planning'], hourly_rate:35, fixed_rate:250, rating:4.8, review_count:38, completed_jobs:45, availability:'available', city:'Toronto', trust_score:90, is_police_verified:true, background_check:'clear', bio:'Professional chef and event planner. Specialize in Latin and Mediterranean cuisine.', experience_years:8, certifications:['Culinary Arts Diploma','Food Safety'], email:'r****@test.com', phone:'+1 (6**) ***-**23', address:'*** Bloor St W, Toronto', joined:'Dec 2023', lat:43.6650, lng:-79.3650 },
  { id:'8', full_name:'Tom Wilson', skills:['Gardening','Painting'], hourly_rate:25, fixed_rate:150, rating:4.4, review_count:14, completed_jobs:19, availability:'available', city:'North York', trust_score:82, is_police_verified:true, background_check:'clear', bio:'Landscaping and interior painting expert. Transform your home inside and out.', experience_years:6, certifications:['Horticulture Certificate'], email:'t****@test.com', phone:'+1 (4**) ***-**78', address:'*** Yonge St, North York', joined:'Mar 2024', lat:43.6350, lng:-79.4050 },
];

export const DEMO_JOBS = [
  { id:'1', title:'Babysitter Needed Tonight', poster:'Sophia Kim', posterId:'p1', category:'Babysitting', urgency:'immediate', payment:'hourly', amount:25, desc:'Need someone to watch my 2 year old tonight from 7-11pm. Must have experience with toddlers.', location:'Brampton, ON', applicants:3 },
  { id:'2', title:'Dog Walker - Morning Walks', poster:'Olivia Brown', posterId:'p2', category:'Pet Care', urgency:'today', payment:'hourly', amount:18, desc:'Need daily morning walks for my golden retriever. 30 min each walk.', location:'North York, ON', applicants:5 },
  { id:'3', title:'Move 1BR Apartment', poster:'Mia Johnson', posterId:'p3', category:'Moving', urgency:'tomorrow', payment:'fixed', amount:200, desc:'Moving from 1 bedroom apartment. 3rd floor no elevator.', location:'Brampton, ON', applicants:2 },
  { id:'4', title:'Fix Leaky Kitchen Faucet', poster:'Benjamin Lee', posterId:'p4', category:'Plumbing', urgency:'today', payment:'fixed', amount:80, desc:'Kitchen faucet dripping constantly. Need a plumber ASAP.', location:'Toronto, ON', applicants:1 },
  { id:'5', title:'Math Tutor Grade 8', poster:'Harper Wilson', posterId:'p5', category:'Tutoring', urgency:'by_date', payment:'hourly', amount:35, desc:'Need a math tutor for my daughter. Algebra and geometry focus.', location:'Mississauga, ON', applicants:4 },
  { id:'6', title:'Deep House Cleaning', poster:'Sarah Mitchell', posterId:'p6', category:'House Cleaning', urgency:'today', payment:'fixed', amount:180, desc:'3 bedroom house needs deep cleaning. Kitchen, bathrooms, all rooms.', location:'Toronto, ON', applicants:6 },
  { id:'7', title:'Birthday Party Photographer', poster:'Jennifer White', posterId:'p7', category:'Photography', urgency:'by_date', payment:'fixed', amount:300, desc:"Need a photographer for my son's 5th birthday party. 3 hours coverage.", location:'Toronto, ON', applicants:2 },
  { id:'8', title:'Paint Living Room', poster:'Amanda Lewis', posterId:'p8', category:'Painting', urgency:'no_rush', payment:'fixed', amount:250, desc:'Living room walls need repainting. Approx 400 sq ft. Paint provided.', location:'Mississauga, ON', applicants:3 },
];

export const DEMO_REVIEWS: Record<string, Array<{id:string; reviewer:string; rating:number; comment:string; date:string}>> = {
  '1': [
    { id:'r1', reviewer:'Sarah M.', rating:5, comment:'Maria was amazing with my kids! So patient and caring.', date:'2 weeks ago' },
    { id:'r2', reviewer:'Jennifer W.', rating:5, comment:'Best babysitter we ever had. Kids loved her!', date:'1 month ago' },
    { id:'r3', reviewer:'Tom R.', rating:4, comment:'Very reliable and professional. Highly recommend.', date:'2 months ago' },
  ],
  '2': [
    { id:'r4', reviewer:'Robert C.', rating:5, comment:'Fixed our plumbing in under an hour. Very professional.', date:'1 week ago' },
    { id:'r5', reviewer:'Susan W.', rating:5, comment:'James rewired our basement perfectly.', date:'3 weeks ago' },
  ],
  '3': [
    { id:'r6', reviewer:'Aisha K.', rating:5, comment:"Priya's cooking is restaurant quality. House was spotless!", date:'1 week ago' },
    { id:'r7', reviewer:'Lisa T.', rating:5, comment:'Deep cleaned our 3BR house. Incredible attention to detail.', date:'2 weeks ago' },
  ],
  '5': [
    { id:'r8', reviewer:'Margaret H.', rating:5, comment:'Aisha took wonderful care of our dog. Very trustworthy!', date:'3 days ago' },
    { id:'r9', reviewer:'Dorothy S.', rating:5, comment:'My garden has never looked better. Thank you!', date:'1 month ago' },
  ],
};

export const CHAT_CONTACTS: Record<string, {name:string; status:string; skills:string}> = {
  '1': { name:'Maria Santos', status:'online', skills:'Babysitting, Tutoring' },
  '2': { name:"James O'Brien", status:'online', skills:'Plumbing, Electrical' },
  '3': { name:'Priya Sharma', status:'away', skills:'Cleaning, Cooking' },
  '4': { name:'David Chen', status:'online', skills:'Tutoring, Tech Support' },
  '5': { name:'Aisha Hassan', status:'online', skills:'Pet Care, Gardening' },
  '6': { name:'Mike Johnson', status:'away', skills:'Moving, General Labor' },
  '7': { name:'Rosa Martinez', status:'online', skills:'Cooking, Event Planning' },
  '8': { name:'Tom Wilson', status:'online', skills:'Gardening, Painting' },
  'p1': { name:'Sophia Kim', status:'online', skills:'Job Poster' },
  'p2': { name:'Olivia Brown', status:'online', skills:'Job Poster' },
  'p3': { name:'Mia Johnson', status:'away', skills:'Job Poster' },
  'p4': { name:'Benjamin Lee', status:'online', skills:'Job Poster' },
  'p5': { name:'Harper Wilson', status:'online', skills:'Job Poster' },
  'p6': { name:'Sarah Mitchell', status:'online', skills:'Job Poster' },
  'p7': { name:'Jennifer White', status:'away', skills:'Job Poster' },
  'p8': { name:'Amanda Lewis', status:'online', skills:'Job Poster' },
};

export const AUTO_REPLIES: Record<string, string[]> = {
  '1': ["Hi! I'd love to help with babysitting. What ages are your children?","I'm available this weekend. I charge $22/hr and have first aid certification.","Sounds great! I can be there at the time you mentioned. See you then! 😊"],
  '2': ["Hey! What plumbing issue are you having?","I can come take a look tomorrow. For a standard faucet repair it's usually around $80 fixed.","Perfect, I'll bring all the tools needed. See you then!"],
  '3': ["Hello! I'd be happy to help with cleaning.","For a deep clean of a 3-bedroom, I usually charge $150 fixed price.","Great! I'll bring all my own supplies. Looking forward to it!"],
  '4': ["Hi there! What subject does your child need help with?","I specialize in math and science for grades 6-12. $40/hr.","I can start this week! Let me know what time works best."],
  '5': ["Hi! I love taking care of pets! What kind of animal?","I'm very experienced with dogs. I do walks, feeding, and overnight stays.","Wonderful! I'll take great care of your fur baby! 🐕"],
  '6': ["Hey! I can help with the move. How big is the load?","For a 1BR apartment, $180 flat rate including loading and unloading.","I'll bring a helper too. What time works for you?"],
  '7': ["Hi! I'd love to cook for your event!","I can do a full 3-course meal for up to 20 guests. $35/hr.","I'll send you a sample menu. What cuisine do you prefer?"],
  '8': ["Hello! I can help with your garden/painting needs.","For garden maintenance it's $25/hr. Painting depends on the area.","I'll come by for a free estimate. When works for you?"],
  'default': ["Thanks for your message! I'd be happy to discuss the details.","That sounds doable! Let me check my schedule.","Perfect, let's set up a time. Looking forward to working with you!"],
};

export const URGENCY_STYLES: Record<string, {emoji:string; label:string; bg:string; color:string}> = {
  immediate: { emoji:'🔴', label:'Immediate', bg:'rgba(239,68,68,0.12)', color:'#ef4444' },
  today: { emoji:'🟠', label:'Today', bg:'rgba(249,115,22,0.12)', color:'#f97316' },
  tomorrow: { emoji:'🟡', label:'Tomorrow', bg:'rgba(234,179,8,0.12)', color:'#eab308' },
  by_date: { emoji:'📅', label:'By Date', bg:'rgba(59,130,246,0.12)', color:'#3b82f6' },
  no_rush: { emoji:'🟢', label:'No Rush', bg:'rgba(34,197,94,0.12)', color:'#22c55e' },
};

// Helper to get/set favorites from localStorage safely
export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('datore-favs') || '[]'); } catch { return []; }
}
export function setFavorites(ids: string[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('datore-favs', JSON.stringify(ids)); } catch {}
}
export function toggleFavorite(id: string): boolean {
  const favs = getFavorites();
  const isFav = favs.includes(id);
  if (isFav) { setFavorites(favs.filter(f => f !== id)); } else { setFavorites([...favs, id]); }
  return !isFav;
}

export function getJoinedCommunities(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('datore-joined') || '[]'); } catch { return []; }
}
export function toggleCommunity(id: string): boolean {
  const joined = getJoinedCommunities();
  const isMember = joined.includes(id);
  const updated = isMember ? joined.filter(j => j !== id) : [...joined, id];
  if (typeof window !== 'undefined') { try { localStorage.setItem('datore-joined', JSON.stringify(updated)); } catch {} }
  return !isMember;
}
