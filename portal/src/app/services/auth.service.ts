import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { JobSeeker, Employer, Staff, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Mock users for demonstration
  private mockUsers: User[] = [
    {
      id: 'js1',
      email: 'marcus@example.com',
      firstName: 'Marcus',
      lastName: 'Johnson',
      userType: 'jobseeker',
      createdAt: new Date('2025-05-15')
    } as JobSeeker,
    {
      id: 'emp1',
      email: 'hr@coastcascade.com',
      firstName: 'HR',
      lastName: 'Manager',
      userType: 'employer',
      companyName: 'Coast & Cascade',
      industry: 'Retail - Clothing',
      verified: true,
      createdAt: new Date('2025-04-10')
    } as Employer,
    {
      id: 'staff1',
      email: 'staff@workforce.gov',
      firstName: 'Staff',
      lastName: 'Member',
      userType: 'staff',
      department: 'Employment Services',
      role: 'Career Advisor',
      createdAt: new Date('2024-12-01')
    } as Staff
  ];

  constructor() {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // For demonstration purposes, we'll simulate authentication
  login(email: string, password: string): Observable<User> {
    // Find user by email (in a real app, this would validate password too)
    const user = this.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Simulate API delay
    return of(user).pipe(
      delay(800),
      tap(user => {
        // Store user in localStorage and update the BehaviorSubject
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  register(user: Partial<User>): Observable<User> {
    // In a real app, this would make an API call to register the user
    const newUser = {
      ...user,
      id: `user${this.mockUsers.length + 1}`,
      createdAt: new Date()
    } as User;
    
    this.mockUsers.push(newUser);
    
    // Simulate API delay
    return of(newUser).pipe(
      delay(800),
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isJobSeeker(): boolean {
    return this.currentUserSubject.value?.userType === 'jobseeker';
  }

  isEmployer(): boolean {
    return this.currentUserSubject.value?.userType === 'employer';
  }

  isStaff(): boolean {
    return this.currentUserSubject.value?.userType === 'staff';
  }

  // For staff-assisted registration
  staffAssistedRegister(user: Partial<User>): Observable<User> {
    return this.register(user);
  }

  // For multi-factor authentication (simulated)
  sendVerificationCode(email: string): Observable<boolean> {
    // In a real app, this would send an email or SMS
    console.log(`Sending verification code to ${email}`);
    return of(true).pipe(delay(800));
  }

  verifyCode(code: string): Observable<boolean> {
    // In a real app, this would validate the code
    // For demo, we'll accept any 6-digit code
    return of(/^\d{6}$/.test(code)).pipe(delay(800));
  }
  
  // For password reset functionality
  requestPasswordReset(email: string): Observable<boolean> {
    // In a real app, this would verify the email exists and send a reset link
    const user = this.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return throwError(() => new Error('Email not found'));
    }
    
    // Simulate sending an email with reset link
    console.log(`Sending password reset email to ${email}`);
    return of(true).pipe(delay(800));
  }
  
  resetPassword(token: string, newPassword: string): Observable<boolean> {
    // In a real app, this would validate the token and update the password
    // For demo, we'll accept any token
    if (!token) {
      return throwError(() => new Error('Invalid token'));
    }
    
    console.log('Password reset successful');
    return of(true).pipe(delay(800));
  }
  
  // For profile management
  updateProfile(userId: string, profileData: Partial<User>): Observable<User> {
    // In a real app, this would call an API to update the user profile
    const userIndex = this.mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }
    
    // Update the user data
    const updatedUser = {
      ...this.mockUsers[userIndex],
      ...profileData
    };
    
    this.mockUsers[userIndex] = updatedUser;
    
    // Update the current user if it's the logged-in user
    if (this.currentUserSubject.value?.id === userId) {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
    
    return of(updatedUser).pipe(delay(800));
  }
  
  updateAccessibilityPreferences(userId: string, preferences: any): Observable<User> {
    // In a real app, this would call an API to update accessibility preferences
    const userIndex = this.mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }
    
    if (this.mockUsers[userIndex].userType !== 'jobseeker') {
      return throwError(() => new Error('Only job seekers can update accessibility preferences'));
    }
    
    // Update the user data
    const jobSeeker = this.mockUsers[userIndex] as JobSeeker;
    jobSeeker.accessibilityPreferences = preferences;
    
    // Update the current user if it's the logged-in user
    if (this.currentUserSubject.value?.id === userId) {
      localStorage.setItem('currentUser', JSON.stringify(jobSeeker));
      this.currentUserSubject.next(jobSeeker);
    }
    
    return of(jobSeeker).pipe(delay(800));
  }
  
  changePassword(userId: string, currentPassword: string, newPassword: string): Observable<boolean> {
    // In a real app, this would verify the current password and update to the new one
    const userIndex = this.mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }
    
    // For demo, we'll accept any current password
    console.log('Password changed successfully');
    return of(true).pipe(delay(800));
  }
}
