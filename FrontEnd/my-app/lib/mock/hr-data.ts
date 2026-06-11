export interface Employee {
  id: number;
  name: string;
  email: string;
  dept: string;
  title: string;
  hired: string;
  status: 'Actif' | 'En congé' | 'Inactif';
  leaves: number;
}

export interface Leave {
  id: number;
  employee: string;
  dept: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: 'en_attente' | 'approuve' | 'refuse';
  reason: string;
}

export interface Department {
  id: number;
  name: string;
  head: string;
  count: number;
  active: number;
  color: string;
}

export interface DashboardStats {
  totalEmployees: number;
  newThisMonth: number;
  pendingLeaves: number;
  presenceRate: string;
  presenceDelta: number;
  departments: number;
  totalPositions: number;
}

export const EMPLOYEES_DATA: Employee[] = [
  { id: 1,  name: 'Nadia Benjelloun',   email: 'n.benjelloun@aurea.ma',  dept: 'Finance',     title: 'Directrice Financière', hired: '12 Jan 2022', status: 'Actif',     leaves: 3 },
  { id: 2,  name: 'Karim El Idrissi',   email: 'k.elidrissi@aurea.ma',   dept: 'Engineering', title: 'Lead Developer',         hired: '3 Mar 2021',  status: 'En congé',  leaves: 8 },
  { id: 3,  name: 'Salma Ait Ouarab',   email: 's.aitouarab@aurea.ma',   dept: 'Product',     title: 'Product Manager',        hired: '15 Sep 2022', status: 'Actif',     leaves: 1 },
  { id: 4,  name: 'Youssef Mansouri',   email: 'y.mansouri@aurea.ma',    dept: 'Sales',       title: 'Account Executive',      hired: '1 Jun 2023',  status: 'Actif',     leaves: 5 },
  { id: 5,  name: 'Houda Tazi',         email: 'h.tazi@aurea.ma',        dept: 'Marketing',   title: 'Chef de projet',         hired: '20 Feb 2022', status: 'Actif',     leaves: 2 },
  { id: 6,  name: 'Hicham Kamani',      email: 'h.kamani@aurea.ma',      dept: 'Operations',  title: 'Responsable Ops',        hired: '8 Apr 2020',  status: 'Actif',     leaves: 4 },
  { id: 7,  name: 'Fatima Zahra Alami', email: 'fz.alami@aurea.ma',      dept: 'HR',          title: 'Responsable RH',         hired: '14 Jul 2021', status: 'Actif',     leaves: 0 },
  { id: 8,  name: 'Omar Benali',        email: 'o.benali@aurea.ma',      dept: 'Engineering', title: 'Frontend Developer',     hired: '5 Nov 2023',  status: 'Actif',     leaves: 2 },
  { id: 9,  name: 'Zineb El Fassi',     email: 'z.elfassi@aurea.ma',     dept: 'Finance',     title: 'Analyste Finance',       hired: '22 Jan 2023', status: 'Inactif',   leaves: 0 },
  { id: 10, name: 'Mehdi Berrada',      email: 'm.berrada@aurea.ma',     dept: 'Sales',       title: 'Sales Manager',          hired: '11 Mar 2022', status: 'Actif',     leaves: 6 },
];

export const LEAVES_DATA: Leave[] = [
  { id: 1, employee: 'Nadia Benjelloun',   dept: 'Finance',     type: 'Annuel',     from: '10 Jun 2026', to: '14 Jun 2026', days: 5, status: 'en_attente', reason: 'Vacances familiales' },
  { id: 2, employee: 'Karim El Idrissi',   dept: 'Engineering', type: 'Maladie',    from: '8 Jun 2026',  to: '9 Jun 2026',  days: 2, status: 'approuve',   reason: 'Arrêt médical' },
  { id: 3, employee: 'Salma Ait Ouarab',   dept: 'Product',     type: 'Annuel',     from: '15 Jun 2026', to: '20 Jun 2026', days: 6, status: 'approuve',   reason: 'Voyage personnel' },
  { id: 4, employee: 'Youssef Mansouri',   dept: 'Sales',       type: 'Sans solde', from: '1 Jul 2026',  to: '5 Jul 2026',  days: 5, status: 'refuse',     reason: 'Démarche personnelle' },
  { id: 5, employee: 'Houda Tazi',         dept: 'Marketing',   type: 'Annuel',     from: '18 Jun 2026', to: '22 Jun 2026', days: 5, status: 'en_attente', reason: 'Congé annuel' },
  { id: 6, employee: 'Hicham Kamani',      dept: 'Operations',  type: 'Annuel',     from: '25 Jun 2026', to: '2 Jul 2026',  days: 8, status: 'en_attente', reason: 'Mariage familial' },
  { id: 7, employee: 'Omar Benali',        dept: 'Engineering', type: 'Maladie',    from: '3 Jun 2026',  to: '5 Jun 2026',  days: 3, status: 'approuve',   reason: 'Consultation médicale' },
  { id: 8, employee: 'Mehdi Berrada',      dept: 'Sales',       type: 'Annuel',     from: '7 Jul 2026',  to: '11 Jul 2026', days: 5, status: 'en_attente', reason: 'Congé été' },
];

export const DEPARTMENTS_DATA: Department[] = [
  { id: 1, name: 'Engineering', head: 'Karim El Idrissi',  count: 52, active: 49, color: '#4E6BA6' },
  { id: 2, name: 'Finance',     head: 'Nadia Benjelloun',  count: 38, active: 37, color: '#2E7D5B' },
  { id: 3, name: 'Product',     head: 'Salma Ait Ouarab',  count: 24, active: 24, color: '#6B5EA8' },
  { id: 4, name: 'Marketing',   head: 'Houda Tazi',        count: 31, active: 30, color: '#8B5E3C' },
  { id: 5, name: 'Sales',       head: 'Mehdi Berrada',     count: 45, active: 44, color: '#B4862F' },
  { id: 6, name: 'Operations',  head: 'Hicham Kamani',     count: 28, active: 27, color: '#3C6B8B' },
  { id: 7, name: 'HR',          head: 'F.Z. Alami',        count: 12, active: 12, color: '#7B5EA8' },
  { id: 8, name: 'Legal',       head: 'Omar Benali',       count: 17, active: 17, color: '#4A7C6B' },
];

export const DASHBOARD_STATS: DashboardStats = {
  totalEmployees: 247,
  newThisMonth: 4,
  pendingLeaves: 8,
  presenceRate: '94.2%',
  presenceDelta: 1.8,
  departments: 14,
  totalPositions: 312,
};
