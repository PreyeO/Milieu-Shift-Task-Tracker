// Task templates for each program and shift
// startTime / endTime in "HH:MM" 24h format

const parksideEDay = [
  { id: 'ped-01', startTime: '07:00', endTime: '07:15', title: 'Sign-In & Shift Exchange', description: 'Sign in, do shift exchange and read comm book. Read Schedule for day, make sure visual is updated.' },
  { id: 'ped-02', startTime: '07:15', endTime: '07:25', title: 'Greet & Check In', description: 'Greet person, check in and see how they are doing.' },
  { id: 'ped-03', startTime: '07:25', endTime: '07:40', title: 'Medication Administration', description: 'Administer morning medications as per medication chart.' },
  { id: 'ped-04', startTime: '07:40', endTime: '08:00', title: 'Breakfast Options & Dishes', description: 'Offer options for breakfast, present visual options to the person. Breakfast dishes wash/dry put away. Cut fresh fruit and veggies.' },
  { id: 'ped-05', startTime: '08:00', endTime: '08:30', title: 'Kitchen Cleaning', description: 'Sweep kitchen floors, wipe down stove top. Offer fruit and veggies and ensure person engages with you.' },
  { id: 'ped-06', startTime: '08:30', endTime: '09:00', title: 'Vehicle Inspection', description: 'Pre-trip inspection of vehicles.' },
  { id: 'ped-07', startTime: '09:00', endTime: '09:15', title: 'Goal Review & Making Board', description: 'Choose making board with person, what activity did they choose, update visual schedule. Review goal with person, have them sign if needed.' },
  { id: 'ped-08', startTime: '09:15', endTime: '10:00', title: 'Morning Routine & Day Prep', description: 'Morning routine, getting ready for the day. Prepare for PS daily activity (Backpack, Wallet, Location of outing, PRN).' },
  { id: 'ped-09', startTime: '10:00', endTime: '11:00', title: 'Community Access', description: 'Access community (Community Mapping and chosen Activities).' },
  { id: 'ped-10', startTime: '11:00', endTime: '12:15', title: 'Meal Prep & Temp Checks', description: 'Take out meat for dinner and fill all temp checks (water and fridge/freezer).' },
  { id: 'ped-11', startTime: '12:15', endTime: '12:30', title: 'Lunch Options', description: 'Offer options for lunch, visually show options available for the person to chose. Lunch Prep/Serve.' },
  { id: 'ped-12', startTime: '12:30', endTime: '13:00', title: 'Lunch Dishes', description: 'Lunch dishes wash/dry put away.' },
  { id: 'ped-13', startTime: '13:00', endTime: '13:30', title: 'Sensory Activity', description: 'Engage person in sensory activity or sensory break. Wipe down high traffic areas (door knobs, light switches etc).' },
  { id: 'ped-14', startTime: '13:30', endTime: '14:00', title: 'Laundry', description: 'Do laundry with person served (task analysis).' },
  { id: 'ped-15', startTime: '14:00', endTime: '15:00', title: 'Documentation', description: 'Share vision documentation: Catalyst, Body Check, Behavior Chart, ISP Reporting, Daily Activity logs, Cleaning Schedule, Drills, designated duties, and OFL.' },
  { id: 'ped-16', startTime: '15:00', endTime: '15:05', title: 'Sign-Out & Group Message', description: 'Finish all documentation. Send group message verifying information and picture of this document and sign out.' },
];

