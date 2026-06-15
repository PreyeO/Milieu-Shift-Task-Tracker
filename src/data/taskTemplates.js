// Task templates for Hudson House based on real schedules
// startTime / endTime in "HH:MM" 24h format

const hudsonDay = [
  { id: 'hud-01', startTime: '07:00', endTime: '07:30', title: 'Sign In, Comm Book & Greet', description: 'Sign In, do shift exchange and read comm book\nRead Schedule for day Make sure visual is updated\nGreet person, check in and see how they are doing\nVerify bathroom is dry' },
  { id: 'hud-02', startTime: '07:30', endTime: '08:00', title: 'Meds & Breakfast Prep', description: 'Medication Administration\nOffer options for breakfast, present visual options to the person\nBreakfast Dishes wash /dry put away.\nCut fresh fruit and veggies\nVerify bathroom is dry' },
  { id: 'hud-03', startTime: '08:00', endTime: '08:30', title: 'Kitchen Cleanup', description: 'Sweep Kitchen floors\nWipe down stove top\nAnd counters. Will person engage with you\nVerify bathroom is dry' },
  { id: 'hud-04', startTime: '08:30', endTime: '09:00', title: 'Vehicle Check & Bedroom Tidy', description: 'Pre- trip inspection of vehicles.\nPerson Served Bedroom Tidy with Person\nVerify bathroom is dry' },
  { id: 'hud-05', startTime: '09:00', endTime: '09:30', title: 'Choice Board & Goal Review', description: 'Do choice making board with person, what activity did they choose, update visual schedule\nReview goal with person, have them sign if needed. Note from the schedule where in the day you will be working on their goal\nVerify bathroom is dry' },
  { id: 'hud-06', startTime: '09:30', endTime: '10:00', title: 'Morning Routine & Activity Prep', description: 'Morning Routine, getting ready for the day\nPrepare for PS daily activity\n(Backpack, Wallet, Location of outing, PRN)\nVerify bathroom is dry' },
  { id: 'hud-07', startTime: '10:00', endTime: '10:30', title: 'Access Community (Part 1)', description: 'Access Community (Community Mapping and chosen Activities)\nVerify bathroom is dry' },
  { id: 'hud-08', startTime: '10:30', endTime: '11:00', title: 'Access Community (Part 2)', description: 'Access Community (Community Mapping and chosen Activities)\nVerify bathroom is dry' },
  { id: 'hud-09', startTime: '11:00', endTime: '11:30', title: 'Access Community (Part 3)', description: 'Access Community (Community Mapping and chosen Activities)\nVerify bathroom is dry' },
  { id: 'hud-10', startTime: '11:30', endTime: '12:00', title: 'Access Community (Part 4)', description: 'Access Community (Community Mapping and chosen Activities)\nVerify bathroom is dry' },
  { id: 'hud-11', startTime: '12:00', endTime: '12:30', title: 'Temp Checks & Lunch Prep', description: 'Take out meat for Dinner and Fill all temp checks (water and fridge/freezer)\nOffer options for lunch, visually show options available for the person to chose\nLunch Prep /serve\nVerify bathroom is dry' },
  { id: 'hud-12', startTime: '12:30', endTime: '13:00', title: 'Lunch Cleanup', description: 'Lunch Dishes wash /dry put away.\nVerify bathroom is dry' },
  { id: 'hud-13', startTime: '13:00', endTime: '13:30', title: 'Sensory Break & Sanitize', description: 'Engage person in sensory activity or sensory break\nWipe down high traffic areas (door knobs light switches etc)\nVerify bathroom is dry' },
  { id: 'hud-14', startTime: '13:30', endTime: '14:00', title: 'Laundry', description: 'Do laundry with person served (task analysis)\nVerify bathroom is dry' },
  { id: 'hud-15', startTime: '14:00', endTime: '14:30', title: 'Documentation & Body Check', description: 'Share vision Documentation Catalyst, Body Check,' },
  { id: 'hud-16', startTime: '14:30', endTime: '15:00', title: 'Monthly Duties', description: 'Complete OFL for the month\nComplete Emergency drills for the month\nComplete Designated duties for the month' },
];

