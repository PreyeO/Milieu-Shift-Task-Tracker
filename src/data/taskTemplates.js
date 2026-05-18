// Task templates for each program and shift
// startTime / endTime in "HH:MM" 24h format

const hudsonDay = [
  { id: 'hud-01', startTime: '07:00', endTime: '07:30', title: 'Sign-In & Comm Book', description: 'Sign In, do shift exchange and read & sign comm book' },
  { id: 'hud-02', startTime: '07:30', endTime: '08:00', title: 'Schedule & Visuals', description: 'Read Schedule for day Make sure visual is updated' },
  { id: 'hud-03', startTime: '08:00', endTime: '08:30', title: 'Medication & Wake Up', description: 'Medication Administration. Prompt every 15min to encourage AC to wake up' },
  { id: 'hud-04', startTime: '08:30', endTime: '09:00', title: 'Wake Up & Temp Checks', description: 'Prompt every 15min to encourage AC to wake up/ Temp and water checks to be signed' },
  { id: 'hud-05', startTime: '09:00', endTime: '09:30', title: 'Morning Wake Up', description: 'Give AC morning wake up he enjoys TV first thing in the morning. Engage with him.' },
  { id: 'hud-06', startTime: '09:30', endTime: '10:00', title: 'Breakfast Choices & Hygiene', description: 'Verbally offer breakfast choices/Support AC with morning routine/Shower teeth brushing' },
  { id: 'hud-07', startTime: '10:00', endTime: '10:30', title: 'Breakfast', description: 'Prepare breakfast/ set table with AC/ Eat breakfast/Offer activity options over breakfast' },
  { id: 'hud-08', startTime: '10:30', endTime: '11:00', title: 'Breakfast Cleanup', description: 'Breakfast Dishes wash /dry put away. /Tables and counters wiped' },
  { id: 'hud-09', startTime: '11:00', endTime: '11:30', title: 'Laundry & Vehicle Check', description: 'Put in laundry, Pre- trip inspection of vehicles. Ready for activitey' },
  { id: 'hud-10', startTime: '11:30', endTime: '12:00', title: 'Community Activity', description: 'Activity in community' },
  { id: 'hud-11', startTime: '12:00', endTime: '12:30', title: 'Community Activity', description: 'Activity in community' },
  { id: 'hud-12', startTime: '12:30', endTime: '13:00', title: 'Community Activity', description: 'Activity in community' },
  { id: 'hud-13', startTime: '13:00', endTime: '13:30', title: 'Lunch & Cleanup', description: 'Lunch in community or at home, Dishes wash /dry put away.' },
  { id: 'hud-14', startTime: '13:30', endTime: '14:00', title: 'Lunch, Cleanup & Free Time', description: 'Lunch in community or at home, Dishes wash /dry put away/ AC free time games or movies' },
  { id: 'hud-15', startTime: '14:00', endTime: '14:30', title: 'Free Time & Documentation', description: 'AC free time games or movies, Sharevision Documentation Catalyst, Body Check, Behavior Chart, ISP Reporting, Daily Activity logs Cleaning Schedule. Drills, designated duties, and OFL' },
  { id: 'hud-16', startTime: '14:30', endTime: '15:00', title: 'Documentation & Bathroom Clean', description: 'Finish all documentation/Both bathroom clean with AC/Update communication book' },
];

const hudsonEvening = [
  { id: 'hue-01', startTime: '15:00', endTime: '15:30', title: 'Sign-In & Comm Book', description: 'Sign In and read comm book. Read PS Schedule for day. Talk to shift exchange partner and get update. Verify bathroom is dry.' },
  { id: 'hue-02', startTime: '15:30', endTime: '16:30', title: 'Community Access', description: 'AH choice making for community access. Verify bathroom is dry.' },
  { id: 'hue-03', startTime: '16:30', endTime: '17:00', title: 'Dinner Prep', description: 'Dinner Prep with AH. Verify bathroom is dry.' },
  { id: 'hue-04', startTime: '17:00', endTime: '17:45', title: 'Dinner', description: 'Eat dinner with AH. Verify bathroom is dry.' },
  { id: 'hue-05', startTime: '17:45', endTime: '18:15', title: 'Dinner Cleanup', description: 'Dinner Dishes wash /dry/away. (Nothing left on counter/in dishwasher-Environmental scan) Sweep kitchen floor, Wipe down counters, cupboards, kitchen table and chairs. Verify bathroom is dry.' },
  { id: 'hue-06', startTime: '18:15', endTime: '19:30', title: 'Evening Activity Prep', description: 'Choice making for AH evening activity and prepare. Verify bathroom is dry.' },
  { id: 'hue-07', startTime: '19:30', endTime: '20:00', title: 'Cleaning & Laundry', description: 'Wipe down stair banisters and Clean office and washrooms, Complete laundry outstanding with person served. Verify bathroom is dry.' },
  { id: 'hue-08', startTime: '20:00', endTime: '21:00', title: 'Night Routine & Medications', description: 'Night routine with the PS Ex. Bath time. Teeth etc., Empty kitchen garbage and bathroom garbage and take out., Administer Medications. Verify bathroom is dry.' },
  { id: 'hue-09', startTime: '20:30', endTime: '21:00', title: 'Sanitize & Med Cabinet', description: 'Sanitize high touch areas. Organize medication cabinet inside and wipe down the outside. Verify bathroom is dry.' },
  { id: 'hue-10', startTime: '21:00', endTime: '21:30', title: 'Living Room Tidy', description: 'Living room tidy wipe down tables and organize. Verify bathroom is dry.' },
  { id: 'hue-11', startTime: '21:30', endTime: '22:00', title: 'Window Sills', description: 'Wash window sills in the kitchen and living room area. Verify bathroom is dry.' },
  { id: 'hue-12', startTime: '22:00', endTime: '22:30', title: 'Fridge Clean & Documentation', description: 'Clean out the fridge of any outdated items and wipe down shelves, Documentation Catalyst, Body Check, Behavior Chart, ISP Reporting, Daily Activity logs, Cleaning Schedule. Verify bathroom is dry.' },
  { id: 'hue-13', startTime: '22:30', endTime: '23:00', title: 'Documentation & Sign-Out', description: 'Finish all documentation, Send Group message verifying information and picture of this document and sign out. Verify bathroom is dry.' },
];