const parksideEEvening = [
  { id: 'pee-01', startTime: '15:00', endTime: '15:30', title: 'Sign-In & Shift Exchange', description: 'Sign in and read comm book. Read PS Schedule for day. Talk to shift exchange partner and get update.' },
  { id: 'pee-02', startTime: '15:30', endTime: '16:30', title: 'Community Access Walk', description: 'Community access walk in community or physical activity.' },
  { id: 'pee-03', startTime: '16:30', endTime: '17:00', title: 'Dinner Prep', description: 'Prepare dinner according to meal plan and dietary requirements.' },
  { id: 'pee-04', startTime: '17:00', endTime: '17:45', title: 'Serve & Eat Dinner', description: 'Serve and eat dinner with person served.' },
  { id: 'pee-05', startTime: '17:45', endTime: '18:15', title: 'Dinner Cleanup', description: 'Dinner dishes wash/dry away (nothing left on counter - environmental scan). Sweep kitchen floor, wipe down counters, cupboards, kitchen table and chairs.' },
  { id: 'pee-06', startTime: '18:15', endTime: '18:30', title: 'Evening Activity Prep', description: 'Prepare for PS coming activity (Backpack, Wallet, Location of outing, PRN).' },
  { id: 'pee-07', startTime: '18:30', endTime: '19:00', title: 'Stairway & Office Clean', description: 'Wipe down stair banisters and clean office and washrooms.' },
  { id: 'pee-08', startTime: '19:00', endTime: '20:30', title: 'Night Routine', description: 'Night routine with the PS (bath time, teeth, empty kitchen garbage and recycling, administer medications and take out).' },
  { id: 'pee-09', startTime: '20:30', endTime: '21:00', title: 'Sanitize High-Touch Areas', description: 'Sanitize high touch areas throughout the home.' },
  { id: 'pee-10', startTime: '21:00', endTime: '21:30', title: 'Living Room Tidy', description: 'Living room tidy, wipe down tables and organize.' },
  { id: 'pee-11', startTime: '21:30', endTime: '22:00', title: 'Window Sills', description: 'Wash window sills in the kitchen and living room area.' },
  { id: 'pee-12', startTime: '22:00', endTime: '22:30', title: 'Fridge Clean & Documentation', description: 'Clean out the fridge of any outdated items and wipe down shelves. Documentation Catalyst, Body Check, Behavior Chart, ISP Reporting, Daily Activity Logs, Cleaning Schedule.' },
  { id: 'pee-13', startTime: '22:30', endTime: '23:00', title: 'Sign-Out & Van Exchange', description: 'Finish all documentation. Send group message verifying information and picture of this document and sign out and complete van shift exchange.' },
];

const parksideENight = [
  { id: 'pen-01', startTime: '23:00', endTime: '23:30', title: 'Night Check-In & Handover', description: 'Sign in, read comm book, complete night shift exchange with evening staff.' },
  { id: 'pen-02', startTime: '23:30', endTime: '00:00', title: 'Wellness Check', description: 'Complete wellness check on all persons served. Document observations.' },
  { id: 'pen-03', startTime: '00:00', endTime: '00:30', title: 'Home Security Check', description: 'Check all doors, windows and security systems. Ensure home is safe and secure.' },
  { id: 'pen-04', startTime: '00:30', endTime: '01:00', title: 'Overnight Documentation', description: 'Complete overnight documentation and notes in Catalyst.' },
  { id: 'pen-05', startTime: '01:00', endTime: '02:00', title: 'Night Wellness Check', description: 'Perform scheduled wellness check. Document any overnight concerns.' },
  { id: 'pen-06', startTime: '02:00', endTime: '03:00', title: 'Wellness Check', description: 'Perform scheduled wellness check. Document findings.' },
  { id: 'pen-07', startTime: '03:00', endTime: '04:00', title: 'Wellness Check', description: 'Perform scheduled wellness check. Document findings.' },
  { id: 'pen-08', startTime: '04:00', endTime: '05:00', title: 'Wellness Check & Morning Prep', description: 'Perform scheduled wellness check. Begin morning preparation tasks.' },
  { id: 'pen-09', startTime: '05:00', endTime: '06:00', title: 'Morning Setup', description: 'Set up morning routine items. Prepare breakfast items. Review morning schedule.' },
  { id: 'pen-10', startTime: '06:00', endTime: '07:00', title: 'Morning Handover Prep', description: 'Complete all night documentation. Prepare handover notes for day shift. Complete OFL monthly duties if applicable.' },
];