const hudsonEvening = [
  { id: 'hue-01', startTime: '15:00', endTime: '15:30', title: 'Sign In & Comm Book', description: 'Sign In and read comm book\nRead PS Schedule for day\nTalk to shift exchange partner and get update\nVerify bathroom is dry' },
  { id: 'hue-02', startTime: '15:30', endTime: '16:00', title: 'Choice Making for Community (Part 1)', description: 'AH choice making for community access\nVerify bathroom is dry' },
  { id: 'hue-03', startTime: '16:00', endTime: '16:30', title: 'Choice Making for Community (Part 2)', description: 'AH choice making for community access\nVerify bathroom is dry' },
  { id: 'hue-04', startTime: '16:30', endTime: '17:00', title: 'Dinner Prep', description: 'Dinner Prep with AH\nVerify bathroom is dry' },
  { id: 'hue-05', startTime: '17:00', endTime: '17:30', title: 'Dinner', description: 'Eat dinner with AH\nVerify bathroom is dry' },
  { id: 'hue-06', startTime: '17:30', endTime: '18:00', title: 'Dinner Cleanup (Part 1)', description: 'Dinner Dishes wash /dry/away.\n(Nothing left on counter/in dishwasher- Environmental scan) Sweep kitchen floor, Wipe down counters, cupboards, kitchen table and chairs.\nVerify bathroom is dry' },
  { id: 'hue-07', startTime: '18:00', endTime: '18:30', title: 'Dinner Cleanup (Part 2)', description: 'Dinner Dishes wash /dry/away.\n(Nothing left on counter/in dishwasher- Environmental scan) Sweep kitchen floor, Wipe down counters, cupboards, kitchen table and chairs.\nVerify bathroom is dry' },
  { id: 'hue-08', startTime: '18:30', endTime: '19:00', title: 'Evening Activity Prep (Part 1)', description: 'Choice making for AH evening activity and prepare\nVerify bathroom is dry' },
  { id: 'hue-09', startTime: '19:00', endTime: '19:30', title: 'Evening Activity Prep (Part 2)', description: 'Choice making for AH evening activity and prepare\nVerify bathroom is dry' },
  { id: 'hue-10', startTime: '19:30', endTime: '20:00', title: 'Cleaning & Laundry', description: 'Wipe down stair banisters and Clean office and washrooms\nComplete laundry outstanding with person served\nVerify bathroom is dry' },
  { id: 'hue-11', startTime: '20:00', endTime: '20:30', title: 'Night Routine', description: 'Night routine with the PS Ex. Bath time, Teeth etc.\nEmpty kitchen garbage and bathroom garbage and take out.\nAdminister Medications Verify bathroom is dry' },
  { id: 'hue-12', startTime: '20:30', endTime: '21:00', title: 'Sanitize & Med Cabinet', description: 'Sanitize high touch areas.\nOrganize medication cabinet inside and wipe down the outside.\nVerify bathroom is dry' },
  { id: 'hue-13', startTime: '21:00', endTime: '21:30', title: 'Living Room Tidy', description: 'Living room tidy wipe down tables and organize\nVerify bathroom is dry' },
  { id: 'hue-14', startTime: '21:30', endTime: '22:00', title: 'Wash Window Sills', description: 'Wash window sills in the kitchen and living room area\nVerify bathroom is dry' },
  { id: 'hue-15', startTime: '22:00', endTime: '22:30', title: 'Fridge Clean & Docs', description: 'Clean out the fridge of any outdated items and wipe down shelves\nDocumentation Catalyst, Body Check, Behavior Chart, ISP Reporting, Daily Activity logs, Cleaning Schedule\nVerify bathroom is dry' },
  { id: 'hue-16', startTime: '22:30', endTime: '23:00', title: 'Sign Out & Monthly', description: 'Finish all documentation, Send Group message verifying information and picture of this document and sign out\nVerify bathroom is dry\n\nComplete OFL for the month\nComplete Emergency drills for the month\nComplete Designated duties for the month' },
];

