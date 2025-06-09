import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  id: string;
  weekId: string; // Identifier for the week this slot belongs to
}

@Component({
  selector: 'app-staff-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-schedule.component.html',
  styleUrl: './staff-schedule.component.scss',
  providers: [DatePipe]
})
export class StaffScheduleComponent implements OnInit {
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  hours: string[] = [];
  timeSlots: TimeSlot[] = [];
  
  // Week selection
  currentWeekStart: Date = this.getStartOfWeek(new Date());
  weekLabel: string = '';
  
  // Selection state
  selectionStart: { day: string, time: string } | null = null;
  selectionEnd: { day: string, time: string } | null = null;
  isSelecting: boolean = false;
  
  constructor(private datePipe: DatePipe) {
    // Generate hours from 8:00 AM to 8:00 PM in 30-minute intervals
    for (let hour = 8; hour <= 20; hour++) {
      const hourFormatted = hour.toString().padStart(2, '0');
      this.hours.push(`${hourFormatted}:00`);
      if (hour < 20) { // Don't add the :30 for the last hour
        this.hours.push(`${hourFormatted}:30`);
      }
    }
    
    // Load any saved schedule
    this.loadSchedule();
  }
  
  ngOnInit(): void {
    this.updateWeekLabel();
  }
  
  /**
   * Navigate to the previous week
   */
  previousWeek(): void {
    const newDate = new Date(this.currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    this.currentWeekStart = this.getStartOfWeek(newDate);
    this.updateWeekLabel();
  }
  
  /**
   * Navigate to the next week
   */
  nextWeek(): void {
    const newDate = new Date(this.currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    this.currentWeekStart = this.getStartOfWeek(newDate);
    this.updateWeekLabel();
  }
  
  /**
   * Go to the current week
   */
  goToCurrentWeek(): void {
    this.currentWeekStart = this.getStartOfWeek(new Date());
    this.updateWeekLabel();
  }
  
  /**
   * Get the start date of the week (Monday) for a given date
   */
  getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  }
  
  /**
   * Update the week label based on current week start date
   */
  updateWeekLabel(): void {
    const weekEnd = new Date(this.currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const startStr = this.datePipe.transform(this.currentWeekStart, 'MMM d');
    const endStr = this.datePipe.transform(weekEnd, 'MMM d, yyyy');
    
    this.weekLabel = `${startStr} - ${endStr}`;
  }
  
  /**
   * Get the current week identifier
   */
  getCurrentWeekId(): string {
    return this.datePipe.transform(this.currentWeekStart, 'yyyy-MM-dd') || '';
  }
  
  /**
   * Start the selection process when a cell is clicked
   */
  startSelection(day: string, time: string): void {
    if (this.isSelecting) {
      // If already selecting, complete the selection
      this.completeSelection(day, time);
    } else {
      // Start a new selection
      this.selectionStart = { day, time };
      this.selectionEnd = null;
      this.isSelecting = true;
    }
  }
  
  /**
   * Complete the selection process when a second cell is clicked
   */
  completeSelection(day: string, time: string): void {
    if (!this.selectionStart) return;
    
    // Only allow selection within the same day
    if (this.selectionStart.day !== day) {
      this.cancelSelection();
      return;
    }
    
    this.selectionEnd = { day, time };
    this.isSelecting = false;
    
    // Ensure start time is before end time
    const startTimeIndex = this.hours.indexOf(this.selectionStart.time);
    const endTimeIndex = this.hours.indexOf(time);
    
    if (startTimeIndex > endTimeIndex) {
      // Swap if selected in reverse
      const temp = this.selectionStart.time;
      this.selectionStart.time = time;
      this.selectionEnd.time = temp;
    }
    
    // Add the new time slot
    this.addTimeSlot(this.selectionStart.day, this.selectionStart.time, this.selectionEnd.time);
    
    // Reset selection
    this.selectionStart = null;
    this.selectionEnd = null;
  }
  
  /**
   * Cancel the current selection
   */
  cancelSelection(): void {
    this.selectionStart = null;
    this.selectionEnd = null;
    this.isSelecting = false;
  }
  
  /**
   * Add a new time slot to the schedule
   */
  addTimeSlot(day: string, startTime: string, endTime: string): void {
    const id = `${day}-${startTime}-${endTime}-${Date.now()}`;
    const weekId = this.getCurrentWeekId();
    this.timeSlots.push({ day, startTime, endTime, id, weekId });
    this.saveSchedule();
  }
  
  /**
   * Remove a time slot from the schedule
   */
  removeTimeSlot(id: string): void {
    this.timeSlots = this.timeSlots.filter(slot => slot.id !== id);
    this.saveSchedule();
  }
  
  /**
   * Check if a cell is part of the current selection
   */
  isInSelection(day: string, time: string): boolean {
    if (!this.selectionStart || !this.isSelecting) return false;
    if (this.selectionStart.day !== day) return false;
    
    const timeIndex = this.hours.indexOf(time);
    const startTimeIndex = this.hours.indexOf(this.selectionStart.time);
    const endTimeIndex = this.selectionEnd ? this.hours.indexOf(this.selectionEnd.time) : startTimeIndex;
    
    return timeIndex >= Math.min(startTimeIndex, endTimeIndex) && 
           timeIndex <= Math.max(startTimeIndex, endTimeIndex);
  }
  
  /**
   * Check if a cell is part of an existing time slot
   */
  isInTimeSlot(day: string, time: string): TimeSlot | null {
    const timeIndex = this.hours.indexOf(time);
    const currentWeekId = this.getCurrentWeekId();
    
    for (const slot of this.timeSlots) {
      // Only check slots for the current week
      if (slot.day !== day || slot.weekId !== currentWeekId) continue;
      
      const startIndex = this.hours.indexOf(slot.startTime);
      const endIndex = this.hours.indexOf(slot.endTime);
      
      if (timeIndex >= startIndex && timeIndex < endIndex) {
        return slot;
      }
    }
    
    return null;
  }
  
  /**
   * Get the formatted time range for a time slot
   */
  getTimeRange(slot: TimeSlot): string {
    return `${this.formatTime(slot.startTime)} - ${this.formatTime(slot.endTime)}`;
  }
  
  /**
   * Get the time slots for the current week
   */
  getCurrentWeekTimeSlots(): TimeSlot[] {
    const currentWeekId = this.getCurrentWeekId();
    return this.timeSlots.filter(slot => slot.weekId === currentWeekId);
  }
  
  /**
   * Format time for display (convert from 24h to 12h format)
   */
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  }
  
  /**
   * Save the schedule to local storage
   */
  saveSchedule(): void {
    localStorage.setItem('staffSchedule', JSON.stringify(this.timeSlots));
  }
  
  /**
   * Load the schedule from local storage
   */
  loadSchedule(): void {
    const saved = localStorage.getItem('staffSchedule');
    if (saved) {
      try {
        this.timeSlots = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved schedule', e);
        this.timeSlots = [];
      }
    }
  }
}