const hudsonDay = [
  { id: 'hud-01', startTime: '07:00', endTime: '07:30', title: 'Sign-In & Shift Exchange', description: 'Sign in, read comm book, shift handover with night staff. Review daily schedule.' },
  { id: 'hud-02', startTime: '07:30', endTime: '08:00', title: 'Morning Greet & Medication', description: 'Greet all persons served. Administer morning medications per chart.' },
  { id: 'hud-03', startTime: '08:00', endTime: '08:30', title: 'Breakfast Service', description: 'Prepare and serve breakfast. Offer choices. Assist as needed per support plans.' },
  { id: 'hud-04', startTime: '08:30', endTime: '09:00', title: 'Breakfast Cleanup', description: 'Wash, dry and put away breakfast dishes. Clean kitchen surfaces.' },
  { id: 'hud-05', startTime: '09:00', endTime: '09:30', title: 'Personal Care Support', description: 'Support persons with morning personal care routines as per ISP.' },
  { id: 'hud-06', startTime: '09:30', endTime: '10:30', title: 'Employment / Day Program', description: 'Transport or accompany persons to employment or day program. Complete vehicle check.' },
  { id: 'hud-07', startTime: '10:30', endTime: '11:30', title: 'Home Maintenance', description: 'Complete scheduled home maintenance tasks. Laundry, vacuuming, mopping as per cleaning schedule.' },
  { id: 'hud-08', startTime: '11:30', endTime: '12:00', title: 'Lunch Prep', description: 'Prepare lunch according to meal plan and dietary requirements.' },
  { id: 'hud-09', startTime: '12:00', endTime: '12:30', title: 'Lunch Service', description: 'Serve lunch, assist as needed, document meal intake.' },
  { id: 'hud-10', startTime: '12:30', endTime: '13:00', title: 'Lunch Cleanup', description: 'Clean up after lunch. Wipe down tables, wash dishes, sweep kitchen.' },
  { id: 'hud-11', startTime: '13:00', endTime: '14:00', title: 'Afternoon Activity', description: 'Facilitate scheduled afternoon activity. Community outing, craft, or leisure activity per person preferences.' },
  { id: 'hud-12', startTime: '14:00', endTime: '15:00', title: 'Documentation & Handover Prep', description: 'Complete documentation: Catalyst, Body Check, ISP notes, Behavior Chart. Prepare handover notes.' },
];

const hudsonEvening = [
  { id: 'hue-01', startTime: '15:00', endTime: '15:30', title: 'Sign-In & Shift Exchange', description: 'Sign in, shift handover with day staff, read comm book, review evening plan.' },
  { id: 'hue-02', startTime: '15:30', endTime: '16:30', title: 'Afternoon Community Access', description: 'Community walk, appointment, or recreation activity with persons served.' },
  { id: 'hue-03', startTime: '16:30', endTime: '17:00', title: 'Dinner Prep', description: 'Prepare dinner, involve persons served in meal prep as per goals.' },
  { id: 'hue-04', startTime: '17:00', endTime: '18:00', title: 'Dinner Service', description: 'Serve dinner, document intake, administer medications if scheduled.' },
  { id: 'hue-05', startTime: '18:00', endTime: '18:30', title: 'Dinner Cleanup', description: 'Full kitchen cleanup after dinner. Sweep, mop, wipe surfaces.' },
  { id: 'hue-06', startTime: '18:30', endTime: '19:30', title: 'Evening Activity', description: 'Facilitate chosen evening activity per schedule and preferences.' },
  { id: 'hue-07', startTime: '19:30', endTime: '20:30', title: 'Night Routine', description: 'Support persons with evening personal care routines. Baths, hygiene, medications.' },
  { id: 'hue-08', startTime: '20:30', endTime: '21:30', title: 'Wind-Down & Bedtime', description: 'Wind-down activities. Support persons to bed. Ensure comfort and safety.' },
  { id: 'hue-09', startTime: '21:30', endTime: '22:30', title: 'Home Tidying', description: 'Tidy common areas. Take out garbage. Sanitize high-touch surfaces.' },
  { id: 'hue-10', startTime: '22:30', endTime: '23:00', title: 'Documentation & Sign-Out', description: 'Complete all evening documentation. Send group message. Sign out.' },
];

const hudsonNight = [
  { id: 'hun-01', startTime: '23:00', endTime: '23:30', title: 'Night Shift Sign-In', description: 'Sign in, complete handover with evening staff. Read all notes.' },
  { id: 'hun-02', startTime: '23:30', endTime: '01:00', title: 'Wellness Check', description: 'Complete wellness check on all persons served. Document status.' },
  { id: 'hun-03', startTime: '01:00', endTime: '03:00', title: 'Overnight Check', description: 'Perform wellness checks every hour. Document observations.' },
  { id: 'hun-04', startTime: '03:00', endTime: '05:00', title: 'Overnight Check', description: 'Continue wellness checks. Begin any scheduled overnight documentation.' },
  { id: 'hun-05', startTime: '05:00', endTime: '07:00', title: 'Morning Prep & Handover', description: 'Prepare for morning shift. Complete all documentation. Brief day staff.' },
];

