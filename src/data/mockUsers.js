// Mock users for the demo
// At Milieu, all staff use the same generic login details.
export const USERS = [
  {
    id: 'staff-shared',
    name: 'Milieu Staff',
    initials: 'MS',
    username: 'staff',
    password: 'Milieu123!',
    role: 'staff',
    avatar: null,
    color: 'teal',
  },
  {
    id: 'manager-shared',
    name: 'Milieu Manager',
    initials: 'MM',
    username: 'manager',
    password: 'Manager123!',
    role: 'manager',
    avatar: null,
    color: 'blue',
  }
];

export const findUser = (username, password, role) => {
  return USERS.find(u => u.username === username && u.password === password && u.role === role) || null;
};