const hudsonNight = [
  { id: 'hun-01', startTime: '23:00', endTime: '23:30', title: 'Sign-In & Checks', description: 'Sign In and read comm book. Talk to shift exchange partner and get updated info. Staff to check in on residents. And record grave yard check in. Verify if bathroom is dry.' },
  { id: 'hun-02', startTime: '23:30', endTime: '00:00', title: 'Mopping', description: 'All floors mopped throughout the common living space. Verify if bathroom is dry.' },
  { id: 'hun-03', startTime: '01:00', endTime: '01:30', title: 'Checks & Sinks', description: 'Staff to check in on residents. And report grave yard check in. Sinks in kitchen deep cleaned scrubbed and dried. Verify if bathroom is dry.' },
  { id: 'hun-04', startTime: '01:30', endTime: '02:00', title: 'Laundry Room', description: 'Wipe out all PS Laundry baskets. Clean and disinfect washer / and Dryer. Verify if bathroom is dry.' },
  { id: 'hun-05', startTime: '02:00', endTime: '02:30', title: 'Checks & Drawers', description: 'Staff to check in on residents. And report grave yard check in on. Clean out kitchen drawers pull items out clean and tidy. Verify if bathroom is dry.' },
  { id: 'hun-06', startTime: '02:30', endTime: '03:00', title: 'Clean Bathroom', description: 'Clean bathroom Upstairs. Verify if bathroom is dry.' },
  { id: 'hun-07', startTime: '03:00', endTime: '03:30', title: 'Checks & Supplies', description: 'Staff to check in on residents. And record grave yard check in on. Check all lightbulbs are in working order look over cleaning supplies and note if supplies needed. Verify if bathroom is dry.' },
  { id: 'hun-08', startTime: '03:30', endTime: '04:00', title: 'Sanitize Surfaces', description: 'Wipe down and sanitize all high touch surfaces. Verify if bathroom is dry.' },
  { id: 'hun-09', startTime: '04:00', endTime: '04:30', title: 'Checks & Temp', description: 'Staff to check in on residents. And record grave yard check in on. Complete ALL temp checks fridges freezers and taps. Verify if bathroom is dry.' },
  { id: 'hun-10', startTime: '04:30', endTime: '05:00', title: 'Window Sills & Baseboards', description: 'Window sills and baseboards cleaned in common areas. Verify if bathroom is dry.' },
  { id: 'hun-11', startTime: '05:00', endTime: '05:30', title: 'Checks & Foyer', description: 'Staff to check in on residents. And record grave yard check in. Front foyer area wipe down and sanitize doors shelves railings. Verify if bathroom is dry.' },
  { id: 'hun-12', startTime: '05:30', endTime: '06:00', title: 'Office & Drills', description: 'Organize office desk and drawers tidy all office space. Verify if bathroom is dry. Complete OFL - email certificate to manager. Complete Drills that have been assigned to you. Verify if bathroom is dry.' },
  { id: 'hun-13', startTime: '06:00', endTime: '06:30', title: 'Checks', description: 'Staff to check in on residents. And record grave yard check in. Verify if bathroom is dry.' },
  { id: 'hun-14', startTime: '06:30', endTime: '06:45', title: 'Checks & Sharevision', description: 'Staff to check in on residents. And record grave yard check in on. Complete cleaning duties on sharevision. Verify if bathroom is dry.' },
  { id: 'hun-15', startTime: '06:45', endTime: '07:00', title: 'Documentation & Sign-Out', description: 'Finish all documentation, Send Group message verifying information and picture of this document and sign out. Verify if bathroom is dry.' },
];

export const TASK_TEMPLATES = {
  'hudson': {
    day: hudsonDay,
    evening: hudsonEvening,
    night: hudsonNight,
  },
  'orion': {
    day: hudsonDay.map(t => ({ ...t, id: t.id.replace('hud', 'ord') })),
    evening: hudsonEvening.map(t => ({ ...t, id: t.id.replace('hue', 'ore') })),
    night: hudsonNight.map(t => ({ ...t, id: t.id.replace('hun', 'orn') })),
  },
};

export const getTasksForShift = (programId, shift) => {
  return TASK_TEMPLATES[programId]?.[shift] || [];
};