const orionDay = [
  { id: 'ord-01', startTime: '07:00', endTime: '07:30', title: 'Sign-In & Youth Check-In', description: 'Sign in, shift handover. Check on all youth. Review safety plan and any overnight notes.' },
  { id: 'ord-02', startTime: '07:30', endTime: '08:00', title: 'Morning Medications', description: 'Administer morning medications. Document in medication chart.' },
  { id: 'ord-03', startTime: '08:00', endTime: '08:30', title: 'Breakfast Service', description: 'Prepare and serve breakfast. Support youth with morning routine.' },
  { id: 'ord-04', startTime: '08:30', endTime: '09:00', title: 'School Prep', description: 'Support youth with school preparation. Pack bags, ensure proper dress.' },
  { id: 'ord-05', startTime: '09:00', endTime: '09:30', title: 'School Transport', description: 'Transport youth to school or South Vancouver Learning Centre.' },
  { id: 'ord-06', startTime: '09:30', endTime: '11:30', title: 'Home Tasks & Documentation', description: 'Complete home cleaning tasks. Update documentation, case notes, and Catalyst entries.' },
  { id: 'ord-07', startTime: '11:30', endTime: '12:30', title: 'Lunch Prep & Service', description: 'Prepare and serve lunch for any youth at home. Document meal intake.' },
  { id: 'ord-08', startTime: '12:30', endTime: '13:30', title: 'Appointments / Outreach', description: 'Transport youth to appointments or facilitate daytime outreach activity.' },
  { id: 'ord-09', startTime: '13:30', endTime: '14:30', title: 'After School Prep & Plan', description: 'Prepare for youth returning from school. Review afternoon and evening plan.' },
  { id: 'ord-10', startTime: '14:30', endTime: '15:00', title: 'Documentation & Handover', description: 'Complete documentation. Prepare handover notes for evening staff.' },
];

const orionEvening = [
  { id: 'ore-01', startTime: '15:00', endTime: '15:30', title: 'Sign-In & Shift Exchange', description: 'Sign in, receive handover, read comm book and youth safety plans.' },
  { id: 'ore-02', startTime: '15:30', endTime: '16:30', title: 'After School Welcome', description: 'Welcome youth home from school. Check in, snack, debrief the day.' },
  { id: 'ore-03', startTime: '16:30', endTime: '17:00', title: 'Homework / Skills', description: 'Support youth with homework or life skills development activities.' },
  { id: 'ore-04', startTime: '17:00', endTime: '18:00', title: 'Dinner Prep & Service', description: 'Involve youth in meal preparation. Serve dinner, document intake.' },
  { id: 'ore-05', startTime: '18:00', endTime: '18:30', title: 'Kitchen Cleanup', description: 'Clean up after dinner. Youth to assist as per chore schedule.' },
  { id: 'ore-06', startTime: '18:30', endTime: '19:30', title: 'Evening Program Activity', description: 'Youth Evening Activity Program (SVYC or planned recreation).' },
  { id: 'ore-07', startTime: '19:30', endTime: '20:30', title: 'Night Routine', description: 'Support youth with evening hygiene routines. Administer medications if scheduled.' },
  { id: 'ore-08', startTime: '20:30', endTime: '21:30', title: 'Wind-Down', description: 'Facilitate wind-down activities. Reading, journaling, or calm activity.' },
  { id: 'ore-09', startTime: '21:30', endTime: '22:30', title: 'Bedtime & House Tidy', description: 'Ensure all youth are settled for bed. Tidy common areas.' },
  { id: 'ore-10', startTime: '22:30', endTime: '23:00', title: 'Documentation & Sign-Out', description: 'Complete all documentation including any incident notes. Sign out and send group message.' },
];

