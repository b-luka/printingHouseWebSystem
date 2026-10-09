export interface User {
  _id: string;
  userType: 'client_individual' | 'client_legal' | 'printer' | 'admin';
  username: string;
  email: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  profilePicture?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;

  institutionName?: string;
  headquartersAddress?: string;
  city?: string;
  taxId?: string;
  registrationNumber?: string;
}
