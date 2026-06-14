// Programs at Milieu Family Services
export const PROGRAMS = [
  {
    id: 'hudson',
    name: 'Hudson',
    shortName: 'HUD',
    location: 'Burnaby, BC',
    type: 'Residential Adult Services',
    color: 'purple',
    colorHex: '#8b5cf6',
    capacity: 4,
    description: 'Shared living residential home with employment and community programs.',
    phoneNumber: '+1 (604) 555-0193',
    staffContact: 'Emily Rogers',
  },

];

export const getProgramById = (id) => PROGRAMS.find(p => p.id === id) || null;