const parksideBDay = [
  { id: 'pbd-01', startTime: '07:00', endTime: '07:30', title: 'Sign-In & Shift Exchange', description: 'Sign in, handover with night staff, read comm book.' },
  { id: 'pbd-02', startTime: '07:30', endTime: '08:00', title: 'Morning Greet & Medication', description: 'Greet persons served, administer morning medications.' },
  { id: 'pbd-03', startTime: '08:00', endTime: '08:30', title: 'Breakfast', description: 'Prepare and serve breakfast. Offer visual choices. Document intake.' },
  { id: 'pbd-04', startTime: '08:30', endTime: '09:00', title: 'Breakfast Cleanup', description: 'Wash dishes, clean kitchen surfaces, sweep.' },
  { id: 'pbd-05', startTime: '09:00', endTime: '09:30', title: 'Personal Care', description: 'Support with morning hygiene and personal care per ISP.' },
  { id: 'pbd-06', startTime: '09:30', endTime: '10:30', title: 'Community Inclusion Activity', description: 'Facilitate morning community inclusion activity.' },
  { id: 'pbd-07', startTime: '10:30', endTime: '11:30', title: 'Home Skills / Laundry', description: 'Home skills development: laundry, tidying, life skills tasks.' },
  { id: 'pbd-08', startTime: '11:30', endTime: '12:00', title: 'Lunch Prep', description: 'Prepare lunch with involvement from persons served.' },
  { id: 'pbd-09', startTime: '12:00', endTime: '12:30', title: 'Lunch Service', description: 'Serve lunch, document, assist as needed.' },
  { id: 'pbd-10', startTime: '12:30', endTime: '13:00', title: 'Lunch Cleanup', description: 'Clean up after lunch.' },
  { id: 'pbd-11', startTime: '13:00', endTime: '14:00', title: 'Afternoon Activity', description: 'Scheduled afternoon activity or community outing.' },
  { id: 'pbd-12', startTime: '14:00', endTime: '15:00', title: 'Documentation', description: 'Complete all documentation: Body Check, Catalyst, ISP notes, Cleaning Schedule.' },
];

const parksideBEvening = [
  { id: 'pbe-01', startTime: '15:00', endTime: '15:30', title: 'Sign-In & Shift Exchange', description: 'Sign in, handover with day staff, read comm book.' },
  { id: 'pbe-02', startTime: '15:30', endTime: '16:30', title: 'Afternoon Community Walk', description: 'Community walk or physical activity with persons served.' },
  { id: 'pbe-03', startTime: '16:30', endTime: '17:30', title: 'Dinner Prep & Service', description: 'Prepare and serve dinner. Offer choices. Document intake.' },
  { id: 'pbe-04', startTime: '17:30', endTime: '18:00', title: 'Dinner Cleanup', description: 'Full dinner cleanup. Sweep, mop, wipe all surfaces.' },
  { id: 'pbe-05', startTime: '18:00', endTime: '19:30', title: 'Evening Activity', description: 'Facilitate chosen evening recreation activity.' },
  { id: 'pbe-06', startTime: '19:30', endTime: '20:30', title: 'Night Routine & Medications', description: 'Support with evening hygiene routines. Administer evening medications.' },
  { id: 'pbe-07', startTime: '20:30', endTime: '21:30', title: 'Bedtime Wind-Down', description: 'Facilitate wind-down, ensure all persons are settled.' },
  { id: 'pbe-08', startTime: '21:30', endTime: '22:30', title: 'Home Tidy & Sanitize', description: 'Tidy home, take out garbage, sanitize high-touch surfaces.' },
  { id: 'pbe-09', startTime: '22:30', endTime: '23:00', title: 'Documentation & Sign-Out', description: 'Complete all documentation. Send group message. Sign out.' },
];

export const TASK_TEMPLATES = {
  'parkside-e': {
    day: parksideEDay,
    evening: parksideEEvening,
    night: parksideENight,
  },
  'hudson': {
    day: hudsonDay,
    evening: hudsonEvening,
    night: hudsonNight,
  },
  'orion': {
    day: orionDay,
    evening: orionEvening,
    night: [],
  },
  'parkside-b': {
    day: parksideBDay,
    evening: parksideBEvening,
    night: [],
  },
  'sunrise': {
    day: parksideEDay.map(t => ({ ...t, id: t.id.replace('ped', 'sud') })),
    evening: parksideEEvening.map(t => ({ ...t, id: t.id.replace('pee', 'sue') })),
    night: [],
  },
  'cedar': {
    day: hudsonDay.map(t => ({ ...t, id: t.id.replace('hud', 'ced') })),
    evening: hudsonEvening.map(t => ({ ...t, id: t.id.replace('hue', 'cee') })),
    night: [],
  },
};

export const getTasksForShift = (programId, shift) => {
  return TASK_TEMPLATES[programId]?.[shift] || [];
};
