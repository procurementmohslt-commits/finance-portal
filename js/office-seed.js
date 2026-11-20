// User-supplied reference data. Descriptions intentionally preserved verbatim.
export const initialOffices = [
{ba:'1016',name:'Ministry of Homeland Security, Labour and Technology',areas:`S022001001001001|Minister & Senior Executi
S022001001002001|Human Resource
S022001001003001|Finance Management
S022001001004001|ICT
S022001001005001|Procurement
S022001001006001|Internal Audit
S022001001007001|Administration
S022001001008001|Minister Bureau
S022001001009001|Logistics and Maintenance
S022001001010001|Training and Development
S022001001011001|Secretariat Support
S022001002001001|Legal Research and Reform
S022001002002001|Legal Advisory, Treaties
S022001003001001|Policy Planning
S022001003002001|Project Management
S022002001001001|Monitoring
S022002002001001|Program Monitoring & Eval
S022002003001001|Peace & Security
S022002003003001|Law Enforcement Training
S022002004001001|Police Board Secretariat
S022002005001001|Case Management
S022002005002001|Inspection Section
S022004001001001|Press & publication
S022004002001001|Media registration & deve
S022004002002001|Media Grant
S022004002003001|Media Village
S022005002001001|Project & Resources Devel
S022006001001001|Administration & Support
S022006001002001|Transport, repair & maint
S022006002001001|Psycho Social Support
S022006002002001|Education Center
S022006002003001|Vocational & Support
S022006002004001|Religious
S022006003001001|Shift - A
S022006004001001|Medical Services
S022010001001001|Quota
S022010001002001|Work permit regularizatio
S022010001003001|Registration, Awareness &
S022010002002001|Labor Relations
S022010002005001|Workforce Management
S022011001001001|Anti Human Trafficking
S022011001002001|Policy and Outreach
S022011001003001|Victim Support
S022014001001001|Program & Projects
S022014002001001|NGO Registration`},
{ba:'1057',name:'Department of Juvenile Justice',areas:`S022007001001001|Corporate Services
S022007001003001|Procurement
S022007001004001|Human Resources
S022007002001001|Rehabilitation & Reintegr
S022007002002001|Diversion & Reintegration
S022007002003001|Early Intervention
S022007002004001|Psycho Social Support
S022007003001001|Prevention & Community Su
S022007003002001|Programs
S022007004001001|Administration
S022007005001001|Training, Reserach & Advo`},
{ba:'1549',name:'National Careers Service',areas:`S022015001001002|Finance
S022015001001003|Human Resources & Adminis
S022015001003001|Regional Job Centers Unit
S022015001005001|Marketing and Media Unit
S028007001001003|Human Resources & Adminis
S048008001001002|Finance
S048008001001003|Human Resources & Adminis
S048008001003001|Regional Job centers Unit
S048008001005001|Marketing and Media Unit`},
{ba:'1563',name:'National Cyber Security Agency',areas:`S022001001004001|ICT
S022001002002001|Legal Advisory, Treaties
S022001003001001|Policy Planning
S022013001001001|Administration`}
].map(o=>({...o,areas:o.areas.split('\n').map(line=>{const [code,...rest]=line.split('|');return {code,description:rest.join('|')};})}));