const hudsonNight = [
  { id: 'hun-01', startTime: '23:00', endTime: '23:30', title: 'Sign In & Checks', description: 'Sign In and read comm book\nTalk to shift exchange partner and get updated info\nStaff to check in on residents\nAnd record grave yard check in\nVerify if bathroom is dry' },
  { id: 'hun-02', startTime: '23:30', endTime: '00:00', title: 'Mopping', description: 'All floors mopped throughout the common living space.\nVerify if bathroom is dry' },
  { id: 'hun-03', startTime: '00:00', endTime: '00:30', title: 'Midnight Checks', description: 'Staff to check in on residents\nAnd report grave yard check in\nVerify if bathroom is dry' },
  { id: 'hun-04', startTime: '00:30', endTime: '01:00', title: 'Quiet Time Checks', description: 'Staff to check in on residents\nAnd report grave yard check in\nVerify if bathroom is dry' },
  { id: 'hun-05', startTime: '01:00', endTime: '01:30', title: 'Checks & Sinks', description: 'Staff to check in on residents\nAnd report grave yard check in\nSinks in kitchen deep cleaned scrubbed and dried\nVerify if bathroom is dry' },
  { id: 'hun-06', startTime: '01:30', endTime: '02:00', title: 'Laundry Room', description: 'Wipe out all PS Laundry baskets\nClean and disinfect washer / and Dryer\nVerify if bathroom is dry' },
  { id: 'hun-07', startTime: '02:00', endTime: '02:30', title: 'Checks & Drawers', description: 'Staff to check in on residents\nAnd report grave yard check in on\nClean out kitchen drawers pull items out clean and tidy\nVerify if bathroom is dry' },
  { id: 'hun-08', startTime: '02:30', endTime: '03:00', title: 'Clean Bathroom', description: 'Clean bathroom Upstairs\nVerify if bathroom is dry' },
  { id: 'hun-09', startTime: '03:00', endTime: '03:30', title: 'Checks & Supplies', description: 'Staff to check in on residents\nAnd record grave yard check in on\nCheck all lightbulbs are in working order look over cleaning supplies and note if supplies needed\nVerify if bathroom is dry' },
  { id: 'hun-10', startTime: '03:30', endTime: '04:00', title: 'Sanitize Surfaces', description: 'Wipe down and sanitize all high touch surfaces\nVerify if bathroom is dry' },
  { id: 'hun-11', startTime: '04:00', endTime: '04:30', title: 'Checks & Temp', description: 'Staff to check in on residents\nAnd record grave yard check in on\nComplete ALL temp checks fridges freezers and taps\nVerify if bathroom is dry' },
  { id: 'hun-12', startTime: '04:30', endTime: '05:00', title: 'Window Sills & Baseboards', description: 'Window sills and baseboards cleaned in common areas\nVerify if bathroom is dry' },
  { id: 'hun-13', startTime: '05:00', endTime: '05:30', title: 'Checks & Foyer', description: 'Staff to check in on residents\nAnd record grave yard check in\nFront foyer area wipe down and sanitize doors shelves railings.\nVerify if bathroom is dry' },
  { id: 'hun-14', startTime: '05:30', endTime: '06:00', title: 'Office Tidy, OFL & Drills', description: 'Organize office desk and drawers tidy all office space.\nComplete OFL – email certificate to manager\nComplete Drills that have been assigned to you\nVerify if bathroom is dry' },
  { id: 'hun-15', startTime: '06:00', endTime: '06:30', title: 'Checks & Sharevision (Part 1)', description: 'Staff to check in on residents\nAnd record grave yard check in\nVerify if bathroom is dry' },
  { id: 'hun-16', startTime: '06:30', endTime: '07:00', title: 'Checks, Sharevision & Sign Out', description: 'Staff to check in on residents\nAnd record grave yard check in on\nComplete cleaning duties on sharevision\nFinish all documentation, Send Group message verifying information and picture of this document and sign out\nVerify if bathroom is dry\n\nComplete OFL for the month\nComplete Emergency drills for the month\nComplete Designated duties for the month' },
];

export const TASK_TEMPLATES = {
  'hudson': {
    day: hudsonDay,
    evening: hudsonEvening,
    night: hudsonNight,
  },
};

export const getTasksForShift = (programId, shift) => {
  return TASK_TEMPLATES[programId]?.[shift] || [];
};
